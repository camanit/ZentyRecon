// ============================================================
// Module 7: Mosca Theorem Calculator
// ============================================================

import type { MoscaResult } from '@/types';

export const MoscaCalcModule = {
  container: null as HTMLElement | null,
  x: 3, // Migration time (years)
  y: 7, // Shelf-life (years)
  z: 6, // Q-Day estimate (years)

  mount(el: HTMLElement): void {
    this.container = el;
    this.render();
  },

  update(): void {
    this.render();
  },

  calculate(): MoscaResult {
    const totalExposure = this.x + this.y;
    const isAtRisk = totalExposure > this.z;
    const delta = totalExposure - this.z;

    let riskLevel: MoscaResult['riskLevel'] = 'low';
    let message = 'Your systems are well-positioned before Q-Day.';

    if (delta > 5) {
      riskLevel = 'critical';
      message = `CRITICAL: Your data will be exposed ${delta} years before migration can protect it!`;
    } else if (delta > 0) {
      riskLevel = 'high';
      message = `HIGH RISK: Migration must start immediately. Exposure window is ${delta} years.`;
    } else if (delta === 0) {
      riskLevel = 'medium';
      message = 'BORDERLINE: Zero margin for error. Any migration delay creates vulnerability.';
    }

    return {
      x: this.x,
      y: this.y,
      z: this.z,
      isAtRisk,
      riskLevel,
      message,
    };
  },

  render(): void {
    if (!this.container) return;

    const res = this.calculate();
    const riskBadge = res.riskLevel === 'critical'
      ? 'background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4);'
      : res.riskLevel === 'high'
      ? 'background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4);'
      : 'background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4);';

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Mosca's Theorem (X + Y > Z)</span>
          <span class="badge" style="${riskBadge}">${res.riskLevel.toUpperCase()}</span>
        </div>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 10px;">
          Determines if your confidential data will be compromised by quantum cryptanalysis before post-quantum migration finishes.
        </p>

        <!-- Sliders -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>X: Migration Time</span>
              <span class="mono" style="color: #a78bfa; font-weight: 700;">${this.x} Years</span>
            </div>
            <input type="range" id="slider-x" min="1" max="15" value="${this.x}" style="width: 100%; accent-color: #8b5cf6;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>Y: Data Shelf-Life</span>
              <span class="mono" style="color: #38bdf8; font-weight: 700;">${this.y} Years</span>
            </div>
            <input type="range" id="slider-y" min="1" max="30" value="${this.y}" style="width: 100%; accent-color: #06b6d4;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>Z: Estimated Time to Q-Day</span>
              <span class="mono" style="color: #ec4899; font-weight: 700;">${this.z} Years</span>
            </div>
            <input type="range" id="slider-z" min="2" max="20" value="${this.z}" style="width: 100%; accent-color: #ec4899;">
          </div>
        </div>
      </div>

      <div class="zr-card" style="text-align: center;">
        <div style="font-size: 10px; color: var(--muted); text-transform: uppercase; margin-bottom: 4px;">Equation Outcome</div>
        <div class="mono" style="font-size: 18px; font-weight: 800; color: ${res.isAtRisk ? '#ef4444' : '#10b981'};">
          ${this.x} + ${this.y} ${res.isAtRisk ? '>' : '≤'} ${this.z} (${this.x + this.y} vs ${this.z} yrs)
        </div>
        <div style="font-size: 11px; margin-top: 6px; color: var(--text); font-weight: 500;">
          ${res.message}
        </div>
      </div>

      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Recommendation</span>
          <span class="badge badge-pro">Action Plan</span>
        </div>
        <div style="font-size: 11px; color: var(--muted); line-height: 1.6;">
          ${res.isAtRisk
            ? '⚠️ <strong style="color: #ef4444;">Harvest Now, Decrypt Later (HNDL)</strong> attack in progress. Adversaries are recording your encrypted traffic today. Deploy hybrid KEM (ML-KEM/Kyber) immediately to protect secrets whose shelf life extends past Q-Day.'
            : '✅ Current timeline provides sufficient runway. Ensure migration milestones are tracked quarterly.'
          }
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents(): void {
    if (!this.container) return;

    this.container.querySelector('#slider-x')?.addEventListener('input', (e) => {
      this.x = parseInt((e.target as HTMLInputElement).value, 10);
      this.render();
    });

    this.container.querySelector('#slider-y')?.addEventListener('input', (e) => {
      this.y = parseInt((e.target as HTMLInputElement).value, 10);
      this.render();
    });

    this.container.querySelector('#slider-z')?.addEventListener('input', (e) => {
      this.z = parseInt((e.target as HTMLInputElement).value, 10);
      this.render();
    });
  },
};
