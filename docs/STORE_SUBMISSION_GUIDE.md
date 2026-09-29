# 🚀 ZentyRecon — Chrome Web Store & Edge Add-ons Submission Guide

> **Dokumen Panduan Rilis v1.0.0**  
> Panduan lengkap siap pakai untuk mengunggah dan mempublikasikan ZentyRecon ke Chrome Web Store Developer Console dan Microsoft Edge Add-ons.

---

## 1. Persiapan Akun Pengembang (Developer Accounts)

### A. Chrome Web Store Developer Console
1. Kunjungi: [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Login menggunakan akun Google.
3. Bayar biaya registrasi satu kali (**$5 USD one-time fee**) untuk akun developer seumur hidup.
4. Siapkan nomor kontak atau email pendukung: `support@ctar.tech` atau email akun pengembang.

### B. Microsoft Edge Add-ons Partner Center (Opsional tapi Direkomendasikan)
1. Kunjungi: [https://partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge)
2. Login dengan akun Microsoft.
3. Pendaftaran akun pengembang Microsoft Edge adalah **100% GRATIS** (tanpa biaya).
4. Dapat langsung mengunggah file zip yang sama persis (`zentyrecon-v1.0.0.zip`).

---

## 2. File Paket Ekstensi (Release Bundle)

File zip resmi telah dibuat dan tersimpan di:
```text
release/zentyrecon-v1.0.0.zip (Ukuran: ~60 KB)
```
*Catatan: Jika ada pembaruan kode di kemudian hari, cukup jalankan `npm run package` di terminal.*

---

## 3. Metadata Toko (Copy-Paste Ready)

### 📌 Listing Information
- **Item Name:** `ZentyRecon`
- **Summary (Ringkasan - Maks. 132 Karakter):**
  ```text
  All-in-One PQC & Security Recon Suite. Replace 7 extensions with one unified Side Panel for web pentesting & crypto audit.
  ```

- **Detailed Description (Deskripsi Lengkap):**
  ```markdown
  🛡️ ZentyRecon — All-in-One Post-Quantum Cryptography & Web Security Recon Suite

  Replace 7 separate browser extensions with a single unified, lightweight, and blazing-fast Side Panel. Built for penetration testers, security engineers, bug bounty hunters, and developers preparing for the Post-Quantum Cryptography (PQC) migration.

  🚀 KEY FEATURES & MODULES:

  1. 🔍 Tech Stack Detector:
     Deep fingerprinting for 100+ technologies, frameworks, CMS, servers, CDN, and crypto libraries with HNDL quantum risk alerts.

  2. 🔗 DOM & API Endpoint Extractor:
     Discovers hidden API routes, REST endpoints, GraphQL queries, and AWS S3 buckets from HTML DOM and inline JavaScript bundles. Export to JSON, CSV, or wordlists for ffuf/dirsearch.

  3. 🍪 Session & Cookie Manager:
     Inspect, inject, edit, and delete cookies per domain. Built-in security audit detects missing HttpOnly (XSS risk) and missing Secure flags. Export to Netscape format for curl and sqlmap.

  4. 🌐 Dynamic Proxy Manager:
     1-click routing to Burp Suite, OWASP ZAP, Tor SOCKS5, or custom upstream proxies with persistent local storage.

  5. 🛠️ Security Utilities Suite:
     Instant encoders/decoders (Base64, URL, Hex, HTML Entities, JWT decoder), cryptographic hashing (SHA-1, SHA-256, SHA-512 via WebCrypto API), pentest cheat-sheet payloads, and dynamic reverse shell generator (Bash, Python, Netcat, PowerShell).

  6. ⚛️ PQC Crypto & Threat Intel Analyzer:
     Evaluates TLS cipher suites, NIST FIPS 203 (ML-KEM) hybrid encapsulation readiness, Content Security Policy (CSP) weaknesses, HSTS Preload readiness, and queries public Certificate Transparency logs via crt.sh. Generates CycloneDX-standard Cryptographic Bill of Materials (CBOM).

  7. 🧮 Mosca Theorem Calculator (WASM-Powered):
     Interactive simulation of the Mosca theorem (X + Y > Z) to calculate quantum exposure timelines and migration deadlines, powered by zero-latency WebAssembly binary arithmetic.

  🔒 PRIVACY & ZERO-TELEMETRY GUARANTEE:
  ZentyRecon runs 100% locally in your browser. It does NOT collect, sell, or transmit any user browsing activity, passwords, or session cookies to any remote server.

  Part of the CTAR.tech and ZentyQuetry security ecosystem.
  Community Edition is open-source under GPL v3.
  ```

- **Category:** `Developer Tools`
- **Primary Language:** `English`
- **Website URL:** `https://zentyrecon.ctar.tech`

---

## 4. Google Chrome Web Store Privacy Practices Justification

> ⚠️ **SANGAT PENTING:** Google akan menolak ekstensi jika alasan penggunaan permissions (*justification*) tidak diisi secara jelas dan terperinci. Gunakan teks justifikasi berikut pada tab **Privacy practices**:

### Single Purpose Description
```text
ZentyRecon provides an all-in-one local security reconnaissance and Post-Quantum Cryptography readiness analysis suite within the browser side panel for developers and security engineers.
```

### Permission Justifications

| Permission | Justification Text (Siap Copy-Paste) |
|---|---|
| `activeTab` & `tabs` | "Used to detect the current tab's hostname and URL context so the user can inspect technologies and security headers of the active page." |
| `sidePanel` | "Used to render the primary multi-module reconnaissance interface in the Chrome native side panel." |
| `storage` | "Used to persist user interface preferences (such as compact mode and font sizing) and custom local proxy configurations." |
| `cookies` | "Used by the Cookie Manager module to audit session security flags (HttpOnly, Secure, SameSite) and export cookies in Netscape format for security testing." |
| `proxy` | "Used by the Proxy Manager module to route active browser traffic through local penetration testing tools like Burp Suite or OWASP ZAP upon user request." |
| `scripting` | "Used to inspect client-side JavaScript bundles and DOM elements to identify front-end frameworks and API endpoints." |
| `webRequest` | "Used solely in passive mode to inspect live response security headers such as HSTS, Content-Security-Policy, and X-Frame-Options." |
| `declarativeNetRequest` | "Used to enforce local proxy routing rules safely without modifying network traffic content." |

### Data Usage Declarations:
- **Does your product collect user data?** ➔ Pilih **NO**.
- Centang pernyataan:
  - *"I certify that this extension complies with the Limited Use policy."*
  - *"I certify that this extension does not sell user data to third parties."*
  - *"I certify that this extension does not use or transfer user data for purposes unrelated to the item's core functionality."*

---

## 5. Tautan Legal & Dukungan (Wajib)

- **Privacy Policy URL:** `https://zentyrecon.ctar.tech/privacy`
- **Terms of Service URL:** `https://zentyrecon.ctar.tech/terms`
- **Support / Issues URL:** `https://github.com/camanit/ZentyRecon/issues`

---

## 6. Persiapan Visual Assets (Screenshots & Promo Tiles)

Untuk memenuhi syarat visual Chrome Web Store:
1. **Store Icon:** 128x128 PNG (Tersedia di `public/icons/icon128.png`).
2. **Screenshots (Minimal 1, Maksimal 5):**
   - Resolusi: **1280x800 px** atau **640x400 px**.
   - Menampilkan Side Panel ZentyRecon sedang aktif menganalisis web (misal: tab PQC, DOM Extractor, dan Cookie Manager).
3. **Small Promo Tile (Opsional):** 440x280 px PNG.
4. **Marquee Promo Tile (Opsional):** 1400x560 px PNG.

---

## 7. Rilis Komunitas GitHub (GitHub Releases)

Untuk mendistribusikan release binary ke komunitas open-source:
```bash
git tag -a v1.0.0 -m "Release ZentyRecon v1.0.0"
git push origin v1.0.0
```
Lalu di GitHub:
1. Masuk ke: [https://github.com/camanit/ZentyRecon/releases/new](https://github.com/camanit/ZentyRecon/releases/new)
2. Pilih tag `v1.0.0`.
3. Judul: `ZentyRecon v1.0.0 — All-in-One PQC & Security Recon Suite`
4. Lampirkan file: `release/zentyrecon-v1.0.0.zip`.
5. Klik **Publish release**.
