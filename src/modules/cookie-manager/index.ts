// ============================================================
// Module 3: Session & Cookie Manager (Enhanced CRUD & Netscape)
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
  currentOrigin: '',
  showAddForm: false,

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
        this.currentOrigin = url.origin;
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
      this.cookies = [];
    }
    this.render();
  },

  async deleteCookie(name: string, domain: string, path: string): Promise<void> {
    try {
      const proto = this.currentOrigin.startsWith('https') ? 'https://' : 'http://';
      const cleanDomain = domain.replace(/^\./, '');
      const url = `${proto}${cleanDomain}${path}`;
      await chrome.cookies.remove({ url, name });
      await this.loadCookies();
    } catch (err) {
      console.error('Failed to delete cookie:', err);
    }
  },

  async setCookie(name: string, value: string, domain: string, path: string, secure: boolean, httpOnly: boolean): Promise<void> {
    try {
      const proto = secure ? 'https://' : 'http://';
      const cleanDomain = domain.replace(/^\./, '');
      const url = `${proto}${cleanDomain}${path}`;
      await chrome.cookies.set({
        url,
        name,
        value,
        domain: cleanDomain,
        path: path || '/',
        secure,
        httpOnly,
        sameSite: 'lax',
      });
      this.showAddForm = false;
      await this.loadCookies();
    } catch (err) {
      console.error('Failed to set cookie:', err);
    }
  },

  render(): void {
    if (!this.container) return;

    const filtered = this.cookies.filter((c) =>
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.value.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const xssVulnerable = this.cookies.filter((c) => !c.httpOnly).length;
    const plaintextVulnerable = this.cookies.filter((c) => !c.secure).length;

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Session Audit (${this.cookies.length})</span>
          <div style="display: flex; gap: 4px;">
            <button id="btn-toggle-add" class="copy-btn" style="color: #a78bfa;">+ Add</button>
            <button id="btn-export-netscape" class="copy-btn" title="Export Netscape format for curl/sqlmap">Netscape</button>
            <button id="btn-export-cookies" class="copy-btn">JSON</button>
          </div>
        </div>

        <!-- Security Risk Badges -->
        <div style="display: flex; gap: 6px; margin: 6px 0;">
          <div style="flex: 1; padding: 5px; border-radius: 6px; background: ${xssVulnerable > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)'}; border: 1px solid ${xssVulnerable > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.25)'}; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: ${xssVulnerable > 0 ? '#f59e0b' : '#10b981'};">${xssVulnerable} JS-Readable</div>
            <div style="font-size: 9px; color: var(--muted);">${xssVulnerable > 0 ? 'XSS Session Risk' : 'Protected'}</div>
          </div>
          <div style="flex: 1; padding: 5px; border-radius: 6px; background: ${plaintextVulnerable > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)'}; border: 1px solid ${plaintextVulnerable > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: ${plaintextVulnerable > 0 ? '#ef4444' : '#10b981'};">${plaintextVulnerable} Insecure</div>
            <div style="font-size: 9px; color: var(--muted);">${plaintextVulnerable > 0 ? 'MITM Interceptable' : 'HTTPS Only'}</div>
          </div>
        </div>

        <!-- Search Bar -->
        <input type="text" id="cookie-search" placeholder="Search cookie name or value..." value="${this.searchQuery}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
      </div>

      <!-- Add Cookie Form (Toggleable) -->
      ${this.showAddForm ? `
        <div class="zr-card" style="border: 1px solid rgba(139,92,246,0.4); background: rgba(15,23,42,0.95);">
          <div class="card-header">
            <span class="card-title">Add / Inject Cookie</span>
            <button id="btn-close-add" style="background: none; border: none; color: var(--muted); cursor: pointer;">✕</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            <input type="text" id="new-c-name" placeholder="Name (e.g. auth_token)" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 5px 7px; font-size: 11px; color: var(--text);">
            <textarea id="new-c-val" rows="2" placeholder="Value..." style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 5px 7px; font-size: 11px; color: var(--text); font-family: monospace;"></textarea>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="new-c-domain" placeholder="Domain" value="${this.currentOrigin ? new URL(this.currentOrigin).hostname : ''}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 5px 7px; font-size: 11px; color: var(--text);">
              <input type="text" id="new-c-path" placeholder="Path" value="/" style="width: 60px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 5px 7px; font-size: 11px; color: var(--text);">
            </div>
            <div style="display: flex; gap: 12px; font-size: 11px; color: var(--muted); align-items: center;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="new-c-secure" checked> Secure</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="new-c-httponly" checked> HttpOnly</label>
            </div>
            <button id="btn-save-cookie" style="padding: 6px; border-radius: 6px; border: none; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; font-weight: 700; font-size: 11px; cursor: pointer;">
              Save & Inject Cookie
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Cookie List -->
      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 380px;">
        ${filtered.length === 0 ? `
          <p style="color: var(--muted); font-size: 11px; text-align: center; padding: 16px 0;">
            No cookies found for this origin.
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
    const isRisky = !c.secure || !c.httpOnly;
    return `
      <li style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid ${isRisky ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}; margin-bottom: 5px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span class="mono" style="font-weight: 700; color: #38bdf8; font-size: 11px; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.name}">
            ${c.name}
          </span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="badge" style="font-size: 8px; ${c.secure ? 'color: #10b981; background: rgba(16,185,129,0.1);' : 'color: #ef4444; background: rgba(239,68,68,0.1);'}">
              ${c.secure ? 'Secure' : 'Insecure'}
            </span>
            <span class="badge" style="font-size: 8px; ${c.httpOnly ? 'color: #10b981; background: rgba(16,185,129,0.1);' : 'color: #f59e0b; background: rgba(245,158,11,0.1);'}">
              ${c.httpOnly ? 'HttpOnly' : 'JS-Read'}
            </span>
            <button class="btn-del-cookie copy-btn" data-name="${c.name}" data-domain="${c.domain}" data-path="${c.path}" style="color: #ef4444; padding: 1px 4px;" title="Delete cookie">✕</button>
          </div>
        </div>
        <div class="mono" style="font-size: 10px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(0,0,0,0.25); padding: 3px 5px; border-radius: 4px;" title="${c.value}">
          ${c.value}
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
      const newInp = this.container?.querySelector('#cookie-search') as HTMLInputElement | null;
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });

    this.container.querySelector('#btn-toggle-add')?.addEventListener('click', () => {
      this.showAddForm = !this.showAddForm;
      this.render();
    });

    this.container.querySelector('#btn-close-add')?.addEventListener('click', () => {
      this.showAddForm = false;
      this.render();
    });

    this.container.querySelector('#btn-save-cookie')?.addEventListener('click', () => {
      const name = (this.container?.querySelector('#new-c-name') as HTMLInputElement)?.value.trim();
      const val = (this.container?.querySelector('#new-c-val') as HTMLTextAreaElement)?.value.trim();
      const domain = (this.container?.querySelector('#new-c-domain') as HTMLInputElement)?.value.trim();
      const path = (this.container?.querySelector('#new-c-path') as HTMLInputElement)?.value.trim() || '/';
      const secure = (this.container?.querySelector('#new-c-secure') as HTMLInputElement)?.checked ?? true;
      const httpOnly = (this.container?.querySelector('#new-c-httponly') as HTMLInputElement)?.checked ?? true;

      if (name && domain) {
        this.setCookie(name, val, domain, path, secure, httpOnly);
      }
    });

    this.container.querySelectorAll<HTMLButtonElement>('.btn-del-cookie').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const domain = btn.dataset.domain;
        const path = btn.dataset.path || '/';
        if (name && domain) {
          this.deleteCookie(name, domain, path);
        }
      });
    });

    // Netscape format export for curl -b / sqlmap / hydra
    this.container.querySelector('#btn-export-netscape')?.addEventListener('click', () => {
      let netscape = '# Netscape HTTP Cookie File\n# Generated by ZentyRecon (https://ctar.tech)\n\n';
      for (const c of this.cookies) {
        const flag = c.domain.startsWith('.') ? 'TRUE' : 'FALSE';
        const secure = c.secure ? 'TRUE' : 'FALSE';
        const expiry = c.expirationDate ? Math.floor(c.expirationDate) : Math.floor(Date.now() / 1000) + 86400;
        netscape += `${c.domain}\t${flag}\t${c.path}\t${secure}\t${expiry}\t${c.name}\t${c.value}\n`;
      }
      this.downloadFile(netscape, `cookies-${Date.now()}.txt`, 'text/plain');
    });

    // JSON export
    this.container.querySelector('#btn-export-cookies')?.addEventListener('click', () => {
      const blob = JSON.stringify(this.cookies, null, 2);
      this.downloadFile(blob, `cookies-${Date.now()}.json`, 'application/json');
    });
  },

  downloadFile(content: string, filename: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
