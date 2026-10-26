# NEXUS SHIELD — FRONTEND & UI ENGINEERING SPECIFICATION
## Comprehensive Hand-Off & Architecture Brief for Software Engineers

---

### 1. Executive Overview & Mission
**Project Name:** Nexus Shield (`https://nexusshield.org`)  
**Product Category:** Institutional Blockchain Forensics & Cyber Asset Recovery Platform  
**Target Users:**
1. **Distressed Victims of Crypto Scams (Public Portal):** Non-technical individuals who have experienced cryptocurrency theft (Permit2 signature drainers, fake sniper/MEV bots, fake broker/pig butchering platforms, phishing approvals) needing immediate case intake, urgent containment steps (`revoke.cash`), and real-time status tracking.
2. **On-Chain Forensic Investigators & Compliance Officers (Admin Desk):** Internal analysts who review incoming ledgers, inspect transaction hashes, track multi-hop fund movements across peel-chains, serve statutory 48-hour emergency freeze notices to exchange compliance desks (Binance, OKX, Bybit, Kraken), and generate court-ready FBI IC3 evidence dossiers.

---

### 2. Current Architecture & Tech Stack ("What We Work With")

| Component | Technology / Provider | Implementation Details |
| :--- | :--- | :--- |
| **Hosting & Edge Delivery** | **Cloudflare Pages** | Static hosting with global edge caching, HTTP/3, and automatic SSL/TLS. |
| **Serverless API Layer** | **Cloudflare Pages Functions** | Node-compatible Edge Functions located in `/functions/api/`. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Cloud-hosted database with Row Level Security (RLS) policies, Realtime websockets, and Supabase Auth. Fallback to encrypted `localStorage` for offline resilience. |
| **Frontend Foundation** | **HTML5 / CSS3 / Vanilla JS** | Pure client-side SPA logic with zero heavy build-step dependencies. Can be refactored into React / Next.js / Vue / Svelte if desired by engineering. |
| **Design System & CSS** | Custom CSS Variables in `css/styles.css` | Cyber-security dark mode palette (Space Cadet Navy, Cyan `#38bdf8`, Emerald `#00f59b`, Rose `#f43f5e`, Amber `#f59e0b`). |
| **Email Infrastructure** | **Resend API + Zoho Mail** | Automated transactional emails sent via Resend API (`/api/send-confirmation`) from `no-reply@nexusshield.org`. Manual/operator communications via Zoho Mail (`support@nexusshield.org`, `compliance@nexusshield.org`). |
| **Domain & DNS** | **Namecheap + Cloudflare DNS** | Apex domain `nexusshield.org` with proxied DNS records and strict security headers (`_headers`). |
| **Social Automation** | **Typefully API & Custom X Queue** | Standalone tool `x-scheduler.html` managing automated content posting for `@NEXUSSHIELDhq`. |

---

### 3. Core UI Surfaces & What Needs to Be Built / Enhanced ("What We Need")

The platform consists of **Two Primary UI Applications**:

#### A. The Public Client Portal (`index.html`)
The public-facing surface must combine **extreme security credibility** with **calm, empathetic usability** for panic-stricken victims.

1. **Hero Section & High-Speed Scanner:**
   - **Single Dominant Action:** A clean, uncluttered transaction hash / wallet inspector field.
   - **Helper Chips:** Subtle examples so users understand what to paste (TxID vs Wallet).
   - **Multi-Chain Dropdown:** Seamless selection across Ethereum (ERC-20), Bitcoin, Solana (SPL), BNB Chain, Tron (TRC-20), Arbitrum, Base.
2. **Urgent Phishing Containment Banner (`revoke.cash`):**
   - When a victim reports a drainer or phishing link, the UI must immediately highlight the `revoke.cash` containment step so scammers cannot drain remaining funds.
