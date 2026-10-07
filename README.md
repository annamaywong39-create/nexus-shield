# NEXUS SHIELD — CRYPTO ASSET RECOVERY & FORENSICS (v5.0)
## Bespoke Web3 Interface, ChainExplorer & Global Crypto Alliances
### Multi-Chain Forensic Investigation, Emergency Exchange Freezes & Restitution Architecture

---

## 1. Executive Summary of v5.0 Architecture

**Nexus Shield** is an enterprise-grade digital asset recovery and blockchain forensic investigation platform. It empowers victims of cryptocurrency fraud (pig-butchering syndicates, fake trading platforms, phishing drainers, compromised seed phrases) to preserve court-admissible evidence, trace illicit fund flows across multi-hop peeling chains, and initiate emergency administrative holds directly at centralized exchange bottlenecks before fiat conversion.

### Core v5.0 Enhancements:
1. **The 3 Strategic Operational Capabilities:**
   - **Printable / Downloadable Digital Case Card:** In both the Case Intake Confirmation and the Live Case Tracker, victims can view and print/download an official, high-resolution Digital Case Card featuring their unique `NX-XXXXXX` Case ID, dynamic QR code for mobile tracking, complainant name, loss summary in USD, restitution wallet address, and forensic audit seal. Includes `@media print` styling for clean physical printing or PDF saving.
   - **Real-Time Notification Dispatch Channels (WhatsApp / Telegram / SMS):** Complainants can specify their preferred communication channels (Email, WhatsApp, Telegram, SMS). In the internal staff portal (`/desk-internal-sec.html`), investigators can immediately dispatch 1-click status pings directly to the complainant via WhatsApp (`wa.me`) or Telegram (`t.me`).
   - **Restitution Address Safety Validator:** Real-time client-side cryptographic address validator that verifies address format for EVM (`0x...`), Bitcoin (`1...`, `3...`, `bc1...`), Solana, TRON (`T...`), and Litecoin. It actively prevents critical mistakes (e.g. accidentally entering the scammer's destination wallet or an already-compromised wallet) and recommends uncompromised self-custody cold storage (Ledger, Trezor, MetaMask, Trust Wallet).
2. **Top Crypto Bodies & Global Partners Page (`partners.html`):**
   - Direct collaboration network encompassing:
     - **Tier-1 Blockchain Forensics:** Chainalysis (Reactor Alliance), TRM Labs (Cross-Chain Bridges), Elliptic (Sanctions & AML), CipherTrace / Mastercard (Banking Gateways).
     - **Centralized Exchange Emergency Freeze Desks:** Binance Investigations (24/7 LE Portal), OKX Risk Control, Coinbase Legal & Law Enforcement, Bybit Financial Crime Compliance (FCC), Kraken Compliance, Tether/Circle Stablecoin Compliance.
     - **Law Enforcement & Cybercrime Alliances:** FBI IC3 (Internet Crime Complaint Center), Interpol Cybercrime Directorate (Project Gateway), Europol EFECC, Crypto Defenders Alliance (CDA).
3. **Comprehensive Methodology Guide ("How We Work & Recover Money" - `about.html`):**
   - Definitive 6-Stage Forensic Recovery Framework:
     1. Intake, Parsing & Cryptographic Fingerprinting.
     2. Peeling Chains & Cross-Bridge De-Anonymization.
     3. Centralized Exchange Cluster Identification (The Choke Point).
     4. Emergency 24/7 Administrative Freezing Notice.
     5. Judicial Subpoenas, Seizure Warrants & Law Enforcement Liaison.
     6. Asset Restitution & Compliant Return to Safe Custody.
   - Transparent Economics: $0 upfront initial review; 10% contingency fee payable strictly after funds arrive safely in the victim's verified restitution wallet.
   - Anti-Recovery Scam Warnings: Technical explanation of why blockchain "hack-back" is an outright impossibility and how real recovery works.
4. **Autonomous On-Chain ChainExplorer (`chainexplorer.html` & In-Form Auto-Lookup):**
   - Victims can paste any Transaction Hash (TxID) or Wallet Address into the search terminal.
   - Automatically connects to blockchain nodes and public explorers (Bitcoin, Ethereum, Solana, TRON, BNB Chain, Litecoin).
   - Tells the victim exactly:
     - **What transaction it sees:** Sender (Victim), Target (Scammer), Asset, Amount in crypto and USD loss, Block confirmations, Network gas fee, and Destination endpoint type.
     - **When it happened:** Exact UTC date and time, block height, and human-friendly relative time (e.g. *"4 hours ago"*).
     - **Risk Score & Flags:** Critical risk indicators and exchange attribution.
     - **1-Click Import:** Pre-populates the victim's recovery intake form with the detected transaction data.
   - Built-in In-Form Auto-Checker on `index.html` allows users to auto-verify transactions and auto-fill wallet addresses with one click.
5. **Unique Case ID Tracking Model (`NX-XXXXXX`):**
   - No user profile, account creation, or password management required.
   - 6-digit reference number (e.g., `NX-849201`) tracks live milestone progress, investigator notes, and active advisory pop-ups.
6. **Discreet Internal Staff Portal (`/admin` or `/desk`):**
   - Direct clean URLs: `/admin` or `/desk` (also accessible via `/desk-internal-sec.html` or `Ctrl+Shift+A`).
   - Staff credentials: `support@nexusshield.org` / `NexusDesk#2026`.
   - Dual progress bar controls: Automatic time-based or Manual override slider (0% to 100%).
   - Client Advisory Pop-up publisher with automated email dispatch to assigned case address.
   - CEX Emergency Freeze Notice Generator & Law Enforcement Dispatch.
   - Queue Analytics, Smart Tabs & SLA Elapsed Timers.

---

## 2. Production Directory Structure

```
├── index.html                 # Main public portal, multi-wallet intake & Case ID tracker
├── about.html                 # Complete "How We Work & Recover Money" methodology guide
├── partners.html              # Top crypto bodies, exchange compliance & LE alliances
├── chainexplorer.html         # Autonomous on-chain transaction scanner & inspector
├── admin.html                 # Primary staff portal (/admin)
├── desk.html                  # Quick shortcut staff portal (/desk)
├── desk-internal-sec.html     # Discreet staff portal (/desk-internal-sec.html)
├── _redirects                 # Cloudflare / Netlify clean URL routing rules
├── site.webmanifest           # Mobile PWA manifest
├── README.md                  # Comprehensive architectural & operational manual
├── css/
│   └── styles.css             # Complete Trust Wallet/Coinbase-grade design system
├── js/
│   ├── script.js              # Multi-wallet intake, ChainExplorer & Case Card generator
│   ├── blockchain-bg.js       # True 3D celestial solar system, 360° galaxy & secret gem
│   ├── translations.js        # 6-language i18n dictionary (EN, ZH, ES, FR, DE, JA)
│   └── admin.js               # Staff desk portal controller & SLA dispatch
└── assets/
    ├── images/                # High-res emblems (logo-header-dark, logo-512, etc.)
    └── icons/                 # Full favicon suite, Apple touch icon & PWA chrome icons
```

---

## 3. Web Navigation Matrix

| Page | URL | Purpose | Key User Capabilities |
| :--- | :--- | :--- | :--- |
| **Report Loss (Home)** | `/index.html` | Primary Incident Intake & Case Tracker | Multi-wallet drain submission, ChainExplorer auto-check, restitution safety validator, notification preferences, printable case card. |
| **How We Work (About)** | `/about.html` | Educational & Operational Guide | 6-stage forensic framework, $0 review / 10% contingency economics, anti-recovery fraud warnings, reporting bureau links. |
| **Partners & Alliances** | `/partners.html` | Top Crypto Bodies & Exchange Desks | Chainalysis, TRM Labs, Elliptic, Binance, OKX, Coinbase, Bybit, Kraken, FBI IC3, Interpol, CDA. |
| **ChainExplorer** | `/chainexplorer.html` | Autonomous On-Chain Inspector | Input TxID or address, see what transaction it sees and when it happened, block confirmations, risk score, 1-click case import. |
| **Staff Portal** | `/admin` or `/desk` | Internal Forensic Console | Staff login (`support@nexusshield.org` / `NexusDesk#2026`), dual progress slider, client alert popup publisher, CEX freeze generator. |

---

## 4. Emergency Freezing & Restitution SLA

1. **15-Minute Triage:** Active fund movements heading toward verified exchange deposit addresses (Binance, OKX, Bybit, Coinbase, Kraken) are automatically escalated to senior forensic analysts.
2. **Court-Admissible Dossiers:** Crypographically signed `.txt` and CSV dossiers containing raw UTXO traces, gas timestamps, IP infrastructure, and scammer deposit UIDs.
3. **Direct Restitution:** Seized funds are released from exchange/court escrow directly to the victim's verified self-custody wallet, maintaining zero third-party custody risk.

---
*Nexus Shield Architecture v5.0 — Verified, Integrated & Deployed.*
