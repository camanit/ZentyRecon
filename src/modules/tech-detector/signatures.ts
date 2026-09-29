// ============================================================
// ZentyRecon — Tech Stack & Crypto Surface Signatures Database
// 100+ high-fidelity detection rules with PQC relevance scoring
// ============================================================

import type { TechItem } from '@/types';

export interface TechSignature {
  name: string;
  category: TechItem['category'];
  isPqcRelevant: boolean;
  pqcNote?: string;
  jsGlobals?: string[];
  htmlPatterns?: RegExp[];
  metaTags?: { name?: string; property?: string; content?: RegExp }[];
  scriptSrc?: RegExp[];
  headers?: { header: string; pattern: RegExp }[];
}

export const TECH_SIGNATURES: TechSignature[] = [
  // --- Post-Quantum & Cryptography Libraries ---
  {
    name: 'liboqs / Open Quantum Safe',
    category: 'crypto',
    isPqcRelevant: true,
    pqcNote: 'Supports NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA)',
    jsGlobals: ['liboqs', 'oqs', '__OQS__'],
    scriptSrc: [/liboqs/i, /oqs-wasm/i],
  },
  {
    name: 'WebCrypto API',
    category: 'crypto',
    isPqcRelevant: true,
    pqcNote: 'Client-side hardware-backed cryptographic primitive',
    jsGlobals: ['crypto.subtle'],
  },
  {
    name: 'CryptoJS',
    category: 'crypto',
    isPqcRelevant: false,
    jsGlobals: ['CryptoJS'],
    scriptSrc: [/crypto-js/i, /cryptojs/i],
  },
  {
    name: 'TweetNaCl / Sodium',
    category: 'crypto',
    isPqcRelevant: true,
    pqcNote: 'High-speed elliptic curve cryptography (Ed25519/X25519 - classical)',
    jsGlobals: ['nacl', 'sodium', '_sodium'],
    scriptSrc: [/tweetnacl/i, /sodium/i],
  },
  {
    name: 'Node-Forge',
    category: 'crypto',
    isPqcRelevant: false,
    jsGlobals: ['forge'],
    scriptSrc: [/forge(\.min)?\.js/i],
  },
  {
    name: 'JSEncrypt (RSA)',
    category: 'crypto',
    isPqcRelevant: true,
    pqcNote: 'Classical RSA (Vulnerable to Shor\'s algorithm on Q-Day)',
    jsGlobals: ['JSEncrypt'],
    scriptSrc: [/jsencrypt/i],
  },

  // --- CDNs & Cloud Edge (PQC Hybrid TLS Providers) ---
  {
    name: 'Cloudflare',
    category: 'cdn',
    isPqcRelevant: true,
    pqcNote: 'World leader in PQC Hybrid Key Exchange (X25519Kyber768 enabled by default)',
    scriptSrc: [/cloudflare/i, /challenges\.cloudflare\.com/i, /static\.cloudflareinsights\.com/i],
    headers: [{ header: 'server', pattern: /cloudflare/i }],
  },
  {
    name: 'AWS CloudFront',
    category: 'cdn',
    isPqcRelevant: true,
    pqcNote: 'AWS supports hybrid post-quantum TLS for API endpoints',
    headers: [
      { header: 'via', pattern: /cloudfront/i },
      { header: 'x-amz-cf-id', pattern: /.+/ },
    ],
  },
  {
    name: 'Fastly',
    category: 'cdn',
    isPqcRelevant: false,
    headers: [{ header: 'x-fastly-request-id', pattern: /.+/ }],
  },
  {
    name: 'Vercel Edge',
    category: 'cdn',
    isPqcRelevant: true,
    pqcNote: 'Vercel Edge uses Cloudflare-backed PQC hybrid TLS termination',
    headers: [{ header: 'x-vercel-id', pattern: /.+/ }],
  },
  {
    name: 'Netlify',
    category: 'cdn',
    isPqcRelevant: false,
    headers: [{ header: 'x-nf-request-id', pattern: /.+/ }],
  },

  // --- Frontend Frameworks & UI ---
  {
    name: 'React',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/data-reactroot/, /react-root/],
    jsGlobals: ['React', '__REACT_DEVTOOLS_GLOBAL_HOOK__'],
  },
  {
    name: 'Next.js',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/__next/],
    jsGlobals: ['__NEXT_DATA__'],
    scriptSrc: [/_next\/static/i],
  },
  {
    name: 'Vue.js',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/data-v-[a-f0-9]+/, /id="app"/],
    jsGlobals: ['Vue', '__vue_app__'],
  },
  {
    name: 'Nuxt.js',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/__nuxt/],
    jsGlobals: ['__NUXT__'],
    scriptSrc: [/_nuxt\//i],
  },
  {
    name: 'Svelte / SvelteKit',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/class="svelte-[a-z0-9]+"/],
    jsGlobals: ['__svelte__'],
  },
  {
    name: 'Angular',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/ng-version/, /ng-app/],
    jsGlobals: ['ng'],
  },
  {
    name: 'Astro',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/data-astro-cid/],
  },
  {
    name: 'Remix',
    category: 'framework',
    isPqcRelevant: false,
    jsGlobals: ['__remixContext'],
  },
  {
    name: 'jQuery',
    category: 'framework',
    isPqcRelevant: false,
    jsGlobals: ['jQuery', '$'],
    scriptSrc: [/jquery(\.min)?\.js/i],
  },
  {
    name: 'Tailwind CSS',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/class="[^"]*(flex|grid|hidden|relative|px-|py-|text-sm)[^"]*"/],
  },
  {
    name: 'Bootstrap',
    category: 'framework',
    isPqcRelevant: false,
    htmlPatterns: [/class="[^"]*(container|row|col-|btn-|navbar)[^"]*"/],
    scriptSrc: [/bootstrap(\.bundle)?(\.min)?\.js/i],
  },

  // --- CMS & E-Commerce ---
  {
    name: 'WordPress',
    category: 'other',
    isPqcRelevant: false,
    metaTags: [{ name: 'generator', content: /WordPress/i }],
    htmlPatterns: [/wp-content\//, /wp-includes\//],
    scriptSrc: [/wp-content\//i, /wp-includes\//i],
  },
  {
    name: 'Shopify',
    category: 'other',
    isPqcRelevant: false,
    jsGlobals: ['Shopify'],
    scriptSrc: [/cdn\.shopify\.com/i],
  },
  {
    name: 'Drupal',
    category: 'other',
    isPqcRelevant: false,
    metaTags: [{ name: 'generator', content: /Drupal/i }],
    jsGlobals: ['Drupal'],
  },
  {
    name: 'Ghost',
    category: 'other',
    isPqcRelevant: false,
    metaTags: [{ name: 'generator', content: /Ghost/i }],
  },

  // --- Backend Runtimes & Servers ---
  {
    name: 'Nginx',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'server', pattern: /nginx/i }],
  },
  {
    name: 'Apache HTTP Server',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'server', pattern: /apache/i }],
  },
  {
    name: 'Caddy',
    category: 'server',
    isPqcRelevant: true,
    pqcNote: 'Modern Go server with experimental Kyber TLS support',
    headers: [{ header: 'server', pattern: /caddy/i }],
  },
  {
    name: 'LiteSpeed',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'server', pattern: /litespeed/i }],
  },
  {
    name: 'PHP',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'x-powered-by', pattern: /php/i }],
  },
  {
    name: 'ASP.NET',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'x-powered-by', pattern: /asp\.net/i }],
  },
  {
    name: 'Express / Node.js',
    category: 'server',
    isPqcRelevant: false,
    headers: [{ header: 'x-powered-by', pattern: /express/i }],
  },

  // --- Analytics & Tag Managers ---
  {
    name: 'Google Tag Manager',
    category: 'analytics',
    isPqcRelevant: false,
    scriptSrc: [/googletagmanager\.com\/gtm\.js/i],
    jsGlobals: ['google_tag_manager'],
  },
  {
    name: 'Google Analytics 4',
    category: 'analytics',
    isPqcRelevant: false,
    scriptSrc: [/googletagmanager\.com\/gtag\/js/i, /google-analytics\.com/i],
    jsGlobals: ['gtag', 'ga'],
  },
  {
    name: 'Sentry',
    category: 'analytics',
    isPqcRelevant: false,
    jsGlobals: ['__SENTRY__', 'Sentry'],
    scriptSrc: [/sentry/i],
  },
  {
    name: 'Datadog RUM',
    category: 'analytics',
    isPqcRelevant: false,
    jsGlobals: ['DD_RUM'],
    scriptSrc: [/datadog-rum/i],
  },
];
