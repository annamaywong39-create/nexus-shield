// ======================== SUPABASE SETUP ========================
const SUPABASE_URL = 'https://bxelezmomnruiurtiptg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWxlem1vbW5ydWl1cnRpcHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzg1NjksImV4cCI6MjA5MTY1NDU2OX0.N_QqBk9GVAWqMAyj9zzpopY2pqkzpk6P1w45giZZGNo';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
} else {
    console.error('Supabase library not loaded.');
}

// ======================== PAYMENT ADDRESSES ========================
const PAYMENT_ADDRESSES = {
  "Bitcoin": "bc1q2utac4hp5ya3sxxua9agtcwdktawmhsjygzffs",
  "Ethereum": "0x3AF5288E633E42ee14F710cd7C7Df363B6C1b281",
  "BNB Chain": "0x3AF5288E633E42ee14F710cd7C7Df363B6C1b281",
  "Solana": "8qqT9zdS8vvbhzXmY3fr1MwezRaWEKtTMccUWsnuFTjU",
  "Litecoin": "ltc1qvcrhuhahgk6hhkqyxeekva6fp68vcpndx28saw",
  "Dogecoin": "DCyUadcXhDshgMaANDDCoVV6mJtzM1Tdvr",
  "Cardano": "addr1q8n0n6t9hx5pz24tgjs2msw5scmz9gmyw9fgymly7ewp6grdvcgxks3dum0edweda4tpwhrlvus5c824dcqdnj44txwql8mtg0",
  "USDT_TRC20": "TSZXRfXdh1QH4JnjcrEQUMvjkkNjghd3s3",
  "USDT_ERC20": "0x3AF5288E633E42ee14F710cd7C7Df363B6C1b281",
  "USDT_BEP20": "0x3AF5288E633E42ee14F710cd7C7Df363B6C1b281",
  "USDT_SPL": "8qqT9zdS8vvbhzXmY3fr1MwezRaWEKtTMccUWsnuFTjU",
  "default": "0x3AF5288E633E42ee14F710cd7C7Df363B6C1b281"
};

let lastSubmissionTime = 0;
let pendingSubmission = null;

function getPaymentAddress(token, network, chainDetected) {
  if (token === "USDT") {
    switch (network) {
      case "tron": return PAYMENT_ADDRESSES["USDT_TRC20"];
      case "ethereum": return PAYMENT_ADDRESSES["USDT_ERC20"];
      case "bnb": return PAYMENT_ADDRESSES["USDT_BEP20"];
      case "solana": return PAYMENT_ADDRESSES["USDT_SPL"];
      default: return PAYMENT_ADDRESSES["default"];
    }
  } else {
    return PAYMENT_ADDRESSES[chainDetected] || PAYMENT_ADDRESSES["default"];
  }
}

function validateUSDTNetworkAddress(address, network) {
  if (!address) return false;
  switch (network) {
    case "tron": return /^T[A-Za-z0-9]{33}$/.test(address);
    case "ethereum": return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "bnb": return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "solana": return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default: return true;
  }
}

// ======================== PRICE HELPERS ========================
let priceCache = {};
let lastPriceFetch = 0;

async function getPriceUSD(coinSymbol) {
  if (coinSymbol === "USD") return 1;
  const symbolToId = {
    BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
    DOGE: "dogecoin", ADA: "cardano", MATIC: "matic-network", XRP: "ripple",
    AVAX: "avalanche-2", DOT: "polkadot", USDT: "tether", LTC: "litecoin",
    LINK: "chainlink", UNI: "uniswap", ATOM: "cosmos", FIL: "filecoin",
    NEAR: "near", ALGO: "algorand", VET: "vechain", ICP: "internet-computer",
    ETC: "ethereum-classic", XLM: "stellar", BCH: "bitcoin-cash", EOS: "eos",
    XTZ: "tezos", THETA: "theta", FTM: "fantom", SAND: "sandbox", MANA: "decentraland"
  };
  const id = symbolToId[coinSymbol];
  if (!id) return 0;
  const now = Date.now();
  if (priceCache[coinSymbol] && now - lastPriceFetch < 60000) return priceCache[coinSymbol];
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    const data = await response.json();
    const price = data[id]?.usd || 0;
    priceCache[coinSymbol] = price;
    lastPriceFetch = now;
    return price;
  } catch (error) { return 0; }
}

