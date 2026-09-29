# Privacy Policy — ZentyRecon

**Last Updated:** September 29, 2026  
**Effective Date:** September 29, 2026  
**Publisher:** CTAR.tech / ZentyQuetry Team ([https://ctar.tech](https://ctar.tech))  
**Contact:** [privacy@ctar.tech](mailto:privacy@ctar.tech)

---

## 1. Overview & Commitment to User Privacy

**ZentyRecon** ("the Extension") is an open-source, all-in-one browser extension designed for cybersecurity professionals, penetration testers, and developers to analyze Post-Quantum Cryptography (PQC) readiness and perform authorized security reconnaissance.

**Our Core Privacy Principle:**  
> **Your data stays on your machine.** ZentyRecon operates locally in your browser. We do **not** collect, sell, lease, or transmit your personal browsing data, visited URLs, session cookies, or scan results to remote servers.

---

## 2. Information We Handle & Purpose

ZentyRecon interacts with browser data **exclusively at your request** and purely for client-side security analysis:

| Data Type | Purpose | Storage & Transmission |
|---|---|---|
| **Active Tab URL & Origin** | To identify technologies, domain cryptographic status, and DOM endpoints. | Processed entirely in browser memory; never sent to external servers. |
| **HTTP Headers & TLS Handshake** | To evaluate cipher suites, key exchange algorithms (e.g., X25519 vs ML-KEM/Kyber), and TLS version. | Analyzed in memory via browser APIs; never logged remotely. |
| **Session Cookies** | To enable authorized penetration testers to view, inspect, and evaluate cookie security flags (`Secure`, `HttpOnly`, `SameSite`). | Read only on active tabs with explicit permission; never exfiltrated. |
| **Proxy Settings** | To route browser network traffic into local pen-testing tools (such as Burp Suite, OWASP ZAP, or Tor). | Stored in browser `chrome.storage.local`. |
| **User Settings & Preferences** | To remember theme, active module selection, and local custom configurations. | Persisted locally on your device via `chrome.storage.local`. |

---

## 3. Chrome Web Store Permissions Justification

In compliance with the Chrome Web Store Minimum Permissions Policy, ZentyRecon requests only the necessary permissions required to fulfill its technical purpose:

1. **`activeTab` / `tabs`**: Used strictly to obtain the domain and URL of the webpage you are currently auditing when you interact with the extension.
2. **`sidePanel`**: Required to present the unified multi-module reconnaissance interface natively inside the browser sidebar.
3. **`storage`**: Used to save your local UI preferences, proxy presets, and custom configurations on your local device.
4. **`cookies`**: Required for the Session & Cookie Manager module to audit cookie security attributes on inspected targets.
5. **`proxy`**: Required for the Dynamic Proxy Manager to switch proxy configurations between direct, Burp Suite, or Tor.
6. **`scripting`**: Required to inject lightweight DOM analysis routines on inspected pages upon user action.
7. **`webRequest` & `declarativeNetRequest`**: Used to inspect cryptographic TLS handshake metadata and evaluate PQC cipher suites without intercepting personal user content.
8. **`<all_urls>` (Host Permissions)**: Necessary because security professionals conduct reconnaissance across diverse client domains, internal testing environments, and web applications.

---

## 4. Third-Party Sharing & Sale of Data

- **No Sale of Data:** We do **not** sell, rent, or trade your personal information, browsing history, or reconnaissance artifacts to data brokers or advertising networks.
- **No Remote Tracking:** We do **not** embed tracking pixels, marketing beacons, or invasive analytics inside the extension.
- **No Cloud Telemetry in Community Edition:** All calculations (such as Mosca's Theorem and PQC grading) execute entirely inside the client's browser runtime.

---

## 5. Security of Your Information

All sensitive operations, configurations, and extracted endpoints are contained within the browser's sandboxed environment. We adhere to industry best practices, including Manifest V3 security boundaries and strict Content Security Policy (`script-src 'self'`).

---

## 6. Children's Privacy

ZentyRecon is a technical utility intended for cybersecurity professionals, students, and system administrators. We do not knowingly solicit or collect data from children under 13.

---

## 7. Changes to This Policy

We may update this Privacy Policy to reflect future feature developments or regulatory updates. Any changes will be published in this repository with an updated revision date.

---

## 8. Contact Us

If you have questions regarding this Privacy Policy or the security practices of ZentyRecon, please contact:
- **Email:** [privacy@ctar.tech](mailto:privacy@ctar.tech)
- **Security Team:** [security@ctar.tech](mailto:security@ctar.tech)
- **Website:** [https://ctar.tech](https://ctar.tech) / [https://zentyrecon.ctar.tech](https://zentyrecon.ctar.tech)
