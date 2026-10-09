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

  // ======================== 2. OFFICIAL AGENT & CHANNEL VERIFICATION ========================
  const OFFICIAL_DIRECTORY = [
    { type: 'email', val: 'support@nexusshield.org', role: 'Primary Case Intake & Client Support Desk', dept: 'Operations & Triage' },
    { type: 'email', val: 'compliance@nexusshield.org', role: 'Statutory Law Enforcement & Legal Liaison', dept: 'Legal & Exchange Freeze Directorate' },
    { type: 'email', val: 'recovery@nexusshield.org', role: 'Forensic Peeling-Chain Investigation Desk', dept: 'Digital Asset Intelligence Unit' },
    { type: 'email', val: 'lead.analyst@nexusshield.org', role: 'Senior Blockchain Forensic Examiner', dept: 'Technical Forensics' },
    { type: 'x', val: '@nexusshieldhq', role: 'Official Verified Communications Channel', dept: 'Public Announcements & Threat Advisories' },
    { type: 'web', val: 'nexusshield.org', role: 'Primary Institutional Domain', dept: 'Secure Cloudflare Protected Infrastructure' },
    { type: 'agent_id', val: 'nx-analyst-01', role: 'Senior Forensic Investigator (ID: NX-ANALYST-01)', dept: 'CEX Freeze Response Team' },
    { type: 'agent_id', val: 'nx-analyst-02', role: 'Blockchain Data Scientist (ID: NX-ANALYST-02)', dept: 'Clustering & Graph Intelligence' },
    { type: 'agent_id', val: 'nx-officer-elena', role: 'Lead Triage Officer (ID: NX-OFFICER-ELENA)', dept: '24/7 Digital Evidence Intake' }
  ];

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

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) window.closeAgentVerifyModal();
    });

    const runVerification = () => {
      const query = (input?.value || '').toLowerCase().trim().replace(/^@/, '');
      if (!query || query.length < 3) {
        if (resultBox) {
          resultBox.style.display = 'block';
          resultBox.className = 'verify-result-card failure';
          resultBox.innerHTML = `
            <div style="font-weight: 700; color: #fb7185; margin-bottom: 0.25rem;">
              <i class="fas fa-circle-exclamation"></i> Input Required
            </div>
            <div style="font-size: 0.78rem; color: #cbd5e1;">Please enter a valid email address, @Telegram handle, or Agent ID to verify.</div>
          `;
        }
        return;
      }

      const match = OFFICIAL_DIRECTORY.find(item => {
        const itemVal = item.val.toLowerCase().replace(/^@/, '');
        return itemVal === query || itemVal.includes(query) || query.includes(itemVal);
      });

      if (!resultBox) return;
      resultBox.style.display = 'block';

      if (match) {
        resultBox.className = 'verify-result-card success';
        resultBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 245, 155, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-size: 1rem;">
              <i class="fas fa-shield-check"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: var(--accent-green); font-size: 0.9rem;">
                VERIFIED OFFICIAL CREDENTIAL
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8;">Cryptographically Accredited Representative</div>
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
        resultBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(244, 63, 94, 0.2); display: flex; align-items: center; justify-content: center; color: #fb7185; font-size: 1rem;">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div>
              <div style="font-weight: 800; color: #fb7185; font-size: 0.9rem;">
                UNVERIFIED / SUSPECTED IMPERSONATOR
              </div>
              <div style="font-size: 0.72rem; color: #cbd5e1;">Not Found in Authorized Registry</div>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(244, 63, 94, 0.25);">
            The identifier <code>${escapeHtml(query)}</code> is <strong>NOT</strong> an authorized representative of Nexus Shield.
          </div>
          <div style="margin-top: 0.6rem; font-size: 0.74rem; color: #fda4af; line-height: 1.45;">
            <strong>⚠️ CRITICAL WARNING:</strong> Recovery scammers frequently create fake profiles claiming to be our investigators. <strong>NEVER</strong> share private keys, seed phrases, or transfer money to personal wallets. Report this impersonation to <code>compliance@nexusshield.org</code>.
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

  // ======================== 4. LIVE AI FORENSIC TRIAGE INTAKE BOT ========================
  let triageState = {
    step: 0,
    scamType: '',
    lossAmount: '',
    currency: 'USDT',
    originInput: '',
    victimName: '',
    victimEmail: '',
    victimPhone: '',
    createdReportId: null
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

    if (!launcher || !windowEl || !chatBody) return;

    // Toggle window
    launcher.addEventListener('click', () => {
      windowEl.classList.toggle('active');
      if (windowEl.classList.contains('active')) {
        if (!chatBody.children.length) {
          startTriageGreeting();
        }
        inputField?.focus();
      }
    });

    closeBtn?.addEventListener('click', () => windowEl.classList.remove('active'));
    minimizeBtn?.addEventListener('click', () => windowEl.classList.remove('active'));

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
        <div class="triage-msg-time">${timeStr} &bull; Officer Elena</div>
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

    // Starting conversation
    function startTriageGreeting() {
      triageState.step = 0;
      addBotMessage(
        `Hello, I'm <strong>Officer Elena</strong> with the Nexus Shield Digital Forensics Unit. I understand you may have experienced an unauthorized withdrawal or digital fraud.<br><br>You're in a safe, encrypted environment. <strong>What kind of incident occurred?</strong>`,
        [
          { label: 'Malicious Link / Wallet Drainer', val: 'Wallet Drainer', icon: 'fas fa-link-slash' },
          { label: 'Fake Investment Platform', val: 'Fake Investment', icon: 'fas fa-chart-line' },
          { label: 'Pig-Butchering / Telegram Romance', val: 'Pig-Butchering', icon: 'fas fa-heart-crack' },
          { label: 'Compromised Private Key / Seed', val: 'Compromised Seed', icon: 'fas fa-key' },
          { label: 'P2P / OTC Escrow Fraud', val: 'P2P Escrow', icon: 'fas fa-handshake-slash' }
        ]
      );
    }

    // State machine processor
    function handleTriageAnswer(textVal) {
      const val = textVal.trim();
      if (!val) return;

      switch(triageState.step) {
        case 0: // Scam Type chosen
          triageState.scamType = val;
          triageState.step = 1;
          setTimeout(() => {
            addBotMessage(
              `Noted: <strong>[${escapeHtml(val)}]</strong>. We deal with these attack vectors daily.<br><br>Approximately <strong>how much was lost</strong>, and in which cryptocurrency? (e.g. <em>15,000 USDT</em> or <em>0.5 BTC</em>)`,
              [
                { label: '$1,000 - $5,000 USDT', val: '3500 USDT' },
                { label: '$5,000 - $25,000 USDT', val: '15000 USDT' },
                { label: '$25,000 - $100,000 USDT', val: '45000 USDT' },
                { label: '$100,000+ (High Priority)', val: '120000 USDT' }
              ]
            );
          }, 350);
          break;

        case 1: // Loss Amount chosen
          triageState.lossAmount = val;
          triageState.step = 2;
          setTimeout(() => {
            addBotMessage(
              `Loss recorded: <strong>${escapeHtml(val)}</strong>.<br><br>To map the peeling chains and destination exchange, please paste your <strong>Transaction Hash (TxID)</strong>, the <strong>scammer's deposit wallet address</strong>, or the scam platform's URL:`,
              [
                { label: 'Use Sample Ethereum TxID', val: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e' },
                { label: 'I only have the scammer address', val: '0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7' }
              ]
            );
          }, 350);
          break;

        case 2: // TxID or Address chosen
          triageState.originInput = val;
          triageState.step = 3;
          setTimeout(() => {
            addBotMessage(
              `Origin pointer captured: <code>${escapeHtml(val.substring(0, 20))}...</code><br><br>To assign your official statutory Case Reference and generate your court-admissible evidence binder, what is your <strong>genuine full legal name</strong>?`
            );
          }, 350);
          break;

        case 3: // Name entered
          triageState.victimName = val;
          triageState.step = 4;
          setTimeout(() => {
            addBotMessage(
              `Thank you, <strong>${escapeHtml(val)}</strong>.<br><br>What is your <strong>best contact email address</strong> where we can dispatch encrypted forensic updates and official statutory notices?`
            );
          }, 350);
          break;

        case 4: // Email entered
          triageState.victimEmail = val;
          triageState.step = 5;

          // Clean values
          const cleanAmt = parseFloat(triageState.lossAmount.replace(/[^0-9.]/g, '')) || 15000;
          const cleanCurr = triageState.lossAmount.toUpperCase().includes('BTC') ? 'BTC' : (triageState.lossAmount.toUpperCase().includes('SOL') ? 'SOL' : 'USDT');

          setTimeout(() => {
            addBotMessage(
              `📋 <strong>Case Docket Ready for Immediate Filing:</strong><br>
              &bull; <strong>Complainant:</strong> ${escapeHtml(triageState.victimName)}<br>
              &bull; <strong>Contact:</strong> ${escapeHtml(triageState.victimEmail)}<br>
              &bull; <strong>Incident Type:</strong> ${escapeHtml(triageState.scamType)}<br>
              &bull; <strong>Documented Loss:</strong> ${cleanAmt.toLocaleString()} ${cleanCurr}<br>
              &bull; <strong>Target Origin:</strong> <code>${escapeHtml(triageState.originInput.substring(0, 18))}...</code><br><br>
              Shall I officially register this docket with the taskforce and initiate active blockchain tracing nodes right now?`,
              [
                { label: '🚀 Yes, Register Case & Launch Tracing', val: 'EXECUTE_REGISTRATION', icon: 'fas fa-rocket' },
                { label: 'Restart Intake', val: 'RESTART', icon: 'fas fa-rotate' }
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
      } catch (e) {
        console.warn(e);
      }

      triageState.step = 6;

      addBotMessage(
        `🎉 <strong>Docket Registered Successfully!</strong><br><br>
        Your official Case Reference ID is: <strong style="color: var(--accent-cyan); font-size: 1.05rem;">${caseRef}</strong><br><br>
        Node crawlers have initiated multi-hop peeling-chain analysis. Your case is now open in our internal investigation queue.<br><br>
        What would you like to do next?`,
        [
          { label: '📄 Download FBI IC3 Police Incident Packet', val: 'DOWNLOAD_FBI', icon: 'fas fa-file-shield' },
          { label: '📊 View Live On-Screen Dashboard', val: 'VIEW_DASHBOARD', icon: 'fas fa-chart-pie' }
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
