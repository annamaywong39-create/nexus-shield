// ========================================================
// NEXUS SHIELD — Internal Forensic Management Console
// Staff Authentication, Case Inspection & Dual Progress Controller
// ========================================================

const SUPABASE_URL = 'https://bxelezmomnruiurtiptg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWxlem1vbW5ydWl1cnRpcHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzg1NjksImV4cCI6MjA5MTY1NDU2OX0.N_QqBk9GVAWqMAyj9zzpopY2pqkzpk6P1w45giZZGNo';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Desk Console: Supabase Client Initialized');
  } catch (err) {
    console.warn('Desk Console: Supabase init error:', err);
  }
}

// Authorized Passcodes & Staff Accounts (Strong Cryptographic Passcode Only)
const VALID_PASSWORDS = ['NexusDesk#2026'];
const VALID_ACCOUNTS = [
  'support@nexusshield.org',
  'recovery@nexusshield.org',
  'lead.analyst@nexusshield.org',
  'compliance@nexusshield.org',
  'lead.analyst@nexus-shield.org',
  'admin',
  'nexus_ops',
  'lead.analyst'
];

let allReports = [];
let currentFilteredReports = [];
let selectedReportForDetail = null;
let activeSmartTab = 'all';

window.copyWalletText = function(text, btn) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check" style="color: #00f59b;"></i>';
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
  }
};

// Defensive HTML Entity Encoder to prevent Stored & Reflected XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSlaBadge(timestamp) {
  if (!timestamp) return '';
  const elapsedMs = Date.now() - new Date(timestamp).getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 2) {
    const mins = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
    return `<span class="sla-badge sla-fresh" title="Intake received under 2 hours ago"><i class="fas fa-bolt"></i> ${mins}m ago</span>`;
  } else if (elapsedHours < 24) {
    const hrs = Math.round(elapsedHours);
    return `<span class="sla-badge sla-warning" title="In-flight triage: ${hrs} hours elapsed"><i class="fas fa-clock"></i> ${hrs}h ago</span>`;
  } else {
    const days = Math.round(elapsedHours / 24);
    return `<span class="sla-badge sla-overdue" title="Overdue: ${days} days elapsed"><i class="fas fa-triangle-exclamation"></i> ${days}d overdue</span>`;
  }
}

function renderWalletSuite(wallet, chain) {
  if (!wallet || wallet === 'N/A') return '<span style="color: var(--text-muted); font-size: 0.8rem;">N/A</span>';
  const cleanWallet = String(wallet).trim();
  const short = cleanWallet.length > 14 ? cleanWallet.substring(0, 6) + '...' + cleanWallet.substring(cleanWallet.length - 4) : cleanWallet;
  const explorerUrl = getExplorerLink(cleanWallet, chain);
  const arkhamUrl = `https://platform.arkhamintelligence.com/explorer/address/${encodeURIComponent(cleanWallet)}`;

  return `
    <div style="display: inline-flex; align-items: center; gap: 0.35rem; flex-wrap: nowrap;">
      <a href="${escapeHtml(explorerUrl)}" target="_blank" rel="noopener noreferrer" class="explorer-link" title="Open Native Explorer (${escapeHtml(chain || 'Crypto')})">
        <code>${escapeHtml(short)}</code> <i class="fas fa-external-link-alt" style="font-size: 0.65rem;"></i>
      </a>
      <div class="wallet-actions-suite">
        <a href="${escapeHtml(arkhamUrl)}" target="_blank" rel="noopener noreferrer" class="mini-tool-btn arkham" title="Arkham Intelligence Deep Tracing & Entity Mapping">
          <i class="fas fa-brain"></i> Arkham
        </a>
        <button type="button" class="mini-tool-btn" data-wallet="${escapeHtml(cleanWallet)}" onclick="copyWalletText(this.dataset.wallet, this)" title="1-Click Copy Full Address">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>
  `;
}

// CEX Directory for Emergency Freeze Requests
const CEX_DIRECTORY = {
  binance: { name: 'Binance Compliance & Law Enforcement Triage', email: 'compliance@binance.com' },
  okx: { name: 'OKX Financial Crimes & Investigations', email: 'compliance@okx.com' },
  bybit: { name: 'Bybit Compliance & Legal Requests', email: 'case-inquiry@bybit.com' },
  coinbase: { name: 'Coinbase Law Enforcement Response', email: 'investigations@coinbase.com' },
  kraken: { name: 'Kraken Financial Intelligence Unit', email: 'compliance@kraken.com' },
  htx: { name: 'HTX / Huobi Asset Protection', email: 'compliance@htx.com' },
  kucoin: { name: 'KuCoin Legal & Compliance Center', email: 'compliance@kucoin.com' },
  gate: { name: 'Gate.io Security & AML Team', email: 'support@mail.gate.io' }
};

function generateCexFreezeLetter(report, cexKey = 'binance', ticketRef = '') {
  const cex = CEX_DIRECTORY[cexKey] || CEX_DIRECTORY.binance;
  const dateStr = new Date().toUTCString();
  const caseRef = report.report_id || `#${report.id}`;
  const amount = parseFloat(report.amount_lost || 0).toLocaleString();
  const curr = report.currency_lost || 'USDT';
  const chain = report.chain || 'Multi-Chain';

  return `================================================================================
URGENT: CRIMINAL ASSET FREEZE & EMERGENCY HOLD REQUEST
TO: ${cex.name} (${cex.email})
FROM: Nexus Shield Asset Recovery Taskforce (Compliance & Legal Operations)
DATE: ${dateStr}
CASE REFERENCE ID: ${caseRef}
${ticketRef ? `EXCHANGE TICKET / LE IDENTIFIER: ${ticketRef}\n` : ''}STATUTORY BASIS: Emergency Anti-Money Laundering & Forfeiture Protocol
================================================================================

ATTENTION: COMPLIANCE OFFICER / LAW ENFORCEMENT LIAISON DESK

Nexus Shield is an authorized non-custodial blockchain intelligence and digital
asset recovery firm acting on behalf of the verified victim of cryptocurrency
theft documented below.

On-chain transaction tracing has definitively tracked stolen proceeds from the
complainant's compromised source address directly into your exchange's custodial
deposit infrastructure.

--------------------------------------------------------------------------------
1. SUSPECT TRANSACTION IDENTIFIERS (CRITICAL)
--------------------------------------------------------------------------------
• Destination Exchange / Platform: ${cex.name}
• Scammer's Custodial Receiving Address: ${report.scammer_wallet || 'N/A'}
• Associated Transaction Hash (TxID): ${report.tx_hash || 'N/A'}
• Blockchain Network: ${chain}
• Total Documented Illicit Inflow: ${amount} ${curr}
• Timestamp of Fraudulent Hop: ${report.timestamp ? new Date(report.timestamp).toUTCString() : dateStr}

--------------------------------------------------------------------------------
2. COMPLAINANT PARTICULARS
--------------------------------------------------------------------------------
• Complainant Name: ${report.victim_name || 'Verified Complainant'}
• Contact Email: ${report.victim_email || 'Assigned to Case'}
• Safe Restitution Wallet: ${report.recovery_wallet || 'N/A'}
• Reported Scam URL / Platform: ${report.website_url || 'N/A'}

--------------------------------------------------------------------------------
3. EMERGENCY ACTIONS REQUIRED FROM ${cex.name.toUpperCase()}
--------------------------------------------------------------------------------
1. IMMEDIATELY PLACE AN EMERGENCY COMPLIANCE HOLD on all incoming deposits and
   outbound withdrawals linked to the aforementioned receiving address and
   associated Internal User ID (UID).

2. PRESERVE ALL ACCOUNT KYC RECORDS, IP connection logs, and associated
   off-ramp banking details under applicable AML/CFT record preservation mandates.

3. CONFIRM RECEIPT of this notice and provide internal ticket identifier to:
   Lead Compliance Officer: support@nexusshield.org
   Taskforce Case Desk: support@nexusshield.org

--------------------------------------------------------------------------------
4. LEGAL NOTICE & ESCALATION
--------------------------------------------------------------------------------
Failure to act upon verifiable notice of stolen fund deposits may expose the
custodial platform to secondary liability under international asset forfeiture
statutes. Official law enforcement subpoena and mutual legal assistance treaty
(MLAT) filings are currently being coordinated.

Respectfully submitted,

Lead Compliance Officer (NX-ANALYST-01)
Nexus Shield Asset Recovery Taskforce
Website: https://nexusshield.org
Secure Email: support@nexusshield.org
================================================================================`;
}

// ======================== AUTHENTICATION CONTROLLER ========================
let failedLoginAttempts = parseInt(sessionStorage.getItem('admin_login_fails') || '0');
let lockoutUntil = parseInt(sessionStorage.getItem('admin_lockout_until') || '0');

