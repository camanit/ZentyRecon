// ============================================================
// ZentyRecon — Content Script
// Runs in page context — extracts DOM data, sends to SW
// ============================================================

import type { ZRMessage, TechDetectorResult, DomExtractorResult, ExtractedLink } from '@/types';

// Avoid double-injection
if (!(window as Window & { __ZR_INJECTED__?: boolean }).__ZR_INJECTED__) {
  (window as Window & { __ZR_INJECTED__?: boolean }).__ZR_INJECTED__ = true;

  // ── Tech Detector (DOM-based hints) ──────────────────────
  function detectTechs(): Partial<TechDetectorResult> {
    const techs = [];

    // React
    if (document.querySelector('[data-reactroot]') || (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      techs.push({ name: 'React', category: 'framework' as const, confidence: 0.95, isPqcRelevant: false });
    }
    // Next.js
    if ((window as unknown as Record<string, unknown>).__NEXT_DATA__) {
      const nd = (window as unknown as Record<string, { buildId?: string }>).__NEXT_DATA__;
      techs.push({ name: 'Next.js', category: 'framework' as const, version: nd?.buildId, confidence: 0.98, isPqcRelevant: false });
    }
    // Vue
    if ((window as unknown as Record<string, unknown>).__vue_app__) {
      techs.push({ name: 'Vue.js', category: 'framework' as const, confidence: 0.95, isPqcRelevant: false });
    }
    // Angular
    if (document.querySelector('[ng-version]')) {
      const ver = document.querySelector('[ng-version]')?.getAttribute('ng-version');
      techs.push({ name: 'Angular', category: 'framework' as const, version: ver ?? undefined, confidence: 0.98, isPqcRelevant: false });
    }
    // WordPress
    if (document.querySelector('meta[name="generator"][content*="WordPress"]')) {
      techs.push({ name: 'WordPress', category: 'other' as const, confidence: 0.99, isPqcRelevant: false });
    }
    // jQuery
    if ((window as unknown as Record<string, unknown>).jQuery) {
      const jq = (window as unknown as Record<string, { fn?: { jquery?: string } }>).jQuery;
      techs.push({ name: 'jQuery', category: 'framework' as const, version: jq?.fn?.jquery, confidence: 0.99, isPqcRelevant: false });
    }
    // Cloudflare
    if (document.querySelector('script[src*="cloudflare"]') || document.querySelector('link[href*="cloudflare"]')) {
      techs.push({ name: 'Cloudflare', category: 'cdn' as const, confidence: 0.85, isPqcRelevant: true, evidence: 'Cloudflare supports PQC Hybrid TLS' });
    }

    return {
      url: window.location.href,
      techs,
      scannedAt: Date.now(),
    };
  }

  // ── DOM Extractor ─────────────────────────────────────────
  function extractLinks(): Partial<DomExtractorResult> {
    const origin = window.location.origin;
    const links: ExtractedLink[] = [];

    document.querySelectorAll('a[href]').forEach((el) => {
      const href = (el as HTMLAnchorElement).href;
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) return;
      try {
        const url = new URL(href);
        const isInternal = url.origin === origin;
        const isApi = /\/api\/|\/v\d+\/|\.json|graphql/i.test(url.pathname);
        links.push({
          href,
          text: el.textContent?.trim().slice(0, 60) ?? '',
          type: isApi ? 'api' : isInternal ? 'internal' : 'external',
          isSecure: url.protocol === 'https:',
        });
      } catch {
        // Ignore malformed URLs
      }
    });

    const forms = Array.from(document.querySelectorAll('form')).map((f) => ({
      action: (f as HTMLFormElement).action,
      method: (f as HTMLFormElement).method.toUpperCase() || 'GET',
      inputs: Array.from(f.querySelectorAll('input')).map((i) => i.type || 'text'),
    }));

    const scripts = Array.from(document.querySelectorAll('script[src]'))
      .map((s) => (s as HTMLScriptElement).src)
      .filter(Boolean);

    return {
      url: window.location.href,
      links: links.slice(0, 500), // Cap at 500
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
