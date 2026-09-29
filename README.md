# ZentyRecon — All-in-One PQC & Security Recon Suite

> **Browser Extension** | Manifest V3 | Chrome · Edge · Firefox · Brave

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/camanit/ZentyRecon)
[![Version](https://img.shields.io/badge/Version-0.1.0--alpha-purple)](https://github.com/camanit/ZentyRecon)

---

## 🛡️ Tentang ZentyRecon

**ZentyRecon** adalah ekstensi browser All-in-One yang menyatukan 7 tools security recon dalam satu Side Panel terintegrasi. Dirancang khusus untuk pentester, security engineer, dan komunitas cybersecurity yang membutuhkan analisis **Post-Quantum Cryptography (PQC)** secara real-time langsung di browser.

> Bagian dari ekosistem **[ZentyQuetry](https://zentyquetry.ctar.tech)** oleh **CTAR.tech**

---

## ✨ Fitur Utama (Community Edition)

| Modul | Deskripsi |
|---|---|
| 🔍 **Tech Stack Detector** | Deteksi teknologi web & crypto surface (RSA/ECC vs PQC) |
| 🔗 **DOM Link Extractor** | Ekstraksi semua link, API endpoint, dan form dari halaman |
| 🍪 **Cookie Manager** | Manajemen session & cookie secara real-time |
| 🌐 **Proxy Manager** | Switching proxy profil dengan cepat |
| 🛠️ **Security Utilities** | Encoder/decoder, hash generator, payload snippets |
| ⚛️ **PQC Analyzer** | Deteksi cipher suite TLS & PQC readiness score |
| 🧮 **Mosca Calculator** | Kalkulator risiko Store-Now-Decrypt-Later |

---

## 🚀 Quick Start (Development)

```bash
# Clone repo
git clone https://github.com/camanit/ZentyRecon.git
cd ZentyRecon

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env dengan konfigurasi lokal kamu

# Build development
npm run dev

# Load ke Chrome: chrome://extensions → Developer Mode → Load Unpacked → pilih folder dist/
```

---

## 🏗️ Tech Stack

- **Extension Engine:** TypeScript + WebExtension API (Manifest V3)
- **UI Framework:** Svelte / React (TBD) + Tailwind CSS
- **Build Tool:** Vite + @crxjs/vite-plugin
- **Crypto Engine:** Rust → WebAssembly (wasm-bindgen)
- **Testing:** Vitest + Playwright

---

## 📁 Struktur Proyek

```
zentyrecon/
├── manifest.json              # Manifest V3
├── src/
│   ├── background/            # Service Worker
│   ├── sidepanel/             # Unified Side Panel UI
│   ├── content-scripts/       # DOM inspector & TLS scanner
│   ├── modules/               # Feature modules (7 modul)
│   └── wasm/                  # Compiled Rust/WASM engine
├── native-host/               # Rust daemon (ZentyQuetry connector)
├── public/icons/              # Extension icons
└── .env.example               # Template konfigurasi
```

---

## 📜 Lisensi

ZentyRecon Community Edition dirilis di bawah **GNU General Public License v3.0**.

- ✅ Gratis untuk personal & komunitas
- ✅ Open source — boleh modifikasi & distribusi
- ⚠️ Turunan harus tetap GPL v3
- 💼 **Pro/Enterprise Edition** tersedia dengan [lisensi komersial](https://zentyrecon.ctar.tech)

---

## 🔗 Link

- 🌐 **Landing Page:** [zentyrecon.ctar.tech](https://zentyrecon.ctar.tech) *(coming soon)*
- 🖥️ **ZentyQuetry Desktop:** [zentyquetry.ctar.tech](https://zentyquetry.ctar.tech)
- ☁️ **GPlay AI DataBank:** [gplay.ctar.tech](https://gplay.ctar.tech)
- 🐙 **GitHub:** [camanit/ZentyRecon](https://github.com/camanit/ZentyRecon)

---

*Built with ❤️ by [CTAR.tech](https://ctar.tech) — Advancing Post-Quantum Security*
