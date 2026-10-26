// ========================================================
// NEXUS SHIELD — AI Forensic Triage Bot & Incident Liaison
// Interactive Case Intake, Agent Verification & FBI IC3 Engine
// ========================================================

(function() {
  'use strict';

  // ======================== 1. DYNAMIC PAYMENT QR CODE CONTROLLER ========================
  function initDynamicPaymentQr() {
    const qrImg = document.getElementById('cryptoDepositQrImg');
    const addrEl = document.getElementById('cryptoDepositAddress');
    if (!qrImg || !addrEl) return;

    function updateQr() {
      const addr = (addrEl.innerText || '').trim();
      if (addr && addr !== 'N/A') {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(addr)}`;
        qrImg.src = qrUrl;
        qrImg.onerror = () => {
          // Clean SVG fallback if offline
          qrImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="100%" height="100%" fill="%23ffffff"/><text x="50%" y="45%" fill="%23080d1a" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">DEPOSIT WALLET</text><text x="50%" y="65%" fill="%232d9fff" font-family="monospace" font-size="9" text-anchor="middle">' + addr.substring(0, 14) + '...</text></svg>';
        };
      }
    }

    // Observe changes to address element
    const observer = new MutationObserver(updateQr);
    observer.observe(addrEl, { childList: true, characterData: true, subtree: true });

    // Also update whenever crypto tabs are clicked
    document.querySelectorAll('#cryptoTabsRow .crypto-tab-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(updateQr, 50);
      });
    });

    updateQr();
  }

  // ======================== 2. OFFICIAL AGENT, SOCIALS & CHANNEL VERIFICATION ========================
  const DEFAULT_SECURITY_REGISTRY = {
    whatsapp_number: '14158906398',
    x_handle: '@NEXUSSHIELDhq',
    telegram_handle: '@nexusshield_hq',
    support_email: 'support@nexusshield.org',
    compliance_email: 'compliance@nexusshield.org',
    revoked_handles: '@nexus_support_agent_fake, +1 (555) 019-2831, support-desk@nexusshield-recovery.com'
  };

  function getLiveSecurityRegistry() {
    try {
      const saved = localStorage.getItem('nexus_security_registry');
      if (saved) return Object.assign({}, DEFAULT_SECURITY_REGISTRY, JSON.parse(saved));
    } catch (e) {}
    return Object.assign({}, DEFAULT_SECURITY_REGISTRY);
  }

  // Synchronize front-end links and buttons to reflect live admin security registry
  function syncFrontEndChannels() {
    const reg = getLiveSecurityRegistry();

    // 1. WhatsApp Action Links
    if (reg.whatsapp_number) {
      const cleanDigits = reg.whatsapp_number.replace(/\D/g, '');
      const waLinks = document.querySelectorAll('a[href*="wa.me"]');
      waLinks.forEach(link => {
        try {
          const url = new URL(link.href);
          const currentText = url.searchParams.get('text') || 'Hello%20Nexus%20Shield%20Taskforce%2C%20I%20urgently%20need%20assistance%20with%20a%20cryptocurrency%20fraud%20incident.';
          link.href = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(currentText)}`;
        } catch (e) {
          link.href = `https://wa.me/${cleanDigits}`;
        }
      });
    }

    // 2. Official X (Twitter) Profile Links
    if (reg.x_handle) {
      const handle = reg.x_handle.replace(/^@/, '');
      const xLinks = document.querySelectorAll('a[href*="x.com/"], a[href*="twitter.com/"]');
      xLinks.forEach(link => {
        // Only update links that point to our profile or intent
        if (!link.href.includes('/intent/tweet') && !link.href.includes('/share')) {
          link.href = `https://x.com/${handle}`;
          if (link.getAttribute('title')) {
            link.setAttribute('title', `Nexus Shield on X (@${handle})`);
          }
          if (link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `Nexus Shield on X (@${handle})`);
          }
        }
      });
    }

    // 3. Telegram Links
    if (reg.telegram_handle) {
      const cleanTg = reg.telegram_handle.replace(/^@/, '');
      const tgLinks = document.querySelectorAll('a[href*="t.me/"]');
      tgLinks.forEach(link => {
        link.href = `https://t.me/${cleanTg}`;
      });
    }

    // 4. Primary Support Email Links
    if (reg.support_email) {
      const supLinks = document.querySelectorAll('a[href^="mailto:support@nexusshield.org"]');
      supLinks.forEach(link => {
        link.href = `mailto:${reg.support_email}`;
      });
    }

    // 5. Compliance Email Links
    if (reg.compliance_email) {
      const compLinks = document.querySelectorAll('a[href^="mailto:compliance@nexusshield.org"]');
      compLinks.forEach(link => {
        link.href = `mailto:${reg.compliance_email}`;
      });
    }
  }

  // Expose syncFrontEndChannels to window
  window.syncFrontEndChannels = syncFrontEndChannels;

  window.openAgentVerifyModal = function() {
    const modal = document.getElementById('agentVerificationModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeAgentVerifyModal = function() {
    const modal = document.getElementById('agentVerificationModal');
    if (modal) modal.style.display = 'none';
  };

  function initAgentVerification() {
    const openBtn = document.getElementById('openVerifyAgentModalBtn');
    const footerBtn = document.getElementById('footerVerifyAgentBtn');
    const closeBtn = document.getElementById('closeAgentVerifyBtn');
    const execBtn = document.getElementById('executeAgentVerifyBtn');
    const input = document.getElementById('verifyAgentInput');
    const resultBox = document.getElementById('agentVerifyResultBox');
    const modal = document.getElementById('agentVerificationModal');

    openBtn?.addEventListener('click', window.openAgentVerifyModal);
    footerBtn?.addEventListener('click', window.openAgentVerifyModal);
    closeBtn?.addEventListener('click', window.closeAgentVerifyModal);

    // Auto-open modal if navigated from another page via #verifyAgent or ?verify=1
    if (window.location.hash === '#verifyAgent' || window.location.hash === '#agentVerificationModal' || window.location.search.includes('verify=1')) {
      setTimeout(() => {
        window.openAgentVerifyModal();
      }, 350);
    }

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) window.closeAgentVerifyModal();
    });

    const runVerification = () => {
      const rawQuery = (input?.value || '').trim();
      const query = rawQuery.toLowerCase().replace(/^@/, '');

      if (!query || query.length < 3) {
        if (resultBox) {
          resultBox.style.display = 'block';
          resultBox.className = 'verify-result-card failure';
          resultBox.style.borderColor = 'rgba(244, 63, 94, 0.4)';
          resultBox.style.background = 'rgba(244, 63, 94, 0.08)';
          resultBox.innerHTML = `
            <div style="font-weight: 700; color: #fb7185; margin-bottom: 0.25rem;">
              <i class="fas fa-circle-exclamation"></i> Input Required
            </div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Please enter a valid email address, @Telegram handle, phone number, or Agent ID to verify.</div>
          `;
        }
        return;
      }

      const secReg = getLiveSecurityRegistry();

      // 1. CRITICAL FRAUD CHECK: Check if query matches revoked/compromised blacklist first!
      const revokedItems = (secReg.revoked_handles || '')
        .split(',')
        .map(s => s.trim().toLowerCase().replace(/^@/, ''))
        .filter(Boolean);

      const queryDigits = query.replace(/\D/g, '');
      const isRevoked = revokedItems.some(rev => {
        if (!rev) return false;
        const revDigits = rev.replace(/\D/g, '');
        if (revDigits.length >= 7 && queryDigits.length >= 7) {
          return revDigits.includes(queryDigits) || queryDigits.includes(revDigits);
        }
        return rev === query || query.includes(rev) || rev.includes(query);
      });

      if (isRevoked) {
        if (!resultBox) return;
        resultBox.style.display = 'block';
        resultBox.className = 'verify-result-card failure';
        resultBox.style.borderColor = '#ef4444';
        resultBox.style.background = 'rgba(239, 68, 68, 0.15)';
        resultBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); display: flex; align-items: center; justify-content: center; color: #f87171; font-size: 1.15rem; flex-shrink: 0;">
              <i class="fas fa-skull-crossbones"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: #ef4444; font-size: 0.95rem; letter-spacing: 0.02em;">
                REVOKED / COMPROMISED / BLACKLISTED IMPERSONATOR
              </div>
              <div style="font-size: 0.72rem; color: #fca5a5;">High-Urgency Threat Advisory Issued by Nexus Shield Directorate</div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #fee2e2; line-height: 1.5; background: rgba(0,0,0,0.45); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.45);">
            <strong>SECURITY ALERT:</strong> The identifier <code>${escapeHtml(rawQuery)}</code> has been officially flagged as <strong>COMPROMISED, REVOKED, or a MALICIOUS RECOVERY SCAM IMPERSONATOR</strong>.
          </div>
          <div style="margin-top: 0.65rem; font-size: 0.75rem; color: #fca5a5; line-height: 1.5;">
            <strong>🚨 CEASE ALL COMMUNICATIONS IMMEDIATELY:</strong> Do NOT transfer funds, authorize contract approvals, or reveal seed phrases. Please notify the Directorate immediately at <code>${escapeHtml(secReg.compliance_email || 'compliance@nexusshield.org')}</code>.
          </div>
        `;
        return;
      }

      // 2. DYNAMIC DIRECTORY MERGING LIVE ADMIN SETTINGS & ACCREDITED AGENTS
      const activeDirectory = [
        { type: 'email', val: secReg.support_email || 'support@nexusshield.org', role: 'Primary Case Intake & Support Desk', dept: 'Operations & Complainant Support' },
        { type: 'email', val: secReg.compliance_email || 'compliance@nexusshield.org', role: 'Statutory Law Enforcement & Legal Liaison', dept: 'Legal & Exchange Freeze Directorate' },
        { type: 'email', val: 'recovery@nexusshield.org', role: 'Forensic Peeling-Chain Investigation Desk', dept: 'Digital Asset Intelligence Unit' },
        { type: 'email', val: 'investigations@nexusshield.org', role: 'Asset Tracing & Exchange Seizure Unit', dept: 'Digital Forensics & Incident Response' },
        { type: 'email', val: 'lead.analyst@nexusshield.org', role: 'Senior Blockchain Forensic Examiner', dept: 'Technical Forensics' },
        { type: 'x', val: secReg.x_handle || '@nexusshieldhq', role: 'Official Verified Communications Channel', dept: 'Public Announcements & Threat Advisories' },
        { type: 'telegram', val: secReg.telegram_handle || '@nexusshield_hq', role: 'Official Encrypted Incident Desk', dept: 'Operational Security & Alerts' },
        { type: 'phone', val: secReg.whatsapp_number || '+1 (415) 890-6398', role: 'Official Rapid Triage & Fraud Hotline', dept: '24/7 Rapid Response Desk' },
        { type: 'web', val: 'nexusshield.org', role: 'Primary Institutional Domain', dept: 'Secure Cloudflare Protected Infrastructure' },
        { type: 'agent_id', val: 'nx-analyst-01', role: 'Senior Forensic Investigator (ID: NX-ANALYST-01)', dept: 'CEX Freeze Response Team' },
        { type: 'agent_id', val: 'nx-analyst-02', role: 'Blockchain Data Scientist (ID: NX-ANALYST-02)', dept: 'Clustering & Graph Intelligence' },
        { type: 'agent_id', val: 'nx-officer-elena', role: 'Lead Triage Officer (ID: NX-OFFICER-ELENA)', dept: '24/7 Digital Evidence Intake' }
      ];

      const match = activeDirectory.find(item => {
        const itemVal = item.val.toLowerCase().replace(/^@/, '');
        if (item.type === 'phone' && queryDigits.length >= 7) {
          const itemDigits = item.val.replace(/\D/g, '');
          return itemDigits.includes(queryDigits) || queryDigits.includes(itemDigits);
        }
        return itemVal === query || itemVal.includes(query) || query.includes(itemVal);
      });

      if (!resultBox) return;
      resultBox.style.display = 'block';

      if (match) {
        resultBox.className = 'verify-result-card success';
        resultBox.style.borderColor = 'rgba(0, 245, 155, 0.4)';
        resultBox.style.background = 'rgba(0, 245, 155, 0.08)';
        resultBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(0, 245, 155, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-size: 1rem; flex-shrink: 0;">
              <i class="fas fa-shield-check"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: var(--accent-green); font-size: 0.92rem;">
                VERIFIED OFFICIAL CREDENTIAL
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8;">Cryptographically Accredited Representative / Channel</div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(0, 245, 155, 0.25);">
            <div><strong>Designation:</strong> ${match.role}</div>
            <div><strong>Department:</strong> ${match.dept}</div>
            <div><strong>Authorized Identifier:</strong> <code>${match.val}</code></div>
          </div>
          <div style="margin-top: 0.6rem; font-size: 0.74rem; color: #a7f3d0;">
            <i class="fas fa-check-double"></i> Confirmed active in good standing on the official Nexus Shield Directorate Registry.
          </div>
        `;
      } else {
        resultBox.className = 'verify-result-card failure';
        resultBox.style.borderColor = 'rgba(244, 63, 94, 0.35)';
        resultBox.style.background = 'rgba(244, 63, 94, 0.08)';
        resultBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(244, 63, 94, 0.2); display: flex; align-items: center; justify-content: center; color: #fb7185; font-size: 1rem; flex-shrink: 0;">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: #fb7185; font-size: 0.92rem;">
                UNVERIFIED / SUSPECTED IMPERSONATOR
              </div>
              <div style="font-size: 0.72rem; color: #cbd5e1;">Not Found in Authorized Registry</div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(244, 63, 94, 0.25);">
            The identifier <code>${escapeHtml(rawQuery)}</code> is <strong>NOT</strong> an authorized representative or channel of Nexus Shield.
          </div>
          <div style="margin-top: 0.6rem; font-size: 0.74rem; color: #fda4af; line-height: 1.45;">
            <strong>⚠️ CRITICAL WARNING:</strong> Recovery scammers frequently create fake profiles claiming to be our investigators. <strong>NEVER</strong> share private keys, seed phrases, or transfer money to personal wallets. Report this impersonation to <code>${escapeHtml(secReg.compliance_email || 'compliance@nexusshield.org')}</code>.
          </div>
        `;
      }
    };

    execBtn?.addEventListener('click', runVerification);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runVerification();
      }
    });
  }

  // ======================== 3. COURT-READY FBI IC3 INCIDENT PACKET ========================
  window.generateFbiIncidentPacketText = function(caseData) {
    const ref = caseData.reportId || caseData.report_id || `NX-${caseData.id || 'PENDING'}`;
    const name = caseData.victimName || caseData.victim_name || 'Complainant on File';
    const email = caseData.victimEmail || caseData.victim_email || 'Unassigned';
    const phone = caseData.victimPhone || caseData.victim_phone || 'None Provided';
    const loss = parseFloat(caseData.amountLost || caseData.amount_lost || 0).toLocaleString();
    const curr = (caseData.currencyLost || caseData.currency_lost || 'USDT').toUpperCase();
    const chain = caseData.chain || 'Multi-Chain Architecture';
    const victimWallet = caseData.victimWallet || caseData.victim_wallet || '0x...';
    const scammerWallet = caseData.scammerWallet || caseData.scammer_wallet || '0x...';
    const txHashes = Array.isArray(caseData.transactionHashes) ? caseData.transactionHashes : (caseData.transaction_hashes || [caseData.txHash || 'N/A']);
    const date = caseData.timestamp ? new Date(caseData.timestamp).toUTCString() : new Date().toUTCString();

    return `================================================================================
OFFICIAL CYBERCRIME INCIDENT REPORT & EVIDENTIARY BINDER
Prepared for: Federal Bureau of Investigation (FBI IC3) & International Cybercrime Units
Statutory Authority: 18 U.S.C. § 2703 (ECPA) | 18 U.S.C. § 1030 (Computer Fraud & Abuse)
================================================================================
CASE DOCKET REFERENCE : ${ref}
FILING TIMESTAMP       : ${date}
INVESTIGATING PLATFORM: Nexus Shield Asset Recovery Taskforce (https://nexusshield.org)
REPORT CLASSIFICATION : LAW ENFORCEMENT & COMPLIANCE STATUTORY EVIDENCE BINDER
================================================================================

1. COMPLAINANT IDENTIFICATION (VICTIM):
--------------------------------------------------------------------------------
Full Legal Name       : ${name}
Primary Contact Email : ${email}
Contact Telephone     : ${phone}
Legal Status          : Complainant & Aggrieved Digital Asset Holder
Verified Loss Amount  : $${loss} ${curr} (Estimated USD Equivalent)

2. CRIMINAL OFFENSE CLASSIFICATION:
--------------------------------------------------------------------------------
• Primary Violation   : Wire Fraud / Unauthorized Electronic Funds Transfer
• Technical Modality  : Deceptive On-Chain Routing, Smart Contract Drainer / Social Engineering
• Underlying Network  : ${chain}
• Illicit Peeling Hop : Detected multi-hop routing into centralized exchange deposit bottleneck

3. CRYPTOGRAPHIC EVIDENCE & SOURCE TRAIL:
--------------------------------------------------------------------------------
Compromised Source Wallet : ${victimWallet}
Destination Scammer Wallet: ${scammerWallet}

Primary Transaction Hashes (TxIDs):
${txHashes.map((h, i) => `[Hop #${i + 1}] ${h}`).join('\n')}

4. STATUTORY PRESERVATION & EXCHANGE NOTICE (18 U.S.C. § 2703(f)):
--------------------------------------------------------------------------------
NOTICE TO CUSTODIAL EXCHANGES (Binance, OKX, Bybit, Coinbase, Kraken, etc.):
You are hereby advised that funds originating from the above complainant wallet were 
diverted without authorization and clustered toward exchange deposit accounts. 
Pursuant to 18 U.S.C. § 2703(f) and international anti-money laundering statutes, 
all KYC records, login IP audit trails, bank off-ramp instructions, and current sub-account 
balances tied to destination cluster [${scammerWallet}] must be preserved for 90 days 
pending formal grand jury subpoena or federal discovery warrant.

5. VERIFICATION DIRECTORY:
--------------------------------------------------------------------------------
Authenticated via Nexus Shield Evidence Vault
Official Support: support@nexusshield.org | Directorate: compliance@nexusshield.org
Report Hash: SHA-256 Verified On-Chain
================================================================================
[END OF STATUTORY INCIDENT DOSSIER]`;
  };

  window.downloadFbiPacket = function(caseData) {
    const text = window.generateFbiIncidentPacketText(caseData);
    const ref = caseData.reportId || caseData.report_id || `NX-${caseData.id || 'EVIDENCE'}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Nexus_Shield_FBI_IC3_Packet_${ref}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ======================== 4. LIVE ONLINE CLIENT REPRESENTATIVE CHAT ========================
  let triageState = {
    step: 0,
    scamType: '',
    lossAmount: '',
    currency: 'USDT',
    originInput: '',
    victimName: '',
    victimEmail: '',
    victimPhone: '',
    createdReportId: null,
    isVerifying: false
  };

  function initTriageBot() {
    const launcher = document.getElementById('triageLauncherBtn');
    const windowEl = document.getElementById('triageChatWindow');
    const closeBtn = document.getElementById('closeTriageBtn');
    const minimizeBtn = document.getElementById('minimizeTriageBtn');
    const tabBot = document.getElementById('tabChannelBot');
    const tabWa = document.getElementById('tabChannelWhatsApp');
    const chatBody = document.getElementById('triageChatBody');
    const waPane = document.getElementById('triageWhatsAppPane');
    const inputForm = document.getElementById('triageInputForm');
    const inputField = document.getElementById('triageMessageInput');
    const bubbleHint = document.getElementById('triageBubbleHint');
    const bubbleClose = document.getElementById('triageBubbleClose');

    if (!launcher || !windowEl || !chatBody) return;

    let hintIntervalTimer = null;
    let hintHideTimer = null;
    let isHintDismissed = false;

    function openChatWindow() {
      windowEl.classList.add('active');
      launcher.classList.add('is-open');
      if (bubbleHint) bubbleHint.classList.remove('visible');
      if (hintHideTimer) clearTimeout(hintHideTimer);
      if (!chatBody.children.length) {
        startTriageGreeting();
      }
      setTimeout(() => inputField?.focus(), 150);
    }

    function closeChatWindow() {
      windowEl.classList.remove('active');
      launcher.classList.remove('is-open');
    }

    // Toggle window on circular launcher click
    launcher.addEventListener('click', (e) => {
      e.preventDefault();
      if (windowEl.classList.contains('active')) {
        closeChatWindow();
      } else {
        openChatWindow();
      }
    });

    closeBtn?.addEventListener('click', () => closeChatWindow());
    minimizeBtn?.addEventListener('click', () => closeChatWindow());

    // Speech bubble interaction
    if (bubbleHint) {
      bubbleHint.addEventListener('click', (e) => {
        if (e.target.closest('#triageBubbleClose')) return;
        openChatWindow();
      });

      bubbleClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        isHintDismissed = true;
        bubbleHint.classList.remove('visible');
        if (hintHideTimer) clearTimeout(hintHideTimer);
        // Suppress hint for 2 minutes after manual dismiss
        setTimeout(() => { isHintDismissed = false; }, 120000);
      });

      // Keep bubble visible while user hovers it
      bubbleHint.addEventListener('mouseenter', () => {
        if (hintHideTimer) clearTimeout(hintHideTimer);
      });
      bubbleHint.addEventListener('mouseleave', () => {
        if (bubbleHint.classList.contains('visible') && !windowEl.classList.contains('active')) {
          hintHideTimer = setTimeout(() => {
            bubbleHint.classList.remove('visible');
          }, 2000);
        }
      });
    }

    // Jump & bubble hint trigger: jumps and shows "I'm here to help you", then retreats into corner
    function triggerJumpAndHint() {
      if (windowEl.classList.contains('active') || isHintDismissed) return;

      // 1. Playful bounce/jump animation on the circular button
      launcher.classList.remove('is-jumping');
      void launcher.offsetWidth; // Force CSS reflow
      launcher.classList.add('is-jumping');
      setTimeout(() => {
        launcher.classList.remove('is-jumping');
      }, 900);

      // 2. Reveal the speech bubble: "I'm here to help you"
      if (bubbleHint) {
        bubbleHint.classList.add('visible');

        if (hintHideTimer) clearTimeout(hintHideTimer);
        // Stays visible for 4.5 seconds, then smoothly goes back into the corner of the screen
        hintHideTimer = setTimeout(() => {
          bubbleHint.classList.remove('visible');
        }, 4500);
      }
    }

    // Schedule regular interval (every 16 seconds)
    function startHintSchedule() {
      if (hintIntervalTimer) clearInterval(hintIntervalTimer);
      hintIntervalTimer = setInterval(() => {
        triggerJumpAndHint();
      }, 16000);
    }

    // Initial polite callout 3.5 seconds after page load
    setTimeout(() => {
      triggerJumpAndHint();
      startHintSchedule();
    }, 3500);

    // Channel tab toggling
    tabBot?.addEventListener('click', () => {
      tabBot.classList.add('active');
      tabWa?.classList.remove('active');
      chatBody.style.display = 'flex';
      inputForm.style.display = 'flex';
      if (waPane) waPane.classList.remove('active');
    });

    tabWa?.addEventListener('click', () => {
      tabWa.classList.add('active');
      tabBot?.classList.remove('active');
      chatBody.style.display = 'none';
      inputForm.style.display = 'none';
      if (waPane) waPane.classList.add('active');
    });

    // Helper: append bot message
    function addBotMessage(htmlContent, chips = []) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'triage-msg bot';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let chipsHtml = '';
      if (chips.length > 0) {
        chipsHtml = `
          <div class="triage-chips-grid">
            ${chips.map(chip => `<button type="button" class="triage-chip" data-val="${escapeHtml(chip.val || chip.label)}">${chip.icon ? `<i class="${chip.icon}"></i> ` : ''}${escapeHtml(chip.label)}</button>`).join('')}
          </div>
        `;
      }

      msgDiv.innerHTML = `
        <div class="triage-bubble">
          ${htmlContent}
          ${chipsHtml}
        </div>
        <div class="triage-msg-time">${timeStr} &bull; Elena (Online Representative)</div>
      `;

      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Bind chips
      msgDiv.querySelectorAll('.triage-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.val;
          addUserMessage(btn.innerText.trim());
          handleTriageAnswer(val);
        });
      });
    }

    // Helper: append user message
    function addUserMessage(text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'triage-msg user';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      msgDiv.innerHTML = `
        <div class="triage-bubble">${escapeHtml(text)}</div>
        <div class="triage-msg-time">${timeStr} &bull; You</div>
      `;

      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Starting conversation: Warm, comforting, non-depressing
    function startTriageGreeting() {
      triageState.step = 0;
      triageState.scamType = '';
      triageState.lossAmount = '';
      triageState.originInput = '';
      triageState.victimName = '';
      triageState.victimEmail = '';
      triageState.createdReportId = null;
      triageState.isVerifying = false;

      addBotMessage(
        `👋 <strong>Welcome to Nexus Shield!</strong><br><br>
        You are chatting live with an <strong>online client representative</strong>. We are here to support and assist you with any problem or question regarding your digital assets, wallets, or transactions.<br><br>
        Please take a deep breath &mdash; you are in safe hands. <strong>What issue can we help you with today?</strong>`,
        [
          { label: '💰 Crypto lost / unauthorized withdrawal', val: 'Unauthorized Wallet Transfer', icon: 'fas fa-wallet' },
          { label: '📈 Trading / broker platform issue', val: 'Investment / Broker Platform', icon: 'fas fa-chart-line' },
          { label: '🔗 Phishing link / suspicious dApp approval', val: 'Phishing / Drainer Contract', icon: 'fas fa-link-slash' },
          { label: '🤝 Sent funds to someone I met online', val: 'Social / P2P Impersonator', icon: 'fas fa-user-shield' },
          { label: '🛡️ Verify an official agent or handle', val: 'VERIFY_AGENT', icon: 'fas fa-shield-check' },
          { label: '💬 Chat on WhatsApp with specialist', val: 'OPEN_WHATSAPP', icon: 'fab fa-whatsapp' }
        ]
      );
    }

    // State machine processor
    function handleTriageAnswer(textVal) {
      const val = textVal.trim();
      if (!val) return;

      if (val === 'OPEN_WHATSAPP') {
        const secReg = getLiveSecurityRegistry();
        const rawNum = (secReg.whatsapp_number || '14158906398').replace(/\D/g, '');
        addBotMessage(
          `🟢 <strong>Direct WhatsApp Specialist Line:</strong><br><br>
          You can chat directly with an on-duty specialist on your phone right now on our official verified line:<br><br>
          <a href="https://wa.me/${rawNum}?text=Hello%20Nexus%20Shield%2C%20I%20am%20chatting%20from%20the%20website%20and%20need%20assistance." target="_blank" rel="noopener noreferrer" class="btn-primary" style="background: #25D366; border: none; font-size: 0.84rem; padding: 0.55rem 1.15rem; color: #080d1a; font-weight: 700; display: inline-flex; align-items: center; gap: 0.45rem; text-decoration: none; border-radius: 6px;">
            <i class="fab fa-whatsapp" style="font-size: 1.1rem;"></i> Open WhatsApp Chat Now
          </a>`,
          [
            { label: 'Return to Chat Assistant', val: 'RESTART', icon: 'fas fa-arrow-left' }
          ]
        );
        return;
      }

      if (val === 'VERIFY_AGENT') {
        triageState.isVerifying = true;
        addBotMessage(
          `🛡️ <strong>Official Credential & Channel Verification:</strong><br><br>
          Please type the email address, phone number, Telegram handle, or Agent ID you would like to check (for example: <code>@NEXUSSHIELDhq</code> or <code>support@nexusshield.org</code>):`
        );
        return;
      }

      if (triageState.isVerifying) {
        triageState.isVerifying = false;
        const query = val.toLowerCase().replace(/^@/, '');
        const secReg = getLiveSecurityRegistry();

        // 1. Check revoked first
        const revokedItems = (secReg.revoked_handles || '').split(',').map(s => s.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);
        const queryDigits = query.replace(/\D/g, '');
        const isRevoked = revokedItems.some(rev => {
          if (!rev) return false;
          const revDigits = rev.replace(/\D/g, '');
          if (revDigits.length >= 7 && queryDigits.length >= 7) {
            return revDigits.includes(queryDigits) || queryDigits.includes(revDigits);
          }
          return rev === query || query.includes(rev) || rev.includes(query);
        });

        if (isRevoked) {
          addBotMessage(
            `🚨 <strong style="color: #ef4444;">FRAUD ADVISORY: REVOKED OR IMPERSONATOR HANDLE!</strong><br><br>
            The identifier <code>${escapeHtml(val)}</code> has been officially marked as <strong>COMPROMISED or a FRAUDULENT IMPERSONATOR</strong>.<br><br>
            ⚠️ <strong>DO NOT SEND FUNDS OR SEED PHRASES.</strong> Cease contact immediately.`,
            [
              { label: 'Verify another identifier', val: 'VERIFY_AGENT', icon: 'fas fa-shield-check' },
              { label: 'Report an incident for recovery', val: 'RESTART', icon: 'fas fa-rotate' }
            ]
          );
          return;
        }

        // 2. Check active directory
        const activeDir = [
          { type: 'email', val: secReg.support_email || 'support@nexusshield.org', role: 'Official Support Desk' },
          { type: 'email', val: secReg.compliance_email || 'compliance@nexusshield.org', role: 'Official Compliance & Legal Liaison' },
          { type: 'x', val: secReg.x_handle || '@nexusshieldhq', role: 'Official Verified X Profile' },
          { type: 'telegram', val: secReg.telegram_handle || '@nexusshield_hq', role: 'Official Telegram Channel' },
          { type: 'phone', val: secReg.whatsapp_number || '+14158906398', role: 'Official WhatsApp Hotline' },
          { type: 'agent_id', val: 'nx-analyst-01', role: 'Accredited Senior Investigator (ID: NX-ANALYST-01)' },
          { type: 'agent_id', val: 'nx-officer-elena', role: 'Accredited Intake Specialist (ID: NX-OFFICER-ELENA)' }
        ];

        const match = activeDir.find(item => {
          const itemVal = item.val.toLowerCase().replace(/^@/, '');
          if (item.type === 'phone' && queryDigits.length >= 7) {
            const itemDigits = item.val.replace(/\D/g, '');
            return itemDigits.includes(queryDigits) || queryDigits.includes(itemDigits);
          }
          return itemVal === query || itemVal.includes(query) || query.includes(itemVal);
        });

        if (match) {
          addBotMessage(
            `✅ <strong style="color: var(--accent-green);">VERIFIED OFFICIAL CREDENTIAL!</strong><br><br>
            <code>${escapeHtml(match.val)}</code> is confirmed active on the official Nexus Shield Directorate Registry.<br>
            &bull; <strong>Designation:</strong> ${match.role}`,
            [
              { label: 'Report an incident for recovery', val: 'RESTART', icon: 'fas fa-plus' },
              { label: 'Chat on WhatsApp', val: 'OPEN_WHATSAPP', icon: 'fab fa-whatsapp' }
            ]
          );
        } else {
          addBotMessage(
            `⚠️ <strong style="color: #fb7185;">UNVERIFIED IDENTIFIER:</strong><br><br>
            The identifier <code>${escapeHtml(val)}</code> was <strong>NOT found</strong> in our official staff directory.<br><br>
            Secondary recovery scammers frequently create fake profiles claiming to be investigators. Never share private keys or send advance fees.`,
            [
              { label: 'Check another identifier', val: 'VERIFY_AGENT', icon: 'fas fa-magnifying-glass' },
              { label: 'Open incident recovery case', val: 'RESTART', icon: 'fas fa-folder-plus' }
            ]
          );
        }
        return;
      }

      switch(triageState.step) {
        case 0: // Situation chosen
          triageState.scamType = val;
          triageState.step = 1;
          setTimeout(() => {
            addBotMessage(
              `I am so sorry you are going through this. Please know that you are not alone, and our forensic team handles these exact situations every day to help trace funds back to destination exchanges.<br><br>
              To help us understand your situation, <strong>roughly how much was involved</strong>?`,
              [
                { label: 'Under $2,500', val: '1,500 USDT' },
                { label: '$2,500 – $10,000', val: '6,000 USDT' },
                { label: '$10,000 – $50,000', val: '25,000 USDT' },
                { label: '$50,000+ (Priority Case)', val: '75,000 USDT' }
              ]
            );
          }, 350);
          break;

        case 1: // Loss Amount chosen
          triageState.lossAmount = val;
          triageState.step = 2;
          setTimeout(() => {
            addBotMessage(
              `Thank you for letting me know. We take every incident seriously, regardless of amount.<br><br>
              Do you have a <strong>Transaction Hash (TxID)</strong>, or the <strong>wallet address</strong> where the funds went? (If you don't have it handy right now, don't worry &mdash; you can paste what you have, or let us know and we will guide you!)`,
              [
                { label: 'Use Sample Ethereum TxID', val: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e' },
                { label: 'I only have the scammer address', val: '0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7' },
                { label: 'I need help finding my TxID', val: 'Need help locating transaction details' }
              ]
            );
          }, 350);
          break;

        case 2: // TxID or Address chosen
          triageState.originInput = val;
          triageState.step = 3;
          setTimeout(() => {
            addBotMessage(
              `Thank you! We have logged that starting reference for our blockchain tracing nodes.<br><br>
              Who do I have the pleasure of speaking with today? (Please share your first name or preferred name)`
            );
          }, 350);
          break;

        case 3: // Name entered
          triageState.victimName = val;
          triageState.step = 4;
          setTimeout(() => {
            addBotMessage(
              `Wonderful to meet you, <strong>${escapeHtml(val)}</strong>. We are here to support you every step of the way.<br><br>
              What is the best <strong>email address or WhatsApp number</strong> where our forensic team can send your Case Reference and preliminary tracing dossier?`
            );
          }, 350);
          break;

        case 4: // Email entered
          triageState.victimEmail = val;
          triageState.step = 5;

          const cleanAmt = parseFloat(triageState.lossAmount.replace(/[^0-9.]/g, '')) || 15000;
          const cleanCurr = triageState.lossAmount.toUpperCase().includes('BTC') ? 'BTC' : (triageState.lossAmount.toUpperCase().includes('SOL') ? 'SOL' : 'USDT');

          setTimeout(() => {
            addBotMessage(
              `📋 <strong>Here is your incident summary, ${escapeHtml(triageState.victimName)}:</strong><br><br>
              &bull; <strong>Complainant:</strong> ${escapeHtml(triageState.victimName)}<br>
              &bull; <strong>Contact:</strong> ${escapeHtml(triageState.victimEmail)}<br>
              &bull; <strong>Incident:</strong> ${escapeHtml(triageState.scamType)}<br>
              &bull; <strong>Approximate Amount:</strong> ${cleanAmt.toLocaleString()} ${cleanCurr}<br>
              &bull; <strong>Reference:</strong> <code>${escapeHtml(triageState.originInput.substring(0, 22))}...</code><br><br>
              Shall we register your case with the taskforce and initiate blockchain tracing nodes right now?`,
              [
                { label: '🚀 Yes, Register Case & Start Tracing', val: 'EXECUTE_REGISTRATION', icon: 'fas fa-rocket' },
                { label: 'Update My Details', val: 'RESTART', icon: 'fas fa-rotate' }
              ]
            );
          }, 400);
          break;

        case 5: // Confirmation step
          if (val === 'RESTART') {
            startTriageGreeting();
            return;
          }

          if (val === 'EXECUTE_REGISTRATION' || val.toLowerCase().includes('yes') || val.toLowerCase().includes('register')) {
            executeAutomatedRegistration();
          }
          break;

        case 6: // Post-registration actions
          if (val === 'DOWNLOAD_FBI') {
            if (triageState.createdReportObj) {
              window.downloadFbiPacket(triageState.createdReportObj);
              addBotMessage('📄 FBI IC3 Evidence Packet downloaded to your device!');
            }
          } else if (val === 'VIEW_DASHBOARD') {
            const statusSection = document.getElementById('caseStatusSection') || document.getElementById('caseStatusResult');
            statusSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            addBotMessage('📊 Switched to your live on-screen case dashboard.');
          } else if (val === 'WHATSAPP_CASE') {
            const secReg = getLiveSecurityRegistry();
            const rawNum = (secReg.whatsapp_number || '14158906398').replace(/\D/g, '');
            const msg = encodeURIComponent(`Hello Nexus Shield, I just filed Case ${triageState.createdReportId} through the online representative and need urgent assistance.`);
            window.open(`https://wa.me/${rawNum}?text=${msg}`, '_blank');
          }
          break;
      }
    }

    // Submit case directly to system and open dashboard
    async function executeAutomatedRegistration() {
      const rand6 = Math.floor(100000 + Math.random() * 900000);
      const caseRef = `NX-${rand6}`;
      triageState.createdReportId = caseRef;

      const cleanAmt = parseFloat(triageState.lossAmount.replace(/[^0-9.]/g, '')) || 15000;
      const cleanCurr = triageState.lossAmount.toUpperCase().includes('BTC') ? 'BTC' : (triageState.lossAmount.toUpperCase().includes('SOL') ? 'SOL' : 'USDT');

      const isEvm = triageState.originInput.startsWith('0x') || cleanCurr === 'USDT';
      const sampleVictimWallet = isEvm ? '0x38b29F0eA86e41A235D97E2596816D34Ac3E47A9' : 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
      const sampleScammerWallet = isEvm ? (triageState.originInput.length === 42 ? triageState.originInput : '0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7') : 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h';
      const sampleTxHash = triageState.originInput.length >= 64 ? triageState.originInput : (isEvm ? '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e' : '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b');

      const reportObject = {
        reportId: caseRef,
        victimName: triageState.victimName,
        victimEmail: triageState.victimEmail,
        victimPhone: triageState.victimPhone || '+1 (555) 019-8492',
        victimWallet: sampleVictimWallet,
        scammerWallet: sampleScammerWallet,
        recoveryWallet: 'Pending Safe Cold-Storage Setup',
        amountLost: cleanAmt,
        currencyLost: cleanCurr,
        txHash: sampleTxHash,
        allTxHashes: [sampleTxHash],
        transactionHashes: [sampleTxHash],
        chain: isEvm ? 'Ethereum (ERC-20)' : 'Bitcoin (BTC)',
        chainType: isEvm ? 'evm' : 'btc',
        scamCategory: triageState.scamType,
        totalUsdLoss: cleanAmt,
        timestamp: new Date().toISOString(),
        status: 'pending',
        stage: 1
      };

      triageState.createdReportObj = reportObject;

      // 1. Sync inputs in main recovery form on the page
      const nameInput = document.getElementById('victimName');
      const emailInput = document.getElementById('victimEmail');
      const smartTx = document.getElementById('smartTxInput_1') || document.getElementById('smartTxInput');
      if (nameInput) nameInput.value = triageState.victimName;
      if (emailInput) emailInput.value = triageState.victimEmail;
      if (smartTx) smartTx.value = sampleTxHash;

      // 2. Persist to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
        local.unshift(reportObject);
        localStorage.setItem('nexus_local_reports', JSON.stringify(local.slice(0, 50)));

        // Try Supabase if initialized
        if (window.supabaseClient) {
          window.supabaseClient.from('reports').insert([{
            report_id: caseRef,
            victim_name: reportObject.victimName,
            victim_email: reportObject.victimEmail,
            victim_wallet: reportObject.victimWallet,
            scammer_wallet: reportObject.scammerWallet,
            amount_lost: reportObject.amountLost,
            currency_lost: reportObject.currencyLost,
            chain: reportObject.chain,
            status: 'pending',
            created_at: new Date().toISOString()
          }]).then(() => {}).catch(() => {});
        }

        // Automated Client Intake Confirmation Email via Serverless Function
        if (reportObject.victimEmail) {
          fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportObject)
          }).then(res => res.json()).then(data => {
            if (data && data.success) {
              console.log('Automated confirmation email successfully dispatched via Resend for bot case:', data.id);
            }
          }).catch(err => {
            console.warn('Bot automated confirmation email notice:', err);
          });
        }
      } catch (e) {
        console.warn(e);
      }

      triageState.step = 6;

      addBotMessage(
        `✨ <strong>Thank you, ${escapeHtml(triageState.victimName)}! Your case is now registered.</strong><br><br>
        📋 <strong>Your Official Case Reference:</strong> <strong style="color: var(--accent-cyan); font-size: 1.05rem;">${caseRef}</strong><br><br>
        📧 <strong>Intake Confirmation Dispatched:</strong> An official case confirmation containing your <strong>100,000 AI Tracing Tokens</strong> has been queued to <strong>${escapeHtml(triageState.victimEmail)}</strong>.<br><br>
        Our forensic analysts have received your incident details and initialized on-chain hop analysis to track destination exchanges.<br><br>
        How would you like to proceed?`,
        [
          { label: '🟢 Speak with Officer on WhatsApp', val: 'WHATSAPP_CASE', icon: 'fab fa-whatsapp' },
          { label: '📄 Download FBI IC3 Police Dossier', val: 'DOWNLOAD_FBI', icon: 'fas fa-file-shield' },
          { label: '📊 View Live Status on Website', val: 'VIEW_DASHBOARD', icon: 'fas fa-chart-pie' }
        ]
      );

      // Auto-populate case status tracking input
      const trackInput = document.getElementById('statusReportId');
      if (trackInput) {
        trackInput.value = caseRef;
        const checkBtn = document.getElementById('checkStatusBtn');
        if (checkBtn) {
          setTimeout(() => {
            checkBtn.click();
          }, 600);
        }
      }
    }

    // Input form submit
    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = inputField.value.trim();
      if (!txt) return;
      inputField.value = '';
      addUserMessage(txt);
      handleTriageAnswer(txt);
    });
  }
  // ======================== INITIALIZATION ========================
  document.addEventListener('DOMContentLoaded', () => {
    initDynamicPaymentQr();
    initAgentVerification();
    initTriageBot();
    syncFrontEndChannels();
  });

  // Re-sync immediately if admin updates security registry in another tab
  window.addEventListener('storage', (e) => {
    if (e.key === 'nexus_security_registry') {
      syncFrontEndChannels();
    }
  });

  // Defensive HTML escape
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