3. **Interactive Forensic Triage Bot (`triage-bot.js`):**
   - Compact floating circular launcher in the bottom corner of the viewport.
   - Micro-interaction: Periodic friendly wave animation ("I'm here to help") that automatically tucks back into a circle so it never blocks mobile screens.
   - Conversational step-by-step state machine: Collects victim name, email, stolen amount, network, scammer address, and tx hash.
   - Instant case registration: Generates unique Case Reference ID (e.g., `NX-942817`), assigns 100,000 AI Tracing Tokens, triggers automated confirmation email, and provides direct WhatsApp and FBI IC3 download links.
4. **Case Status & Token Tracker:**
   - Visual progress timeline: 6 recovery stages (Intake ➔ Evidence Verified ➔ Multi-Hop Tracing ➔ Exchange Freeze Notice ➔ Legal Restitution ➔ Restitution Completed).
   - Live AI Tracing Token Meter: Visual computational progress bar showing token consumption.
5. **Combined Information Pages:**
   - Streamlined, non-repetitive pages: `methodology.html` (Process & Sanctions), `partners.html` (About & Institutional Alliance), `cases.html` (Case Studies & Proven Recoveries).

---

#### B. The Superuser Security Desk & Admin Console (`admin.html` / `desk.html`)
The internal workspace used by investigators to manage cases, analyze blockchains, and dispatch freeze notices.

1. **Partitioned Workspace Navigation (No Clutter):**
   - Clean top/side navigation partitioning the console into dedicated workspaces:
     - 📁 **Case Management Queue:** Master table of all active, pending, and archived intakes.
     - 🧠 **AI On-Chain Forensic Dossier:** In-depth transaction breakdown and hop visualizer.
     - 💳 **Treasury & Fee Audits:** Crypto fee payments, TX confirmations, and release codes.
     - 🏛️ **Exchange SLA & Freeze Desk:** 48-hour compliance deadlines for Binance, OKX, Bybit, Coinbase, Kraken.
     - 🔐 **Security Registry & Direct Dispatcher:** Staff accredited list, revoked agents, and official X posting engine.
2. **Automated AI Forensic Intelligence Engine:**
   For every incoming report, the UI must immediately display:
   - **Scam Typology & Attack Vector:** Badges and plain-English breakdown (e.g., *Permit2 Off-Chain Signature Sweeper*, *Obfuscated Sniper Bot Vault Harvester*, *Fake DeFi Broker*).
   - **Multi-Hop Trajectory Count:** Exact number of on-chain hops (e.g., `3 Hops Mapped`) and peel-chain child splits (e.g., `4 Peel Dispersion Splits`).
   - **Current Asset Location:** Exact terminal deposit address and identified cluster (e.g., `Binance Ingestion Deposit: 0x9e2a53c9...`).
   - **Liquidity & Cashout State:**
     - 🟢 `STILL IN WALLET (Active Hold Window)`: Assets stationary in exchange wallet; fiat wire has not occurred.
     - 🟡 `IN TRANSIT`: High-velocity peel node dispersion.
     - 🔴 `CASHOUT ATTEMPT`: Internal exchange conversion.
   - **Venue Architecture:** `🏢 Centralized Exchange (CEX)` (Actionable for freeze) vs `🌐 Decentralized (DEX / Bridge)`.
   - **Visual Multi-Hop Graph:** Interactive card-based flow showing Hop 0 (Victim) ➔ Hop 1 (Drainer) ➔ Hop 2 (Peel Split) ➔ Hop 3 (Exchange Cluster).
   - **Executive AI Diagnosis & Tactical Advice:** Pre-computed summary explaining the exact legal and technical move to make next.
3. **1-Click Investigator Actions:**
   - **Pre-Configured CEX Freeze Notice Builder:** Clicking `[ Serve CEX Freeze Notice ]` automatically selects the target exchange (Binance, OKX, Bybit, Kraken) and pre-populates target wallets, loss amounts, and legal statutory language (18 U.S.C. § 2703 Directive).
   - **1-Click Client Intake Email Dispatcher:** One click fires the automated serverless email and opens a pre-formatted mail client composer as a fail-safe.
   - **Court-Ready FBI IC3 Dossier Exporter:** One click downloads a formatted, court-ready `.txt` / `.pdf` evidentiary binder.