async function convertToUSD(amount, currency) {
  const price = await getPriceUSD(currency);
  return amount * price;
}

// ======================== SUPABASE STORAGE ========================
async function storeReport(reportData) {
  if (!supabaseClient) throw new Error('Supabase not initialized');
  const { error } = await supabaseClient
    .from('reports')
    .insert([{
      victim_name: reportData.victimName,
      victim_wallet: reportData.victimWallet,
      scammer_wallet: reportData.scammerWallet,
      recovery_wallet: reportData.recoveryWallet,
      amount_lost: reportData.amountLost,
      currency_lost: reportData.currencyLost,
      transaction_hashes: reportData.transactionHashes,
      website_url: reportData.websiteUrl,
      chain: reportData.chain,
      chain_type: reportData.chainType,
      usdt_network: reportData.usdtNetwork || null,
      status: 'pending'
    }]);
  if (error) throw new Error(error.message);
}

async function checkScammerWalletExists(scammerAddress) {
  if (!supabaseClient) return false;
  const { data, error } = await supabaseClient
    .from('reports')
    .select('id')
    .eq('scammer_wallet', scammerAddress)
    .limit(1);
  if (error) return false;
  return data.length > 0;
}

async function getTotalReportCount() {
  if (!supabaseClient) return 0;
  const { count, error } = await supabaseClient
    .from('reports')
    .select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count;
}

// ======================== CHAIN DETECTION ========================
function detectChainFromAddress(address) {
  if (!address) return { chain: "unknown", nativeCoin: "Unknown", type: "unknown" };
  if (/^(1|3)[A-Za-z0-9]{25,33}$/.test(address)) return { chain: "Bitcoin", nativeCoin: "BTC", type: "bitcoin" };
  if (/^bc1[A-Za-z0-9]{39,59}$/.test(address)) return { chain: "Bitcoin", nativeCoin: "BTC", type: "bitcoin" };
  if (/^[LM][A-Za-z0-9]{26,33}$/.test(address)) return { chain: "Litecoin", nativeCoin: "LTC", type: "litecoin" };
  if (/^D[A-Za-z0-9]{33}$/.test(address)) return { chain: "Dogecoin", nativeCoin: "DOGE", type: "dogecoin" };
  if (/^addr1[A-Za-z0-9]{38,100}$/.test(address)) return { chain: "Cardano", nativeCoin: "ADA", type: "cardano" };
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return { chain: "Solana", nativeCoin: "SOL", type: "solana" };
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return { chain: "Ethereum (or BSC)", nativeCoin: "ETH/BNB", type: "evm" };
  return { chain: "Unknown", nativeCoin: "Unknown", type: "unknown" };
}

