// ============================================================
// Module 2: DOM & Endpoint Extractor
// ============================================================

import type { DomExtractorResult, ExtractedLink } from '@/types';

export const DomExtractorModule = {
  container: null as HTMLElement | null,
  currentData: null as DomExtractorResult | null,
  activeFilter: 'all' as 'all' | 'api' | 'internal' | 'external',

  mount(el: HTMLElement): void {
    this.container = el;
    this.render();
  },

  update(data: unknown): void {
    if (!data) return;
    this.currentData = data as DomExtractorResult;
    this.render();
  },

  render(): void {
    if (!this.container) return;

    if (!this.currentData || !this.currentData.links) {
      this.container.innerHTML = `
        <div class="zr-card">
          <div class="card-header">
            <span class="card-title">Endpoint & Link Extractor</span>
            <span class="badge badge-free">DOM Analyzer</span>
          </div>
          <p style="color: var(--muted); font-size: 12px; margin-top: 6px;">
            No DOM links extracted yet. Click refresh ↻ on an active webpage.
          </p>
        </div>
      `;
      return;
    }

    const links = this.currentData.links;
    const apiLinks = links.filter((l) => l.type === 'api');
    const internalLinks = links.filter((l) => l.type === 'internal');
    const externalLinks = links.filter((l) => l.type === 'external');

    const filtered = this.activeFilter === 'all'
      ? links
      : links.filter((l) => l.type === this.activeFilter);

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">DOM Overview</span>
          <span class="badge badge-free">${links.length} Links</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 8px 0;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: #38bdf8;">${apiLinks.length}</div>
            <div style="font-size: 9px; color: var(--muted); text-transform: uppercase;">APIs</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: #a78bfa;">${internalLinks.length}</div>
            <div style="font-size: 9px; color: var(--muted); text-transform: uppercase;">Internal</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: #f59e0b;">${externalLinks.length}</div>
            <div style="font-size: 9px; color: var(--muted); text-transform: uppercase;">External</div>
          </div>
        </div>
        <div style="display: flex; gap: 4px; margin-top: 6px;">
          <button class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'all' ? 'rgba(139,92,246,0.2)' : 'transparent'}; color: var(--text); cursor: pointer;">All</button>
          <button class="filter-btn ${this.activeFilter === 'api' ? 'active' : ''}" data-filter="api" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'api' ? 'rgba(139,92,246,0.2)' : 'transparent'}; color: #38bdf8; cursor: pointer;">APIs (${apiLinks.length})</button>
          <button class="filter-btn ${this.activeFilter === 'internal' ? 'active' : ''}" data-filter="internal" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'internal' ? 'rgba(139,92,246,0.2)' : 'transparent'}; color: #a78bfa; cursor: pointer;">Internal</button>
          <button class="filter-btn ${this.activeFilter === 'external' ? 'active' : ''}" data-filter="external" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'external' ? 'rgba(139,92,246,0.2)' : 'transparent'}; color: #f59e0b; cursor: pointer;">External</button>
        </div>
      </div>

      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 380px;">
        <div class="card-header">
          <span class="card-title">Endpoints (${filtered.length})</span>
          <button id="btn-export-links" style="background: none; border: none; font-size: 10px; color: #a78bfa; cursor: pointer;">Export JSON</button>
        </div>
        <ul class="zr-list" style="margin-top: 6px;">
          ${filtered.slice(0, 100).map((link) => this.renderLinkItem(link)).join('')}
        </ul>
      </div>
    `;

    this.bindEvents();
  },

  renderLinkItem(link: ExtractedLink): string {
    const typeColor = link.type === 'api' ? '#38bdf8' : link.type === 'internal' ? '#a78bfa' : '#f59e0b';
    return `
      <li style="padding: 5px 6px; background: rgba(255,255,255,0.02); border-radius: 4px; margin-bottom: 3px; font-size: 11px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
          <span class="mono" style="color: ${typeColor}; font-weight: 600; font-size: 9px; text-transform: uppercase;">[${link.type}]</span>
          <span style="font-size: 9px; color: ${link.isSecure ? '#10b981' : '#ef4444'};">${link.isSecure ? '🔒 HTTPS' : '⚠️ HTTP'}</span>
        </div>
        <div class="mono" style="font-size: 10px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;" title="${link.href}">
          ${link.href}
        </div>
      </li>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    this.container.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter as 'all' | 'api' | 'internal' | 'external';
        if (filter) {
          this.activeFilter = filter;
          this.render();
        }
      });
    });

    this.container.querySelector('#btn-export-links')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const blob = new Blob([JSON.stringify(this.currentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zentyrecon-endpoints-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};
