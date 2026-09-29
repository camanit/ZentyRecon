// ============================================================
// ZentyRecon — Content Script (Comprehensive Recon Engine)
// Runs in page context — extracts DOM, endpoints, APIs, and Techs
// ============================================================

import type { ZRMessage, TechDetectorResult, DomExtractorResult, ExtractedLink, TechItem } from '@/types';
import { TECH_SIGNATURES } from '@/modules/tech-detector/signatures';

// Avoid double-injection
if (!(window as Window & { __ZR_INJECTED__?: boolean }).__ZR_INJECTED__) {
  (window as Window & { __ZR_INJECTED__?: boolean }).__ZR_INJECTED__ = true;

  // ── Tech Detector (Signature-based matching) ─────────────
  function detectTechs(): Partial<TechDetectorResult> {
    const detected: TechItem[] = [];
    const htmlContent = document.documentElement.outerHTML;
    const scripts = Array.from(document.querySelectorAll('script[src]')).map(
      (s) => (s as HTMLScriptElement).src
    );
    const metaTags = Array.from(document.querySelectorAll('meta')).map((m) => ({
      name: m.getAttribute('name') || '',
      property: m.getAttribute('property') || '',
      content: m.getAttribute('content') || '',
    }));

    for (const sig of TECH_SIGNATURES) {
      let matched = false;
      let evidence = '';

      // 1. Check JS globals
      if (sig.jsGlobals) {
        for (const g of sig.jsGlobals) {
          try {
            const parts = g.split('.');
            let curr: unknown = window;
            let found = true;
            for (const part of parts) {
              if (curr && typeof curr === 'object' && part in curr) {
                curr = (curr as Record<string, unknown>)[part];
              } else {
                found = false;
                break;
              }
            }
            if (found && curr !== undefined) {
              matched = true;
              evidence = `window.${g} is present`;
              break;
            }
          } catch {
            // Ignore access errors
          }
        }
      }

      // 2. Check Script Sources
      if (!matched && sig.scriptSrc) {
        for (const regex of sig.scriptSrc) {
          const found = scripts.some((src) => regex.test(src));
          if (found) {
            matched = true;
            evidence = `Matched script src: ${regex.source}`;
            break;
          }
        }
      }

      // 3. Check Meta Tags
      if (!matched && sig.metaTags) {
        for (const rule of sig.metaTags) {
          const found = metaTags.some((m) => {
            const nameMatch = !rule.name || m.name.toLowerCase() === rule.name.toLowerCase();
            const propMatch = !rule.property || m.property.toLowerCase() === rule.property.toLowerCase();
            const contentMatch = !rule.content || rule.content.test(m.content);
            return nameMatch && propMatch && contentMatch;
          });
          if (found) {
            matched = true;
            evidence = `Meta tag match: ${rule.name || rule.property}`;
            break;
          }
        }
      }

      // 4. Check HTML Patterns
      if (!matched && sig.htmlPatterns) {
        for (const pattern of sig.htmlPatterns) {
          if (pattern.test(htmlContent)) {
            matched = true;
            evidence = `DOM pattern: ${pattern.source}`;
            break;
          }
        }
      }

      if (matched) {
        detected.push({
          name: sig.name,
          category: sig.category,
          confidence: 0.95,
          isPqcRelevant: sig.isPqcRelevant,
          evidence: sig.pqcNote || evidence,
        });
      }
    }

    return {
      url: window.location.href,
      techs: detected,
      scannedAt: Date.now(),
    };
  }

  // ── DOM & Endpoint Extractor ──────────────────────────────
  function extractLinks(): Partial<DomExtractorResult> {
    const origin = window.location.origin;
    const links: ExtractedLink[] = [];
    const seenHrefs = new Set<string>();

    // 1. Regular <a> links
    document.querySelectorAll('a[href]').forEach((el) => {
      const href = (el as HTMLAnchorElement).href;
      if (!href || href.startsWith('javascript:') || href.startsWith('#') || seenHrefs.has(href)) return;
      seenHrefs.add(href);

      try {
        const url = new URL(href);
        const isInternal = url.origin === origin;
        const isApi = /\/api\/|\/v\d+\/|\.json|graphql|rest\//i.test(url.pathname);
        links.push({
          href,
          text: el.textContent?.trim().slice(0, 60) ?? '',
          type: isApi ? 'api' : isInternal ? 'internal' : 'external',
          isSecure: url.protocol === 'https:',
        });
      } catch {
        // Skip malformed
      }
    });

    // 2. Forms
    const forms = Array.from(document.querySelectorAll('form')).map((f) => ({
      action: (f as HTMLFormElement).action,
      method: (f as HTMLFormElement).method.toUpperCase() || 'GET',
      inputs: Array.from(f.querySelectorAll('input')).map((i) => i.name || i.type || 'text'),
    }));

    // 3. Scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'))
      .map((s) => (s as HTMLScriptElement).src)
      .filter(Boolean);

    // 4. API Endpoints discovered inside script tags / inline JavaScript
    const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'))
      .map((s) => s.textContent || '')
      .join('\n');

    const apiRegex = /(?:["'])((\/(?:api|v\d+|graphql|rest)[a-zA-Z0-9_\-\/.]*)|(https?:\/\/[a-zA-Z0-9_\-.]+(?:amazonaws\.com|firebaseio\.com|\/api\/[a-zA-Z0-9_\-\/.]*)))(?:["'])/g;
    let match: RegExpExecArray | null;
    while ((match = apiRegex.exec(inlineScripts)) !== null) {
      const endpoint = match[1];
      if (endpoint && !seenHrefs.has(endpoint)) {
        seenHrefs.add(endpoint);
        const fullUrl = endpoint.startsWith('http') ? endpoint : `${origin}${endpoint}`;
        links.push({
          href: fullUrl,
          text: 'Discovered in JS',
          type: 'api',
          isSecure: fullUrl.startsWith('https:'),
        });
      }
    }

    return {
      url: window.location.href,
      links: links.slice(0, 500),
      forms,
      scripts,
      scannedAt: Date.now(),
    };
  }

  // ── Message Listener ──────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg: ZRMessage, _sender, sendResponse) => {
    switch (msg.type) {
      case 'SCAN_PAGE': {
        const techData = detectTechs();
        const domData = extractLinks();
        sendResponse({
          success: true,
          data: { tech: techData, dom: domData },
        });
        break;
      }
      default:
        sendResponse({ success: false, error: 'Unknown message' });
    }
    return true;
  });

  // Auto-notify background on load
  const initMsg: ZRMessage = {
    type: 'SCAN_RESULT',
    payload: detectTechs(),
    timestamp: Date.now(),
  };
  chrome.runtime.sendMessage(initMsg).catch(() => null);
}
