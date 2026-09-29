// ============================================================
// Module 1: Tech Stack & Cryptographic Detector (Enhanced)
// ============================================================

import type { TechDetectorResult, TechItem } from '@/types';

export const TechDetectorModule = {
  container: null as HTMLElement | null,
  currentData: null as TechDetectorResult | null,
  activeCategory: 'all' as 'all' | 'framework' | 'crypto' | 'cdn' | 'server' | 'analytics',
  searchQuery: '',

  mount(el: HTMLElement): void {
    this.container = el;
    this.render();
  },

  update(data: unknown): void {
    if (!data) return;
    this.currentData = data as TechDetectorResult;
    this.render();
  },

  render(): void {
    if (!this.container) return;

    if (!this.currentData || !this.currentData.techs || this.currentData.techs.length === 0) {
      this.container.innerHTML = `
        <div class="zr-card">
          <div class="card-header">
            <span class="card-title">Technology & Crypto Recon</span>
            <span class="badge badge-free">Live Scanner</span>
          </div>
          <p style="color: var(--muted); font-size: 11px; margin-top: 6px; line-height: 1.6;">
            Awaiting scan data. Navigate to any website or click refresh ↻ above to trigger active signature detection.
          </p>
        </div>

        <div class="zr-card">
          <div class="card-header">
            <span class="card-title">Crypto Surface Baseline</span>
            <span class="badge badge-pro">TLS / PQC</span>
          </div>
          <div style="font-size: 11px; color: var(--muted); line-height: 1.8; margin-top: 4px;">
            <div>Target Protocol: <span class="mono" style="color: #38bdf8;">TLS 1.3 / HTTPS</span></div>
            <div>Classical Anchor: <span class="mono" style="color: #a78bfa;">X25519 (ECDHE)</span></div>
            <div>Quantum Risk: <span style="color: #f59e0b; font-weight: 700;">HNDL Vulnerable</span></div>
          </div>
        </div>
      `;
      return;
    }

    const techs = this.currentData.techs;
    const pqcItems = techs.filter((t) => t.isPqcRelevant);
    const cryptoItems = techs.filter((t) => t.category === 'crypto');

    const filtered = techs.filter((t) => {
      const matchCat = this.activeCategory === 'all' || t.category === this.activeCategory;
      const matchSearch = !this.searchQuery ||
        t.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    this.container.innerHTML = `
      <!-- Stats Overview -->
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Stack Recon (${techs.length} Detected)</span>
          <span class="badge ${pqcItems.length > 0 ? 'badge-pro' : 'badge-free'}">
            ${pqcItems.length > 0 ? `${pqcItems.length} PQC Elements` : 'Classical Stack'}
          </span>
        </div>

        <!-- Search Bar -->
        <div style="margin-top: 6px; display: flex; gap: 6px;">
          <input type="text" id="tech-search" placeholder="Search technologies or crypto..." value="${this.searchQuery}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
        </div>

        <!-- Category Pills -->
        <div style="display: flex; gap: 4px; margin-top: 8px; overflow-x: auto; padding-bottom: 2px;">
          <button class="cat-pill ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">All (${techs.length})</button>
          <button class="cat-pill ${this.activeCategory === 'framework' ? 'active' : ''}" data-cat="framework">Frameworks</button>
          <button class="cat-pill ${this.activeCategory === 'crypto' ? 'active' : ''}" data-cat="crypto">Crypto (${cryptoItems.length})</button>
          <button class="cat-pill ${this.activeCategory === 'cdn' ? 'active' : ''}" data-cat="cdn">CDN / Edge</button>
          <button class="cat-pill ${this.activeCategory === 'server' ? 'active' : ''}" data-cat="server">Servers</button>
          <button class="cat-pill ${this.activeCategory === 'analytics' ? 'active' : ''}" data-cat="analytics">Analytics</button>
        </div>
      </div>

      <!-- Detected List -->
      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 380px;">
        <div class="card-header">
          <span class="card-title">Identified Components (${filtered.length})</span>
          <button id="btn-export-techs" style="background: none; border: none; font-size: 10px; color: #a78bfa; cursor: pointer;">Export JSON</button>
        </div>

        ${filtered.length === 0 ? `
          <p style="color: var(--muted); font-size: 11px; text-align: center; padding: 14px 0;">
            No components found matching current filter.
          </p>
        ` : `
          <ul class="zr-list" style="margin-top: 6px;">
            ${filtered.map((t) => this.renderTechItem(t)).join('')}
          </ul>
        `}
      </div>

      <!-- Cryptographic Surface Card -->
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Crypto Surface Assessment</span>
          <span class="badge ${pqcItems.length > 0 ? 'badge-free' : 'badge-pro'}">
            ${pqcItems.length > 0 ? 'Hybrid Active' : 'Classical Warning'}
          </span>
        </div>
        <div style="font-size: 11px; color: var(--muted); line-height: 1.6; margin-top: 4px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
            <span>Key Agreement:</span>
            <span class="mono" style="color: #a78bfa;">${pqcItems.some(i => i.name.includes('Cloudflare') || i.name.includes('liboqs')) ? 'X25519Kyber768 (Draft)' : 'X25519 (ECDHE)'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
            <span>Harvest-Now-Decrypt-Later:</span>
            <span style="color: ${pqcItems.length > 0 ? '#10b981' : '#ef4444'}; font-weight: 700;">
              ${pqcItems.length > 0 ? 'Low Risk (Encrypted with KEM)' : 'High Vulnerability ⚠️'}
            </span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  renderTechItem(tech: TechItem): string {
    const isPqc = tech.isPqcRelevant;
    const badgeStyle = isPqc
      ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35);'
      : tech.category === 'crypto'
      ? 'background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3);'
      : 'background: rgba(139, 92, 246, 0.12); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.25);';

    return `
      <li style="padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid ${isPqc ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)'}; margin-bottom: 5px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; font-size: 12px; color: var(--text);">
            ${tech.name} ${tech.version ? `<span class="mono" style="font-size: 10px; color: #38bdf8;">v${tech.version}</span>` : ''}
          </span>
          <span class="badge" style="${badgeStyle}; font-size: 9px;">
            ${isPqc ? 'PQC-Ready' : tech.category}
          </span>
        </div>
        ${tech.evidence ? `
          <div style="font-size: 10px; color: ${isPqc ? '#34d399' : 'var(--muted)'}; margin-top: 4px; line-height: 1.4;">
            ${tech.evidence}
          </div>
        ` : ''}
      </li>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    const searchInput = this.container.querySelector('#tech-search') as HTMLInputElement | null;
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
      const newInp = this.container?.querySelector('#tech-search') as HTMLInputElement | null;
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });

    this.container.querySelectorAll<HTMLButtonElement>('.cat-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat as typeof this.activeCategory;
        if (cat) {
          this.activeCategory = cat;
          this.render();
        }
      });
    });

    this.container.querySelector('#btn-export-techs')?.addEventListener('click', () => {
      if (!this.currentData) return;
      const blob = new Blob([JSON.stringify(this.currentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zentyrecon-tech-stack-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};
