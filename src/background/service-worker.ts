// ============================================================
// ZentyRecon — Service Worker (Background Script)
// Manifest V3 — Service Worker lifecycle
// ============================================================

import type { ZRMessage, ZRResponse, TabContext } from '@/types';

// ── Install / Update ────────────────────────────────────────
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log('[ZentyRecon SW] Installed:', reason);

  if (reason === 'install') {
    // First install — set defaults
    chrome.storage.local.set({
      settings: {
        autoScanOnPageLoad: false,
        showPqcBadge: true,
        defaultModule: 'tech-detector',
        theme: 'dark',
      },
    });

    // Open side panel on install
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(() => {
          // Side panel may not be available on all pages
        });
      }
    });
  }
});

// ── Action Click → Toggle Side Panel ────────────────────────
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
    console.warn('[ZentyRecon SW] Could not open side panel:', err);
  });
});

// ── Tab Events → Notify Side Panel ─────────────────────────
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    broadcastTabContext(tabId, tab.url ?? '', tab.title ?? '');
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  broadcastTabContext(tabId, tab.url ?? '', tab.title ?? '');
});

// ── Security Headers & TLS Inspector (webRequest) ─────────
const securityHeadersCache = new Map<number, Record<string, string>>();

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type === 'main_frame' && details.responseHeaders) {
      const headersMap: Record<string, string> = {};
      for (const h of details.responseHeaders) {
        if (h.name && h.value) {
          headersMap[h.name.toLowerCase()] = h.value;
        }
      }
      securityHeadersCache.set(details.tabId, headersMap);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

function broadcastTabContext(tabId: number, url: string, title: string) {
  const ctx: TabContext = {
    tabId,
    url,
    origin: tryParseOrigin(url),
    title,
  };

  const msg: ZRMessage = {
    type: 'TAB_CHANGED',
    tabId,
    payload: ctx,
    timestamp: Date.now(),
  };

  chrome.runtime.sendMessage(msg).catch(() => {
    // Side panel may not be open — ignore
  });
}

// ── Message Router ──────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (message: ZRMessage, _sender, sendResponse: (r: ZRResponse) => void) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ success: false, error: String(err) });
      });

    return true; // Keep message channel open for async
  },
);

async function handleMessage(msg: ZRMessage): Promise<ZRResponse> {
  switch (msg.type) {
    case 'PING':
      return { success: true, data: { pong: true, version: chrome.runtime.getManifest().version } };

    case 'SCAN_PAGE': {
      if (!msg.tabId) return { success: false, error: 'No tabId provided' };
      // Inject content script for deep scan
      await chrome.scripting.executeScript({
        target: { tabId: msg.tabId },
        files: ['src/content-scripts/main.js'],
      }).catch(() => null);
      return { success: true };
    }

    case 'GET_COOKIES': {
      if (!msg.payload || typeof msg.payload !== 'object') {
        return { success: false, error: 'Invalid payload' };
      }
      const { url } = msg.payload as { url: string };
      const cookies = await chrome.cookies.getAll({ url });
      return { success: true, data: cookies };
    }

    case 'SET_PROXY': {
      const profile = msg.payload;
      if (!profile) return { success: false, error: 'No proxy profile provided' };
      // Proxy setting handled in proxy-manager module
      return { success: true, data: { applied: true } };
    }

    case 'GET_SECURITY_HEADERS': {
      const tId = msg.tabId || 0;
      const headers = securityHeadersCache.get(tId) || {};
      return { success: true, data: headers };
    }

    default:
      return { success: false, error: `Unknown message type: ${msg.type}` };
  }
}

// ── Helpers ─────────────────────────────────────────────────
function tryParseOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

console.log('[ZentyRecon SW] Service worker started ✅');