4. **Batch Case Operations & SLA Tracker:**
   - Multi-case selection with bulk status updates ("Mark Done", "End / Archive").
   - Filter tabs: `All`, `New Intake`, `Active Tracing`, `CEX Freeze Active`, `Restituted`, `Closed/Archived`, `SLA Overdue (>24h)`.

---

### 4. Technical Constraints & Non-Negotiables

1. **No External CDN Dependencies in Offline Previews:**
   - Do not rely on unbundled CDNs that fail in restricted or air-gapped sandbox environments. All critical icons (FontAwesome) and fonts should degrade gracefully with SVG/CSS fallbacks.
2. **Defensive Sanitization & XSS Hardening:**
   - All victim-supplied inputs (names, emails, wallets, tx hashes, notes) must pass through `escapeHtml()` before DOM insertion. Never use raw `innerHTML` with untrusted data.
3. **Row Level Security (RLS) & Edge Security:**
   - Client submissions only have `INSERT` permissions on Supabase `reports`.
   - Read/update permissions on sensitive forensic records are strictly restricted to authenticated staff sessions (`desk_staff_tokens`).
4. **Mobile Performance (60fps Canvas & Responsive Breakpoints):**
   - All pages must render with zero horizontal scroll on iPhone SE (320px) up to 4K desktop displays.
   - Touch targets must be at least 44px × 44px.
   - Interactive background canvases (`js/blockchain-bg.js`) must detect Device Pixel Ratio (DPR) and throttle frame rates when battery saver or mobile user agents are detected.
5. **Institutional, Non-Generic Aesthetic:**
   - The UI must look like an enterprise cyber-intelligence platform (like Chainalysis, Elliptic, Palantir, or Mandiant).
   - Avoid generic, bubbly, AI-template designs. Use high-contrast monospace ledger fonts for hashes, sharp borders with subtle glow (`rgba(0, 245, 155, 0.25)`), and structured data tables.

---

### 5. Implementation Roadmap for the Software Engineer

```
Phase 1: Componentization & Design System (Days 1–3)
  ├── Extract color tokens, badges, typography, and card containers into a modular CSS/UI system.
  ├── Unify modals, inputs, and button hierarchies across all pages.
  └── Polish mobile navigation drawer and floating triage bot micro-interactions.

Phase 2: Public Intake & Tracking Experience (Days 4–7)
  ├── Build intuitive, single-field multi-chain scanner in hero.
  ├── Polish floating circular triage bot state machine and dynamic QR modal.
  └── Build visual 6-stage case progress bar and live 100,000 AI Token meter.

Phase 3: Superuser Admin Console & AI Dossier (Days 8–12)
  ├── Implement partitioned tabbed navigation for Admin Desk (Queue, AI Dossier, Treasury, CEX SLA, Security).
  ├── Render interactive Visual Multi-Hop Node Trail with arrows and responsive cards.
  ├── Wire 1-Click CEX Hold Notice generator pre-selecting destination exchanges.
  └── Connect batch case selection dock and SLA overdue filters.

Phase 4: API & Notification Engine Integration (Days 13–15)
  ├── Verify Cloudflare Pages Function `/api/send-confirmation` with Resend API.
  ├── Ensure fallback mailto: client composer triggers flawlessly.
  └── Conduct end-to-end latency, cross-browser, and WCAG AA accessibility audits.
```

---

### 6. Developer Onboarding: Running Locally

```bash
# 1. Clone repository
git clone https://github.com/annamaywong39-create/nexus-shield.git
cd nexus-shield

# 2. Local development server (zero dependencies required)
python3 -m http.server 8080
# Or using Node:
# npx serve .

# 3. Access applications:
# Public Client Portal: http://localhost:8080/index.html
# Superuser Admin Desk : http://localhost:8080/admin.html
# Standalone X Scheduler: http://localhost:8080/x-scheduler.html
```

---
*Nexus Shield Architecture Document — Authorized for Engineering Hand-Off.*
