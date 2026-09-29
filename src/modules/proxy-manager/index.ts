// ============================================================
// Module 4: Dynamic Proxy Manager
// ============================================================

import type { ProxyProfile } from '@/types';

export const ProxyManagerModule = {
  container: null as HTMLElement | null,
  activeProxy: 'direct' as string,
  profiles: [
    { id: 'direct', name: 'Direct (No Proxy)', type: 'direct', isActive: true, createdAt: Date.now() },
    { id: 'burp', name: 'Burp Suite / Caido', type: 'http', host: '127.0.0.1', port: 8080, isActive: false, createdAt: Date.now() },
    { id: 'tor', name: 'Tor Proxy', type: 'socks5', host: '127.0.0.1', port: 9050, isActive: false, createdAt: Date.now() },
  ] as ProxyProfile[],

  mount(el: HTMLElement): void {
    this.container = el;
    this.render();
  },

  update(): void {
    this.render();
  },

  async setProxy(profileId: string): Promise<void> {
    const prof = this.profiles.find((p) => p.id === profileId);
    if (!prof) return;

    this.profiles.forEach((p) => (p.isActive = p.id === profileId));
    this.activeProxy = profileId;

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
              bypassList: ['<local>', 'localhost', '127.0.0.1'],
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

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Proxy Routing</span>
          <span class="badge ${this.activeProxy === 'direct' ? 'badge-free' : 'badge-pro'}">
            ${this.activeProxy.toUpperCase()}
          </span>
        </div>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
          Seamlessly intercept or route browser traffic into pen-test proxies or Tor nodes.
        </p>

        <ul class="zr-list">
          ${this.profiles.map((p) => this.renderProfileItem(p)).join('')}
        </ul>
      </div>

      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Custom Proxy Settings</span>
          <span class="badge badge-ent">Custom</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="custom-host" placeholder="Host (e.g. 127.0.0.1)" value="127.0.0.1" style="flex:2; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
            <input type="number" id="custom-port" placeholder="Port" value="8080" style="flex:1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
          </div>
          <button id="btn-apply-custom" style="padding: 7px; border-radius: 6px; border: none; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; font-weight: 700; font-size: 11px; cursor: pointer;">
            Apply Custom Proxy
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  renderProfileItem(p: ProxyProfile): string {
    const isAct = p.id === this.activeProxy;
    return `
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: ${isAct ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)'}; border-radius: 6px; border: 1px solid ${isAct ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.04)'}; margin-bottom: 4px;">
        <div>
          <div style="font-weight: 700; font-size: 11px; color: ${isAct ? '#a78bfa' : 'var(--text)'};">
            ${p.name}
          </div>
          <div class="mono" style="font-size: 9px; color: var(--muted);">
            ${p.type === 'direct' ? 'System direct connection' : `${p.type.toUpperCase()} · ${p.host}:${p.port}`}
          </div>
        </div>
        <button class="btn-select-proxy" data-id="${p.id}" style="padding: 3px 8px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${isAct ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}; color: white; cursor: pointer;">
          ${isAct ? 'Active ✓' : 'Use'}
        </button>
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

    this.container.querySelector('#btn-apply-custom')?.addEventListener('click', () => {
      const hostInput = this.container?.querySelector('#custom-host') as HTMLInputElement | null;
      const portInput = this.container?.querySelector('#custom-port') as HTMLInputElement | null;
      const host = hostInput?.value.trim() || '127.0.0.1';
      const port = parseInt(portInput?.value.trim() || '8080', 10);

      const customIndex = this.profiles.findIndex((p) => p.id === 'custom');
      const customProf: ProxyProfile = {
        id: 'custom',
        name: `Custom (${host}:${port})`,
        type: 'http',
        host,
        port,
        isActive: true,
        createdAt: Date.now(),
      };

      if (customIndex >= 0) {
        this.profiles[customIndex] = customProf;
      } else {
        this.profiles.push(customProf);
      }

      this.setProxy('custom');
    });
  },
};
