// ============================================================
// ZentyRecon — Action Popup Controller (popup.ts)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const domainEl = document.getElementById('active-domain');
  const openBtn = document.getElementById('btn-open-panel');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && domainEl) {
      try {
        const url = new URL(tab.url);
        domainEl.textContent = url.hostname || tab.url;
      } catch {
        domainEl.textContent = tab.url;
      }
    }
  } catch (err) {
    console.error('Failed to get active tab:', err);
  }

  openBtn?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && chrome.sidePanel?.open) {
        await chrome.sidePanel.open({ tabId: tab.id });
      }
      window.close();
    } catch (err) {
      console.warn('Direct sidePanel.open failed, fallback to window.close:', err);
      window.close();
    }
  });
});
