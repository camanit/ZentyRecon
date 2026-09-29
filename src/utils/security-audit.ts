// ============================================================
// ZentyRecon — Deep Security & Network Policy Audit Engine
// Evaluates CSP, HSTS Preload readiness, and Certificate Transparency
// ============================================================

export interface CspFinding {
  severity: 'high' | 'medium' | 'low' | 'good';
  directive: string;
  issue: string;
  recommendation: string;
}

export interface CspAuditResult {
  hasCsp: boolean;
  rawCsp?: string;
  findings: CspFinding[];
  score: number; // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface HstsAuditResult {
  hasHsts: boolean;
  rawHsts?: string;
  isPreloadReady: boolean;
  maxAge: number;
  includesSubDomains: boolean;
  hasPreloadFlag: boolean;
  status: string;
}

export interface CtSubdomain {
  subdomain: string;
  issuer: string;
  loggedAt: string;
}

/**
 * Audit Content Security Policy for common bypasses and weaknesses
 */
export function auditCsp(cspHeader?: string): CspAuditResult {
  if (!cspHeader) {
    return {
      hasCsp: false,
      findings: [
        {
          severity: 'high',
          directive: 'Content-Security-Policy',
          issue: 'No Content-Security-Policy header detected.',
          recommendation: 'Enforce a strict CSP with nonce-based or hash-based script loading.',
        },
      ],
      score: 15,
      grade: 'F',
    };
  }

  const findings: CspFinding[] = [];
  const lower = cspHeader.toLowerCase();
  let score = 100;

  // 1. unsafe-inline
  if (lower.includes("'unsafe-inline'")) {
    findings.push({
      severity: 'high',
      directive: 'script-src / style-src',
      issue: "Contains 'unsafe-inline' — allows arbitrary inline script execution (XSS risk).",
      recommendation: "Remove 'unsafe-inline' and migrate to cryptographic nonces or SHA hashes.",
    });
    score -= 30;
  }

  // 2. unsafe-eval
  if (lower.includes("'unsafe-eval'")) {
    findings.push({
      severity: 'medium',
      directive: 'script-src',
      issue: "Contains 'unsafe-eval' — permits eval(), setTimeout(str), and Function constructor.",
      recommendation: "Refactor code to avoid dynamic code evaluation.",
    });
    score -= 20;
  }

  // 3. Wildcards
  if (/script-src[^;]*\*/.test(lower) || /default-src[^;]*\*/.test(lower)) {
    findings.push({
      severity: 'high',
      directive: 'script-src / default-src',
      issue: 'Wildcard (*) source allows loading scripts from any arbitrary domain.',
      recommendation: 'Specify exact trusted domains or use self / nonces.',
    });
    score -= 25;
  }

  // 4. object-src
  if (!lower.includes('object-src')) {
    findings.push({
      severity: 'low',
      directive: 'object-src',
      issue: "Missing 'object-src' directive — may allow legacy Flash/Java plugins.",
      recommendation: "Set object-src 'none'.",
    });
    score -= 10;
  } else if (lower.includes("object-src 'none'")) {
    findings.push({
      severity: 'good',
      directive: 'object-src',
      issue: "object-src is securely set to 'none'.",
      recommendation: 'Maintained.',
    });
  }

  // 5. base-uri
  if (!lower.includes('base-uri')) {
    findings.push({
      severity: 'low',
      directive: 'base-uri',
      issue: 'Missing base-uri directive — allows base tag manipulation.',
      recommendation: "Set base-uri 'self' or 'none'.",
    });
    score -= 5;
  }

  score = Math.max(10, Math.min(100, score));
  const grade: CspAuditResult['grade'] = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    hasCsp: true,
    rawCsp: cspHeader,
    findings,
    score,
    grade,
  };
}

/**
 * Audit HSTS header compliance and Chromium Preload eligibility
 */
export function auditHsts(hstsHeader?: string): HstsAuditResult {
  if (!hstsHeader) {
    return {
      hasHsts: false,
      isPreloadReady: false,
      maxAge: 0,
      includesSubDomains: false,
      hasPreloadFlag: false,
      status: 'Missing HSTS Header (Vulnerable to SSL Stripping)',
    };
  }

  const lower = hstsHeader.toLowerCase();
  const maxAgeMatch = lower.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  const includesSubDomains = lower.includes('includesubdomains');
  const hasPreloadFlag = lower.includes('preload');

  const isPreloadReady = maxAge >= 31536000 && includesSubDomains && hasPreloadFlag;

  let status = 'HSTS Active';
  if (isPreloadReady) {
    status = 'Preload Ready (Eligible for Chrome HSTS preload list)';
  } else if (maxAge < 10886400) {
    status = 'Weak max-age (Less than recommended 1 year)';
  }

  return {
    hasHsts: true,
    rawHsts: hstsHeader,
    isPreloadReady,
    maxAge,
    includesSubDomains,
    hasPreloadFlag,
    status,
  };
}

/**
 * Detect whether origin is a local/private network
 */
export function isLocalOrPrivateHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  );
}

/**
 * Query Certificate Transparency logs via crt.sh
 */
export async function queryCertificateTransparency(domain: string): Promise<CtSubdomain[]> {
  if (!domain || isLocalOrPrivateHost(domain)) {
    return [];
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    const res = await fetch(`https://crt.sh/?q=%.${encodeURIComponent(cleanDomain)}&output=json`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];

    const data = await res.json() as Array<{ name_value?: string; issuer_name?: string; entry_timestamp?: string }>;
    const seen = new Set<string>();
    const results: CtSubdomain[] = [];

    for (const item of data) {
      if (!item.name_value) continue;
      const names = item.name_value.split('\n');
      for (const name of names) {
        const cleanName = name.trim().toLowerCase();
        if (cleanName && !seen.has(cleanName)) {
          seen.add(cleanName);
          results.push({
            subdomain: cleanName,
            issuer: (item.issuer_name || 'Unknown CA').slice(0, 40),
            loggedAt: item.entry_timestamp ? item.entry_timestamp.slice(0, 10) : 'Recent',
          });
        }
      }
      if (results.length >= 100) break; // Limit to 100
    }

    return results;
  } catch {
    return [];
  }
}