// ======================== LIVE CRYPTO TICKER ========================
let tickerItems = [];
async function fetchCryptoPrices() {
  const ids = ["bitcoin","ethereum","binancecoin","solana","dogecoin","cardano","matic-network","ripple","avalanche-2","polkadot"];
  const coinKeys = ["btc","eth","bnb","sol","doge","ada","matic","xrp","avax","dot"];
  const displayNames = { btc:"BTC", eth:"ETH", bnb:"BNB", sol:"SOL", doge:"DOGE", ada:"ADA", matic:"MATIC", xrp:"XRP", avax:"AVAX", dot:"DOT" };
  const icons = { btc:"fab fa-bitcoin", eth:"fab fa-ethereum", bnb:"fas fa-coins", sol:"fas fa-sun", doge:"fas fa-dog", ada:"fas fa-chart-line", matic:"fas fa-cube", xrp:"fas fa-chart-simple", avax:"fas fa-mountain", dot:"fas fa-link" };
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    coinKeys.forEach((key, idx) => {
      let price = "--";
      if (key === "btc") price = data.bitcoin?.usd?.toLocaleString() || "--";
      else if (key === "eth") price = data.ethereum?.usd?.toLocaleString() || "--";
      else if (key === "bnb") price = data.binancecoin?.usd?.toLocaleString() || "--";
      else if (key === "sol") price = data.solana?.usd?.toLocaleString() || "--";
      else if (key === "doge") price = data.dogecoin?.usd?.toLocaleString() || "--";
      else if (key === "ada") price = data.cardano?.usd?.toLocaleString() || "--";
      else if (key === "matic") price = data["matic-network"]?.usd?.toLocaleString() || "--";
      else if (key === "xrp") price = data.ripple?.usd?.toLocaleString() || "--";
      else if (key === "avax") price = data["avalanche-2"]?.usd?.toLocaleString() || "--";
      else if (key === "dot") price = data.polkadot?.usd?.toLocaleString() || "--";
      if (tickerItems[idx]) tickerItems[idx].innerHTML = `<i class="${icons[key]}"></i> ${displayNames[key]}: $${price}`;
    });
  } catch (error) {
    const fallback = { btc:"63,000", eth:"3,100", bnb:"580", sol:"150", doge:"0.12", ada:"0.45", matic:"0.85", xrp:"0.55", avax:"35", dot:"7.50" };
    coinKeys.forEach((key, idx) => { if (tickerItems[idx]) tickerItems[idx].innerHTML = `<i class="${icons[key]}"></i> ${displayNames[key]}: $${fallback[key]}`; });
  }
}
function initTicker() {
  const tickerDiv = document.getElementById("cryptoTicker");
  if (!tickerDiv) return;
  const coinKeys = ["btc","eth","bnb","sol","doge","ada","matic","xrp","avax","dot"];
  const displayNames = { btc:"BTC", eth:"ETH", bnb:"BNB", sol:"SOL", doge:"DOGE", ada:"ADA", matic:"MATIC", xrp:"XRP", avax:"AVAX", dot:"DOT" };
  const icons = { btc:"fab fa-bitcoin", eth:"fab fa-ethereum", bnb:"fas fa-coins", sol:"fas fa-sun", doge:"fas fa-dog", ada:"fas fa-chart-line", matic:"fas fa-cube", xrp:"fas fa-chart-simple", avax:"fas fa-mountain", dot:"fas fa-link" };
  tickerDiv.innerHTML = "";
  tickerItems = [];
  coinKeys.forEach(key => {
    const span = document.createElement("span");
    span.className = "ticker-item";
    span.innerHTML = `<i class="${icons[key]}"></i> ${displayNames[key]}: $--`;
    tickerDiv.appendChild(span);
    tickerItems.push(span);
  });
  fetchCryptoPrices();
  setInterval(fetchCryptoPrices, 30000);
}

