// ============================================================
// ZentyRecon — Storage Utility
// Typed wrapper for chrome.storage.local
// ============================================================

import type { ZRStorage } from '@/types';

export async function getStorage<K extends keyof ZRStorage>(
  keys: K[],
): Promise<Pick<ZRStorage, K>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys as string[], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result as Pick<ZRStorage, K>);
    });
  });
}

export async function setStorage(data: Partial<ZRStorage>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => resolve());
  });
}
