// ============================================================
// Module 3: Session & Cookie Manager
// ============================================================

export interface ZRStoredCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  expirationDate?: number;
}

export const CookieManagerModule = {
  container: null as HTMLElement | null,
  cookies: [] as ZRStoredCookie[],
  searchQuery: '',

  mount(el: HTMLElement): void {
    this.container = el;
    this.loadCookies();
  },

  update(): void {
    this.loadCookies();
  },

  async loadCookies(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        const url = new URL(tab.url);
        const rawCookies = await chrome.cookies.getAll({ domain: url.hostname });
        this.cookies = rawCookies.map((c) => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite || 'unspecified',
          expirationDate: c.expirationDate,
        }));
      }
    } catch {
      // Fallback empty if running in non-extension or restricted context
      this.cookies = [];
    }
    this.render();
  },

  render(): void {
    if (!this.container) return;

    const filtered = this.cookies.filter((c) =>
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.value.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const insecureCount = this.cookies.filter((c) => !c.secure || !c.httpOnly).length;

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Active Cookies (${this.cookies.length})</span>
          ${insecureCount > 0 ? `<span class="badge" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);">${insecureCount} Insecure</span>` : '<span class="badge badge-free">All Secure</span>'}
        </div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <input type="text" id="cookie-search" placeholder="Search cookie name or value..." value="${this.searchQuery}" style="flex:1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
          <button id="btn-export-cookies" style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #a78bfa; border-radius: 6px; padding: 0 8px; font-size: 11px; cursor: pointer;">Export</button>
        </div>
      </div>

      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 400px;">
        ${filtered.length === 0 ? `
          <p style="color: var(--muted); font-size: 11px; text-align: center; padding: 12px 0;">
            No cookies found matching query or for this origin.
          </p>
        ` : `
          <ul class="zr-list">
            ${filtered.map((c) => this.renderCookieItem(c)).join('')}
          </ul>
        `}
      </div>
    `;

    this.bindEvents();
  },

  renderCookieItem(c: ZRStoredCookie): string {
    const isSecurityRisky = !c.secure || !c.httpOnly;
    return `
      <li style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid ${isSecurityRisky ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}; margin-bottom: 5px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span class="mono" style="font-weight: 700; color: #38bdf8; font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${c.name}
          </span>
          <div style="display: flex; gap: 3px;">
            <span class="badge" style="font-size: 8px; ${c.secure ? 'color: #10b981; background: rgba(16,185,129,0.1);' : 'color: #ef4444; background: rgba(239,68,68,0.1);'}">
              ${c.secure ? 'Secure' : 'No-Secure'}
            </span>
            <span class="badge" style="font-size: 8px; ${c.httpOnly ? 'color: #10b981; background: rgba(16,185,129,0.1);' : 'color: #f59e0b; background: rgba(245,158,11,0.1);'}">
              ${c.httpOnly ? 'HttpOnly' : 'JS-Read'}
            </span>
          </div>
        </div>
        <div class="mono" style="font-size: 10px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(0,0,0,0.25); padding: 3px 5px; border-radius: 4px;">
          ${c.value.slice(0, 80)}${c.value.length > 80 ? '...' : ''}
        </div>
      </li>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    const input = this.container.querySelector('#cookie-search') as HTMLInputElement | null;
    input?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
    });

    this.container.querySelector('#btn-export-cookies')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(this.cookies, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zentyrecon-cookies-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};
