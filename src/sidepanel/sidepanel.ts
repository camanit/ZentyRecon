// ============================================================
// ZentyRecon — Side Panel Controller (sidepanel.ts)
// Orchestrates all 7 modules, tab switching, and messaging
// ============================================================

import type { ZRMessage, TabContext, ModuleId } from '@/types';
import { sendMessage } from '@/utils/messaging';
import { TechDetectorModule } from '@/modules/tech-detector/index';
import { DomExtractorModule } from '@/modules/dom-extractor/index';
import { CookieManagerModule } from '@/modules/cookie-manager/index';
import { ProxyManagerModule } from '@/modules/proxy-manager/index';
import { SecurityUtilsModule } from '@/modules/security-utils/index';
import { PqcAnalyzerModule } from '@/modules/pqc-analyzer/index';
import { MoscaCalcModule } from '@/modules/mosca-calc/index';

// ── Module registry ─────────────────────────────────────────
const MODULE_LABELS: Record<ModuleId, string> = {
  'tech-detector':  'Tech Stack Detector',
  'dom-extractor':  'DOM & Endpoint Extractor',
  'cookie-manager': 'Session & Cookie Manager',
  'proxy-manager':  'Dynamic Proxy Manager',
  'security-utils': 'Security Utilities Suite',
  'pqc-analyzer':   'PQC Readiness Analyzer',
  'mosca-calc':     'Mosca Theorem Calculator',
};

// ── State ────────────────────────────────────────────────────
let activeModule: ModuleId = 'tech-detector';
let currentTabId: number | null = null;

// ── Init ─────────────────────────────────────────────────────
async function init() {
  // Mount all modules
  TechDetectorModule.mount(document.getElementById('module-tech-detector')!);
  DomExtractorModule.mount(document.getElementById('module-dom-extractor')!);
  CookieManagerModule.mount(document.getElementById('module-cookie-manager')!);
  ProxyManagerModule.mount(document.getElementById('module-proxy-manager')!);
  SecurityUtilsModule.mount(document.getElementById('module-security-utils')!);
  PqcAnalyzerModule.mount(document.getElementById('module-pqc-analyzer')!);
  MoscaCalcModule.mount(document.getElementById('module-mosca-calc')!);

  // Bind tab buttons
  document.querySelectorAll<HTMLButtonElement>('.module-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mod = btn.dataset.module as ModuleId;
      if (mod) switchModule(mod);
    });
  });

  // Refresh button
  document.getElementById('btn-refresh')?.addEventListener('click', () => {
    if (currentTabId) scanCurrentTab(currentTabId);
    setStatus('Scanning...');
  });

  // Get active tab on open
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    currentTabId = tab.id;
    updateTabContext({
      tabId: tab.id,
      url: tab.url ?? '',
      origin: tryOrigin(tab.url ?? ''),
      title: tab.title ?? '',
      favicon: tab.favIconUrl,
    });
    scanCurrentTab(tab.id);
  }

  // Listen for tab changes from service worker
  chrome.runtime.onMessage.addListener((msg: ZRMessage) => {
    if (msg.type === 'TAB_CHANGED' && msg.payload) {
      const ctx = msg.payload as TabContext;
      currentTabId = ctx.tabId;
      updateTabContext(ctx);
      scanCurrentTab(ctx.tabId);
    }
    if (msg.type === 'SCAN_RESULT' && msg.payload) {
      // Data comes back from content script via SW
    }
  });

  setStatus('Ready ✅');
}

// ── Module Switching ─────────────────────────────────────────
function switchModule(mod: ModuleId) {
  // Update tab buttons
  document.querySelectorAll('.module-tab').forEach((btn) => {
    const b = btn as HTMLButtonElement;
    b.classList.toggle('active', b.dataset.module === mod);
  });

  // Show/hide panels
  document.querySelectorAll('.module-panel').forEach((panel) => {
    const p = panel as HTMLElement;
    const isActive = p.id === `module-${mod}`;
    p.classList.toggle('active', isActive);
  });

  // Update label
  const labelEl = document.getElementById('active-module-name');
  if (labelEl) labelEl.textContent = MODULE_LABELS[mod];

  activeModule = mod;
}

export function getActiveModule(): ModuleId {
  return activeModule;
}

// ── Tab Context Update ───────────────────────────────────────
function updateTabContext(ctx: TabContext) {
  const domainEl = document.getElementById('ctx-domain');
  const urlEl    = document.getElementById('ctx-url');
  const favicon  = document.getElementById('ctx-favicon');

  if (domainEl) domainEl.textContent = tryOrigin(ctx.url).replace(/^https?:\/\//, '') || '—';
  if (urlEl)    urlEl.textContent    = ctx.url.slice(0, 60) + (ctx.url.length > 60 ? '…' : '');

  if (favicon && ctx.favicon) {
    (favicon as HTMLDivElement).style.backgroundImage = `url(${ctx.favicon})`;
    (favicon as HTMLDivElement).style.backgroundSize = 'cover';
    (favicon as HTMLDivElement).style.background = 'none';
  }
}

// ── Scan Tab ─────────────────────────────────────────────────
async function scanCurrentTab(tabId: number) {
  try {
    const res = await sendMessage({ type: 'SCAN_PAGE', tabId, timestamp: Date.now() });
    if (res.success && res.data) {
      const data = res.data as { tech?: unknown; dom?: unknown };
      if (data.tech) TechDetectorModule.update(data.tech);
      if (data.dom)  DomExtractorModule.update(data.dom);
    }
    setStatus('Scan complete');
  } catch {
    setStatus('Could not scan this page');
  }
}

// ── Helpers ──────────────────────────────────────────────────
function setStatus(msg: string) {
  const el = document.getElementById('status-text');
  if (el) el.textContent = msg;
}

function tryOrigin(url: string): string {
  try { return new URL(url).origin; } catch { return ''; }
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { init().catch(console.error); });