// ======================== VALIDATION ========================
function isValidCryptoAddress(address) {
  if (!address || address.length < 10) return false;
  return detectChainFromAddress(address).type !== "unknown";
}
function isValidTxHash(hash) {
  if (/^0x[a-fA-F0-9]{64}$/.test(hash)) return true;
  if (/^[A-Fa-f0-9]{64}$/.test(hash)) return true;
  if (/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(hash)) return true;
  return false;
}
function isValidUrl(url) {
  if (!url) return true;
  if (!url.match(/^https?:\/\//)) return false;
  try { new URL(url); return true; } catch(e) { return false; }
}

// ======================== MODAL HANDLERS ========================
let pendingCallback = null;
const modalContract = document.getElementById("modalContract");
const modalPayment = document.getElementById("modalPayment");
const warningConfirmModal = document.getElementById("warningConfirmModal");

function showContractModal(callback, chainInfo) {
  const chainText = document.getElementById("modalChainText");
  if (chainText) chainText.innerHTML = t('modal_contract_text', chainInfo.chain);
  pendingCallback = callback;
  modalContract.classList.add("active");
}
function hideContractModal() { modalContract.classList.remove("active"); }

async function showPaymentModal(chainInfo, amountLost, currencyLost, usdtNetwork) {
  let networkName = chainInfo.chain;
  let paymentAddr;
  if (currencyLost === "USDT" && usdtNetwork) {
    paymentAddr = getPaymentAddress("USDT", usdtNetwork, networkName);
    const networkDisplay = {
      tron: "Tron (TRC-20)",
      ethereum: "Ethereum (ERC-20)",
      bnb: "BNB Chain (BEP-20)",
      solana: "Solana (SPL)"
    };
    networkName = networkDisplay[usdtNetwork] || "USDT on " + usdtNetwork;
  } else {
    paymentAddr = getPaymentAddress(currencyLost, null, networkName);
  }
  if (!paymentAddr || paymentAddr.includes("Placeholder") || paymentAddr === PAYMENT_ADDRESSES["default"]) {
    const errorMsg = `❌ No payment address configured for ${networkName}. Please contact support.`;
    document.getElementById("paymentChainText").innerHTML = errorMsg;
    document.getElementById("paymentAddress").innerText = "Address missing";
    modalPayment.classList.add("active");
    return;
  }
  const nativeCoin = (currencyLost === "USDT") ? "USDT" : (chainInfo.nativeCoin === "ETH/BNB" ? "BNB" : chainInfo.nativeCoin);
  let amountUSD = await convertToUSD(amountLost, currencyLost);
  if (amountUSD === 0 && currencyLost !== "USD") amountUSD = amountLost;
  let percentage = 0, warningMsg = "";
  if (amountUSD <= 100) { percentage = 8; warningMsg = t('modal_fee_warning'); }
  else if (amountUSD <= 300) percentage = 15;
  else if (amountUSD <= 800) percentage = 25;
  else percentage = 48.9;
  const feeUSD = amountUSD * (percentage / 100);
  let nativePriceUSD = await getPriceUSD(nativeCoin);
  let feeNative = 0;
  if (nativePriceUSD > 0 && feeUSD > 0) feeNative = feeUSD / nativePriceUSD;
  else feeNative = feeUSD / 100;
  if (isNaN(feeNative) || !isFinite(feeNative)) feeNative = 0;
  const paymentText = document.getElementById("paymentChainText");
  if (paymentText) paymentText.innerHTML = t('modal_fee_text', networkName, percentage, feeNative, nativeCoin, feeUSD);
  const warningDiv = document.getElementById("paymentWarning");
  if (warningDiv) { warningDiv.innerHTML = warningMsg; warningDiv.style.display = warningMsg ? "block" : "none"; }
  const addrDiv = document.getElementById("paymentAddress");
  if (addrDiv) addrDiv.innerText = paymentAddr;
  modalPayment.classList.add("active");
}
function hidePaymentModal() { modalPayment.classList.remove("active"); }

// ======================== WARNING CONFIRMATION ========================
function showWarningConfirmation(callback) {
  pendingSubmission = callback;
  if (warningConfirmModal) warningConfirmModal.classList.add("active");
}
function hideWarningConfirmation() {
  if (warningConfirmModal) warningConfirmModal.classList.remove("active");
  pendingSubmission = null;
}

// ======================== PROGRESS POPUP ========================
const progressModal = document.getElementById('progressModal');
const progressBarFill = document.getElementById('progressBarFill');
const popupStatus = document.getElementById('popupStatus');
const popupAmount = document.getElementById('popupAmount');
const popupDate = document.getElementById('popupDate');
const popupChain = document.getElementById('popupChain');
const progressMessage = document.getElementById('progressMessage');

function showProgressModal() { progressModal.classList.add('active'); }
function hideProgressModal() { progressModal.classList.remove('active'); }

function updateProgressBar(status) {
  let percent = 0, color = 'red', message = '';
  switch (status) {
    case 'pending':
      percent = 20;
      color = '#ffaa00'; // orange
      message = t('progress_pending_msg') || 'Report received, waiting for review.';
      break;
    case 'approved':
      percent = 30;
      color = '#ffcc00'; // yellow
      message = t('progress_approved_msg') || 'Case approved, recovery team assigned.';
      break;
    case 'investigating':
      percent = 48;
      color = '#ff6600'; // orange-red
      message = t('progress_investigating_msg') || 'Tracing funds, contacting exchanges.';
      break;
    case 'recovering1':
      percent = 55;
      color = '#88cc44'; // yellow-green
      message = t('progress_recovering1_msg') || 'Attempting to recover funds.';
      break;
    case 'recovering2':
      percent = 75;
      color = '#44cc44'; // green with slight yellow
      message = t('progress_recovering2_msg') || 'Recovery in progress, waiting for confirmation.';
      break;
    case 'recovered':
      percent = 100;
      color = '#44ff44'; // bright green
      message = t('progress_recovered_msg') || 'Funds successfully recovered!';
      break;
    case 'failed':
      percent = 100;
      color = '#ff4444'; // red
      message = t('progress_failed_msg') || 'Recovery failed. Contact support.';
      break;
    default:
      percent = 0;
      color = '#888';
      message = 'Unknown status.';
  }
  progressBarFill.style.width = percent + '%';
  progressBarFill.style.backgroundColor = color;
  progressMessage.innerText = message;
}

async function checkReportStatus() {
  const reportId = document.getElementById('statusReportId').value.trim();
  if (!reportId) { setFormError(t('error_enter_report_id') || '❌ Please enter a Report ID.'); return; }
  if (!supabaseClient) { setFormError('Supabase not initialized. Please refresh the page.'); return; }
  const { data, error } = await supabaseClient.from('reports').select('status, amount_lost, currency_lost, timestamp, chain').eq('report_id', reportId).single();
  if (error || !data) { setFormError(t('status_not_found')); return; }
  
  let statusText = '';
  switch (data.status) {
    case 'pending': statusText = t('status_pending'); break;
    case 'approved': statusText = t('status_approved'); break;
    case 'investigating': statusText = t('status_investigating'); break;
    case 'recovering1': statusText = t('status_recovering1'); break;
    case 'recovering2': statusText = t('status_recovering2'); break;
    case 'recovered': statusText = t('status_recovered'); break;
    case 'failed': statusText = t('status_failed'); break;
    default: statusText = data.status;
  }
  popupStatus.innerText = statusText;
  popupAmount.innerText = `${data.amount_lost} ${data.currency_lost}`;
  popupDate.innerText = new Date(data.timestamp).toLocaleDateString();
  popupChain.innerText = data.chain;
  updateProgressBar(data.status);
  showProgressModal();
}

// ======================== VALIDATION + SUBMISSION ========================
async function onScanAndRecover() {
  const victimName = document.getElementById("victimName").value.trim();
  const victimWallet = document.getElementById("victimWallet").value.trim();
  const scammerWallet = document.getElementById("scammerWallet").value.trim();
  const recoveryWallet = document.getElementById("recoveryWallet").value.trim();
  const amountLost = parseFloat(document.getElementById("amountLost").value.trim());
  const currencyLost = document.getElementById("currencyLost").value;
  const websiteUrl = document.getElementById("websiteUrl").value.trim();
  const txHashes = getTransactionHashes();
  const warningDiv = document.getElementById("warningMsg");
  warningDiv.style.display = "none";
  warningDiv.innerHTML = "";

  let usdtNetwork = null;
  const usdtGroup = document.getElementById("usdtNetworkGroup");
  const usdtSelect = document.getElementById("usdtNetwork");
  if (currencyLost === "USDT") {
    usdtGroup.style.display = "block";
    usdtNetwork = usdtSelect.value;
    if (!validateUSDTNetworkAddress(victimWallet, usdtNetwork)) {
      const networkText = usdtSelect.options[usdtSelect.selectedIndex].text;
      setFormError(t('error_usdt_network_mismatch', networkText));
      return;
    }
  } else {
    usdtGroup.style.display = "none";
  }

  if (!victimName) { setFormError(t('error_victim_name')); return; }
  if (!victimWallet || !scammerWallet || !recoveryWallet || isNaN(amountLost) || txHashes.length === 0) { setFormError(t('error_all_fields')); return; }
  if (!isValidCryptoAddress(victimWallet)) { setFormError(t('error_invalid_victim')); return; }
  if (!isValidCryptoAddress(scammerWallet)) { setFormError(t('error_invalid_scammer')); return; }
  if (!isValidCryptoAddress(recoveryWallet)) { setFormError(t('error_invalid_recovery')); return; }
  if (recoveryWallet === victimWallet) { setFormError(t('error_recovery_eq_victim')); return; }
  if (recoveryWallet === scammerWallet) { setFormError(t('error_recovery_eq_scammer')); return; }
  if (amountLost <= 0) { setFormError(t('error_positive_amount')); return; }
  if (amountLost > 10000000) { setFormError(t('error_amount_unrealistic')); return; }
  for (let hash of txHashes) if (!isValidTxHash(hash)) { setFormError(t('error_invalid_txhash', hash)); return; }
  if (websiteUrl && !isValidUrl(websiteUrl)) { setFormError(t('error_invalid_url')); return; }

  const alreadyReported = await checkScammerWalletExists(scammerWallet);
  if (alreadyReported) { warningDiv.style.display = "block"; warningDiv.innerHTML = t('warning_scammer_exists'); }

  let chainInfo = detectChainFromAddress(victimWallet);
  if (chainInfo.type === "evm" && currencyLost !== "USDT") {
    const overrideSelect = document.getElementById("chainOverride");
    if (overrideSelect && overrideSelect.style.display !== "none") {
      const selected = overrideSelect.value;
      if (selected === "ethereum") chainInfo = { chain: "Ethereum", nativeCoin: "ETH", type: "evm" };
      else if (selected === "bnb") chainInfo = { chain: "BNB Chain", nativeCoin: "BNB", type: "evm" };
    }
  } else if (currencyLost === "USDT" && usdtNetwork) {
    const networkMap = {
      tron: { chain: "Tron (TRC-20)", nativeCoin: "TRX", type: "tron" },
      ethereum: { chain: "Ethereum (ERC-20)", nativeCoin: "ETH", type: "evm" },
      bnb: { chain: "BNB Chain (BEP-20)", nativeCoin: "BNB", type: "evm" },
      solana: { chain: "Solana (SPL)", nativeCoin: "SOL", type: "solana" }
    };
    chainInfo = networkMap[usdtNetwork] || chainInfo;
  }

  const reportObject = { 
    victimName,
    victimWallet, scammerWallet, recoveryWallet, amountLost, currencyLost, 
    transactionHashes: txHashes, websiteUrl: websiteUrl || null, 
    chain: chainInfo.chain, chainType: chainInfo.type,
    usdtNetwork: usdtNetwork,
    reportId: crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random()
  };

  showWarningConfirmation(async () => {
    const btn = document.getElementById("scanRecoverBtn");
    const originalText = btn.innerHTML;
    const now = Date.now();
    if (lastSubmissionTime && (now - lastSubmissionTime) < 60000) {
      setFormError(t('error_rate_limit'));
      return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Processing...';
    try {
      await storeReport(reportObject);
      lastSubmissionTime = Date.now();
      setFormError(t('success_report_saved', reportObject.reportId));
      showContractModal(() => showPaymentModal(chainInfo, amountLost, currencyLost, usdtNetwork), chainInfo);
    } catch (err) { 
      console.error(err); 
      setFormError(t('error_database')); 
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

function getTransactionHashes() { return Array.from(document.querySelectorAll("#hashFieldsContainer .txHashInput")).map(inp => inp.value.trim()).filter(v => v); }
function setFormError(msg) { const errDiv = document.getElementById("formError"); errDiv.innerText = msg; setTimeout(() => { if(errDiv) errDiv.innerText = ""; }, 4000); }

// ======================== DYNAMIC HASH ROWS ========================
function addHashRow() {
  const container = document.getElementById("hashFieldsContainer");
  const newRow = document.createElement("div");
  newRow.className = "hash-row";
  newRow.innerHTML = `<input type="text" class="txHashInput" placeholder="Transaction hash (e.g., 0x... or 64 hex)"><button type="button" class="remove-hash"><i class="fas fa-trash-alt"></i></button>`;
  container.appendChild(newRow);
  attachRemoveHandler(newRow.querySelector(".remove-hash"));
}
function attachRemoveHandler(btn) {
  if (!btn) return;
  const container = document.getElementById("hashFieldsContainer");
  btn.removeEventListener("click", btn._handler);
  const handler = () => { if (container.children.length === 1) setFormError(t('error_all_fields')); else btn.closest(".hash-row").remove(); };
  btn.addEventListener("click", handler);
  btn._handler = handler;
}
function attachAllRemoveHandlers() { document.querySelectorAll("#hashFieldsContainer .remove-hash").forEach(btn => attachRemoveHandler(btn)); }

// ======================== CHAIN DETECTION UI & USDT NETWORK TOGGLE ========================
function setupChainDetection() {
  const victimInput = document.getElementById("victimWallet");
  const chainDisplay = document.getElementById("chainDisplay");
  const overrideSelect = document.getElementById("chainOverride");
  const currencySelect = document.getElementById("currencyLost");
  const usdtGroup = document.getElementById("usdtNetworkGroup");
  if (!victimInput) return;
  victimInput.addEventListener("input", () => {
    const addr = victimInput.value.trim();
    if (!addr) { chainDisplay.innerText = ""; overrideSelect.style.display = "none"; return; }
    const info = detectChainFromAddress(addr);
    if (info.type === "evm") { chainDisplay.innerText = `Detected: ${info.chain} – please select specific chain:`; overrideSelect.style.display = "block"; }
    else { chainDisplay.innerText = `Detected: ${info.chain} (${info.nativeCoin})`; overrideSelect.style.display = "none"; }
  });
  currencySelect.addEventListener("change", () => {
    if (currencySelect.value === "USDT") usdtGroup.style.display = "block";
    else usdtGroup.style.display = "none";
  });
}

// ======================== BACKGROUND CANVAS ========================
function initBackgroundCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height, nodes = [];
  const NODE_COUNT = 60, CONN_DIST = 200;
  function resizeCanvas() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; initNodes(); }
  function initNodes() { nodes = []; for (let i=0; i<NODE_COUNT; i++) nodes.push({ x: Math.random()*width, y: Math.random()*height, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, radius: 3+Math.random()*5, color: `hsl(${Math.random()*60+180},100%,60%)` }); }
  function updateNodes() { for (let n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x<0||n.x>width) n.vx*=-1; if (n.y<0||n.y>height) n.vy*=-1; n.x = Math.min(Math.max(n.x,0),width); n.y = Math.min(Math.max(n.y,0),height); } }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    ctx.lineWidth = 1.2;
    for (let i=0; i<nodes.length; i++) for (let j=i+1; j<nodes.length; j++) { let dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dist = Math.hypot(dx,dy); if (dist<CONN_DIST) { ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.strokeStyle = `rgba(0,200,255,${(1-dist/CONN_DIST)*0.3})`; ctx.stroke(); } }
    for (let n of nodes) { ctx.beginPath(); ctx.arc(n.x,n.y,n.radius,0,Math.PI*2); let grad = ctx.createRadialGradient(n.x-n.radius*0.3,n.y-n.radius*0.3,2,n.x,n.y,n.radius); grad.addColorStop(0,'#ffffaa'); grad.addColorStop(1,n.color); ctx.fillStyle = grad; ctx.fill(); ctx.shadowBlur = 6; ctx.shadowColor = "cyan"; ctx.fill(); ctx.shadowBlur = 0; }
    updateNodes();
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  draw();
}

// ======================== MODAL EVENT BINDINGS ========================
function bindModalEvents() {
  document.getElementById("modalYesBtn")?.addEventListener("click", () => { hideContractModal(); if (pendingCallback) { pendingCallback(); pendingCallback = null; } });
  document.getElementById("modalNoBtn")?.addEventListener("click", () => { hideContractModal(); pendingCallback = null; });
  document.getElementById("paymentCloseBtn")?.addEventListener("click", hidePaymentModal);
  modalContract?.addEventListener("click", (e) => { if (e.target === modalContract) { hideContractModal(); pendingCallback = null; } });
  modalPayment?.addEventListener("click", (e) => { if (e.target === modalPayment) hidePaymentModal(); });
  document.getElementById("warningCancelBtn")?.addEventListener("click", () => { hideWarningConfirmation(); });
  document.getElementById("warningContinueBtn")?.addEventListener("click", async () => {
    hideWarningConfirmation();
    if (pendingSubmission) {
      await pendingSubmission();
      pendingSubmission = null;
    }
  });
  document.getElementById('closeProgressBtn')?.addEventListener('click', hideProgressModal);
  if (progressModal) progressModal.addEventListener('click', (e) => { if (e.target === progressModal) hideProgressModal(); });
  document.getElementById('checkStatusBtn')?.addEventListener('click', checkReportStatus);
}

// ======================== INITIALIZATION ========================
document.addEventListener("DOMContentLoaded", async () => {
  initTicker();
  initBackgroundCanvas();
  setupChainDetection();
  bindModalEvents();
  document.getElementById("addHashBtn")?.addEventListener("click", addHashRow);
  document.getElementById("scanRecoverBtn")?.addEventListener("click", onScanAndRecover);
  attachAllRemoveHandlers();
  const container = document.getElementById("hashFieldsContainer");
  if (container) {
    const observer = new MutationObserver(() => attachAllRemoveHandlers());
    observer.observe(container, { childList: true, subtree: true });
  }
  const count = await getTotalReportCount();
  const countSpan = document.getElementById("reportCount");
  if (countSpan) countSpan.innerText = count;
});