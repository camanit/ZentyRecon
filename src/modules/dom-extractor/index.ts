// ============================================================
// Module 2: DOM & Endpoint Extractor (Enhanced)
// ============================================================

import type { DomExtractorResult, ExtractedLink } from '@/types';

export const DomExtractorModule = {
  container: null as HTMLElement | null,
  currentData: null as DomExtractorResult | null,
  activeFilter: 'all' as 'all' | 'api' | 'internal' | 'external',
  searchQuery: '',

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
          <p style="color: var(--muted); font-size: 11px; margin-top: 6px; line-height: 1.6;">
            No DOM links extracted yet. Browse to any website or click refresh ↻ above to inspect pages, form actions, and script bundles.
          </p>
        </div>
      `;
      return;
    }

    const links = this.currentData.links;
    const apiLinks = links.filter((l) => l.type === 'api');
    const internalLinks = links.filter((l) => l.type === 'internal');
    const externalLinks = links.filter((l) => l.type === 'external');

    const filtered = links.filter((l) => {
      const matchType = this.activeFilter === 'all' || l.type === this.activeFilter;
      const matchSearch = !this.searchQuery ||
        l.href.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        l.text.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchType && matchSearch;
    });

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">DOM Overview</span>
          <span class="badge badge-free">${links.length} Discovered</span>
        </div>

        <!-- Metrics Grid -->
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

        <!-- Search Bar -->
        <div style="margin-top: 6px;">
          <input type="text" id="link-search" placeholder="Search path, endpoint, or query..." value="${this.searchQuery}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
        </div>

        <!-- Filter Buttons -->
        <div style="display: flex; gap: 4px; margin-top: 6px;">
          <button class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'all' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">All (${links.length})</button>
          <button class="filter-btn ${this.activeFilter === 'api' ? 'active' : ''}" data-filter="api" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'api' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: #38bdf8; cursor: pointer;">APIs (${apiLinks.length})</button>
          <button class="filter-btn ${this.activeFilter === 'internal' ? 'active' : ''}" data-filter="internal" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'internal' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: #a78bfa; cursor: pointer;">Internal</button>
          <button class="filter-btn ${this.activeFilter === 'external' ? 'active' : ''}" data-filter="external" style="flex:1; padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeFilter === 'external' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: #f59e0b; cursor: pointer;">External</button>
        </div>
      </div>

      <!-- Links List with Export Actions -->
      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 380px;">
        <div class="card-header">
          <span class="card-title">Endpoints (${filtered.length})</span>
          <div style="display: flex; gap: 6px;">
            <button id="btn-export-txt" class="copy-btn" title="Export as Wordlist (ffuf/dirsearch)">TXT</button>
            <button id="btn-export-csv" class="copy-btn" title="Export as CSV">CSV</button>
            <button id="btn-export-json" class="copy-btn" title="Export as JSON">JSON</button>
          </div>
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
      <li style="padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 4px; font-size: 11px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="mono" style="color: ${typeColor}; font-weight: 700; font-size: 9px; text-transform: uppercase;">[${link.type}]</span>
            <span style="font-size: 9px; color: ${link.isSecure ? '#10b981' : '#ef4444'};">${link.isSecure ? '🔒' : '⚠️ HTTP'}</span>
          </div>
          <button class="copy-link-btn copy-btn" data-url="${link.href}">Copy</button>
        </div>
        <div class="mono" style="font-size: 10px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 3px;" title="${link.href}">
          ${link.href}
        </div>
      </li>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    const searchInput = this.container.querySelector('#link-search') as HTMLInputElement | null;
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
      const newInp = this.container?.querySelector('#link-search') as HTMLInputElement | null;
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });

    this.container.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter as typeof this.activeFilter;
        if (filter) {
          this.activeFilter = filter;
          this.render();
        }
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.copy-link-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url) {
          navigator.clipboard.writeText(url);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        }
      });
    });

    // Export TXT wordlist
    this.container.querySelector('#btn-export-txt')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const lines = this.currentData.links.map((l) => l.href).join('\n');
      this.downloadFile(lines, `zentyrecon-endpoints-${Date.now()}.txt`, 'text/plain');
    });

    // Export CSV
    this.container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const csv = ['URL,Type,Secure,Text'].concat(
        this.currentData.links.map((l) => `"${l.href}","${l.type}","${l.isSecure}","${(l.text || '').replace(/"/g, '""')}"`)
      ).join('\n');
      this.downloadFile(csv, `zentyrecon-endpoints-${Date.now()}.csv`, 'text/csv');
    });

    // Export JSON
    this.container.querySelector('#btn-export-json')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const json = JSON.stringify(this.currentData, null, 2);
      this.downloadFile(json, `zentyrecon-endpoints-${Date.now()}.json`, 'application/json');
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
