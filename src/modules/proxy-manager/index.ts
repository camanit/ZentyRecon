// ============================================================
// Module 4: Dynamic Proxy Manager (Enhanced & Persistent)
// ============================================================

import type { ProxyProfile } from '@/types';

const DEFAULT_PROFILES: ProxyProfile[] = [
  { id: 'direct', name: 'Direct Connection (No Proxy)', type: 'direct', isActive: true, createdAt: 1 },
  { id: 'burp', name: 'Burp Suite / Caido', type: 'http', host: '127.0.0.1', port: 8080, isActive: false, createdAt: 2 },
  { id: 'zap', name: 'OWASP ZAP', type: 'http', host: '127.0.0.1', port: 8081, isActive: false, createdAt: 3 },
  { id: 'tor', name: 'Tor SOCKS5 Daemon', type: 'socks5', host: '127.0.0.1', port: 9050, isActive: false, createdAt: 4 },
  { id: 'tor-browser', name: 'Tor Browser', type: 'socks5', host: '127.0.0.1', port: 9150, isActive: false, createdAt: 5 },
];

export const ProxyManagerModule = {
  container: null as HTMLElement | null,
  activeProxyId: 'direct' as string,
  profiles: [...DEFAULT_PROFILES] as ProxyProfile[],
  bypassList: ['<local>', 'localhost', '127.0.0.1', '::1'],

  async mount(el: HTMLElement): Promise<void> {
    this.container = el;
    await this.loadFromStorage();
    this.render();
  },

  update(): void {
    this.render();
  },

  async loadFromStorage(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get(['zr_proxy_profiles', 'zr_active_proxy']);
      if (stored.zr_proxy_profiles && Array.isArray(stored.zr_proxy_profiles)) {
        this.profiles = stored.zr_proxy_profiles;
      }
      if (stored.zr_active_proxy && typeof stored.zr_active_proxy === 'string') {
        this.activeProxyId = stored.zr_active_proxy;
        this.profiles.forEach((p) => (p.isActive = p.id === this.activeProxyId));
      }
    } catch {
      // Fallback defaults
    }
  },

  async saveToStorage(): Promise<void> {
    try {
      await chrome.storage.local.set({
        zr_proxy_profiles: this.profiles,
        zr_active_proxy: this.activeProxyId,
      });
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
  },

  async setProxy(profileId: string): Promise<void> {
    const prof = this.profiles.find((p) => p.id === profileId);
    if (!prof) return;

    this.profiles.forEach((p) => (p.isActive = p.id === profileId));
    this.activeProxyId = profileId;
    await this.saveToStorage();

    if (chrome.proxy?.settings) {
      if (prof.type === 'direct') {
        await chrome.proxy.settings.set({
          value: { mode: 'direct' },
          scope: 'regular',
        });
      } else {
        const scheme = prof.type === 'socks5' ? 'socks5' : 'http';
        await chrome.proxy.settings.set({
          value: {
            mode: 'fixed_servers',
            rules: {
              singleProxy: {
                scheme,
                host: prof.host || '127.0.0.1',
                port: prof.port || 8080,
              },
              bypassList: this.bypassList,
            },
          },
          scope: 'regular',
        });
      }
    }

    this.render();
  },

  render(): void {
    if (!this.container) return;

    const activeProf = this.profiles.find((p) => p.id === this.activeProxyId) || this.profiles[0];
    const isDirect = activeProf.type === 'direct';

    this.container.innerHTML = `
      <!-- Active Proxy Status Banner -->
      <div class="zr-card" style="border: 1px solid ${isDirect ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.4)'}; background: ${isDirect ? 'rgba(16,185,129,0.05)' : 'rgba(139,92,246,0.08)'};">
        <div class="card-header">
          <span class="card-title">Active Route</span>
          <span class="badge ${isDirect ? 'badge-free' : 'badge-pro'}">
            ${isDirect ? 'Direct (Clear)' : `${activeProf.type.toUpperCase()} Intercept`}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-top: 2px;">
          ${activeProf.name}
        </div>
        <div class="mono" style="font-size: 11px; color: ${isDirect ? 'var(--muted)' : '#38bdf8'}; margin-top: 3px;">
          ${isDirect ? 'Direct connection to target hosts' : `Target: ${activeProf.host}:${activeProf.port}`}
        </div>
      </div>

      <!-- Quick Profiles List -->
      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 280px;">
        <div class="card-header">
          <span class="card-title">Proxy Profiles (${this.profiles.length})</span>
          <span class="badge badge-free">One-Click Switch</span>
        </div>
        <ul class="zr-list" style="margin-top: 6px;">
          ${this.profiles.map((p) => this.renderProfileItem(p)).join('')}
        </ul>
      </div>

      <!-- Custom Proxy & Bypass List -->
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Add Custom Proxy</span>
          <span class="badge badge-ent">Custom</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <div style="display: flex; gap: 6px;">
            <select id="custom-type" style="width: 85px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px; font-size: 11px; color: var(--text);">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks5">SOCKS5</option>
            </select>
            <input type="text" id="custom-name" placeholder="Profile Name" value="Custom Proxy" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
          </div>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="custom-host" placeholder="Host (e.g. 127.0.0.1)" value="127.0.0.1" style="flex:2; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
            <input type="number" id="custom-port" placeholder="Port" value="8888" style="flex:1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
          </div>
          <button id="btn-save-custom-proxy" style="padding: 7px; border-radius: 6px; border: none; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; font-weight: 700; font-size: 11px; cursor: pointer;">
            Add & Apply Profile
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  renderProfileItem(p: ProxyProfile): string {
    const isAct = p.id === this.activeProxyId;
    return `
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: ${isAct ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)'}; border-radius: 6px; border: 1px solid ${isAct ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.04)'}; margin-bottom: 5px;">
        <div>
          <div style="font-weight: 700; font-size: 11px; color: ${isAct ? '#a78bfa' : 'var(--text)'};">
            ${p.name}
          </div>
          <div class="mono" style="font-size: 10px; color: var(--muted); margin-top: 2px;">
            ${p.type === 'direct' ? 'Direct internet routing' : `${p.type.toUpperCase()} · ${p.host}:${p.port}`}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="btn-select-proxy copy-btn" data-id="${p.id}" style="${isAct ? 'background: #8b5cf6; color: white;' : ''}">
            ${isAct ? 'Active ✓' : 'Switch'}
          </button>
          ${p.id.startsWith('custom-') ? `
            <button class="btn-del-proxy copy-btn" data-id="${p.id}" style="color: #ef4444;">✕</button>
          ` : ''}
        </div>
      </li>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    this.container.querySelectorAll<HTMLButtonElement>('.btn-select-proxy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) this.setProxy(id);
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.btn-del-proxy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (id) {
          this.profiles = this.profiles.filter((p) => p.id !== id);
          if (this.activeProxyId === id) {
            await this.setProxy('direct');
          } else {
            await this.saveToStorage();
            this.render();
          }
        }
      });
    });

    this.container.querySelector('#btn-save-custom-proxy')?.addEventListener('click', () => {
      const type = ((this.container?.querySelector('#custom-type') as HTMLSelectElement)?.value || 'http') as ProxyProfile['type'];
      const name = (this.container?.querySelector('#custom-name') as HTMLInputElement)?.value.trim() || 'Custom Proxy';
      const host = (this.container?.querySelector('#custom-host') as HTMLInputElement)?.value.trim() || '127.0.0.1';
      const port = parseInt((this.container?.querySelector('#custom-port') as HTMLInputElement)?.value.trim() || '8080', 10);

      const id = `custom-${Date.now()}`;
      const newProf: ProxyProfile = {
        id,
        name,
        type,
        host,
        port,
        isActive: true,
        createdAt: Date.now(),
      };

      this.profiles.push(newProf);
      this.setProxy(id);
    });
  },
};
