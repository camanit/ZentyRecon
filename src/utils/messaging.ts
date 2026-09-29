// ============================================================
// ZentyRecon — Messaging Utility
// Typed wrapper around chrome.runtime.sendMessage
// ============================================================

import type { ZRMessage, ZRResponse } from '@/types';

export function sendMessage(msg: ZRMessage): Promise<ZRResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (response: ZRResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response ?? { success: false, error: 'No response' });
    });
  });
}

export function sendTabMessage(tabId: number, msg: ZRMessage): Promise<ZRResponse> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, msg, (response: ZRResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response ?? { success: false, error: 'No response' });
    });
  });
}
