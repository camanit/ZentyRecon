// ============================================================
// Module 5: Security Utilities Suite
// ============================================================

export const SecurityUtilsModule = {
  container: null as HTMLElement | null,
  activeTool: 'base64' as 'base64' | 'url' | 'hex' | 'sha256' | 'jwt',
  inputText: '',
  outputText: '',

  mount(el: HTMLElement): void {
    this.container = el;
    this.render();
  },

  update(): void {
    this.render();
  },

  async transform(): Promise<void> {
    try {
      switch (this.activeTool) {
        case 'base64':
          this.outputText = btoa(unescape(encodeURIComponent(this.inputText)));
          break;
        case 'url':
          this.outputText = encodeURIComponent(this.inputText);
          break;
        case 'hex': {
          let hex = '';
          for (let i = 0; i < this.inputText.length; i++) {
            hex += this.inputText.charCodeAt(i).toString(16).padStart(2, '0');
          }
          this.outputText = hex;
          break;
        }
        case 'sha256': {
          const enc = new TextEncoder().encode(this.inputText);
          const buf = await crypto.subtle.digest('SHA-256', enc);
          this.outputText = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          break;
        }
        case 'jwt': {
          const parts = this.inputText.split('.');
          if (parts.length >= 2) {
            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            this.outputText = JSON.stringify({ header, payload }, null, 2);
          } else {
            this.outputText = 'Invalid JWT format (expected 3 parts separated by dots)';
          }
          break;
        }
      }
    } catch (err: unknown) {
      this.outputText = `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    this.updateOutput();
  },

  decode(): void {
    try {
      switch (this.activeTool) {
        case 'base64':
          this.outputText = decodeURIComponent(escape(atob(this.inputText)));
          break;
        case 'url':
          this.outputText = decodeURIComponent(this.inputText);
          break;
        case 'hex': {
          let str = '';
          for (let i = 0; i < this.inputText.length; i += 2) {
            str += String.fromCharCode(parseInt(this.inputText.substr(i, 2), 16));
          }
          this.outputText = str;
          break;
        }
        default:
          this.outputText = 'Decode not supported for this one-way function';
      }
    } catch (err: unknown) {
      this.outputText = `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    this.updateOutput();
  },

  updateOutput(): void {
    const outEl = this.container?.querySelector('#util-output') as HTMLTextAreaElement | null;
    if (outEl) outEl.value = this.outputText;
  },

  render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Security Utilities</span>
          <span class="badge badge-free">Instant</span>
        </div>
        <div style="display: flex; gap: 4px; margin-top: 6px;">
          <button class="tool-btn ${this.activeTool === 'base64' ? 'active' : ''}" data-tool="base64" style="flex:1; padding: 5px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'base64' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">Base64</button>
          <button class="tool-btn ${this.activeTool === 'url' ? 'active' : ''}" data-tool="url" style="flex:1; padding: 5px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'url' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">URL</button>
          <button class="tool-btn ${this.activeTool === 'hex' ? 'active' : ''}" data-tool="hex" style="flex:1; padding: 5px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'hex' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">Hex</button>
          <button class="tool-btn ${this.activeTool === 'sha256' ? 'active' : ''}" data-tool="sha256" style="flex:1; padding: 5px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'sha256' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">SHA-256</button>
          <button class="tool-btn ${this.activeTool === 'jwt' ? 'active' : ''}" data-tool="jwt" style="flex:1; padding: 5px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'jwt' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">JWT</button>
        </div>
      </div>

      <div class="zr-card" style="display: flex; flex-direction: column; gap: 8px;">
        <div>
          <label style="font-size: 10px; color: var(--muted); text-transform: uppercase; display: block; margin-bottom: 3px;">Input</label>
          <textarea id="util-input" rows="4" placeholder="Enter text to transform..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text); resize: vertical;">${this.inputText}</textarea>
        </div>

        <div style="display: flex; gap: 6px;">
          <button id="btn-encode" style="flex: 1; padding: 6px; border-radius: 6px; border: none; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; font-weight: 700; font-size: 11px; cursor: pointer;">
            Encode / Hash
          </button>
          <button id="btn-decode" style="flex: 1; padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: var(--text); font-weight: 700; font-size: 11px; cursor: pointer;">
            Decode
          </button>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <label style="font-size: 10px; color: var(--muted); text-transform: uppercase;">Output</label>
            <button id="btn-copy-output" style="background: none; border: none; font-size: 10px; color: #a78bfa; cursor: pointer;">Copy</button>
          </div>
          <textarea id="util-output" rows="4" readonly placeholder="Output will appear here..." style="width: 100%; background: rgba(0,0,0,0.45); border: 1px solid var(--border); border-radius: 6px; padding: 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #38bdf8; resize: vertical;">${this.outputText}</textarea>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents(): void {
    if (!this.container) return;

    this.container.querySelectorAll<HTMLButtonElement>('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool as 'base64' | 'url' | 'hex' | 'sha256' | 'jwt';
        if (tool) {
          this.activeTool = tool;
          this.render();
        }
      });
    });

    const input = this.container.querySelector('#util-input') as HTMLTextAreaElement | null;
    input?.addEventListener('input', (e) => {
      this.inputText = (e.target as HTMLTextAreaElement).value;
    });

    this.container.querySelector('#btn-encode')?.addEventListener('click', () => {
      this.transform();
    });

    this.container.querySelector('#btn-decode')?.addEventListener('click', () => {
      this.decode();
    });

    this.container.querySelector('#btn-copy-output')?.addEventListener('click', () => {
      if (this.outputText) {
        navigator.clipboard.writeText(this.outputText);
      }
    });
  },
};