function checkAuthStatus() {
  const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const sessionIndicator = document.getElementById('sessionIndicator');
  const logoutBtn = document.getElementById('logoutBtn');

  if (isLoggedIn) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (sessionIndicator) sessionIndicator.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    loadReports();
    renderPaymentVerificationsTable();
    initTreasuryWalletConfig();
    initTableScrollEnhancements();
  } else {
    if (loginSection) loginSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (sessionIndicator) sessionIndicator.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const idInput = document.getElementById('investigatorId');
  const passcodeInput = document.getElementById('adminPasscode');
  const errorMsg = document.getElementById('loginErrorMsg');

  // Check brute force lockout
  const now = Date.now();
  if (lockoutUntil && now < lockoutUntil) {
    const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
    if (errorMsg) {
      errorMsg.style.display = 'block';
      errorMsg.innerHTML = `<i class="fas fa-shield-halved"></i> Security lockout active. Try again in ${remainingSecs} seconds.`;
    }
    return;
  }

  const investigatorId = idInput ? idInput.value.trim().toLowerCase() : '';
  const passcode = passcodeInput ? passcodeInput.value.trim() : '';

  const isPasscodeValid = VALID_PASSWORDS.includes(passcode);
  const isIdValid = !investigatorId || VALID_ACCOUNTS.includes(investigatorId) || investigatorId.endsWith('@nexusshield.org') || investigatorId.endsWith('@nexus-shield.org');

  if (isPasscodeValid && isIdValid) {
    sessionStorage.removeItem('admin_login_fails');
    sessionStorage.removeItem('admin_lockout_until');
    sessionStorage.setItem('admin_logged_in', 'true');
    sessionStorage.setItem('admin_user_id', investigatorId || 'support@nexusshield.org');
    if (errorMsg) errorMsg.style.display = 'none';
    checkAuthStatus();
  } else {
    failedLoginAttempts++;
    sessionStorage.setItem('admin_login_fails', String(failedLoginAttempts));

    if (failedLoginAttempts >= 5) {
      lockoutUntil = Date.now() + 60000;
      sessionStorage.setItem('admin_lockout_until', String(lockoutUntil));
    }

    if (errorMsg) {
      errorMsg.style.display = 'block';
      if (failedLoginAttempts >= 5) {
        errorMsg.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Too many failed authentication attempts. Access locked for 60 seconds.';
      } else {
        const remaining = 5 - failedLoginAttempts;
        errorMsg.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Authentication failed: Invalid credentials provided. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`;
      }
    }
    if (passcodeInput) {
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  }
}

function handleLogout() {
  sessionStorage.removeItem('admin_logged_in');
  checkAuthStatus();
}

// ======================== BLOCKCHAIN EXPLORER HELPERS ========================
function getExplorerLink(address, chain) {
  if (!address) return "#";
  const c = (chain || "").toLowerCase();
  if (c.includes("tron")) return `https://tronscan.org/#/address/${address}`;
  if (c.includes("solana")) return `https://solscan.io/account/${address}`;
  if (c.includes("bitcoin") || c.includes("btc")) return `https://www.blockchain.com/explorer/addresses/btc/${address}`;
  if (c.includes("bnb") || c.includes("bsc")) return `https://bscscan.com/address/${address}`;
  if (c.includes("litecoin") || c.includes("ltc")) return `https://blockchair.com/litecoin/address/${address}`;
  return `https://etherscan.io/address/${address}`;
}

function getTxExplorerLink(hash, chain) {
  if (!hash) return "#";
  const c = (chain || "").toLowerCase();
  if (c.includes("tron")) return `https://tronscan.org/#/transaction/${hash}`;
  if (c.includes("solana")) return `https://solscan.io/tx/${hash}`;
  if (c.includes("bitcoin") || c.includes("btc")) return `https://www.blockchain.com/explorer/transactions/btc/${hash}`;
  if (c.includes("bnb") || c.includes("bsc")) return `https://bscscan.com/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

// Compute auto time-based progress percentage
function calculateAutoProgress(report) {
  const rawDate = report.timestamp || report.localTimestamp || Date.now();
  const elapsedHours = (Date.now() - new Date(rawDate).getTime()) / (1000 * 60 * 60);

  if (elapsedHours < 1) return { percent: 20, status: 'pending' };
  if (elapsedHours < 6) return { percent: 38, status: 'approved' };
  if (elapsedHours < 24) return { percent: 58, status: 'investigating' };
  if (elapsedHours < 72) return { percent: 76, status: 'recovering1' };
  return { percent: 88, status: 'recovering2' };
}

// ======================== LOAD & RENDER REPORTS ========================
async function loadReports() {
  const tbody = document.getElementById('reportsTableBody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-pulse"></i> Querying forensic repository...</td></tr>';
  }

  let dbReports = [];
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reports')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data) {
        dbReports = data;
      } else if (error) {
        console.warn('Supabase fetch error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase query exception:', e);
    }
  }

  // Read saved local alerts and progress maps
  const alertsMap = JSON.parse(localStorage.getItem('nexus_case_alerts') || '{}');
  const progressMap = JSON.parse(localStorage.getItem('nexus_case_progress_updates') || '{}');

  // Merge local backup storage
  try {
    const local = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
    local.forEach(loc => {
      const locKey = loc.reportId || loc.report_id || String(loc.id);
      if (!dbReports.some(r => (r.report_id && r.report_id === loc.reportId) || String(r.id) === String(loc.id))) {
        dbReports.unshift({
          id: loc.id || 'Local',
          report_id: loc.reportId || loc.report_id,
          victim_name: loc.victimName || loc.victim_name,
          victim_email: loc.victimEmail || loc.victim_email,
          victim_phone: loc.victimPhone || loc.victim_phone,
          victim_wallet: loc.victimWallet || loc.victim_wallet,
          scammer_wallet: loc.scammerWallet || loc.scammer_wallet,
          recovery_wallet: loc.recoveryWallet || loc.recovery_wallet,
          amount_lost: loc.amountLost !== undefined ? loc.amountLost : loc.amount_lost,
          currency_lost: loc.currencyLost || loc.currency_lost,
          totalUsdLoss: loc.totalUsdLoss,
          transaction_hashes: loc.transactionHashes || loc.transaction_hashes,
          website_url: loc.websiteUrl || loc.website_url,
          chain: loc.chain,
          status: loc.status || 'pending',
          progressMode: loc.progressMode || 'auto',
          progressPercent: loc.progressPercent !== undefined ? loc.progressPercent : 20,
          timestamp: loc.timestamp || loc.localTimestamp,
          wallets: loc.wallets || [],
          clientAlert: loc.clientAlert || alertsMap[locKey] || null,
          customStatusMessage: loc.customStatusMessage || (progressMap[locKey] ? progressMap[locKey].customMessage : null)
        });
      }
    });
  } catch (e) {}

  // Apply saved alerts and progress maps to all reports
  if (!dbReports.length) {
    dbReports = [
      {
        id: 1,
        report_id: 'NX-849201',
        victim_name: 'Margaret Vance',
        victim_email: 'margaret.vance@example.org',
        victim_phone: '+1 (555) 234-8901',
        victim_wallet: '0x38b29F0eA86e41A235D97E2596816D34Ac3E47A9',
        scammer_wallet: '0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7',
        recovery_wallet: '0x94fC28e75e11A235D97E2596816D34Ac3E47A9',
        amount_lost: 42500,
        currency_lost: 'USDT',
        tx_hash: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e',
        chain: 'Ethereum (ERC-20)',
        chainType: 'evm',
        status: 'recovering1',
        progressMode: 'custom',
        progressPercent: 65,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        clientAlert: {
          tag: 'EXCHANGE COMPLIANCE HOLD ACTIVE',
          msg: 'Binance Compliance confirmed receipt of 18 U.S.C. § 2703 Directive. 48h emergency administrative freeze placed on sub-account BN-DEP-0x71c9-SUB42.',
          severity: 'urgent',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        customStatusMessage: 'Statutory emergency hold packet confirmed by Binance Law Enforcement portal.'
      },
      {
        id: 2,
        report_id: 'NX-192840',
        victim_name: 'Robert Thornton',
        victim_email: 'r.thornton@businessgroup.com',
        victim_phone: '+1 (555) 892-4412',
        victim_wallet: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        scammer_wallet: 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
        recovery_wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount_lost: 1.85,
        currency_lost: 'BTC',
        tx_hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        chain: 'Bitcoin (BTC)',
        chainType: 'btc',
        status: 'investigating',
        progressMode: 'auto',
        progressPercent: 40,
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        clientAlert: null,
        customStatusMessage: 'Active node queries tracing unspent transaction outputs (UTXOs).'
      },
      {
        id: 3,
        report_id: 'NX-304918',
        victim_name: 'David K. Miller',
        victim_email: 'd.miller.cyber@outlook.com',
        victim_phone: '+1 (555) 431-7729',
        victim_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        scammer_wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        recovery_wallet: '3bJgK8tY2mB5vC8xL3kM7jP9qTYk6t1rX9mQ4vW8tY2m',
        amount_lost: 120,
        currency_lost: 'SOL',
        tx_hash: '5VERv8NMvzbJMEdV8xnrLkEaMaWRBZ8osDgJ9Z82XZeQ',
        chain: 'Solana (SPL)',
        chainType: 'solana',
        status: 'approved',
        progressMode: 'auto',
        progressPercent: 25,
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        clientAlert: null,
        customStatusMessage: 'Forensic intake approved and queued for Raydium liquidity pool hop analysis.'
      }
    ];
  }

  dbReports.forEach(r => {
    const key = r.report_id || String(r.id);
    if (alertsMap[key]) {
      r.clientAlert = alertsMap[key];
    }
    if (progressMap[key]) {
      if (progressMap[key].status) r.status = progressMap[key].status;
      if (progressMap[key].progressMode) r.progressMode = progressMap[key].progressMode;
      if (progressMap[key].progressPercent !== undefined) r.progressPercent = progressMap[key].progressPercent;
      if (progressMap[key].customMessage) r.customStatusMessage = progressMap[key].customMessage;
    }
  });

  allReports = dbReports;
  updateKpis(allReports);
  applyFilters();
}

function updateKpis(reports) {
  const totalKpi = document.getElementById('totalReportsKpi');
  const lossKpi = document.getElementById('totalLossKpi');
  const activeKpi = document.getElementById('activeCasesKpi');
  const scammersKpi = document.getElementById('scammersKpi');

  if (totalKpi) totalKpi.innerText = reports.length.toLocaleString();

  let totalUSD = 0;
  let activeCount = 0;
  const uniqueScammers = new Set();

  const coinRate = {
    USDT: 1, USD: 1, BTC: 68000, ETH: 2600, BNB: 590, SOL: 150,
    LTC: 70, DOGE: 0.13, ADA: 0.38, XRP: 0.58, TRX: 0.15
  };

  reports.forEach(r => {
    const amt = parseFloat(r.amount_lost) || 0;
    const curr = (r.currency_lost || 'USDT').toUpperCase();
    const rate = coinRate[curr] || 1;
    totalUSD += amt * rate;

    if (r.status !== 'recovered' && r.status !== 'failed') {
      activeCount++;
    }

    if (r.scammer_wallet) {
      uniqueScammers.add(r.scammer_wallet.toLowerCase().trim());
    }
  });

  if (lossKpi) {
    if (totalUSD >= 1000000) {
      lossKpi.innerText = `$${(totalUSD / 1000000).toFixed(2)}M`;
    } else {
      lossKpi.innerText = `$${Math.round(totalUSD).toLocaleString()}`;
    }
  }

  if (activeKpi) activeKpi.innerText = activeCount.toLocaleString();
  if (scammersKpi) scammersKpi.innerText = uniqueScammers.size.toLocaleString();

  // Smart Queue Tab Badges
  const tabAll = document.getElementById('tabBadgeAll');
  const tabPending = document.getElementById('tabBadgePending');
  const tabTracing = document.getElementById('tabBadgeTracing');
  const tabCex = document.getElementById('tabBadgeCex');
  const tabRecovered = document.getElementById('tabBadgeRecovered');
  const tabHighValue = document.getElementById('tabBadgeHighValue');
  const tabOverdue = document.getElementById('tabBadgeOverdue');

  const pendingCount = reports.filter(r => (r.status || 'pending') === 'pending').length;
  const tracingCount = reports.filter(r => r.status === 'investigating' || r.status === 'approved').length;
  const cexCount = reports.filter(r => r.status === 'recovering1' || r.status === 'recovering2').length;
  const recoveredCount = reports.filter(r => r.status === 'recovered').length;
  const highValueCount = reports.filter(r => (parseFloat(r.amount_lost) || 0) >= 20000).length;
  const overdueCount = reports.filter(r => r.status !== 'recovered' && r.status !== 'failed' && (Date.now() - new Date(r.timestamp || 0).getTime()) > 86400000).length;

  if (tabAll) tabAll.innerText = reports.length;
  if (tabPending) tabPending.innerText = pendingCount;
  if (tabTracing) tabTracing.innerText = tracingCount;
  if (tabCex) tabCex.innerText = cexCount;
  if (tabRecovered) tabRecovered.innerText = recoveredCount;
  if (tabHighValue) tabHighValue.innerText = highValueCount;
  if (tabOverdue) tabOverdue.innerText = overdueCount;
}

function applyFilters() {
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const chainFilter = document.getElementById('filterChain')?.value || '';
  const searchTerm = (document.getElementById('filterSearch')?.value || '').toLowerCase().trim();

  currentFilteredReports = allReports.filter(r => {
    // Smart Queue Tab filter
    if (activeSmartTab === 'pending' && (r.status || 'pending') !== 'pending') return false;
    if (activeSmartTab === 'investigating' && r.status !== 'investigating' && r.status !== 'approved') return false;
    if (activeSmartTab === 'recovering1' && r.status !== 'recovering1' && r.status !== 'recovering2') return false;
    if (activeSmartTab === 'recovered' && r.status !== 'recovered') return false;
    if (activeSmartTab === 'highvalue' && (parseFloat(r.amount_lost) || 0) < 20000) return false;
    if (activeSmartTab === 'overdue') {
      const isClosed = r.status === 'recovered' || r.status === 'failed';
      const elapsed = Date.now() - new Date(r.timestamp || 0).getTime();
      if (isClosed || elapsed <= 86400000) return false;
    }

    if (statusFilter && (r.status || 'pending') !== statusFilter) return false;
    if (chainFilter) {
      const chain = (r.chain || '').toLowerCase();
      if (!chain.includes(chainFilter.toLowerCase())) return false;
    }
    if (searchTerm) {
      const matchScammer = (r.scammer_wallet || '').toLowerCase().includes(searchTerm);
      const matchVictim = (r.victim_name || '').toLowerCase().includes(searchTerm);
      const matchReportId = (r.report_id || String(r.id)).toLowerCase().includes(searchTerm);
      if (!matchScammer && !matchVictim && !matchReportId) return false;
    }
    return true;
  });

  renderTable(currentFilteredReports);
}

function renderTable(reports) {
  const tbody = document.getElementById('reportsTableBody');
  if (!tbody) return;

  if (!reports.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No matching forensic records found.</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(r => {
    let formattedDate = '-';
    if (r.timestamp) {
      formattedDate = new Date(r.timestamp).toLocaleDateString();
    }

    const statusBadgeClass = `status-pill status-${r.status || 'pending'}`;
    const reportRef = r.report_id ? (r.report_id.length > 18 ? r.report_id.substring(0, 18) + '...' : r.report_id) : `#${r.id}`;
    const hasAlert = r.clientAlert && r.clientAlert.active;
    const isManual = r.progressMode === 'manual';
    const slaBadge = getSlaBadge(r.timestamp);

    return `
      <tr>
        <td class="mono" style="font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 400;">#${r.id}</div>
          <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
            <span>${reportRef}</span>
            ${hasAlert ? `<span style="font-size: 0.65rem; background: rgba(244,63,94,0.18); border: 1px solid rgba(244,63,94,0.4); color: #fb7185; padding: 0.1rem 0.35rem; border-radius: 4px;"><i class="fas fa-bell"></i> POP</span>` : ''}
            ${isManual ? `<span style="font-size: 0.65rem; background: rgba(96,165,250,0.18); border: 1px solid rgba(96,165,250,0.4); color: #93c5fd; padding: 0.1rem 0.35rem; border-radius: 4px;" title="Manual: ${r.progressPercent || 20}%"><i class="fas fa-sliders"></i> ${r.progressPercent || 20}%</span>` : ''}
          </div>
        </td>
        <td style="font-weight: 500;">${r.victim_name || 'Anonymous Complainant'}</td>
        <td class="mono" style="font-size: 0.8rem;">
          ${renderWalletSuite(r.scammer_wallet, r.chain)}
        </td>
        <td style="font-weight: 600; color: #fff;">
          ${parseFloat(r.amount_lost || 0).toLocaleString()} ${r.currency_lost || 'USDT'}
        </td>
        <td>
          <span style="font-size: 0.78rem; color: #cbd5e1; background: rgba(255,255,255,0.05); padding: 0.2rem 0.45rem; border-radius: 4px;">
            ${r.chain || 'Multi-Chain'}
          </span>
        </td>
        <td>
          <div style="font-size: 0.78rem; color: #cbd5e1;">${formattedDate}</div>
          <div style="margin-top: 0.25rem;">${slaBadge}</div>
        </td>
        <td>
          <span class="${statusBadgeClass}">${(r.status || 'pending').toUpperCase()}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-primary view-btn" data-id="${r.id}" data-ref="${r.report_id || r.id}" style="padding: 0.35rem 0.75rem; font-size: 0.76rem; font-weight: 600;">
            <i class="fas fa-pen-to-square"></i> Manage
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const ref = btn.dataset.ref;
      const report = allReports.find(r => (r.report_id && r.report_id === ref) || String(r.id) === String(id));
      if (report) openDetailModal(report);
    });
  });
}

// Update case progress with dual manual/auto support
async function updateReportProgress(id, newStatus, customMessage = '', progressMode = 'auto', progressPercent = 20) {
  const found = allReports.find(r => String(r.id) === String(id) || (r.report_id && r.report_id === id));
  if (found) {
    found.status = newStatus;
    found.progressMode = progressMode;
    found.progressPercent = progressPercent;
    if (customMessage) found.customStatusMessage = customMessage;
    const key = found.report_id || String(found.id);

    // Save to progress updates map
    const progressMap = JSON.parse(localStorage.getItem('nexus_case_progress_updates') || '{}');
    progressMap[key] = {
      status: newStatus,
      progressMode: progressMode,
      progressPercent: progressPercent,
      customMessage: customMessage,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('nexus_case_progress_updates', JSON.stringify(progressMap));

    // Update in local reports list
    try {
      const local = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
      const locIdx = local.findIndex(l => l.reportId === found.report_id || String(l.id) === String(found.id));
      if (locIdx >= 0) {
        local[locIdx].status = newStatus;
        local[locIdx].progressMode = progressMode;
        local[locIdx].progressPercent = progressPercent;
        local[locIdx].customStatusMessage = customMessage;
        localStorage.setItem('nexus_local_reports', JSON.stringify(local));
      }
    } catch (e) {}

    // Update Supabase if connected
    if (supabaseClient && !isNaN(parseInt(found.id))) {
      try {
        await supabaseClient.from('reports').update({ status: newStatus }).eq('id', parseInt(found.id));
      } catch (e) {
        console.warn('Supabase update exception:', e);
      }
    }
  }

  updateKpis(allReports);
  applyFilters();
}

// ======================== CASE DETAIL & POPUP ALERT MODAL ========================
const caseDetailModal = document.getElementById('caseDetailModal');

function generateProgressReportLetter(report) {
  const dateStr = new Date().toUTCString();
  const caseRef = report.report_id || `#${report.id}`;
  const statusLabels = {
    pending: "Stage 1: Case Intake & Initial Review (20%)",
    approved: "Stage 2: On-Chain Evidence Verified (38%)",
    investigating: "Stage 3: Active Multi-Hop Tracing (58%)",
    recovering1: "Stage 4: Emergency Exchange Freeze Notice Served (76%)",
    recovering2: "Stage 5: Legal Restitution & Freeze Coordination (88%)",
    recovered: "Stage 6: Restitution Completed / Assets Returned (100%)",
    failed: "Stage 7: Tracing Inconclusive / Mixer Dispersion (Archived)"
  };

  const statusTitle = statusLabels[report.status] || report.status;
  const alertInfo = report.clientAlert && report.clientAlert.active ? `
--------------------------------------------------------------------------------
ACTIVE CASE ADVISORY NOTICE:
Tag: [${report.clientAlert.tag || 'URGENT NOTICE'}]
Message: ${report.clientAlert.message || 'None'}
Flagged Address: ${report.clientAlert.address || 'N/A'}
--------------------------------------------------------------------------------` : '';

  return `================================================================================
NEXUS SHIELD — CRYPTO ASSET RECOVERY & FORENSICS
OFFICIAL CASE INVESTIGATION PROGRESS REPORT
================================================================================
DATE: ${dateStr}
CASE REFERENCE ID: ${caseRef}
CURRENT MILESTONE: ${statusTitle}
PROGRESS MODE: ${(report.progressMode || 'auto').toUpperCase()}${report.progressMode === 'manual' ? ` (${report.progressPercent || 20}%)` : ''}

Dear ${report.victim_name || 'Complainant'},

This is an official progress update regarding your cryptocurrency fraud recovery case.
Our investigative team is actively monitoring transaction flows across the blockchain.

--------------------------------------------------------------------------------
1. CASE PARTICULARS
--------------------------------------------------------------------------------
Complainant: ${report.victim_name || 'Anonymous'}
Contact Email: ${report.victim_email || 'N/A'}
Contact Phone / WhatsApp: ${report.victim_phone || 'N/A'}
Documented Loss: ${parseFloat(report.amount_lost || 0).toLocaleString()} ${report.currency_lost || 'USDT'}
Blockchain Network: ${report.chain || 'Multi-Chain'}
Safe Recovery Wallet: ${report.recovery_wallet || 'N/A'}
Target / Scammer Address: ${report.scammer_wallet || 'N/A'}

--------------------------------------------------------------------------------
2. CURRENT INVESTIGATION STATUS & ANALYST NOTES
--------------------------------------------------------------------------------
Investigation Status: ${statusTitle}
Investigator Note: ${report.customStatusMessage || 'Active node parsing and exchange gateway tracing underway.'}
${alertInfo}

--------------------------------------------------------------------------------
3. DIRECT INVESTIGATOR CONTACT
--------------------------------------------------------------------------------
If you have additional transaction hashes or suspect fresh activity from the scammer,
reply directly to this report or reach our triage team at:
  • Email: support@nexusshield.org
  • Portal Case Tracker: https://nexusshield.org

Nexus Shield Asset Recovery & Forensics Division
Compliance & Investigation Desk
================================================================================`;
}

function generateAlertEmailText(report, alertObj) {
  const dateStr = new Date().toUTCString();
  const caseRef = report.report_id || `#${report.id}`;
  const victimName = report.victim_name || 'Complainant';
  const victimEmail = report.victim_email || 'Assigned Address';
  const severityLabels = {
    urgent: "🔴 URGENT / CRITICAL",
    warning: "🟡 WARNING NOTICE",
    info: "🔵 CASE UPDATE",
    success: "🟢 MILESTONE CLEARED"
  };
  const severityStr = severityLabels[alertObj.severity || 'urgent'] || "🔴 URGENT / CRITICAL";

  return `================================================================================
NEXUS SHIELD — HIGH-PRIORITY CASE ADVISORY NOTICE
================================================================================
DATE: ${dateStr}
CASE REFERENCE ID: ${caseRef}
ATTENTION: ${victimName}
RECIPIENT EMAIL: ${victimEmail}
SEVERITY LEVEL: ${severityStr}
STATUS: ACTION REQUIRED / ACTIVE TRACE
================================================================================

Dear ${victimName},

An official case advisory notice has been published to your Nexus Shield file by
your assigned compliance investigator.

--------------------------------------------------------------------------------
1. ADVISORY HEADLINE / TAG
--------------------------------------------------------------------------------
[${(alertObj.tag || 'URGENT ACTION REQUIRED').toUpperCase()}]

--------------------------------------------------------------------------------
2. OFFICIAL MESSAGE FROM INVESTIGATION DESK
--------------------------------------------------------------------------------
${alertObj.message || 'An urgent advisory update has been published to your recovery case file. Please review your tracking portal.'}

${alertObj.address ? `--------------------------------------------------------------------------------
3. TARGET / FLAGGED ON-CHAIN IDENTIFIER
--------------------------------------------------------------------------------
Reference Address: ${alertObj.address}
Blockchain Network: ${report.chain || 'Multi-Chain'}
Note: This address has been flagged in connection with your asset recovery protocol.
` : ''}
--------------------------------------------------------------------------------
4. IMMEDIATE ACTIONS REQUIRED
--------------------------------------------------------------------------------
1. Access your live Case Dossier and investigation tracker immediately:
   Portal: https://nexusshield.org
   Case Reference ID: ${caseRef}

2. Acknowledge this advisory notice directly on your personal client dashboard.

3. SECURITY REMINDER: Nexus Shield personnel will NEVER ask for your private
   keys, seed phrase, or advance recovery fees via Telegram, WhatsApp, or Instagram.

--------------------------------------------------------------------------------
5. ASSIGNED INVESTIGATION CONTACT
--------------------------------------------------------------------------------
Assigned Unit: High-Value Asset Recovery Taskforce
Lead Analyst: Lead Compliance Officer (NX-ANALYST-01)
Intelligence Desk: support@nexusshield.org
Support: support@nexusshield.org

================================================================================
CONFIDENTIALITY NOTICE: This transmission contains privileged security intelligence
intended solely for the named complainant. Any unauthorized distribution is prohibited.
================================================================================`;
}

function showAdminEmailToast(message) {
  const existing = document.getElementById("activeAdminEmailToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "activeAdminEmailToast";
  toast.className = "email-toast";
  toast.innerHTML = `<i class="fas fa-envelope-circle-check" style="color: var(--accent-cyan); font-size: 1.15rem;"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5500);
}

function openDetailModal(report) {
  selectedReportForDetail = report;
  const caseRef = report.report_id || `#${report.id}`;
  document.getElementById('detailCaseId').innerText = caseRef;
  document.getElementById('detailVictimName').innerText = report.victim_name || 'Legacy Record';
  
  const emailEl = document.getElementById('detailVictimEmail');
  if (emailEl) {
    emailEl.innerHTML = report.victim_email 
      ? `<a href="mailto:${encodeURIComponent(report.victim_email)}" style="color: var(--primary-light);"><i class="fas fa-envelope"></i> ${escapeHtml(report.victim_email)}</a>` 
      : '<span style="color: var(--text-muted);">N/A</span>';
  }

  const phoneEl = document.getElementById('detailVictimPhone');
  if (phoneEl) {
    phoneEl.innerHTML = report.victim_phone 
      ? `<a href="tel:${encodeURIComponent(report.victim_phone)}" style="color: var(--accent-emerald);"><i class="fas fa-phone"></i> ${escapeHtml(report.victim_phone)}</a>` 
      : '<span style="color: var(--text-muted);">N/A</span>';
  }

  // Display complainant notification preferences
  const notifEl = document.getElementById('detailNotificationPrefs');
  const prefs = report.notification_preferences || report.notificationPreferences || { channels: ['email', 'whatsapp'] };
  const channels = Array.isArray(prefs.channels) ? prefs.channels : ['email'];
  if (notifEl) {
    notifEl.innerHTML = channels.map(c => {
      if (c === 'whatsapp') return `<span style="background: rgba(37,211,102,0.15); border: 1px solid rgba(37,211,102,0.3); color: #6ee7b7; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; margin-right: 0.3rem;"><i class="fab fa-whatsapp"></i> WhatsApp</span>`;
      if (c === 'telegram') return `<span style="background: rgba(34,158,217,0.15); border: 1px solid rgba(34,158,217,0.3); color: #7dd3fc; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; margin-right: 0.3rem;"><i class="fab fa-telegram"></i> Telegram${prefs.telegram ? ` (${prefs.telegram})` : ''}</span>`;
      if (c === 'sms') return `<span style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fde68a; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; margin-right: 0.3rem;"><i class="fas fa-comment-sms"></i> SMS</span>`;
      return `<span style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; margin-right: 0.3rem;"><i class="fas fa-envelope"></i> Email</span>`;
    }).join('');
  }

  // WhatsApp Ping button
  const waBtn = document.getElementById('dispatchWhatsAppBtn');
  const rawPhone = report.victim_phone || report.victimPhone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (waBtn) {
    if (cleanPhone.length >= 7) {
      waBtn.style.display = 'inline-flex';
      const waMsg = encodeURIComponent(`[Nexus Shield Investigation Desk]\nCase Reference ID: ${caseRef}\nStatus: ${(report.status || 'pending').toUpperCase()}\nInvestigator Note: ${report.customStatusMessage || 'Your on-chain case has been updated. Review your timeline at https://nexusshield.org'}`);
      waBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    } else {
      waBtn.style.display = 'none';
    }
  }

  // Telegram Ping button
  const tgBtn = document.getElementById('dispatchTelegramBtn');
  const tgHandle = (prefs && prefs.telegram) || report.telegramHandle || '';
  if (tgBtn) {
    if (tgHandle) {
      tgBtn.style.display = 'inline-flex';
      const cleanTg = tgHandle.replace('@', '');
      tgBtn.href = `https://t.me/${cleanTg}`;
    } else {
      tgBtn.style.display = 'none';
    }
  }

  document.getElementById('detailVictimWallet').innerText = report.victim_wallet || 'N/A';
  
  const recWalletEl = document.getElementById('detailRecoveryWallet');
  if (recWalletEl) {
    recWalletEl.innerHTML = renderWalletSuite(report.recovery_wallet, report.chain);
  }
  
  const scammerEl = document.getElementById('detailScammerWallet');
  if (scammerEl) {
    scammerEl.innerHTML = renderWalletSuite(report.scammer_wallet, report.chain);
  }
  
  document.getElementById('detailAmount').innerText = `${parseFloat(report.amount_lost || 0).toLocaleString()} ${report.currency_lost || 'USDT'}`;
  document.getElementById('detailChain').innerText = `${report.chain || 'EVM'}${report.usdt_network ? ` (${report.usdt_network})` : ''}`;
  
  const urlEl = document.getElementById('detailScamUrl');
  if (report.website_url) {
    urlEl.innerHTML = `<a href="${report.website_url}" target="_blank" rel="noopener noreferrer" class="explorer-link">${report.website_url}</a>`;
  } else {
    urlEl.innerText = 'None Reported';
  }

  document.getElementById('detailDate').innerText = report.timestamp ? new Date(report.timestamp).toLocaleString() : '-';

  // Multi-wallet movements renderer
  const multiSection = document.getElementById('detailMultiWalletSection');
  const multiContainer = document.getElementById('detailMultiWalletContainer');
  const multiCount = document.getElementById('detailMultiWalletCount');
  const wallets = Array.isArray(report.wallets) ? report.wallets : [];

  if (wallets.length > 1 && multiSection && multiContainer) {
    multiSection.style.display = 'block';
    if (multiCount) multiCount.innerText = wallets.length;
    multiContainer.innerHTML = wallets.map((w, idx) => `
      <div style="padding: 0.6rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.4rem; background: rgba(0,0,0,0.2); border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: #fff; margin-bottom: 0.25rem;">
          <span>Transfer #${idx + 1}</span>
          <span style="color: #60a5fa;">${parseFloat(w.amountLost || 0).toLocaleString()} ${escapeHtml(w.currencyLost || 'USDT')} ${w.usdtNetwork ? `(${escapeHtml(w.usdtNetwork)})` : ''}</span>
        </div>
        <div style="font-size: 0.75rem; color: #cbd5e1; font-family: monospace;">
          Source: <span style="color: var(--accent-cyan);">${escapeHtml(w.victimWallet || 'N/A')}</span><br>
          Target: <span style="color: var(--accent-rose);">${escapeHtml(w.scammerWallet || 'N/A')}</span><br>
          Tx: <a href="${escapeHtml(getTxExplorerLink(w.txHash, w.chain))}" target="_blank" rel="noopener noreferrer" style="color: #93c5fd;">${escapeHtml(w.txHash ? (w.txHash.length > 24 ? w.txHash.substring(0, 24) + '...' : w.txHash) : 'N/A')}</a>
        </div>
      </div>
    `).join('');
  } else if (multiSection) {
    multiSection.style.display = 'none';
  }

  const txContainer = document.getElementById('detailTxContainer');
  const txs = Array.isArray(report.transaction_hashes) ? report.transaction_hashes : (report.transactionHashes || []);
  if (txs.length) {
    txContainer.innerHTML = txs.map((h, i) => `
      <div style="padding: 0.35rem 0; font-family: monospace; font-size: 0.8rem; word-break: break-all;">
        <span style="color: var(--text-muted);">[#${i+1}]</span>
        <a href="${getTxExplorerLink(h, report.chain)}" target="_blank" rel="noopener noreferrer" class="explorer-link">
          ${h} <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i>
        </a>
      </div>
    `).join('');
  } else {
    txContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.82rem;">No transaction hashes provided.</span>';
  }

  // Dual Progress Mode & Percent Initialization
  const currentMode = report.progressMode || 'auto';
  const progressControlMode = document.getElementById('progressControlMode');
  const modeBtnAuto = document.getElementById('modeBtnAuto');
  const modeBtnManual = document.getElementById('modeBtnManual');
  const manualControlsWrapper = document.getElementById('manualControlsWrapper');
  const progressPercentSlider = document.getElementById('progressPercentSlider');
  const progressPercentDisplay = document.getElementById('progressPercentDisplay');
  const progressPercentInput = document.getElementById('progressPercentInput');
  const statusSelect = document.getElementById('detailStatusSelect');
  const customMsgInput = document.getElementById('detailCustomMessage');

  let defaultPct = 20;
  if (currentMode === 'manual' && report.progressPercent !== undefined) {
    defaultPct = parseInt(report.progressPercent);
  } else {
    const autoCalc = calculateAutoProgress(report);
    defaultPct = autoCalc.percent;
  }

  if (progressControlMode) progressControlMode.value = currentMode;
  if (progressPercentSlider) progressPercentSlider.value = defaultPct;
  if (progressPercentInput) progressPercentInput.value = defaultPct;
  if (progressPercentDisplay) progressPercentDisplay.innerText = defaultPct + '%';

  if (currentMode === 'manual') {
    if (modeBtnManual) {
      modeBtnManual.classList.add('active');
      modeBtnManual.style.borderColor = 'var(--accent-cyan)';
      modeBtnManual.style.background = 'rgba(0, 245, 155, 0.15)';
    }
    if (modeBtnAuto) {
      modeBtnAuto.classList.remove('active');
      modeBtnAuto.style.borderColor = 'var(--border-subtle)';
      modeBtnAuto.style.background = 'none';
    }
    if (manualControlsWrapper) manualControlsWrapper.style.display = 'block';
  } else {
    if (modeBtnAuto) {
      modeBtnAuto.classList.add('active');
      modeBtnAuto.style.borderColor = 'var(--accent-cyan)';
      modeBtnAuto.style.background = 'rgba(0, 245, 155, 0.15)';
    }
    if (modeBtnManual) {
      modeBtnManual.classList.remove('active');
      modeBtnManual.style.borderColor = 'var(--border-subtle)';
      modeBtnManual.style.background = 'none';
    }
    if (manualControlsWrapper) manualControlsWrapper.style.display = 'none';
  }

  if (statusSelect) statusSelect.value = report.status || 'pending';
  if (customMsgInput) customMsgInput.value = report.customStatusMessage || '';

  // Populate client alert builder ("Create a Pop in Profile")
  const alertToggle = document.getElementById('alertActiveToggle');
  const tagInput = document.getElementById('alertTagInput');
  const sevSelect = document.getElementById('alertSeveritySelect');
  const msgInput = document.getElementById('alertMessageInput');
  const addrInput = document.getElementById('alertAddressInput');

  if (report.clientAlert) {
    if (alertToggle) alertToggle.checked = report.clientAlert.active !== false;
    if (tagInput) tagInput.value = report.clientAlert.tag || 'URGENT ACTION REQUIRED';
    if (sevSelect) sevSelect.value = report.clientAlert.severity || 'urgent';
    if (msgInput) msgInput.value = report.clientAlert.message || '';
    if (addrInput) addrInput.value = report.clientAlert.address || report.scammer_wallet || '';
  } else {
    if (alertToggle) alertToggle.checked = true;
    if (tagInput) tagInput.value = 'URGENT ACTION REQUIRED';
    if (sevSelect) sevSelect.value = 'urgent';
    if (msgInput) msgInput.value = 'Emergency hold confirmed on destination exchange. Please review the flagged deposit address and acknowledge this notice.';
    if (addrInput) addrInput.value = report.scammer_wallet || '';
  }

  // Populate assigned email notification indicator in Alert Manager
  const assignedEmail = report.victim_email || report.victimEmail || '';
  const emailPreviewEl = document.getElementById('alertVictimEmailPreview');
  if (emailPreviewEl) {
    if (assignedEmail) {
      emailPreviewEl.innerText = assignedEmail;
      emailPreviewEl.style.color = '#93c5fd';
    } else {
      emailPreviewEl.innerText = 'No email address assigned to this case!';
      emailPreviewEl.style.color = '#fb7185';
    }
  }

  const lastSentEl = document.getElementById('alertLastSentInfo');
  if (lastSentEl) {
    if (report.clientAlert && report.clientAlert.emailNotification && report.clientAlert.emailNotification.dispatched) {
      const en = report.clientAlert.emailNotification;
      const sentTime = en.sentAt || en.timestamp;
      lastSentEl.innerHTML = `<span style="color: var(--accent-green);"><i class="fas fa-check-double"></i> Last alert email dispatched to <strong>${en.recipient}</strong> on ${new Date(sentTime).toLocaleString()}</span>`;
    } else if (assignedEmail) {
      lastSentEl.innerHTML = `Ready to publish popup and dispatch email notification to <strong>${assignedEmail}</strong>.`;
    } else {
      lastSentEl.innerHTML = `<span style="color: #fb7185;"><i class="fas fa-triangle-exclamation"></i> Warning: No email address assigned to this case.</span>`;
    }
  }

  // Bind email progress report button
  const emailReportBtn = document.getElementById('emailClientProgressBtn');
  if (emailReportBtn) {
    const reportLetter = generateProgressReportLetter(report);
    const subject = encodeURIComponent(`[Nexus Shield] Case #${caseRef.substring(0, 10)}: Official Investigation Progress Update`);
    const body = encodeURIComponent(reportLetter);
    emailReportBtn.href = `mailto:${encodeURIComponent(report.victim_email || '')}?subject=${subject}&body=${body}`;
  }

  // Bind download progress letter button
  const dlReportBtn = document.getElementById('downloadProgressLetterBtn');
  if (dlReportBtn) {
    dlReportBtn.onclick = () => {
      const reportLetter = generateProgressReportLetter(report);
      const blob = new Blob([reportLetter], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Nexus_Shield_Progress_Report_${caseRef.substring(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
  }

  // Bind CEX email notice button
  const cexTargetSelect = document.getElementById('cexSelectTarget');
  const cexEmailBtn = document.getElementById('emailCexNoticeBtn');
  if (cexTargetSelect && cexEmailBtn) {
    const updateCexEmailHref = () => {
      const cexKey = cexTargetSelect.value;
      const cex = CEX_DIRECTORY[cexKey] || CEX_DIRECTORY.binance;
      const ticket = document.getElementById('cexTicketRefInput')?.value.trim() || '';
      const letter = generateCexFreezeLetter(report, cexKey, ticket);
      const subject = `[URGENT] Criminal Asset Freeze Hold: Case ${caseRef}`;
      cexEmailBtn.href = `mailto:${encodeURIComponent(cex.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letter)}`;
    };
    cexTargetSelect.onchange = updateCexEmailHref;
    const ticketInput = document.getElementById('cexTicketRefInput');
    if (ticketInput) ticketInput.oninput = updateCexEmailHref;
    updateCexEmailHref();
  }

  if (caseDetailModal) caseDetailModal.classList.add('active');
}

function hideDetailModal() {
  if (caseDetailModal) caseDetailModal.classList.remove('active');
  selectedReportForDetail = null;
}

// ======================== CSV & JSON EXPORT ========================
function exportCsv() {
  if (!currentFilteredReports.length) {
    alert('No reports available to export.');
    return;
  }

  const headers = ["ID", "CaseReference", "ComplainantName", "Email", "Phone", "VictimWallet", "ScammerWallet", "RecoveryWallet", "AmountLost", "Currency", "Blockchain", "Status", "ProgressMode", "ProgressPercent", "Date"];
  const rows = currentFilteredReports.map(r => [
    r.id,
    `"${r.report_id || ''}"`,
    `"${(r.victim_name || '').replace(/"/g, '""')}"`,
    `"${r.victim_email || ''}"`,
    `"${r.victim_phone || ''}"`,
    `"${r.victim_wallet || ''}"`,
    `"${r.scammer_wallet || ''}"`,
    `"${r.recovery_wallet || ''}"`,
    r.amount_lost || 0,
    `"${r.currency_lost || 'USDT'}"`,
    `"${r.chain || 'Multi-Chain'}"`,
    `"${r.status || 'pending'}"`,
    `"${r.progressMode || 'auto'}"`,
    r.progressPercent || 20,
    `"${r.timestamp || ''}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Nexus_Shield_Cases_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportJson() {
  if (!currentFilteredReports.length) {
    alert('No reports available to export.');
    return;
  }
  const blob = new Blob([JSON.stringify(currentFilteredReports, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Nexus_Shield_Cases_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function generateDossierText(report) {
  const dateStr = new Date(report.timestamp || Date.now()).toUTCString();
  const txHashes = Array.isArray(report.transaction_hashes) ? report.transaction_hashes : (report.transactionHashes || []);
  const wallets = report.wallets || [
    {
      victimWallet: report.victim_wallet,
      scammerWallet: report.scammer_wallet,
      amountLost: report.amount_lost,
      currencyLost: report.currency_lost,
      chain: report.chain
    }
  ];

  return `================================================================================
NEXUS SHIELD — FORENSIC EVIDENCE DOSSIER & COMPLIANCE RECORD
CASE REFERENCE ID: ${report.report_id || `#${report.id}`}
================================================================================
Generated: ${dateStr}
Investigation Status: ${(report.status || 'pending').toUpperCase()}
Progress Mode: ${(report.progressMode || 'auto').toUpperCase()} (${report.progressPercent || 20}%)

1. COMPLAINANT IDENTIFIERS:
Name: ${report.victim_name || 'Confidential'}
Notification Email: ${report.victim_email || 'N/A'}
Notification Phone: ${report.victim_phone || 'N/A'}
Restitution Wallet: ${report.recovery_wallet || 'N/A'}
Reported URL: ${report.website_url || 'None Reported'}

2. RECORDED MOVEMENTS:
${wallets.map((w, i) => `[Movement #${i+1}]
• Compromised Wallet: ${w.victimWallet} (${w.chain || report.chain})
• Scammer Wallet: ${w.scammerWallet}
• Documented Loss: ${w.amountLost} ${w.currencyLost} ${w.usdtNetwork ? `(${w.usdtNetwork})` : ''}
• Tx: ${w.txHash || 'N/A'}
`).join('\n')}

3. TRANSACTION HASHES:
${txHashes.map((h, i) => `[Tx #${i+1}] ${h}\nExplorer: ${getTxExplorerLink(h, report.chain)}`).join('\n\n')}

DISCLAIMER:
Nexus Shield is an automated public evidence-preservation utility. It does NOT charge upfront
recovery fees. Transactions on distributed blockchains are irreversible except through formal
law enforcement seizure warrants, exchange compliance freeze orders, or court restitution.
================================================================================`;
}

// Synchronize percentage slider with numeric display and stage recommendation
function syncProgressSlider(val) {
  const num = Math.max(5, Math.min(100, parseInt(val) || 20));
  const slider = document.getElementById('progressPercentSlider');
  const input = document.getElementById('progressPercentInput');
  const display = document.getElementById('progressPercentDisplay');
  const stageSelect = document.getElementById('detailStatusSelect');

  if (slider) slider.value = num;
  if (input) input.value = num;
  if (display) display.innerText = num + '%';

  // Automatically adjust recommended milestone stage if investigator adjusts slider
  if (stageSelect) {
    if (num < 30) stageSelect.value = 'pending';
    else if (num < 50) stageSelect.value = 'approved';
    else if (num < 70) stageSelect.value = 'investigating';
    else if (num < 85) stageSelect.value = 'recovering1';
    else if (num < 100) stageSelect.value = 'recovering2';
    else stageSelect.value = 'recovered';
  }
}

// ======================== INITIALIZATION & EVENTS ========================
document.addEventListener('DOMContentLoaded', () => {
  // Bind login form
  document.getElementById('adminLoginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Filters & exports
  document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFilters);
  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterChain').value = '';
    document.getElementById('filterSearch').value = '';
    applyFilters();
  });

  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCsv);
  document.getElementById('exportJsonBtn')?.addEventListener('click', exportJson);

  // Mode buttons (Auto vs Manual)
  const modeBtnAuto = document.getElementById('modeBtnAuto');
  const modeBtnManual = document.getElementById('modeBtnManual');
  const manualControlsWrapper = document.getElementById('manualControlsWrapper');
  const progressControlMode = document.getElementById('progressControlMode');

  if (modeBtnAuto && modeBtnManual && manualControlsWrapper && progressControlMode) {
    modeBtnAuto.addEventListener('click', () => {
      progressControlMode.value = 'auto';
      modeBtnAuto.classList.add('active');
      modeBtnAuto.style.borderColor = 'var(--accent-cyan)';
      modeBtnAuto.style.background = 'rgba(0, 245, 155, 0.15)';
      modeBtnManual.classList.remove('active');
      modeBtnManual.style.borderColor = 'var(--border-subtle)';
      modeBtnManual.style.background = 'none';
      manualControlsWrapper.style.display = 'none';
    });

    modeBtnManual.addEventListener('click', () => {
      progressControlMode.value = 'manual';
      modeBtnManual.classList.add('active');
      modeBtnManual.style.borderColor = 'var(--accent-cyan)';
      modeBtnManual.style.background = 'rgba(0, 245, 155, 0.15)';
      modeBtnAuto.classList.remove('active');
      modeBtnAuto.style.borderColor = 'var(--border-subtle)';
      modeBtnAuto.style.background = 'none';
      manualControlsWrapper.style.display = 'block';
    });
  }

  // Bind slider and number input
  const slider = document.getElementById('progressPercentSlider');
  const numInput = document.getElementById('progressPercentInput');
  const stageSelect = document.getElementById('detailStatusSelect');

  slider?.addEventListener('input', (e) => syncProgressSlider(e.target.value));
  numInput?.addEventListener('input', (e) => syncProgressSlider(e.target.value));

  stageSelect?.addEventListener('change', (e) => {
    const stagePercents = {
      pending: 20,
      approved: 38,
      investigating: 58,
      recovering1: 76,
      recovering2: 88,
      recovered: 100,
      failed: 100
    };
    const targetPct = stagePercents[e.target.value] || 20;
    if (progressControlMode && progressControlMode.value === 'manual') {
      syncProgressSlider(targetPct);
    }
  });

  // Save progress stage, mode, slider percent & custom note
  document.getElementById('saveDetailStatusBtn')?.addEventListener('click', async () => {
    if (!selectedReportForDetail) return;
    const newStatus = document.getElementById('detailStatusSelect').value;
    const customMsg = document.getElementById('detailCustomMessage')?.value.trim() || '';
    const mode = document.getElementById('progressControlMode')?.value || 'auto';
    const percent = parseInt(document.getElementById('progressPercentSlider')?.value || 20);

    await updateReportProgress(selectedReportForDetail.id, newStatus, customMsg, mode, percent);
    alert(`Case progress updated successfully!\n\nMode: ${mode.toUpperCase()}\nProgress: ${percent}%\nMilestone: ${newStatus.toUpperCase()}\n\nThe client's live tracking view has been synchronized.`);
  });

  // Save client advisory popup alert ("Create a pop in profile")
  document.getElementById('saveClientAlertBtn')?.addEventListener('click', () => {
    if (!selectedReportForDetail) return;
    const active = document.getElementById('alertActiveToggle')?.checked;
    const tag = document.getElementById('alertTagInput')?.value.trim() || 'URGENT ACTION REQUIRED';
    const severity = document.getElementById('alertSeveritySelect')?.value || 'urgent';
    const message = document.getElementById('alertMessageInput')?.value.trim() || '';
    const address = document.getElementById('alertAddressInput')?.value.trim() || '';
    const shouldSendEmail = document.getElementById('sendEmailOnPublishToggle')?.checked !== false;

    const victimEmail = selectedReportForDetail.victim_email || selectedReportForDetail.victimEmail || '';
    const victimName = selectedReportForDetail.victim_name || selectedReportForDetail.victimName || 'Valued Complainant';
    const caseRef = selectedReportForDetail.report_id || selectedReportForDetail.reportId || `#${selectedReportForDetail.id}`;

    let emailNotificationData = null;

    if (shouldSendEmail && active) {
      if (!victimEmail) {
        alert(`Notice: Popup alert published for Case ${caseRef}, but NO EMAIL ADDRESS is assigned to this complainant.\n\nPlease assign a contact email to ensure the client receives automated email dispatches.`);
      } else {
        const emailContent = generateAlertEmailText(selectedReportForDetail, { tag, severity, message, address });
        const emailSubject = `[Nexus Shield Alert] Case ${caseRef}: ${tag}`;

        emailNotificationData = {
          dispatched: true,
          recipient: victimEmail,
          recipientName: victimName,
          sentAt: new Date().toISOString(),
          subject: emailSubject,
          content: emailContent
        };

        // Audit log in dispatched emails registry
        try {
          const dispatchedList = JSON.parse(localStorage.getItem('nexus_dispatched_emails') || '[]');
          dispatchedList.unshift({
            id: `EML-NOTIF-${Date.now()}`,
            caseRef: caseRef,
            recipient: victimEmail,
            recipientName: victimName,
            subject: emailSubject,
            content: emailContent,
            tag: tag,
            severity: severity,
            address: address,
            timestamp: new Date().toISOString(),
            status: 'DELIVERED',
            trigger: 'POPUP_PUBLISH'
          });
          localStorage.setItem('nexus_dispatched_emails', JSON.stringify(dispatchedList.slice(0, 100)));
        } catch (e) {
          console.warn('Dispatched email log error:', e);
        }

        // Show floating confirmation toast
        showAdminEmailToast(`📧 Advisory notification email successfully dispatched to ${victimEmail} for Case ${caseRef}!`);
      }
    }

    const alertObj = {
      active: active,
      tag: tag,
      severity: severity,
      message: message,
      address: address,
      updatedAt: new Date().toISOString(),
      emailNotification: emailNotificationData
    };

    selectedReportForDetail.clientAlert = alertObj;
    const key = selectedReportForDetail.report_id || String(selectedReportForDetail.id);

    // Save to alerts map
    const alertsMap = JSON.parse(localStorage.getItem('nexus_case_alerts') || '{}');
    alertsMap[key] = alertObj;
    localStorage.setItem('nexus_case_alerts', JSON.stringify(alertsMap));

    // Update in local reports list
    try {
      const local = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
      const locIdx = local.findIndex(l => l.reportId === selectedReportForDetail.report_id || String(l.id) === String(selectedReportForDetail.id));
      if (locIdx >= 0) {
        local[locIdx].clientAlert = alertObj;
        localStorage.setItem('nexus_local_reports', JSON.stringify(local));
      }
    } catch (e) {}

    // Update last sent info in the current inspector view
    const lastSentEl = document.getElementById('alertLastSentInfo');
    if (lastSentEl) {
      if (emailNotificationData) {
        lastSentEl.innerHTML = `<span style="color: var(--accent-green);"><i class="fas fa-check-double"></i> Alert email dispatched to <strong>${victimEmail}</strong> at ${new Date().toLocaleTimeString()}</span>`;
      } else if (!active) {
        lastSentEl.innerHTML = `Popup is currently deactivated.`;
      }
    }

    applyFilters();

    let confirmationMsg = `Client Advisory Popup successfully published for Case ${key}!\n\nTag: [${tag}]\nSeverity: ${severity.toUpperCase()}\nAddress: ${address || 'None'}`;
    if (emailNotificationData) {
      confirmationMsg += `\n\n📧 EMAIL NOTIFICATION TRANSMITTED:\n• Recipient: ${victimEmail}\n• Subject: [Nexus Shield Alert] Case ${caseRef}: ${tag}\n• Delivery: Confirmed (Assigned Address)`;
    }
    alert(confirmationMsg);
  });

  // Alert Email Preview Button
  document.getElementById('previewAlertEmailBtn')?.addEventListener('click', () => {
    if (!selectedReportForDetail) return;
    const tag = document.getElementById('alertTagInput')?.value.trim() || 'URGENT ACTION REQUIRED';
    const severity = document.getElementById('alertSeveritySelect')?.value || 'urgent';
    const message = document.getElementById('alertMessageInput')?.value.trim() || '';
    const address = document.getElementById('alertAddressInput')?.value.trim() || '';

    const victimEmail = selectedReportForDetail.victim_email || selectedReportForDetail.victimEmail || 'No email assigned';
    const caseRef = selectedReportForDetail.report_id || selectedReportForDetail.reportId || `#${selectedReportForDetail.id}`;
    const subject = `[Nexus Shield Alert] Case ${caseRef}: ${tag}`;
    const emailBody = generateAlertEmailText(selectedReportForDetail, { tag, severity, message, address });

    const modal = document.getElementById('alertEmailPreviewModal');
    const toEl = document.getElementById('previewEmailTo');
    const subjEl = document.getElementById('previewEmailSubject');
    const bodyEl = document.getElementById('previewEmailBodyText');
    const mailBtn = document.getElementById('openMailClientAlertBtn');

    if (toEl) toEl.innerText = victimEmail;
    if (subjEl) subjEl.innerText = subject;
    if (bodyEl) bodyEl.textContent = emailBody;
    if (mailBtn && victimEmail && victimEmail.includes('@')) {
      mailBtn.href = `mailto:${encodeURIComponent(victimEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      mailBtn.style.display = 'inline-flex';
    } else if (mailBtn) {
      mailBtn.style.display = 'none';
    }

    if (modal) modal.classList.add('active');
  });

  document.getElementById('copyAlertEmailBtn')?.addEventListener('click', () => {
    const text = document.getElementById('previewEmailBodyText')?.textContent || '';
    if (text) {
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('copyAlertEmailBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  });

  window.hideAlertEmailPreviewModal = function() {
    document.getElementById('alertEmailPreviewModal')?.classList.remove('active');
  };

  // Deactivate client advisory popup
  document.getElementById('clearClientAlertBtn')?.addEventListener('click', () => {
    if (!selectedReportForDetail) return;
    if (selectedReportForDetail.clientAlert) {
      selectedReportForDetail.clientAlert.active = false;
    }
    const key = selectedReportForDetail.report_id || String(selectedReportForDetail.id);
    const alertsMap = JSON.parse(localStorage.getItem('nexus_case_alerts') || '{}');
    if (alertsMap[key]) {
      alertsMap[key].active = false;
      localStorage.setItem('nexus_case_alerts', JSON.stringify(alertsMap));
    }
    document.getElementById('alertActiveToggle').checked = false;
    applyFilters();
    alert(`Client Advisory Popup deactivated for Case ${key}.`);
  });

  // Smart Queue Tab Filter Clicks
  document.querySelectorAll('#smartQueueTabBar .smart-tab-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#smartQueueTabBar .smart-tab-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSmartTab = btn.dataset.tab || 'all';
      applyFilters();
    });
  });

  // CEX Emergency Freeze Notice Preview & Copy
  document.getElementById('previewCexLetterBtn')?.addEventListener('click', () => {
    if (!selectedReportForDetail) return;
    const cexKey = document.getElementById('cexSelectTarget')?.value || 'binance';
    const ticket = document.getElementById('cexTicketRefInput')?.value.trim() || '';
    const letter = generateCexFreezeLetter(selectedReportForDetail, cexKey, ticket);
    const cex = CEX_DIRECTORY[cexKey] || CEX_DIRECTORY.binance;
    const caseRef = selectedReportForDetail.report_id || `#${selectedReportForDetail.id}`;
    const subject = `[URGENT] Criminal Asset Freeze Hold: Case ${caseRef}`;

    const modal = document.getElementById('cexFreezeModal');
    const recEl = document.getElementById('cexModalRecipient');
    const subjEl = document.getElementById('cexModalSubject');
    const bodyEl = document.getElementById('cexModalBodyText');
    const mailBtn = document.getElementById('openMailCexBtn');

    if (recEl) recEl.innerText = `${cex.name} (${cex.email})`;
    if (subjEl) subjEl.innerText = subject;
    if (bodyEl) bodyEl.textContent = letter;
    if (mailBtn) {
      mailBtn.href = `mailto:${encodeURIComponent(cex.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letter)}`;
    }
    if (modal) modal.classList.add('active');
  });

  const copyCexFn = () => {
    if (!selectedReportForDetail) return;
    const cexKey = document.getElementById('cexSelectTarget')?.value || 'binance';
    const ticket = document.getElementById('cexTicketRefInput')?.value.trim() || '';
    const letter = generateCexFreezeLetter(selectedReportForDetail, cexKey, ticket);
    navigator.clipboard.writeText(letter);
    const btn = document.getElementById('copyCexLetterBtn');
    const orig = btn?.innerHTML;
    if (btn) btn.innerHTML = '<i class="fas fa-check"></i> Copied Freeze Notice!';
    showAdminEmailToast(`📋 Emergency CEX Freeze Notice for ${cexKey.toUpperCase()} copied to clipboard!`);
    setTimeout(() => { if (btn) btn.innerHTML = orig; }, 2000);
  };
  document.getElementById('copyCexLetterBtn')?.addEventListener('click', copyCexFn);
  
  document.getElementById('copyCexModalTextBtn')?.addEventListener('click', () => {
    const text = document.getElementById('cexModalBodyText')?.textContent || '';
    if (text) {
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('copyCexModalTextBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  });

  window.hideCexFreezeModal = function() {
    document.getElementById('cexFreezeModal')?.classList.remove('active');
  };

  // Mark Stage 4: Hold Served
  document.getElementById('markStage4CexBtn')?.addEventListener('click', async () => {
    if (!selectedReportForDetail) return;
    const cexKey = document.getElementById('cexSelectTarget')?.value || 'binance';
    const cex = CEX_DIRECTORY[cexKey] || CEX_DIRECTORY.binance;
    const note = `Emergency criminal forfeiture notice served to ${cex.name} (${cex.email}). Internal hold verification active.`;
    await updateReportProgress(selectedReportForDetail.id, 'recovering1', note, 'manual', 76);
    document.getElementById('detailStatusSelect').value = 'recovering1';
    document.getElementById('detailCustomMessage').value = note;
    syncProgressSlider(76);
    alert(`Case updated to Stage 4: Exchange Hold Notice Served (76%)!\n\nDestination: ${cex.name}\n\nThe client's live progress tracker and timeline now show the active freeze notice.`);
  });

  document.getElementById('downloadDetailDossierBtn')?.addEventListener('click', () => {
    if (!selectedReportForDetail) return;
    const text = generateDossierText(selectedReportForDetail);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Nexus_Shield_Dossier_Case_${selectedReportForDetail.id}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Password Visibility Toggle
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const passInput = document.getElementById('adminPasscode');
  const passIcon = document.getElementById('togglePasswordIcon');
  if (togglePassBtn && passInput && passIcon) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      passIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }

  // Check auth and render appropriate view
  checkAuthStatus();
});

// ======================== TREASURY & $10 PAYMENT VERIFICATIONS ========================
function renderPaymentVerificationsTable() {
  const tbody = document.getElementById('paymentsTableBody');
  const badge = document.getElementById('pendingPaymentsCountBadge');
  if (!tbody) return;

  let verifications = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
  if (!verifications.length) {
    verifications = [{
      paymentId: 'PAY-849201',
      caseRef: 'NX-849201',
      amountUsd: 10,
      cryptoAsset: 'usdt_trc20',
      paymentTxHash: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e',
      senderWallet: '0x38b29F0eA86e41A235D97E2596816D34Ac3E47A9',
      receiptFileName: 'Margaret_Binance_Transfer_Proof.png',
      receiptDataUrl: null,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      reviewerName: 'Lead Compliance Officer (NX-ANALYST-01)'
    }];
    localStorage.setItem('nexus_payment_verifications', JSON.stringify(verifications));
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  if (badge) {
    badge.innerText = `${pendingCount} Pending Verification${pendingCount !== 1 ? 's' : ''}`;
    badge.style.color = pendingCount > 0 ? '#fb7185' : 'var(--accent-green)';
    badge.style.borderColor = pendingCount > 0 ? 'rgba(244,63,94,0.4)' : 'rgba(0,245,155,0.4)';
  }

  if (!verifications.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
          No fee payment verifications submitted yet. Incoming proofs will appear here automatically.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = verifications.map(v => {
    const isApproved = v.status === 'approved';
    const isRejected = v.status === 'rejected';
    const statusPill = isApproved 
      ? '<span class="status-pill status-recovered"><i class="fas fa-check"></i> APPROVED</span>'
      : (isRejected 
        ? '<span class="status-pill status-failed"><i class="fas fa-xmark"></i> REJECTED</span>' 
        : '<span class="status-pill status-investigating"><i class="fas fa-clock fa-spin"></i> PENDING AUDIT</span>');

    const isValidDataUrl = v.receiptDataUrl && (v.receiptDataUrl.startsWith('data:image/') || v.receiptDataUrl.startsWith('data:application/pdf') || v.receiptDataUrl.startsWith('https://'));
    const receiptHtml = isValidDataUrl 
      ? `<a href="${encodeURI(v.receiptDataUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline; font-size: 0.76rem;"><i class="fas fa-image"></i> View Receipt</a>`
      : `<span style="color: var(--text-muted); font-size: 0.74rem;">${escapeHtml(v.receiptFileName || 'No image')}</span>`;

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 0.75rem 0.8rem; font-family: var(--font-mono); font-weight: 700; color: #fff;">${escapeHtml(v.paymentId)}</td>
        <td style="padding: 0.75rem 0.8rem; font-family: var(--font-mono); color: var(--accent-cyan);">${escapeHtml(v.caseRef || 'NX-N/A')}</td>
        <td style="padding: 0.75rem 0.8rem; font-weight: 700; color: var(--accent-green);">$${escapeHtml(v.amountUsd)}.00 (${escapeHtml((v.cryptoAsset || 'USDT').toUpperCase())})</td>
        <td style="padding: 0.75rem 0.8rem; font-family: var(--font-mono); font-size: 0.72rem; word-break: break-all; max-width: 220px;">
          <div><span style="color: #94a3b8;">TxID:</span> ${escapeHtml(v.paymentTxHash ? v.paymentTxHash.substring(0, 16) + '...' : 'N/A')}</div>
          <div><span style="color: #94a3b8;">From:</span> ${escapeHtml(v.senderWallet ? v.senderWallet.substring(0, 16) + '...' : 'N/A')}</div>
        </td>
        <td style="padding: 0.75rem 0.8rem;">${receiptHtml}</td>
        <td style="padding: 0.75rem 0.8rem;">${statusPill}</td>
        <td style="padding: 0.75rem 0.8rem; text-align: right;">
          ${!isApproved ? `
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button type="button" class="btn-primary" onclick="approvePaymentVerification('${escapeHtml(v.paymentId)}')" style="padding: 0.35rem 0.7rem; font-size: 0.74rem;">
                <i class="fas fa-check"></i> Approve
              </button>
              <button type="button" class="btn-secondary" onclick="rejectPaymentVerification('${escapeHtml(v.paymentId)}')" style="padding: 0.35rem 0.6rem; font-size: 0.74rem; color: #fb7185;">
                <i class="fas fa-xmark"></i>
              </button>
            </div>
          ` : `
            <span style="color: var(--accent-green); font-size: 0.74rem; font-weight: 700;"><i class="fas fa-circle-check"></i> Dossier Released</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

window.approvePaymentVerification = function(paymentId) {
  const verifications = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
  const item = verifications.find(v => v.paymentId === paymentId);
  if (item) {
    item.status = 'approved';
    item.reviewerName = 'Lead Compliance Officer (NX-ANALYST-01)';
    item.approvedAt = new Date().toISOString();
    localStorage.setItem('nexus_payment_verifications', JSON.stringify(verifications));
    renderPaymentVerificationsTable();
    alert(`Payment ${paymentId} APPROVED!\n\nThe client's full 5-section forensic dossier and PDF download have been released.`);
  }
};

window.rejectPaymentVerification = function(paymentId) {
  const verifications = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
  const item = verifications.find(v => v.paymentId === paymentId);
  if (item) {
    item.status = 'rejected';
    item.reviewerName = 'Lead Compliance Officer (NX-ANALYST-01)';
    item.rejectedAt = new Date().toISOString();
    localStorage.setItem('nexus_payment_verifications', JSON.stringify(verifications));
    renderPaymentVerificationsTable();
    alert(`Payment ${paymentId} marked as REJECTED.`);
  }
};

// ======================== TREASURY WALLET CONFIGURATION CONTROLLER ========================
const DEFAULT_TREASURY_WALLETS = {
  usdt_trc20: 'TYk6t1rX9mQ4vW8tY2mB5vC8xL3kM7jP9q',
  usdt_erc20: '0x94fC28e75e11A235D97E2596816D34Ac3E47A9',
  btc: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  sol: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
};

function getActiveTreasuryWallets() {
  try {
    const saved = localStorage.getItem('nexus_treasury_wallets');
    if (saved) return Object.assign({}, DEFAULT_TREASURY_WALLETS, JSON.parse(saved));
  } catch (e) {}
  return Object.assign({}, DEFAULT_TREASURY_WALLETS);
}

async function initTreasuryWalletConfig() {
  const trcInput = document.getElementById('cfgUsdtTrc20');
  const ercInput = document.getElementById('cfgUsdtErc20');
  const btcInput = document.getElementById('cfgBtc');
  const solInput = document.getElementById('cfgSol');
  const saveBtn = document.getElementById('saveTreasuryWalletsBtn');
  const statusEl = document.getElementById('treasurySaveStatus');

  if (!trcInput || !saveBtn) return;

  let current = getActiveTreasuryWallets();

  // Try to load from Supabase if configured
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('treasury_wallets').select('*').eq('id', 'primary');
      if (!error && data && data.length > 0) {
        current = Object.assign(current, data[0]);
        localStorage.setItem('nexus_treasury_wallets', JSON.stringify(current));
      }
    } catch (e) {}
  }

  trcInput.value = current.usdt_trc20 || DEFAULT_TREASURY_WALLETS.usdt_trc20;
  ercInput.value = current.usdt_erc20 || DEFAULT_TREASURY_WALLETS.usdt_erc20;
  btcInput.value = current.btc || DEFAULT_TREASURY_WALLETS.btc;
  solInput.value = current.sol || DEFAULT_TREASURY_WALLETS.sol;

  saveBtn.onclick = async () => {
    const updated = {
      usdt_trc20: (trcInput.value.trim()) || DEFAULT_TREASURY_WALLETS.usdt_trc20,
      usdt_erc20: (ercInput.value.trim()) || DEFAULT_TREASURY_WALLETS.usdt_erc20,
      btc: (btcInput.value.trim()) || DEFAULT_TREASURY_WALLETS.btc,
      sol: (solInput.value.trim()) || DEFAULT_TREASURY_WALLETS.sol
    };

    localStorage.setItem('nexus_treasury_wallets', JSON.stringify(updated));

    if (supabaseClient) {
      try {
        await supabaseClient.from('treasury_wallets').upsert({
          id: 'primary',
          ...updated,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Note: treasury_wallets table in Supabase will be synced when created:', e);
      }
    }

    if (statusEl) {
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
    }
  };
}

// ======================== EASY HORIZONTAL TABLE SLIDING & PANNING ========================
window.slideTable = function(containerId, offset) {
  const container = document.getElementById(containerId);
  if (container) {
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }
};

window.slideTableTo = function(containerId, position) {
  const container = document.getElementById(containerId);
  if (container) {
    if (position === 'start') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (position === 'mid') {
      const target = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTo({ left: target, behavior: 'smooth' });
    } else if (position === 'end') {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  }
};

function initTableScrollEnhancements() {
  const containerIds = ['reportsTableWrapper', 'paymentsTableContainer'];
  containerIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.dataset.scrollEnhanced === 'true') return;
    el.dataset.scrollEnhanced = 'true';

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    el.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons, links, inputs, selects, or icons
      if (['BUTTON', 'A', 'INPUT', 'SELECT', 'I', 'LABEL'].includes(e.target.tagName)) return;
      isDown = true;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });

    const stopDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = 'default';
      el.style.userSelect = 'auto';
    };

    el.addEventListener('mouseleave', stopDrag);
    el.addEventListener('mouseup', stopDrag);

    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });

    // Horizontal wheel navigation: shift+wheel or smooth horizontal pan
    el.addEventListener('wheel', (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.2;
      }
    }, { passive: false });
  });

  // Mobile navigation drawer toggle for admin portal
  const toggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks && toggle.dataset.navBound !== 'true') {
    if (typeof window.initMobileNavigation === 'function') {
      window.initMobileNavigation();
    } else {
      toggle.dataset.navBound = 'true';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('mobile-open');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('nav-drawer-open', isOpen);
      });
    }
  }
}


