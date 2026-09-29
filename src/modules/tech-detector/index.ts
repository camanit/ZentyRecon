// ============================================================
// Module 1: Tech Stack & Cryptographic Detector
// ============================================================

import type { TechDetectorResult, TechItem } from '@/types';

export const TechDetectorModule = {
  container: null as HTMLElement | null,
  currentData: null as TechDetectorResult | null,

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
            <span class="card-title">Detected Technologies</span>
            <span class="badge badge-free">Live</span>
          </div>
          <p style="color: var(--muted); font-size: 12px; margin-top: 6px;">
            No technologies detected yet. Click refresh ↻ or browse to an active page.
          </p>
        </div>
        <div class="zr-card">
          <div class="card-header">
            <span class="card-title">Cryptographic Profile</span>
            <span class="badge badge-pro">TLS / PQC</span>
          </div>
          <div style="font-size: 11px; color: var(--muted); line-height: 1.6;">
            <div>Cipher: <span class="mono" style="color: #38bdf8;">TLS_AES_256_GCM_SHA384</span></div>
            <div>Key Exchange: <span class="mono" style="color: #a78bfa;">X25519 (Classical)</span></div>
            <div>PQC Readiness: <span style="color: #f59e0b; font-weight: 600;">Hybrid Upgrade Needed</span></div>
          </div>
        </div>
      `;
      return;
    }

    const techs = this.currentData.techs;
    const pqcItems = techs.filter((t) => t.isPqcRelevant);

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Detected Techs (${techs.length})</span>
          <span class="badge badge-free">Auto-detected</span>
        </div>
        <ul class="zr-list" style="margin-top: 8px;">
          ${techs.map((tech) => this.renderTechItem(tech)).join('')}
        </ul>
      </div>

      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Cryptographic Profile</span>
          <span class="badge badge-pro">${pqcItems.length > 0 ? 'PQC Hybrid' : 'Standard TLS'}</span>
        </div>
        <div style="font-size: 11px; color: var(--muted); line-height: 1.6; margin-top: 6px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span>Key Exchange:</span>
            <span class="mono" style="color: #a78bfa;">${this.currentData.keyExchange || 'X25519Kyber768 / Hybrid'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span>TLS Protocol:</span>
            <span class="mono" style="color: #38bdf8;">${this.currentData.tlsVersion || 'TLS 1.3'}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>PQC Flag:</span>
            <span style="color: ${pqcItems.length > 0 ? '#10b981' : '#f59e0b'}; font-weight: 700;">
              ${pqcItems.length > 0 ? 'Ready / Post-Quantum' : 'Classical Only'}
            </span>
          </div>
        </div>
      </div>
    `;
  },

  renderTechItem(tech: TechItem): string {
    const badgeColor = tech.isPqcRelevant ? 'background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3);' : 'background: rgba(139,92,246,0.12); color: #a78bfa; border: 1px solid rgba(139,92,246,0.25);';
    return `
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 4px;">
        <div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text);">
            ${tech.name} ${tech.version ? `<span class="mono" style="font-size: 10px; color: var(--muted);">v${tech.version}</span>` : ''}
          </div>
          <div style="font-size: 10px; color: var(--muted); text-transform: capitalize;">
            ${tech.category} · ${(tech.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>
        <span class="badge" style="${badgeColor}">
          ${tech.isPqcRelevant ? 'PQC-Ready' : tech.category}
        </span>
      </li>
    `;
  },
};
