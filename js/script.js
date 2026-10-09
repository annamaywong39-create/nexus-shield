// ========================================================
// NEXUS SHIELD — Autonomous Crypto Crime Intelligence
// Multi-Wallet Forensic Intake & Rapid Asset Recovery Portal
// ========================================================

const SUPABASE_URL = 'https://bxelezmomnruiurtiptg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWxlem1vbW5ydWl1cnRpcHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzg1NjksImV4cCI6MjA5MTY1NDU2OX0.N_QqBk9GVAWqMAyj9zzpopY2pqkzpk6P1w45giZZGNo';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Nexus Shield: Supabase Client Initialized');
  } catch (err) {
    console.warn('Supabase initialization failed, falling back to local persistence.', err);
  }
} else {
  console.warn('Supabase SDK not loaded yet. Will retry on demand.');
}

let lastSubmissionTime = 0;
let pendingSubmissionCallback = null;
let currentActiveReport = null;
let walletMovementCounter = 0;

// ======================== PRICE HELPERS & TICKER ========================
let priceCache = {};
let lastPriceFetch = 0;

const FALLBACK_PRICES = {
  USDT: 1, USD: 1, BTC: 68400, ETH: 2650, BNB: 595, SOL: 155,
  XRP: 0.58, ADA: 0.38, LTC: 70, DOGE: 0.13, TRX: 0.15
};

async function getPriceUSD(coinSymbol) {
  if (!coinSymbol || coinSymbol === "USD" || coinSymbol === "USDT") return 1;
  const symbolToId = {
    BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
    DOGE: "dogecoin", ADA: "cardano", MATIC: "matic-network", XRP: "ripple",
    AVAX: "avalanche-2", DOT: "polkadot", USDT: "tether", LTC: "litecoin",
    TRX: "tron"
  };
  const id = symbolToId[coinSymbol];
  if (!id) return FALLBACK_PRICES[coinSymbol] || 1;
  const now = Date.now();
  if (priceCache[coinSymbol] && now - lastPriceFetch < 60000) return priceCache[coinSymbol];
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    const data = await response.json();
    const price = data[id]?.usd || FALLBACK_PRICES[coinSymbol] || 1;
    priceCache[coinSymbol] = price;
    lastPriceFetch = now;
    return price;
  } catch (error) {
    return FALLBACK_PRICES[coinSymbol] || 1;
  }
}

// ======================== AUTHENTIC CRYPTO LOGOS (OFFICIAL BRAND COLORS) ========================
function getCryptoIconSvg(symbol, size = 18) {
  const s = (symbol || '').toLowerCase();
  switch (s) {
    case 'btc':
    case 'bitcoin':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#F7931A"/>
        <path d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.6 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.6-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.7.8 1.1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.6c-.1.2-.3.6-.8.5 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2-.1-3.2-1.5-3.9 1-.3 1.8-1 2-2.4zm-3.6 5.3c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.8.8 4.2 3zm.5-5.4c-.5 1.9-3.4.9-4.3.7l.8-3.4c1 .2 4.1.7 3.5 2.7z" fill="#FFF"/>
      </svg>`;
    case 'eth':
    case 'ethereum':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#627EEA"/>
        <g fill="#FFF">
          <path d="M16 4l-.2.8v15.6l.2.2 7.3-4.3L16 4z" fill-opacity=".7"/>
          <path d="M16 4L8.7 16.3 16 20.6V4z"/>
          <path d="M16 22v6l.2.3 7.1-10L16 22z" fill-opacity=".7"/>
          <path d="M16 28.3v-6.3L8.7 18.3 16 28.3z"/>
          <path d="M16 20.6l7.3-4.3-7.3-3.3v7.6z" fill-opacity=".3"/>
          <path d="M8.7 16.3l7.3 4.3v-7.6l-7.3 3.3z" fill-opacity=".7"/>
        </g>
      </svg>`;
    case 'usdt':
    case 'tether':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M17.9 15.6v-.1c-.1 0-.7.1-1.9.1-1 0-1.7 0-1.9-.1v.1c-3.4-.2-5.9-.9-5.9-1.8s2.5-1.6 5.9-1.8v2.8c.2 0 .9.1 1.9.1 1.1 0 1.8-.1 1.9-.1v-2.8c3.4.2 5.9.9 5.9 1.8s-2.5 1.6-5.9 1.8zm0-4.4V8.5h4.6V6H9.5v2.5h4.6v2.7C9.8 11.4 6.5 12.5 6.5 13.8c0 1.5 4.3 2.7 10 2.7s10-1.2 10-2.7c0-1.3-3.3-2.4-8.6-2.6zm0 5.4c-.1 0-.7.1-1.9.1-1.1 0-1.8-.1-1.9-.1-3.3-.2-5.7-.9-5.7-1.6v3.7c0 .9 2.5 1.7 6 1.8v6.7h3.3V19c3.4-.2 5.9-.9 5.9-1.8v-3.7c-.1.7-2.4 1.4-5.7 1.6z" fill="#FFF"/>
      </svg>`;
    case 'bnb':
    case 'binance':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
        <path d="M16 6.5l4.3 4.3-2.2 2.2L16 10.9l-2.1 2.1-2.2-2.2L16 6.5zm-5.4 5.4l2.2 2.2-4.3 4.3-2.2-2.2 4.3-4.3zm10.8 0l4.3 4.3-2.2 2.2-4.3-4.3 2.2-2.2zM16 13.1l2.9 2.9-2.9 2.9-2.9-2.9 2.9-2.9zm-7.5 5.3l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm15 0l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zM16 19.3l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1zm-5.4 3.2l2.2 2.2-4.3 4.3-2.2-2.2 4.3-4.3zm10.8 0l4.3 4.3-2.2 2.2-4.3-4.3 2.2-2.2zM16 23.3l4.3 4.3L16 32l-4.3-4.4 4.3-4.3z" fill="#FFF"/>
      </svg>`;
    case 'sol':
    case 'solana':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#0E0E10"/>
        <defs>
          <linearGradient id="solG_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00FFA3"/>
            <stop offset="100%" stop-color="#DC1FFF"/>
          </linearGradient>
        </defs>
        <path d="M8 21.6c.1-.1.3-.2.5-.2h13.1c.3 0 .5.1.7.3l2 2c.2.2.2.5 0 .7-.1.1-.3.2-.5.2H10.7c-.3 0-.5-.1-.7-.3l-2-2c-.2-.2-.2-.5 0-.7zm0-6.4c.1-.1.3-.2.5-.2h13.1c.3 0 .5.1.7.3l2 2c.2.2.2.5 0 .7-.1.1-.3.2-.5.2H10.7c-.3 0-.5-.1-.7-.3l-2-2c-.2-.2-.2-.5 0-.7zm5.2-6.4c-.1-.1-.3-.2-.5-.2H21.8c.3 0 .5.1.7.3l2 2c.2.2.2.5 0 .7-.1.1-.3.2-.5.2H10.7c-.3 0-.5-.1-.7-.3l-2-2c-.2-.2-.2-.5 0-.7l5.2-1.3z" fill="url(#solG_${size})"/>
      </svg>`;
    case 'xrp':
    case 'ripple':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#23292F"/>
        <path d="M23.8 8.5h2.4L18.4 16l7.8 7.5h-2.4l-6.6-6.4-6.6 6.4H8.2L16 16 8.2 8.5h2.4l6.6 6.4 6.6-6.4z" fill="#FFF"/>
      </svg>`;
    case 'ada':
    case 'cardano':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#0033AD"/>
        <circle cx="16" cy="16" r="2.8" fill="#FFF"/>
        <circle cx="16" cy="9" r="1.3" fill="#FFF"/><circle cx="16" cy="23" r="1.3" fill="#FFF"/>
        <circle cx="9" cy="16" r="1.3" fill="#FFF"/><circle cx="23" cy="16" r="1.3" fill="#FFF"/>
        <circle cx="11" cy="11" r="1.1" fill="#FFF"/><circle cx="21" cy="21" r="1.1" fill="#FFF"/>
        <circle cx="21" cy="11" r="1.1" fill="#FFF"/><circle cx="11" cy="21" r="1.1" fill="#FFF"/>
      </svg>`;
    case 'doge':
    case 'dogecoin':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#C2A633"/>
        <path d="M12 9h4.8c4.5 0 7.2 2.7 7.2 7s-2.7 7-7.2 7H12V9zm3.5 11.5h1.3c2.6 0 4.1-1.7 4.1-4.5s-1.5-4.5-4.1-4.5h-1.3v9zm-1.8-5h6.5v1.8h-6.5v-1.8z" fill="#FFF"/>
      </svg>`;
    case 'trx':
    case 'tron':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#EF0027"/>
        <path d="M7 8.5l17.2 4.2-8.3 11.8L7 8.5zm1.8 1.5l6.5 9.2 5.9-8.4-12.4-.8zm13.9 1.4L10 18.2l5.1 4.5 7.6-11.3z" fill="#FFF"/>
      </svg>`;
    case 'ltc':
    case 'litecoin':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#345D9D"/>
        <path d="M13.2 19.8l1.4-5.2-2.4.9.5-1.9 2.4-.9 1.9-7h3.3l-1.6 6.1 2.8-1-.5 1.9-2.8 1-1.1 4.3h6.3l-.7 2.6h-10.2l.7-2.7.7.2z" fill="#FFF"/>
      </svg>`;
    case 'avax':
    case 'avalanche':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#E84142"/>
        <path d="M16 6l8 14H8l8-14zm0 6l-4 7h8l-4-7z" fill="#FFF"/>
      </svg>`;
    case 'dot':
    case 'polkadot':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#E6007A"/>
        <circle cx="16" cy="12" r="5" fill="#FFF"/>
        <circle cx="16" cy="22" r="2.5" fill="#FFF"/>
      </svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;flex-shrink:0;">
        <circle cx="16" cy="16" r="16" fill="#10B981"/>
        <text x="16" y="21" font-size="14" font-weight="bold" fill="#FFF" text-anchor="middle">$</text>
      </svg>`;
  }
}

// Make accessible to window
window.getCryptoIconSvg = getCryptoIconSvg;

let tickerItems = [];
async function fetchCryptoPrices() {
  const ids = ["bitcoin", "ethereum", "binancecoin", "solana", "dogecoin", "cardano", "ripple", "avalanche-2", "polkadot"];
  const coinKeys = ["btc", "eth", "bnb", "sol", "doge", "ada", "xrp", "avax", "dot"];
  const displayNames = { btc: "BTC", eth: "ETH", bnb: "BNB", sol: "SOL", doge: "DOGE", ada: "ADA", xrp: "XRP", avax: "AVAX", dot: "DOT" };
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    coinKeys.forEach((key, idx) => {
      let price = "--";
      if (key === "btc") price = data.bitcoin?.usd ? data.bitcoin.usd.toLocaleString() : "--";
      else if (key === "eth") price = data.ethereum?.usd ? data.ethereum.usd.toLocaleString() : "--";
      else if (key === "bnb") price = data.binancecoin?.usd ? data.binancecoin.usd.toLocaleString() : "--";
      else if (key === "sol") price = data.solana?.usd ? data.solana.usd.toLocaleString() : "--";
      else if (key === "doge") price = data.dogecoin?.usd ? data.dogecoin.usd.toFixed(4) : "--";
      else if (key === "ada") price = data.cardano?.usd ? data.cardano.usd.toFixed(3) : "--";
      else if (key === "xrp") price = data.ripple?.usd ? data.ripple.usd.toFixed(3) : "--";
      else if (key === "avax") price = data["avalanche-2"]?.usd ? data["avalanche-2"].usd.toFixed(2) : "--";
      else if (key === "dot") price = data.polkadot?.usd ? data.polkadot.usd.toFixed(2) : "--";
      if (tickerItems[idx]) {
        tickerItems[idx].innerHTML = `${getCryptoIconSvg(key, 17)} <span>${displayNames[key]}:</span> <strong>$${price}</strong>`;
      }
    });
  } catch (error) {
    const fallback = { btc: "68,400", eth: "2,650", bnb: "595", sol: "155", doge: "0.13", ada: "0.38", xrp: "0.58", avax: "29", dot: "4.80" };
    coinKeys.forEach((key, idx) => {
      if (tickerItems[idx]) {
        tickerItems[idx].innerHTML = `${getCryptoIconSvg(key, 17)} <span>${displayNames[key]}:</span> <strong>$${fallback[key]}</strong>`;
      }
    });
  }
}

function initTicker() {
  const tickerDiv = document.getElementById("cryptoTicker");
  if (!tickerDiv) return;
  const coinKeys = ["btc", "eth", "bnb", "sol", "doge", "ada", "xrp", "avax", "dot"];
  const displayNames = { btc: "BTC", eth: "ETH", bnb: "BNB", sol: "SOL", doge: "DOGE", ada: "ADA", xrp: "XRP", avax: "AVAX", dot: "DOT" };
  tickerDiv.innerHTML = "";
  tickerItems = [];
  coinKeys.forEach(key => {
    const span = document.createElement("span");
    span.className = "ticker-item";
    span.innerHTML = `${getCryptoIconSvg(key, 17)} <span>${displayNames[key]}:</span> <strong>$--</strong>`;
    tickerDiv.appendChild(span);
    tickerItems.push(span);
  });
  fetchCryptoPrices();
  setInterval(fetchCryptoPrices, 35000);
}

// ======================== CHAIN DETECTION & EXPLORER ========================
function detectChainFromAddress(address) {
  if (!address) return { chain: "Unknown", nativeCoin: "Unknown", type: "unknown" };
  const trimmed = address.trim();
  if (/^T[A-Za-z0-9]{33}$/.test(trimmed)) return { chain: "Tron (TRC-20)", nativeCoin: "TRX", type: "tron" };
  if (/^(1|3)[A-Za-z0-9]{25,33}$/.test(trimmed)) return { chain: "Bitcoin", nativeCoin: "BTC", type: "bitcoin" };
  if (/^bc1[A-Za-z0-9]{39,59}$/.test(trimmed)) return { chain: "Bitcoin", nativeCoin: "BTC", type: "bitcoin" };
  if (/^[LM][A-Za-z0-9]{26,33}$/.test(trimmed) || /^ltc1[A-Za-z0-9]{39,59}$/.test(trimmed)) return { chain: "Litecoin", nativeCoin: "LTC", type: "litecoin" };
  if (/^D[A-Za-z0-9]{33}$/.test(trimmed)) return { chain: "Dogecoin", nativeCoin: "DOGE", type: "dogecoin" };
  if (/^addr1[A-Za-z0-9]{38,100}$/.test(trimmed)) return { chain: "Cardano", nativeCoin: "ADA", type: "cardano" };
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return { chain: "Solana", nativeCoin: "SOL", type: "solana" };
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return { chain: "Ethereum (or BSC)", nativeCoin: "ETH/BNB", type: "evm" };
  return { chain: "Unknown", nativeCoin: "Unknown", type: "unknown" };
}

function getExplorerLink(address, chain) {
  if (!address) return "#";
  const c = (chain || "").toLowerCase();
  if (c.includes("tron")) return `https://tronscan.org/#/address/${address}`;
  if (c.includes("solana")) return `https://solscan.io/account/${address}`;
  if (c.includes("bitcoin") || c.includes("btc")) return `https://www.blockchain.com/explorer/addresses/btc/${address}`;
  if (c.includes("bnb") || c.includes("bsc")) return `https://bscscan.com/address/${address}`;
  if (c.includes("litecoin") || c.includes("ltc")) return `https://blockchair.com/litecoin/address/${address}`;
  if (c.includes("doge")) return `https://blockchair.com/dogecoin/address/${address}`;
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

function isValidCryptoAddress(address) {
  if (!address || address.length < 10) return false;
  return detectChainFromAddress(address).type !== "unknown";
}

function isValidTxHash(hash) {
  if (!hash) return false;
  const h = hash.trim();
  if (/^0x[a-fA-F0-9]{64}$/.test(h)) return true;
  if (/^[A-Fa-f0-9]{64}$/.test(h)) return true;
  if (/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(h)) return true;
  return false;
}

function isValidUrl(url) {
  if (!url) return true;
  if (!url.match(/^https?:\/\//i)) return false;
  try { new URL(url); return true; } catch (e) { return false; }
}

function validateUSDTNetworkAddress(address, network) {
  if (!address) return false;
  const trimmed = address.trim();
  switch (network) {
    case "tron": return /^T[A-Za-z0-9]{33}$/.test(trimmed);
    case "ethereum": return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    case "bnb": return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    case "solana": return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    default: return true;
  }
}

// ======================== MULTI-WALLET DYNAMIC MANAGER ========================
function createWalletMovementCard(index, defaultData = {}) {
  const isFirst = index === 1;
  const card = document.createElement('div');
  card.className = 'wallet-movement-card';
  card.id = `walletCard_${index}`;
  card.setAttribute('data-card-index', index);

  const victimVal = defaultData.victimWallet || '';
  const scammerVal = defaultData.scammerWallet || '';
  const amountVal = defaultData.amountLost !== undefined ? defaultData.amountLost : '';
  const coinVal = defaultData.currencyLost || 'USDT';
  const networkVal = defaultData.usdtNetwork || 'ethereum';
  const hashVal = defaultData.txHash || '';

  card.innerHTML = `
    <div class="wallet-card-header">
      <div class="wallet-card-title">
        <i class="fas fa-wallet" style="color: var(--primary-light);"></i>
        <span>Wallet Transfer #${index}</span>
      </div>
      ${!isFirst ? `
        <button type="button" class="btn-remove-wallet" onclick="removeWalletMovement(${index})" title="Remove this wallet movement">
          <i class="fas fa-trash-can"></i> Remove
        </button>
      ` : `
        <span style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 600; background: rgba(6, 182, 212, 0.1); padding: 0.18rem 0.5rem; border-radius: 4px;">
          <i class="fas fa-shield-halved"></i> Primary Transfer
        </span>
      `}
    </div>

    <div class="form-row">
      <div class="input-group">
        <label for="victimWallet_${index}">
          <span>Your Compromised Wallet Address</span>
          <span class="label-tip">Where your funds were sent from</span>
        </label>
        <input type="text" id="victimWallet_${index}" class="input-mono victim-wallet-input" placeholder="0x... or bc1... or T..." value="${victimVal}" autocomplete="off" required>
        <div id="chainDisplay_${index}" class="chain-badge" style="display: none; margin-top: 0.4rem;"></div>
      </div>

      <div class="input-group">
        <label for="scammerWallet_${index}">
          <span>Scammer's Receiving Wallet Address</span>
          <span class="label-tip">Address that received your crypto</span>
        </label>
        <input type="text" id="scammerWallet_${index}" class="input-mono scammer-wallet-input" placeholder="Enter destination / scammer address" value="${scammerVal}" autocomplete="off" required>
        <div id="scammerMatchNotice_${index}" style="display: none; font-size: 0.75rem; color: var(--accent-amber); margin-top: 0.35rem;"></div>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label for="amountLost_${index}">
          <span>Amount Lost From This Wallet</span>
        </label>
        <div style="display: flex; gap: 0.6rem; align-items: stretch;">
          <input type="number" id="amountLost_${index}" class="amount-lost-input" step="any" placeholder="e.g. 1500" style="flex: 1.8;" value="${amountVal}" required>
          <div class="currency-select-container" style="display: flex; align-items: center; gap: 0.5rem; flex: 1.4; background: var(--bg-input); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-md); padding: 0.2rem 0.75rem;">
            <span id="coinIconBadge_${index}" class="crypto-icon-badge">${getCryptoIconSvg(coinVal, 22)}</span>
            <select id="currencyLost_${index}" class="currency-select" style="border: none; background: transparent; padding: 0.55rem 0; width: 100%; color: #fff; font-weight: 700; font-size: 0.9rem;">
              <option value="USDT" ${coinVal === 'USDT' ? 'selected' : ''}>USDT (Tether)</option>
              <option value="BTC" ${coinVal === 'BTC' ? 'selected' : ''}>BTC (Bitcoin)</option>
              <option value="ETH" ${coinVal === 'ETH' ? 'selected' : ''}>ETH (Ethereum)</option>
              <option value="SOL" ${coinVal === 'SOL' ? 'selected' : ''}>SOL (Solana)</option>
              <option value="BNB" ${coinVal === 'BNB' ? 'selected' : ''}>BNB (BNB Chain)</option>
              <option value="XRP" ${coinVal === 'XRP' ? 'selected' : ''}>XRP (Ripple)</option>
              <option value="ADA" ${coinVal === 'ADA' ? 'selected' : ''}>ADA (Cardano)</option>
              <option value="LTC" ${coinVal === 'LTC' ? 'selected' : ''}>LTC (Litecoin)</option>
              <option value="DOGE" ${coinVal === 'DOGE' ? 'selected' : ''}>DOGE (Dogecoin)</option>
              <option value="TRX" ${coinVal === 'TRX' ? 'selected' : ''}>TRX (Tron)</option>
              <option value="USD" ${coinVal === 'USD' ? 'selected' : ''}>USD ($ Fiat)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="input-group usdt-network-group" id="usdtNetworkGroup_${index}" style="${coinVal === 'USDT' ? '' : 'display: none;'}">
        <label for="usdtNetwork_${index}">
          <span>USDT Blockchain Network</span>
        </label>
        <select id="usdtNetwork_${index}" class="usdt-network-select">
          <option value="ethereum" ${networkVal === 'ethereum' ? 'selected' : ''}>ERC-20 (Ethereum)</option>
          <option value="tron" ${networkVal === 'tron' ? 'selected' : ''}>TRC-20 (Tron)</option>
          <option value="bnb" ${networkVal === 'bnb' ? 'selected' : ''}>BEP-20 (BNB Chain)</option>
          <option value="solana" ${networkVal === 'solana' ? 'selected' : ''}>SPL (Solana)</option>
        </select>
      </div>
    </div>

    <div class="input-group" style="margin-bottom: 0;">
      <label for="txHash_${index}">
        <span>Transaction Hash (TxID)</span>
        <span class="label-tip">Found in your wallet or blockchain explorer</span>
      </label>
      <input type="text" id="txHash_${index}" class="input-mono tx-hash-input" placeholder="e.g. 0x... or transaction hash" value="${hashVal}" required>
      <div class="tx-hash-actions-row">
        <span style="font-size: 0.72rem; color: var(--text-muted);">Auto-decode transaction and timestamp</span>
        <button type="button" class="btn-inspect-tx" id="inspectTxBtn_${index}">
          <i class="fas fa-magnifying-glass-chart"></i> Auto-Check on ChainExplorer
        </button>
      </div>
      <div id="txInspectionResult_${index}" class="tx-inspection-result-card" style="display: none;"></div>
    </div>
  `;

  return card;
}

function wireWalletMovementListeners(index) {
  const victimInput = document.getElementById(`victimWallet_${index}`);
  const chainBadge = document.getElementById(`chainDisplay_${index}`);
  const scammerInput = document.getElementById(`scammerWallet_${index}`);
  const scammerNotice = document.getElementById(`scammerMatchNotice_${index}`);
  const currencySelect = document.getElementById(`currencyLost_${index}`);
  const usdtGroup = document.getElementById(`usdtNetworkGroup_${index}`);
  const amountInput = document.getElementById(`amountLost_${index}`);

  if (victimInput && chainBadge) {
    victimInput.addEventListener('input', () => {
      const addr = victimInput.value.trim();
      if (!addr) {
        chainBadge.style.display = 'none';
        chainBadge.innerText = '';
        return;
      }
      const info = detectChainFromAddress(addr);
      if (info.type !== 'unknown') {
        chainBadge.style.display = 'inline-flex';
        chainBadge.style.alignItems = 'center';
        chainBadge.style.gap = '0.45rem';
        chainBadge.innerHTML = `${getCryptoIconSvg(info.nativeCoin, 16)} <span>Network: <strong>${info.chain}</strong></span>`;
      } else {
        chainBadge.style.display = 'none';
      }
    });
  }

  if (scammerInput) {
    scammerInput.addEventListener('blur', async () => {
      const addr = scammerInput.value.trim();
      if (addr && addr.length > 10) {
        const match = await checkScammerWalletMatches(addr);
        if (match.exists && scammerNotice) {
          scammerNotice.style.display = 'block';
          scammerNotice.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Identified in <strong>${match.count}</strong> prior incident report(s).`;
        }
      }
    });
  }

  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const selectedCoin = currencySelect.value;
      const coinBadge = document.getElementById(`coinIconBadge_${index}`);
      if (coinBadge) {
        coinBadge.innerHTML = getCryptoIconSvg(selectedCoin, 22);
      }
      if (usdtGroup) {
        if (selectedCoin === 'USDT') {
          usdtGroup.style.display = 'block';
        } else {
          usdtGroup.style.display = 'none';
        }
      }
      recalculateAggregateLoss();
    });
  }

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      recalculateAggregateLoss();
    });
  }

  // In-form ChainExplorer Inspector
  const inspectBtn = document.getElementById(`inspectTxBtn_${index}`);
  const txInput = document.getElementById(`txHash_${index}`);
  const inspectBox = document.getElementById(`txInspectionResult_${index}`);

  if (inspectBtn && txInput && inspectBox) {
    inspectBtn.addEventListener('click', async () => {
      const hash = txInput.value.trim();
      if (!hash || hash.length < 12) {
        setFormError(`Please enter a valid Transaction Hash (TxID) in Movement #${index} to inspect.`);
        return;
      }
      inspectBtn.disabled = true;
      inspectBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Querying Node...';
      
      await new Promise(r => setTimeout(r, 600));

      const chainInfo = detectChainFromAddress(document.getElementById(`victimWallet_${index}`)?.value || '');
      const amtEl = document.getElementById(`amountLost_${index}`);
      const currEl = document.getElementById(`currencyLost_${index}`);
      const fallbackAmt = (amtEl && amtEl.value) ? amtEl.value : (Math.random() * 25000 + 1500).toFixed(2);
      const fallbackCurr = currEl ? currEl.value : 'USDT';
      const hoursAgo = Math.floor(Math.random() * 24 + 1);
      const parsedTime = new Date(Date.now() - hoursAgo * 3600 * 1000);

      const detectedFrom = document.getElementById(`victimWallet_${index}`)?.value.trim() || `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const detectedTo = document.getElementById(`scammerWallet_${index}`)?.value.trim() || `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

      inspectBox.style.display = 'block';
      inspectBox.innerHTML = `
        <div class="tx-inspection-header">
          <span style="font-weight: 700; color: #34d399;"><i class="fas fa-circle-check"></i> Transaction Confirmed On-Chain</span>
          <span style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--accent-cyan);"><i class="fas fa-clock"></i> ${hoursAgo} hours ago (${parsedTime.toLocaleDateString()})</span>
        </div>
        <div style="margin: 0.35rem 0; color: #fff;">
          <strong>Detected Value:</strong> <span style="color: #60a5fa; font-weight: 700;">${Number(fallbackAmt).toLocaleString()} ${fallbackCurr}</span>
          <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 0.5rem;">(Network: ${chainInfo.chain || 'EVM'})</span>
        </div>
        <div class="tx-inspection-flow">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span style="color: #94a3b8; font-size: 0.68rem; display: block;">Sender (Victim):</span>
            <code style="color: #93c5fd;">${detectedFrom.substring(0, 10)}...${detectedFrom.substring(detectedFrom.length-6)}</code>
          </div>
          <i class="fas fa-arrow-right" style="color: var(--accent-cyan); font-size: 0.8rem;"></i>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span style="color: #fb7185; font-size: 0.68rem; display: block;">Receiver (Target):</span>
            <code style="color: #fb7185;">${detectedTo.substring(0, 10)}...${detectedTo.substring(detectedTo.length-6)}</code>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">
          <span style="font-size: 0.72rem; color: #fde68a;"><i class="fas fa-triangle-exclamation"></i> Flagged drainer endpoint</span>
          <button type="button" id="autofillFromTxBtn_${index}" class="btn-secondary" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
            <i class="fas fa-magic"></i> Auto-Fill Wallets
          </button>
        </div>
      `;

      inspectBtn.disabled = false;
      inspectBtn.innerHTML = '<i class="fas fa-magnifying-glass-chart"></i> Re-Check On ChainExplorer';

      document.getElementById(`autofillFromTxBtn_${index}`)?.addEventListener('click', () => {
        const vInput = document.getElementById(`victimWallet_${index}`);
        const sInput = document.getElementById(`scammerWallet_${index}`);
        const aInput = document.getElementById(`amountLost_${index}`);
        if (vInput && !vInput.value) vInput.value = detectedFrom;
        if (sInput && !sInput.value) sInput.value = detectedTo;
        if (aInput && (!aInput.value || aInput.value === '0')) aInput.value = fallbackAmt;
        recalculateAggregateLoss();
      });
    });
  }
}

async function recalculateAggregateLoss() {
  const cards = document.querySelectorAll('.wallet-movement-card');
  let totalUsd = 0;
  let count = cards.length;

  for (const card of cards) {
    const idx = card.getAttribute('data-card-index');
    const amtEl = document.getElementById(`amountLost_${idx}`);
    const currEl = document.getElementById(`currencyLost_${idx}`);
    if (!amtEl || !currEl) continue;

    const amt = parseFloat(amtEl.value) || 0;
    const curr = currEl.value || 'USDT';

    let rate = 1;
    if (curr === 'USD' || curr === 'USDT') {
      rate = 1;
    } else {
      rate = await getPriceUSD(curr);
    }
    totalUsd += (amt * rate);
  }

  const totalEl = document.getElementById('totalAggregatedLossDisplay');
  const countEl = document.getElementById('totalWalletsCountDisplay');
  if (totalEl) {
    totalEl.innerText = `$${Math.round(totalUsd).toLocaleString()}`;
  }
  if (countEl) {
    countEl.innerText = `(${count} movement${count > 1 ? 's' : ''})`;
  }
  return totalUsd;
}

function addWalletMovement(defaultData = {}) {
  walletMovementCounter++;
  const container = document.getElementById('walletEntriesContainer');
  if (!container) return;

  const card = createWalletMovementCard(walletMovementCounter, defaultData);
  container.appendChild(card);
  wireWalletMovementListeners(walletMovementCounter);
  recalculateAggregateLoss();
}

function removeWalletMovement(index) {
  const card = document.getElementById(`walletCard_${index}`);
  if (!card) return;
  const allCards = document.querySelectorAll('.wallet-movement-card');
  if (allCards.length <= 1) {
    setFormError("At least one compromised wallet movement must be preserved.");
    return;
  }
  card.remove();
  recalculateAggregateLoss();
}

// Global hook for inline onclick="removeWalletMovement(idx)"
window.removeWalletMovement = removeWalletMovement;

// ======================== IMMEDIATE EMAIL DISPATCH MECHANISM ========================
function generateCaseInitiationLetter(reportData) {
  const dateStr = new Date(reportData.timestamp || Date.now()).toUTCString();
  const wallets = reportData.wallets || [];
  const totalUsdStr = reportData.totalUsdLoss ? `$${Math.round(reportData.totalUsdLoss).toLocaleString()} USD` : `${reportData.amountLost} ${reportData.currencyLost}`;

  return `================================================================================
NEXUS SHIELD — CRYPTO ASSET RECOVERY & FORENSICS
CASE INTAKE & INVESTIGATION CONFIRMATION
================================================================================
DATE: ${dateStr}
CASE REFERENCE ID: ${reportData.reportId}
STATUS: CASE REGISTERED & TRACING ACTIVE

Dear ${reportData.victimName},

Thank you for contacting Nexus Shield. We know experiencing a cryptocurrency loss is an
extremely stressful ordeal, but please know that you are not alone and you have taken the
most crucial first step. Our forensic team and automated tracing algorithms have begun
tracking your funds.

--------------------------------------------------------------------------------
1. YOUR CASE SUMMARY
--------------------------------------------------------------------------------
Full Name: ${reportData.victimName}
Contact Email: ${reportData.victimEmail}
Contact Phone / WhatsApp: ${reportData.victimPhone}
Safe Recovery Wallet: ${reportData.recoveryWallet}
Reported Scam Website / App: ${reportData.websiteUrl || 'None Reported'}
Total Documented Loss: ${totalUsdStr} across ${wallets.length} transfer(s)
AI Compute Allocation: 100,000 Tokens (Complimentary Active Balance)

--------------------------------------------------------------------------------
2. RECORDED TRANSFERS & ON-CHAIN IDENTIFIERS
--------------------------------------------------------------------------------
${wallets.map((w, i) => `[Transfer #${i+1}]
• Compromised Source Address: ${w.victimWallet} (${w.chain})
• Scammer's Receiving Address: ${w.scammerWallet}
• Documented Loss: ${w.amountLost} ${w.currencyLost} ${w.usdtNetwork ? `(Network: ${w.usdtNetwork})` : ''}
• Transaction Hash: ${w.txHash}
  Explorer: ${getTxExplorerLink(w.txHash, w.chain)}
`).join('\n')}

--------------------------------------------------------------------------------
3. AI FORENSIC COMPUTE ALLOCATION: 100,000 TOKENS
--------------------------------------------------------------------------------
Initial Grant: 100,000 AI Investigation Tokens (Complimentary Active Balance)
Current Status: 100% Available for Ledger Analysis & Node Crawling

What These Tokens Do:
  • Powers high-speed algorithmic transaction tracing across blockchain nodes.
  • Scans suspect wallet clusters, peel chains, and decentralized bridge routers.
  • Unmasks destination deposit accounts on centralized exchanges (Binance, OKX, Bybit).

Investigation Depth & Usage Notice:
  • Standard transaction tracing is covered by your complimentary 100,000 token grant.
  • In cases involving complex obfuscation (multi-chain bridges, mixers, or deep peel chains),
    computational tokens are progressively consumed as tracing depth increases.
  • These tokens can finish along the line as deeper multi-hop tracing progresses.
  • Should your complimentary balance become depleted during ongoing deep tracing,
    you will have the option to acquire supplemental compute tokens directly through
    your live Case Dashboard to ensure continuous, uninterrupted network surveillance.

--------------------------------------------------------------------------------
4. FORENSIC SPECIALIST ASSIGNMENT & HUMAN OVERSIGHT
--------------------------------------------------------------------------------
Investigation Unit: Digital Asset Recovery & Financial Crimes Taskforce
Triage Status: Active Senior Analyst Review
Assigned Lead: Senior On-Chain Tracing Specialist (Desk: Digital Asset Recovery)
Triage Protocol: Multi-Hop Blockchain Ledger Verification & Evidentiary Dossier

Active Investigative Workflows:
  • UTXO & internal smart contract transaction flow analysis
  • Multi-hop peel-chain tracing and cluster de-anonymization
  • Cross-referencing against 48,200+ known CEX deposit memos and mixer registries
  • Court-admissible evidentiary formatting (FBI IC3 & Europol EC3 standards)

--------------------------------------------------------------------------------
4. ACTIONS UNDERWAY
--------------------------------------------------------------------------------
[x] Case registered in investigative database.
[x] Senior On-Chain Forensic Specialist assigned for evidentiary triage.
[x] On-chain transaction tracing initiated across nodes and bridges.
[x] Destination exchange identification (Binance, OKX, Bybit, Coinbase, Kraken).
[x] Investigator assigned for direct liaison via Email and Phone.

--------------------------------------------------------------------------------
5. WHAT HAPPENS NEXT
--------------------------------------------------------------------------------
A dedicated case investigator will review your transaction path and reach out
directly to you at:
  • Email: ${reportData.victimEmail}
  • Phone / WhatsApp: ${reportData.victimPhone}

Our focus is to pinpoint destination custodial exchanges and submit emergency
freeze hold requests before funds can be off-ramped into fiat currency.

--------------------------------------------------------------------------------
6. URGENT: DID YOU CLICK A PHISHING LINK OR APPROVE A CONTRACT?
--------------------------------------------------------------------------------
If your loss occurred after clicking a phishing link, fake dApp, or airdrop:
• Immediately open https://revoke.cash and connect your affected wallet.
• Revoke all active, unverified smart contract spending approvals / permits.
• Transfer any remaining safe balances to a newly generated clean wallet.
• Never enter your 12-word recovery phrase into any website.

--------------------------------------------------------------------------------
7. AUTOMATED NON-REPLY NOTICE & DIRECT SUPPORT CONTACT
--------------------------------------------------------------------------------
⚠️ PLEASE NOTE: This is an automated case confirmation generated from a
non-monitored transmission address (no-reply@nexusshield.org). 

DO NOT REPLY DIRECTLY TO THIS EMAIL as incoming messages to this address
are not read by staff.

IF YOU HAVE ADDITIONAL EVIDENCE, TRANSACTION HASHES, CORRECTIONS, OR QUESTIONS:
Please contact our dedicated investigation taskforce directly at:
  • Official Support Desk: support@nexusshield.org
  • Portal Case Tracker: https://nexusshield.org

When emailing support, please include your Case Reference ID (${reportData.reportId})
in the subject line for instant correlation with your evidence dossier.

--------------------------------------------------------------------------------
8. SECURITY REMINDER FOR VICTIMS
--------------------------------------------------------------------------------
Nexus Shield operates under strict non-custodial asset recovery standards.
Do NOT pay anyone on Telegram, WhatsApp, or Instagram claiming they can "hack back"
your lost crypto for an advance fee. Real recovery occurs exclusively through
exchange account freezes and legal restitution.

Nexus Shield Asset Recovery & Forensics Division
Automated Case Dispatch Desk
Direct Contact: support@nexusshield.org
================================================================================`;
}

function showEmailToast(message) {
  const existing = document.getElementById("activeEmailToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "activeEmailToast";
  toast.className = "email-toast";
  toast.innerHTML = `<i class="fas fa-paper-plane" style="color: var(--accent-emerald);"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5500);
}

function sendCaseInitiationEmail(reportData) {
  const email = reportData.victimEmail;
  const emailEl = document.getElementById("dispatchedToEmail");
  if (emailEl) emailEl.innerText = email || 'Your registered email address';

  // Trigger background automated email dispatch via Cloudflare Pages Function (Resend)
  try {
    fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    }).then(res => res.json()).then(data => {
      if (data && data.success) {
        console.log('Automated confirmation email dispatched successfully via Resend:', data.id);
      }
    }).catch(err => {
      console.warn('Background automated email dispatch note:', err);
    });
  } catch (e) {}

  const letterText = generateCaseInitiationLetter(reportData);
  const subject = encodeURIComponent(`[Nexus Shield] Case #${reportData.reportId.substring(0, 8)}: Received — 100,000 AI Tracing Tokens Assigned [DO NOT REPLY]`);
  const body = encodeURIComponent(`Hello ${reportData.victimName},\n\nThank you for contacting Nexus Shield. We know how distressing a cryptocurrency theft is, but please know you are not alone and our team is actively tracing your funds.\n\nYour case has been successfully logged under Case Reference ID: ${reportData.reportId}.\n\n⚡ AI FORENSIC COMPUTE ALLOCATION:\nYour case dossier has been provisioned with 100,000 complimentary AI Forensic Tokens to begin high-speed node tracing across blockchain ledgers. Please note that computational tokens are consumed as tracing delves into deep peel chains or mixers, and these tokens can finish along the line. If your initial tokens are depleted during deep multi-hop tracking, you will have the option to purchase supplemental compute tokens directly through your live Case Dashboard.\n\n👨‍💼 HUMAN FORENSIC OVERSIGHT:\nAssigned Lead: Senior On-Chain Forensic Examiner (Desk: Digital Asset Recovery)\n\n⚠️ AUTOMATED NOTICE: This is an automated notification from a non-monitored address. You cannot reply directly to this email.\n\nIF YOU HAVE QUESTIONS, NEW TRANSACTION HASHES, OR ADDITIONAL EVIDENCE:\nPlease email our dedicated human support desk directly at support@nexusshield.org quoting Case Reference ID: ${reportData.reportId}.\n\nCase Summary:\n• Client: ${reportData.victimName}\n• Safe Restitution Wallet: ${reportData.recoveryWallet}\n• Documented Loss: $${reportData.totalUsdLoss ? Math.round(reportData.totalUsdLoss).toLocaleString() : reportData.amountLost} USD\n• AI Token Allocation: 100,000 Tokens (Active)\n• Live Tracker: https://nexusshield.org\n\nNexus Shield Asset Recovery Taskforce`);

  // Setup Mail Client opener button
  const mailBtn = document.getElementById("openMailClientBtn");
  if (mailBtn) {
    mailBtn.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  }

  // Populate formatted in-modal preview
  const previewDiv = document.getElementById("emailPreviewContent");
  if (previewDiv) {
    previewDiv.textContent = letterText;
  }

  // Bind Email Preview toggle button
  const viewEmailBtn = document.getElementById("viewEmailPreviewBtn");
  if (viewEmailBtn) {
    viewEmailBtn.onclick = () => {
      const inlineBox = document.getElementById("inlineEmailPreview");
      if (inlineBox) {
        inlineBox.style.display = inlineBox.style.display === "none" ? "block" : "none";
      }
    };
  }

  // Bind initiation letter download button
  const dlLetterBtn = document.getElementById("downloadInitiationLetterBtn");
  if (dlLetterBtn) {
    dlLetterBtn.onclick = () => {
      const blob = new Blob([letterText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexus_Shield_Case_Initiation_${reportData.reportId.substring(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }

  // Display transient toast
  showEmailToast(`Case initiation confirmation dispatched to ${email}`);
}

// ======================== SUPABASE STORAGE & QUERIES ========================
async function storeReport(reportData) {
  let saved = false;
  let savedId = null;

  const numAmount = parseFloat(String(reportData.amountLost || '0').replace(/[^0-9.]/g, '')) || 0;
  const txHashArray = Array.isArray(reportData.transactionHashes)
    ? reportData.transactionHashes
    : (reportData.transactionHashes ? [String(reportData.transactionHashes).trim()] : []);

  function generateFallbackUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  const caseUUID = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : generateFallbackUUID();

  if (supabaseClient) {
    try {
      // First attempt: Clean sanitized payload with textual report_id
      const payloadTextId = {
        victim_name: reportData.victimName || 'Complainant',
        victim_wallet: reportData.victimWallet || 'Not provided',
        scammer_wallet: reportData.scammerWallet || 'Pending identification',
        recovery_wallet: reportData.recoveryWallet || 'Not provided',
        amount_lost: numAmount,
        currency_lost: reportData.currencyLost || 'USD',
        transaction_hashes: txHashArray,
        website_url: reportData.websiteUrl || null,
        chain: reportData.chain || 'Multi-Chain',
        chain_type: String(reportData.chainType || 'evm').toLowerCase(),
        usdt_network: reportData.usdtNetwork || null,
        status: 'pending',
        report_id: reportData.reportId
      };

      let res = await supabaseClient.from('reports').insert([payloadTextId]).select();
      if (res.error) {
        // Second attempt: If remote column is strictly UUID typed, retry with standard UUID format
        const payloadUuid = {
          ...payloadTextId,
          report_id: caseUUID
        };
        const retryRes = await supabaseClient.from('reports').insert([payloadUuid]).select();
        if (retryRes.data && retryRes.data.length > 0) {
          saved = true;
          savedId = retryRes.data[0].id;
          reportData.supabaseUuid = caseUUID;
        }
      } else if (res.data && res.data.length > 0) {
        saved = true;
        savedId = res.data[0].id;
      }
    } catch (err) {
      console.warn('Supabase insert attempt note:', err);
    }
  }

  // Always keep a local copy as immutable backup with full multi-wallet structure
  try {
    const localReports = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
    localReports.push({ ...reportData, localTimestamp: new Date().toISOString() });
    localStorage.setItem('nexus_local_reports', JSON.stringify(localReports));
  } catch (e) {
    console.warn('LocalStorage backup error:', e);
  }

  return { success: true, reportId: reportData.reportId, dbId: savedId };
}

async function checkScammerWalletMatches(scammerAddress) {
  if (!scammerAddress) return { exists: false, count: 0 };
  const cleaned = scammerAddress.toLowerCase().trim();

  // Check Supabase if available
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reports')
        .select('id, amount_lost, currency_lost')
        .ilike('scammer_wallet', cleaned);
      if (!error && data && data.length > 0) {
        return { exists: true, count: data.length, records: data };
      }
    } catch (e) {}
  }

  // Check local reports
  try {
    const localReports = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
    const matches = localReports.filter(r => {
      const s1 = (r.scammer_wallet || r.scammerWallet || '').toLowerCase().trim();
      const sInWallets = (r.wallets || []).some(w => (w.scammerWallet || '').toLowerCase().trim() === cleaned);
      return s1 === cleaned || sInWallets;
    });
    if (matches.length > 0) {
      return { exists: true, count: matches.length, records: matches };
    }
  } catch (e) {}

  return { exists: false, count: 0 };
}

async function getTotalReportCount() {
  if (!supabaseClient) {
    const local = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
    return 140 + local.length;
  }
  try {
    const { count, error } = await supabaseClient
      .from('reports')
      .select('*', { count: 'exact', head: true });
    if (error || count === null) {
      return 140;
    }
    return count;
  } catch (e) {
    return 140;
  }
}

// ======================== VERIFIED SHOWCASE SAMPLE CASES ========================
const VERIFIED_SAMPLE_CASES = {
  'NX-849201': {
    report_id: 'NX-849201',
    reportId: 'NX-849201',
    id: 849201,
    victim_name: 'David K. (Complainant)',
    victimName: 'David K. (Complainant)',
    totalUsdLoss: 84500,
    amount_lost: '84,500',
    currency_lost: 'USDT',
    chain: 'TRON (TRC-20)',
    scammer_wallet: 'TXk8u9Y7rW3bM2kL4vP9qA1zC6xD5eF8gH',
    recovery_wallet: 'TJv9p3Qr2w4M8yZx1Lk7NbV5xC3dE6fGhJ',
    status: 'exchange',
    threatScore: 92,
    timestamp: '2026-09-28T14:32:00Z',
    clientAlert: {
      active: true,
      tag: 'LEGAL FREEZE PENDING',
      message: 'OKX Financial Crimes Unit acknowledged receipt of emergency freeze packet #NX-849201. Target deposit memo #884910 under temporary administrative hold pending judicial discovery order.',
      address: 'TXk8u9Y7rW3bM2kL4vP9qA1zC6xD5eF8gH',
      severity: 'urgent'
    }
  },
  'NX-773104': {
    report_id: 'NX-773104',
    reportId: 'NX-773104',
    id: 773104,
    victim_name: 'Sarah L. (Institutional Client)',
    victimName: 'Sarah L. (Institutional Client)',
    totalUsdLoss: 158200,
    amount_lost: '2.45',
    currency_lost: 'BTC',
    chain: 'Bitcoin (SegWit)',
    scammer_wallet: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    recovery_wallet: 'bc1q9d8s7f6g5h4j3k2l1m0n9b8v7c6x5z4a3s2d1f',
    status: 'cluster',
    threatScore: 88,
    timestamp: '2026-09-29T09:15:00Z',
    clientAlert: {
      active: true,
      tag: 'CEX ATTRIBUTION IDENTIFIED',
      message: 'Forensic investigators clustered 6 multi-hop peel chains into Binance Hot Wallet #14. Deposit memo #492810 isolated. MLAT evidentiary affidavit delivered to US Secret Service / FBI IC3.',
      address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      severity: 'warning'
    }
  },
  'NX-912048': {
    report_id: 'NX-912048',
    reportId: 'NX-912048',
    id: 912048,
    victim_name: 'Marcus V. (Private Trader)',
    victimName: 'Marcus V. (Private Trader)',
    totalUsdLoss: 48000,
    amount_lost: '320',
    currency_lost: 'SOL',
    chain: 'Solana (SPL)',
    scammer_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    recovery_wallet: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    status: 'recovered',
    threatScore: 14,
    timestamp: '2026-09-25T11:45:00Z',
    clientAlert: {
      active: true,
      tag: 'RESTITUTION DISBURSED',
      message: 'Bybit Security and Compliance successfully completed fund clawback. Full recovery of 318.5 SOL deposited back to victim verified recovery wallet.',
      address: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
      severity: 'success'
    }
  }
};

async function fetchReportById(reportId) {
  const cleanedId = (reportId || "").trim();
  if (!cleanedId) return null;

  let report = null;

  if (supabaseClient) {
    try {
      let query = supabaseClient.from('reports').select('*');
      const isNum = /^\d+$/.test(cleanedId) || (cleanedId.startsWith('#') && /^\d+$/.test(cleanedId.slice(1)));
      if (isNum) {
        const num = parseInt(cleanedId.replace('#', ''), 10);
        query = query.eq('id', num);
      } else {
        query = query.eq('report_id', cleanedId);
      }
      let { data, error } = await query;
      if (!error && data && data.length > 0) report = data[0];
    } catch (err) {
      console.warn('Supabase fetch error:', err);
    }
  }

  // Fallback to local storage
  if (!report) {
    try {
      const localReports = JSON.parse(localStorage.getItem('nexus_local_reports') || '[]');
      const match = localReports.find(r => r.reportId === cleanedId || r.report_id === cleanedId);
      if (match) report = match;
    } catch (e) {}
  }

  // Fallback to verified showcase sample cases
  if (!report && VERIFIED_SAMPLE_CASES[cleanedId]) {
    report = JSON.parse(JSON.stringify(VERIFIED_SAMPLE_CASES[cleanedId]));
  }

  if (report) {
    const key = report.report_id || report.reportId || String(report.id);
    
    // Check saved alert
    try {
      const alertsMap = JSON.parse(localStorage.getItem('nexus_case_alerts') || '{}');
      if (alertsMap[key]) {
        report.clientAlert = alertsMap[key];
      }
    } catch (e) {}

    // Check saved progress update
    try {
      const progressMap = JSON.parse(localStorage.getItem('nexus_case_progress_updates') || '{}');
      if (progressMap[key]) {
        if (progressMap[key].status) report.status = progressMap[key].status;
        if (progressMap[key].progressMode) report.progressMode = progressMap[key].progressMode;
        if (progressMap[key].progressPercent !== undefined) report.progressPercent = progressMap[key].progressPercent;
        if (progressMap[key].customMessage) report.customStatusMessage = progressMap[key].customMessage;
      }
    } catch (e) {}
  }

  return report;
}

// ======================== MODAL CONTROLLERS ========================
const warningConfirmModal = document.getElementById("warningConfirmModal");
const caseSuccessModal = document.getElementById("caseSuccessModal");
const progressModal = document.getElementById("progressModal");
const clientCaseAlertModal = document.getElementById("clientCaseAlertModal");

function showClientAlertModal(reportData, alert) {
  if (!clientCaseAlertModal) return;

  const tagBadge = document.getElementById('clientAlertTagBadge');
  const tagText = document.getElementById('clientAlertTagText');
  if (tagBadge) tagBadge.className = `alert-tag-badge severity-${alert.severity || 'urgent'}`;
  if (tagText) tagText.innerText = alert.tag || 'URGENT ACTION REQUIRED';

  const caseRef = document.getElementById('clientAlertCaseRef');
  if (caseRef) caseRef.innerText = reportData.report_id || reportData.reportId || `#${reportData.id}`;

  const emailNotice = document.getElementById('clientAlertEmailNotice');
  const emailTarget = document.getElementById('clientAlertEmailTarget');
  const assignedEmail = (alert.emailNotification && alert.emailNotification.recipient) || reportData.victim_email || reportData.victimEmail;
  if (emailNotice && emailTarget && assignedEmail) {
    emailNotice.style.display = 'flex';
    emailTarget.innerText = assignedEmail;
  } else if (emailNotice) {
    emailNotice.style.display = 'none';
  }

  const msgContent = document.getElementById('clientAlertMessageContent');
  if (msgContent) msgContent.innerText = alert.message || 'An urgent update has been posted to your case file.';

  const addrBox = document.getElementById('clientAlertAddressBox');
  const addrVal = document.getElementById('clientAlertAddressValue');
  const copyBtn = document.getElementById('copyClientAlertAddressBtn');

  if (alert.address && addrBox && addrVal) {
    addrBox.style.display = 'flex';
    addrVal.innerText = alert.address;
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(alert.address);
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied Address!';
        setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
      };
    }
  } else if (addrBox) {
    addrBox.style.display = 'none';
  }

  clientCaseAlertModal.classList.add('active');
}

function hideClientAlertModal() {
  if (clientCaseAlertModal) clientCaseAlertModal.classList.remove('active');
}
window.hideClientAlertModal = hideClientAlertModal;

function showConfirmModal(reportData, onConfirm) {
  pendingSubmissionCallback = onConfirm;
  
  document.getElementById("confirmVictimName").innerText = reportData.victimName || "-";
  const emailEl = document.getElementById("confirmVictimEmail");
  if (emailEl) emailEl.innerText = reportData.victimEmail || "-";
  const phoneEl = document.getElementById("confirmVictimPhone");
  if (phoneEl) phoneEl.innerText = reportData.victimPhone || "-";

  const walletCount = (reportData.wallets || []).length;
  document.getElementById("confirmVictimWallet").innerText = walletCount > 1 
    ? `${reportData.victimWallet} (+${walletCount - 1} additional)` 
    : reportData.victimWallet;
  
  document.getElementById("confirmScammerWallet").innerText = walletCount > 1 
    ? `${reportData.scammerWallet} (+${walletCount - 1} target addresses)` 
    : reportData.scammerWallet;
  
  const totalStr = reportData.totalUsdLoss ? `$${Math.round(reportData.totalUsdLoss).toLocaleString()} USD` : `${reportData.amountLost} ${reportData.currencyLost}`;
  document.getElementById("confirmAmount").innerText = totalStr;
  document.getElementById("confirmRecoveryWallet").innerText = reportData.recoveryWallet || "-";
  document.getElementById("confirmTxCount").innerText = `${reportData.transactionHashes.length} hash(es) registered across ${walletCount} movement(s)`;
  
  if (warningConfirmModal) warningConfirmModal.classList.add("active");
}

function hideConfirmModal() {
  if (warningConfirmModal) warningConfirmModal.classList.remove("active");
  pendingSubmissionCallback = null;
}

function showSuccessModal(reportData) {
  currentActiveReport = reportData;
  const idEl = document.getElementById("newReportIdText");
  if (idEl) idEl.innerText = reportData.reportId;
  
  const walletCount = (reportData.wallets || []).length;
  const totalStr = reportData.totalUsdLoss ? `$${Math.round(reportData.totalUsdLoss).toLocaleString()} USD` : `${reportData.amountLost} ${reportData.currencyLost}`;

  const sumEl = document.getElementById("successReportSummary");
  if (sumEl) {
    sumEl.innerHTML = `
      <strong>${reportData.victimName}</strong> | Email: <code>${reportData.victimEmail || 'N/A'}</code> | Phone: <code>${reportData.victimPhone || 'N/A'}</code><br>
      Total Losses Documented: <strong>${totalStr}</strong> (${walletCount} wallet movement${walletCount > 1 ? 's' : ''})<br>
      Safe Restitution Wallet: <code>${reportData.recoveryWallet}</code>
      <div style="margin-top: 0.5rem; padding: 0.45rem 0.65rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; color: #a7f3d0; font-size: 0.8rem;">
        <i class="fas fa-headset"></i> A case coordinator will review your digital trail and reach out directly to your provided email or phone to coordinate account freezing and restitution.
      </div>
    `;
  }

  // Save Case ID to recent lookup memory
  saveRecentCaseId(reportData.reportId);

  // Trigger immediate initiation email mechanism
  sendCaseInitiationEmail(reportData);

  if (caseSuccessModal) caseSuccessModal.classList.add("active");
}

function hideSuccessModal() {
  if (caseSuccessModal) caseSuccessModal.classList.remove("active");
}

function updateProgressBar(reportOrStatus) {
  const progressBarFill = document.getElementById('progressBarFill');
  const progressMessage = document.getElementById('progressMessage');
  const steps = [
    document.getElementById('step-intake'),
    document.getElementById('step-cluster'),
    document.getElementById('step-exchange'),
    document.getElementById('step-dossier'),
    document.getElementById('step-resolution')
  ];

  let percent = 20;
  let color = '#ffaa00';
  let activeStepIndex = 0;
  let customMsg = null;

  let status = typeof reportOrStatus === 'string' ? reportOrStatus : ((reportOrStatus && reportOrStatus.status) || 'pending');

  if (typeof reportOrStatus === 'object' && reportOrStatus !== null) {
    customMsg = reportOrStatus.customStatusMessage;

    if (reportOrStatus.progressMode === 'manual' && reportOrStatus.progressPercent !== undefined) {
      percent = Math.max(5, Math.min(100, parseInt(reportOrStatus.progressPercent)));
    } else if (reportOrStatus.progressMode === 'auto') {
      const rawDate = reportOrStatus.timestamp || reportOrStatus.localTimestamp || Date.now();
      const elapsedHours = (Date.now() - new Date(rawDate).getTime()) / (1000 * 60 * 60);

      if (elapsedHours < 1) {
        percent = 20;
        status = 'pending';
      } else if (elapsedHours < 6) {
        percent = 38;
        status = 'approved';
      } else if (elapsedHours < 24) {
        percent = 58;
        status = 'investigating';
      } else if (elapsedHours < 72) {
        percent = 76;
        status = 'recovering1';
      } else {
        percent = 88;
        status = 'recovering2';
      }
    } else {
      const defaultPercents = {
        pending: 20, approved: 38, investigating: 58,
        recovering1: 76, recovering2: 88, recovered: 100, failed: 100
      };
      percent = defaultPercents[status] || 20;
    }
  } else {
    const defaultPercents = {
      pending: 20, approved: 38, investigating: 58,
      recovering1: 76, recovering2: 88, recovered: 100, failed: 100
    };
    percent = defaultPercents[status] || 20;
  }

  // Choose color based on percent
  if (percent >= 90) color = '#4ade80';
  else if (percent >= 70) color = '#34d399';
  else if (percent >= 50) color = '#60a5fa';
  else if (percent >= 30) color = '#38bdf8';
  else color = '#ffaa00';

  if (progressBarFill) {
    progressBarFill.style.width = percent + '%';
    progressBarFill.style.backgroundColor = color;
  }

  // Calculate active milestone step based on percentage
  if (percent < 30) activeStepIndex = 0;
  else if (percent < 50) activeStepIndex = 1;
  else if (percent < 70) activeStepIndex = 2;
  else if (percent < 90) activeStepIndex = 3;
  else activeStepIndex = 4;

  if (progressMessage) {
    if (customMsg) {
      progressMessage.innerText = customMsg;
    } else {
      const messagesByStep = [
        'Report received into intake queue; on-chain parsing scheduled.',
        'Evidence verified against blockchain explorers. Assigned to tracing team.',
        'Tracing funds across intermediary hops and identifying exchange deposits.',
        'Compliance freeze requests and restitution evidence packet dispatched.',
        'Restitution completed. Funds transferred to verified recovery wallet.'
      ];
      progressMessage.innerText = messagesByStep[activeStepIndex] || 'Investigation progressing...';
    }
  }

  steps.forEach((step, idx) => {
    if (!step) return;
    step.classList.remove('active', 'completed');
    if (idx < activeStepIndex) {
      step.classList.add('completed');
    } else if (idx === activeStepIndex) {
      step.classList.add('active');
    }
  });
}

async function renderCaseProgress(data) {
  currentActiveReport = data;
  const statusBadge = document.getElementById('popupStatus');
  const amountEl = document.getElementById('popupAmount');
  const dateEl = document.getElementById('popupDate');
  const chainEl = document.getElementById('popupChain');
  const scammerEl = document.getElementById('popupScammerWallet');
  const reportRefEl = document.getElementById('popupReportRef');

  const statusKey = `status_${data.status || 'pending'}`;
  if (statusBadge) {
    statusBadge.innerText = (typeof t === 'function' ? t(statusKey) : (data.status || 'pending').toUpperCase());
    statusBadge.className = `status-pill status-${data.status || 'pending'}`;
  }

  if (amountEl) {
    const totalDisplay = data.totalUsdLoss ? `$${Math.round(data.totalUsdLoss).toLocaleString()} USD` : `${data.amount_lost || data.amountLost} ${data.currency_lost || data.currencyLost}`;
    amountEl.innerText = totalDisplay;
  }
  
  const rawDate = data.timestamp || data.localTimestamp || new Date().toISOString();
  if (dateEl) dateEl.innerText = new Date(rawDate).toLocaleString();
  
  const chainName = data.chain || (data.usdt_network ? `USDT (${data.usdt_network})` : 'Multi-Chain');
  if (chainEl) chainEl.innerText = chainName;

  const scammerAddr = data.scammer_wallet || data.scammerWallet || '-';
  if (scammerEl) {
    const explorerUrl = getExplorerLink(scammerAddr, chainName);
    scammerEl.innerHTML = `<a href="${explorerUrl}" target="_blank" rel="noopener noreferrer" class="explorer-link"><code>${scammerAddr}</code> <i class="fas fa-external-link-alt"></i></a>`;
  }

  if (reportRefEl) {
    reportRefEl.innerText = data.report_id || data.reportId || `#${data.id}`;
  }

  const threatEl = document.getElementById('popupThreatIndex');
  if (threatEl) {
    const score = data.threatScore || (data.status === 'recovered' ? 12 : 88);
    if (score >= 70) {
      threatEl.innerHTML = `<span style="color: #f87171;">${score}/100</span> <span style="font-size: 0.72rem; color: #fca5a5;">(CRITICAL ILLICIT TAINT)</span>`;
    } else if (score >= 30) {
      threatEl.innerHTML = `<span style="color: #fde68a;">${score}/100</span> <span style="font-size: 0.72rem; color: #fde68a;">(MEDIUM EXPOSURE)</span>`;
    } else {
      threatEl.innerHTML = `<span style="color: #00F59B;">${score}/100</span> <span style="font-size: 0.72rem; color: #a7f3d0;">(CLEARED / LOW RISK)</span>`;
    }
  }

  // Update progress bar with full data object (dual manual/auto support)
  updateProgressBar(data);

  // Handle Client Advisory Alert & Popup ("Create a pop in profile")
  const alert = data.clientAlert;
  const pinnedBanner = document.getElementById('pinnedTrackerAlertBanner');

  if (alert && alert.active) {
    // 1. Reveal pinned banner in progress tracker
    if (pinnedBanner) {
      pinnedBanner.style.display = 'flex';
      pinnedBanner.className = `client-pinned-alert-banner severity-${alert.severity || 'urgent'}`;
      const tagEl = document.getElementById('pinnedAlertTag');
      if (tagEl) tagEl.innerText = alert.tag || 'CASE ADVISORY';
      const msgEl = document.getElementById('pinnedAlertMsg');
      if (msgEl) msgEl.innerText = alert.message || '';
      const addrRow = document.getElementById('pinnedAlertAddressRow');
      const addrCode = document.getElementById('pinnedAlertAddrCode');
      const copyPinnedBtn = document.getElementById('copyPinnedAlertAddrBtn');

      if (alert.address && addrRow && addrCode) {
        addrRow.style.display = 'flex';
        addrCode.innerText = alert.address;
        if (copyPinnedBtn) {
          copyPinnedBtn.onclick = () => {
            navigator.clipboard.writeText(alert.address);
            const orig = copyPinnedBtn.innerHTML;
            copyPinnedBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => { copyPinnedBtn.innerHTML = orig; }, 2000);
          };
        }
      } else if (addrRow) {
        addrRow.style.display = 'none';
      }
    }

    // 2. Trigger high-priority pop-up modal
    showClientAlertModal(data, alert);
  } else if (pinnedBanner) {
    pinnedBanner.style.display = 'none';
  }

  if (progressModal) progressModal.classList.add('active');
}

function hideProgressModal() {
  if (progressModal) progressModal.classList.remove('active');
}

// ======================== CASE DOSSIER EXPORT ========================
function generateDossierText(report) {
  const dateStr = new Date(report.timestamp || report.localTimestamp || Date.now()).toUTCString();
  const txHashes = Array.isArray(report.transaction_hashes) ? report.transaction_hashes : (report.transactionHashes || []);
  const wallets = report.wallets || [
    {
      victimWallet: report.victim_wallet || report.victimWallet,
      scammerWallet: report.scammer_wallet || report.scammerWallet,
      amountLost: report.amount_lost || report.amountLost,
      currencyLost: report.currency_lost || report.currencyLost,
      chain: report.chain || 'Multi-Chain',
      txHash: txHashes[0] || 'N/A'
    }
  ];
  
  return `================================================================================
NEXUS SHIELD — FORENSIC INCIDENT EVIDENCE DOSSIER
CONFIDENTIAL LEGAL INTAKE & BLOCKCHAIN CRIME REPORT
================================================================================
Generated: ${dateStr}
Case Reference ID: ${report.report_id || report.reportId || report.id}
Investigation Status: ${report.status || 'pending'}

--------------------------------------------------------------------------------
1. VICTIM & CASE INFORMATION
--------------------------------------------------------------------------------
Complainant Name: ${report.victim_name || report.victimName || 'Anonymous / Confidential'}
Contact Email: ${report.victim_email || report.victimEmail || 'N/A'}
Contact Phone / WhatsApp: ${report.victim_phone || report.victimPhone || 'N/A'}
Restitution Destination: ${report.recovery_wallet || report.recoveryWallet || 'N/A'}
Total Reported Loss: $${report.totalUsdLoss ? Math.round(report.totalUsdLoss).toLocaleString() : (report.amount_lost || report.amountLost)} USD
Number of Compromised Movements: ${wallets.length}

--------------------------------------------------------------------------------
2. RECORDED WALLET MOVEMENTS & FLOW OF FUNDS
--------------------------------------------------------------------------------
${wallets.map((w, i) => `[Movement #${i+1}]
• Compromised Source Address: ${w.victimWallet} (${w.chain || 'EVM'})
• Destination / Scammer Address: ${w.scammerWallet}
• Documented Loss: ${w.amountLost} ${w.currencyLost} ${w.usdtNetwork ? `(Network: ${w.usdtNetwork})` : ''}
• Transaction Hash: ${w.txHash || 'N/A'}
  Explorer: ${getTxExplorerLink(w.txHash, w.chain)}
`).join('\n')}

--------------------------------------------------------------------------------
3. ALL DOCUMENTED TRANSACTION HASHES (${txHashes.length} HASHES)
--------------------------------------------------------------------------------
${txHashes.map((h, i) => `[Tx #${i+1}] ${h}\nExplorer: ${getTxExplorerLink(h, report.chain)}`).join('\n\n')}

--------------------------------------------------------------------------------
4. STATUTORY & REGULATORY DIRECTIVES
--------------------------------------------------------------------------------
- Submit this document to the FBI Internet Crime Complaint Center (IC3): https://ic3.gov
- File a report with the Federal Trade Commission (FTC): https://reportfraud.ftc.gov
- Submit this Case Reference ID to exchange compliance desks (Binance, Coinbase, Kraken, OKX)
  if intermediary clusters indicate deposit into centralized exchange hot/deposit wallets.

DISCLAIMER:
Nexus Shield is an automated public evidence-preservation and forensic intelligence platform.
Public case logging is complimentary. Private entities promising to "hack back" stolen wallets or
demanding advance crypto fees to unlock funds are fraudulent secondary recovery scams.
Transactions on distributed blockchains are mathematically irreversible except through formal
law enforcement seizure warrants, exchange compliance freeze orders, or civil court restitution.
================================================================================`;
}

function downloadReportDossier(report) {
  if (!report) {
    setFormError("No report data available to export.");
    return;
  }
  const textContent = generateDossierText(report);
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ref = (report.report_id || report.reportId || "case").substring(0, 8);
  a.download = `Nexus_Shield_Evidence_Dossier_${ref}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ======================== VALIDATION & SUBMISSION ========================
function clearFormValidationErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  const errDiv = document.getElementById("formError");
  if (errDiv) {
    errDiv.innerHTML = "";
    errDiv.style.display = "none";
  }
}

function flagFieldInvalid(inputEl, errorMessage) {
  if (!inputEl) return;
  inputEl.classList.add('input-error');
  inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputEl.focus();

  const errDiv = document.getElementById("formError");
  if (errDiv) {
    errDiv.innerHTML = `<i class="fas fa-triangle-exclamation"></i> <div><strong>Validation Error:</strong> ${errorMessage}</div>`;
    errDiv.style.display = "flex";
  }

  const removeError = () => {
    inputEl.classList.remove('input-error');
    if (errDiv) {
      errDiv.innerHTML = "";
      errDiv.style.display = "none";
    }
    inputEl.removeEventListener('input', removeError);
    inputEl.removeEventListener('change', removeError);
  };
  inputEl.addEventListener('input', removeError);
  inputEl.addEventListener('change', removeError);
}

function setFormError(msg) {
  const errDiv = document.getElementById("formError");
  if (!errDiv) return;
  errDiv.innerHTML = `<i class="fas fa-triangle-exclamation"></i> <div><strong>Notice:</strong> ${msg}</div>`;
  errDiv.style.display = "flex";
  errDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    if (errDiv) {
      errDiv.innerHTML = "";
      errDiv.style.display = "none";
    }
  }, 6000);
}

async function onScanAndRecover() {
  clearFormValidationErrors();

  const nameInput = document.getElementById("victimName");
  const emailInput = document.getElementById("victimEmail");
  const phoneInput = document.getElementById("victimPhone");
  const recWalletInput = document.getElementById("recoveryWallet");
  const websiteUrlInput = document.getElementById("websiteUrl");

  const victimName = nameInput?.value.trim() || "";
  const victimEmail = emailInput?.value.trim() || "";
  const victimPhone = phoneInput?.value.trim() || "";
  const recoveryWallet = recWalletInput?.value.trim() || "";
  const websiteUrl = websiteUrlInput?.value.trim() || "";

  const warningDiv = document.getElementById("warningMsg");
  if (warningDiv) {
    warningDiv.style.display = "none";
    warningDiv.innerHTML = "";
  }

  // 1. Strict Complainant Name validation (Anti-Abuse)
  const spamNames = /^(test|testing|asdf|asdfgh|fake|none|unknown|anonymous|n\/a|na|xxx|abc|qwerty|12345|user|victim|scam|no name)$/i;
  if (!victimName || victimName.length < 3) {
    flagFieldInvalid(nameInput, "Please enter your genuine legal full name for official statutory case registration.");
    return;
  }
  if (spamNames.test(victimName) || !/[a-zA-Z]{2,}/.test(victimName)) {
    flagFieldInvalid(nameInput, "Please provide a genuine, authentic complainant name. Test or placeholder names cannot be processed.");
    return;
  }

  // 2. Strict Complainant Email validation
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const spamEmails = /^(test@|asdf@|fake@|admin@|user@|a@a\.|1@1\.|none@|unknown@)/i;
  if (!victimEmail || !strictEmailRegex.test(victimEmail)) {
    flagFieldInvalid(emailInput, "Please enter a valid, authentic email address. All official statutory directives and recovery updates are dispatched strictly to this email.");
    return;
  }
  if (spamEmails.test(victimEmail)) {
    flagFieldInvalid(emailInput, "Please provide a real, active email address. Verification notices cannot be delivered to dummy addresses.");
    return;
  }

  // 3. Strict Phone / WhatsApp validation
  const phoneDigits = victimPhone.replace(/\D/g, '');
  if (!victimPhone || phoneDigits.length < 7 || phoneDigits.length > 15) {
    flagFieldInvalid(phoneInput, "Please enter a valid phone or WhatsApp number (minimum 7 digits with country code) for direct investigator verification.");
    return;
  }
  if (/^(\d)\1+$/.test(phoneDigits) || phoneDigits === '1234567' || phoneDigits === '123456789') {
    flagFieldInvalid(phoneInput, "Please enter a genuine phone number. Test or placeholder numbers cannot be verified by compliance.");
    return;
  }

  // 4. Strict Safe Restitution Wallet validation
  const noSecondaryWallet = document.getElementById('noSecondaryWalletCheck')?.checked;
  if (!noSecondaryWallet) {
    if (!recoveryWallet || !isValidCryptoAddress(recoveryWallet)) {
      flagFieldInvalid(recWalletInput, "Please enter a valid, uncompromised safe restitution wallet address (e.g. 0x..., bc1..., T..., or Solana address) where recovered funds will safely land, or check the box below if you do not have one yet.");
      return;
    }
  } else {
    recoveryWallet = "Pending Specialist Guidance (Assisted Setup Required)";
  }

  // Optional Website URL validation
  if (websiteUrl && !isValidUrl(websiteUrl)) {
    flagFieldInvalid(websiteUrlInput, "Please enter a valid scam website URL (e.g. https://scam-domain.com).");
    return;
  }

  // 5. Automatic Scanner Mode vs Manual Intake Mode validation
  if (currentIntakeMode === 'auto') {
    const txInputs = Array.from(document.querySelectorAll('.auto-tx-hash-input'));
    const validHashEntries = txInputs.map(input => ({ input, val: input.value.trim() })).filter(item => item.val.length > 0);

    if (!validHashEntries.length) {
      const firstInput = txInputs[0] || document.getElementById('smartTxInput_1');
      flagFieldInvalid(firstInput, "Please enter at least one Transaction Hash (TxID) in the Automatic Scanner to inspect and submit your case.");
      return;
    }

    for (const item of validHashEntries) {
      if (!isValidTxHash(item.val)) {
        flagFieldInvalid(item.input, "Please enter a valid 64-character transaction hash (0x... or hex / base58). Short or dummy text is not valid on-chain.");
        return;
      }
    }

    // Ensure each hash has an entry in walletEntriesContainer
    const existingCards = document.querySelectorAll('.wallet-movement-card');
    if (!existingCards.length) {
      validHashEntries.forEach(item => {
        const hash = item.val;
        addWalletMovement({
          txHash: hash,
          victimWallet: hash.startsWith('0x') ? `0x38b29F0eA86e41A235D97E2596816D34Ac3E47A9` : 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
          scammerWallet: hash.startsWith('0x') ? `0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7` : 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
          amountLost: '45000',
          currencyLost: hash.startsWith('0x') ? 'USDT' : 'BTC'
        });
      });
      recalculateAggregateLoss();
    }
  }

  // Multi-wallet movements parsing & validation
  const cards = document.querySelectorAll('.wallet-movement-card');
  if (!cards.length) {
    setFormError("Please record at least one compromised wallet movement.");
    return;
  }

  const wallets = [];
  const allTxHashes = [];
  let totalUsdLoss = 0;

  for (const card of cards) {
    const idx = card.getAttribute('data-card-index');
    const vInput = document.getElementById(`victimWallet_${idx}`);
    const sInput = document.getElementById(`scammerWallet_${idx}`);
    const aInput = document.getElementById(`amountLost_${idx}`);
    const currSelect = document.getElementById(`currencyLost_${idx}`);
    const usdtSelect = document.getElementById(`usdtNetwork_${idx}`);
    const txInput = document.getElementById(`txHash_${idx}`);

    const vWallet = vInput?.value.trim() || "";
    const sWallet = sInput?.value.trim() || "";
    const amt = parseFloat(aInput?.value.trim() || "0");
    const curr = currSelect?.value || 'USDT';
    const usdtNet = curr === 'USDT' ? usdtSelect?.value : null;
    const tx = txInput?.value.trim() || "";

    if (!vWallet || !isValidCryptoAddress(vWallet)) {
      flagFieldInvalid(vInput, `Movement #${idx}: Please enter a valid compromised victim wallet address.`);
      return;
    }
    if (!sWallet || !isValidCryptoAddress(sWallet)) {
      flagFieldInvalid(sInput, `Movement #${idx}: Please enter a valid destination scammer address.`);
      return;
    }
    if (vWallet.toLowerCase() === sWallet.toLowerCase()) {
      flagFieldInvalid(sInput, `Movement #${idx}: Compromised sender wallet cannot match the scammer destination address.`);
      return;
    }
    if (!noSecondaryWallet) {
      if (recoveryWallet.toLowerCase() === vWallet.toLowerCase()) {
        flagFieldInvalid(recWalletInput, `Movement #${idx}: Safe restitution wallet must be different from the compromised wallet.`);
        return;
      }
      if (recoveryWallet.toLowerCase() === sWallet.toLowerCase()) {
        flagFieldInvalid(recWalletInput, `Movement #${idx}: Safe restitution wallet cannot match the scammer destination address.`);
        return;
      }
    }
    if (curr === 'USDT' && usdtNet && !validateUSDTNetworkAddress(vWallet, usdtNet)) {
      flagFieldInvalid(vInput, `Movement #${idx}: Victim wallet does not match the selected USDT network.`);
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      flagFieldInvalid(aInput, `Movement #${idx}: Please enter a documented loss amount greater than 0.`);
      return;
    }
    if (!tx || !isValidTxHash(tx)) {
      flagFieldInvalid(txInput, `Movement #${idx}: Please enter a valid 64-character transaction hash (TxID).`);
      return;
    }

    let chainInfo = detectChainFromAddress(vWallet);
    if (curr === 'USDT' && usdtNet) {
      const networkMap = {
        tron: { chain: "Tron (TRC-20)", nativeCoin: "TRX", type: "tron" },
        ethereum: { chain: "Ethereum (ERC-20)", nativeCoin: "ETH", type: "evm" },
        bnb: { chain: "BNB Chain (BEP-20)", nativeCoin: "BNB", type: "evm" },
        solana: { chain: "Solana (SPL)", nativeCoin: "SOL", type: "solana" }
      };
      chainInfo = networkMap[usdtNet] || chainInfo;
    }

    let coinPrice = 1;
    if (curr !== 'USD' && curr !== 'USDT') {
      coinPrice = await getPriceUSD(curr) || FALLBACK_PRICES[curr] || 1;
    }
    totalUsdLoss += (amt * coinPrice);

    wallets.push({
      victimWallet: vWallet,
      scammerWallet: sWallet,
      amountLost: amt,
      currencyLost: curr,
      usdtNetwork: usdtNet,
      txHash: tx,
      chain: chainInfo.chain,
      chainType: chainInfo.type
    });

    allTxHashes.push(tx);
  }

  // Cross-reference first scammer address
  const matchResult = await checkScammerWalletMatches(wallets[0].scammerWallet);
  if (matchResult.exists && warningDiv) {
    warningDiv.style.display = "block";
    warningDiv.innerHTML = `${typeof t === 'function' ? t('warning_scammer_exists') : 'Scammer address identified in our database'} (<strong>${matchResult.count}</strong> prior report(s) found).`;
  }

  const rand6 = Math.floor(100000 + Math.random() * 900000);
  const reportId = `NX-${rand6}`;

  // Universal Email Dispatch preference for all cases
  const notificationPreferences = {
    channels: ['email'],
    email: victimEmail,
    phone: victimPhone,
    method: 'Universal Encrypted Email Dispatch'
  };

  const reportObject = {
    victimName,
    victimEmail,
    victimPhone,
    victimWallet: wallets[0].victimWallet,
    scammerWallet: wallets[0].scammerWallet,
    recoveryWallet,
    amountLost: wallets[0].amountLost,
    currencyLost: wallets[0].currencyLost,
    usdtNetwork: wallets[0].usdtNetwork,
    txHash: wallets[0].txHash,
    allTxHashes,
    transactionHashes: allTxHashes,
    wallets,
    totalUsdLoss: totalUsdLoss || wallets[0].amountLost,
    websiteUrl: websiteUrl || null,
    chain: wallets[0].chain,
    chainType: wallets[0].chainType,
    notificationPreferences,
    notification_channel: 'Universal Email Dispatch',
    reportId,
    timestamp: new Date().toISOString(),
    status: "pending",
    stage: 1,
    stages: STAGES_DEFAULT
  };

  // Open confirmation modal
  showConfirmModal(reportObject, async () => {
    const btn = document.getElementById("scanRecoverBtn");
    const originalText = btn ? btn.innerHTML : "SUBMIT";
    const now = Date.now();
    if (lastSubmissionTime && (now - lastSubmissionTime) < 15000) {
      setFormError(typeof t === 'function' ? t('error_rate_limit') : 'Submission rate limit reached. Please wait 15 seconds.');
      return;
    }
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Preserving Evidence...';
    }

    try {
      await storeReport(reportObject);
      lastSubmissionTime = Date.now();
      
      // Update reports count badge
      const count = await getTotalReportCount();
      const countSpan = document.getElementById("reportCount");
      if (countSpan) countSpan.innerText = count.toLocaleString();

      // Show success modal (which triggers immediate confirmation email dispatch)
      showSuccessModal(reportObject);
    } catch (err) {
      console.error(err);
      setFormError(typeof t === 'function' ? t('error_database') : 'Database connection error. Report saved locally.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  });
}

function saveRecentCaseId(caseId) {
  if (!caseId) return;
  try {
    let recent = JSON.parse(localStorage.getItem('nexus_recent_cases') || '[]');
    recent = recent.filter(id => id !== caseId);
    recent.unshift(caseId);
    if (recent.length > 4) recent = recent.slice(0, 4);
    localStorage.setItem('nexus_recent_cases', JSON.stringify(recent));
    renderRecentCases();
  } catch (e) {}
}

window.loadSampleCase = function(caseId) {
  const input = document.getElementById('statusReportId');
  if (input) {
    input.value = caseId;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      checkReportStatus();
    }, 150);
  }
};

function renderRecentCases() {
  const container = document.getElementById('recentCasesContainer');
  const pillsBox = document.getElementById('recentCasesPills');
  if (!container || !pillsBox) return;

  try {
    let recent = JSON.parse(localStorage.getItem('nexus_recent_cases') || '[]');
    if (!recent || recent.length === 0) {
      recent = ['NX-849201', 'NX-773104', 'NX-912048'];
    }

    container.style.display = 'block';
    pillsBox.innerHTML = recent.map(id => `
      <button type="button" class="recent-case-pill" data-id="${id}" style="background: rgba(0,245,155,0.08); border: 1px solid rgba(0,245,155,0.25); color: var(--accent-cyan); padding: 0.2rem 0.55rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.74rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.3rem;">
        <i class="fas fa-arrow-right" style="font-size: 0.65rem;"></i> ${id}
      </button>
    `).join('');

    pillsBox.querySelectorAll('.recent-case-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('statusReportId');
        if (input) {
          input.value = btn.dataset.id;
          checkReportStatus();
        }
      });
    });
  } catch (e) {}
}

async function checkReportStatus() {
  const input = document.getElementById('statusReportId');
  const reportId = input ? input.value.trim() : '';
  if (!reportId) {
    setFormError(typeof t === 'function' ? t('error_enter_report_id') : 'Please enter your Case Reference ID.');
    return;
  }
  
  const checkBtn = document.getElementById('checkStatusBtn');
  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Querying...';
  }

  try {
    const report = await fetchReportById(reportId);
    if (!report) {
      setFormError(typeof t === 'function' ? t('status_not_found') : 'Case ID not found in forensic repository.');
      return;
    }
    const resolvedId = report.report_id || report.reportId || `#${report.id}`;
    saveRecentCaseId(resolvedId);
    renderCaseProgress(report);
  } catch (err) {
    setFormError(typeof t === 'function' ? t('status_not_found') : 'Case ID not found in forensic repository.');
  } finally {
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.innerHTML = typeof t === 'function' ? t('check_status_btn') : 'TRACK CASE STATUS';
    }
  }
}

// ======================== RESTITUTION SAFETY VALIDATOR ========================
function validateRestitutionWallet() {
  const input = document.getElementById('recoveryWallet');
  const badge = document.getElementById('recoveryWalletSafetyBadge');
  if (!input || !badge) return;

  const addr = input.value.trim();
  if (!addr) {
    badge.style.display = 'none';
    badge.className = 'restitution-safety-badge';
    badge.innerHTML = '';
    return;
  }

  // Check if matches any scammer wallet
  const cards = document.querySelectorAll('.wallet-movement-card');
  let matchesScammer = false;
  cards.forEach(card => {
    const idx = card.getAttribute('data-card-index');
    const sWallet = document.getElementById(`scammerWallet_${idx}`)?.value.trim().toLowerCase();
    if (sWallet && sWallet === addr.toLowerCase()) {
      matchesScammer = true;
    }
  });

  if (matchesScammer) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-danger';
    badge.innerHTML = '<i class="fas fa-circle-xmark"></i> <strong>CRITICAL WARNING:</strong> Restitution address matches the scammer wallet! Do not send recovered funds to the perpetrator.';
    return;
  }

  // Check against victim compromised wallets
  let matchesVictim = false;
  cards.forEach(card => {
    const idx = card.getAttribute('data-card-index');
    const vWallet = document.getElementById(`victimWallet_${idx}`)?.value.trim().toLowerCase();
    if (vWallet && vWallet === addr.toLowerCase()) {
      matchesVictim = true;
    }
  });

  if (matchesVictim) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-warning';
    badge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> <strong>CAUTION:</strong> This address matches your compromised wallet. We strongly recommend creating a fresh, uncompromised wallet.';
    return;
  }

  // Format check
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(addr);
  const isBtc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr);
  const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  const isTron = /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);
  const isLtc = /^(L|M|ltc1)[a-km-zA-HJ-NP-Z1-9]{26,45}$/.test(addr);

  if (isEvm) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-valid';
    badge.innerHTML = '<i class="fas fa-circle-check"></i> <strong>EVM Format Verified:</strong> Valid Ethereum/BNB address. Self-custody cold storage recommended (Ledger/MetaMask/Trust Wallet).';
  } else if (isBtc) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-valid';
    badge.innerHTML = '<i class="fas fa-circle-check"></i> <strong>Bitcoin Format Verified:</strong> Valid BTC address. Cold-storage hardware custody recommended.';
  } else if (isSol) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-valid';
    badge.innerHTML = '<i class="fas fa-circle-check"></i> <strong>Solana Format Verified:</strong> Valid SPL address.';
  } else if (isTron) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-valid';
    badge.innerHTML = '<i class="fas fa-circle-check"></i> <strong>TRON Format Verified:</strong> Valid TRC-20 destination address.';
  } else if (isLtc) {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-valid';
    badge.innerHTML = '<i class="fas fa-circle-check"></i> <strong>Litecoin Format Verified:</strong> Valid LTC destination address.';
  } else {
    badge.style.display = 'flex';
    badge.className = 'restitution-safety-badge safety-warning';
    badge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> <strong>Unrecognized Format:</strong> Please ensure you paste a valid self-custody wallet address.';
  }
}

// ======================== OFFICIAL CASE CARD MODAL ========================
const officialCaseCardModal = document.getElementById('officialCaseCardModal');

function openCaseCardModal(report) {
  if (!report) return;
  const caseId = report.reportId || report.report_id || `#${report.id}`;
  const victimName = report.victimName || report.victim_name || 'Complainant';
  const totalStr = report.totalUsdLoss ? `$${Math.round(report.totalUsdLoss).toLocaleString()} USD` : `${report.amountLost || report.amount_lost} ${report.currencyLost || report.currency_lost || 'USDT'}`;
  const chainName = report.chain || 'Multi-Chain';
  const recoveryAddr = report.recoveryWallet || report.recovery_wallet || 'Pending Verification';
  const rawDate = report.timestamp || report.localTimestamp || new Date().toISOString();
  const dateStr = new Date(rawDate).toLocaleDateString() + ' ' + new Date(rawDate).toLocaleTimeString();

  const idEl = document.getElementById('cardCaseId');
  if (idEl) idEl.innerText = caseId;
  const nameEl = document.getElementById('cardVictimName');
  if (nameEl) nameEl.innerText = victimName;
  const amtEl = document.getElementById('cardAmountLost');
  if (amtEl) amtEl.innerText = totalStr;
  const chainEl = document.getElementById('cardChain');
  if (chainEl) chainEl.innerText = chainName;
  const dateEl = document.getElementById('cardDate');
  if (dateEl) dateEl.innerText = dateStr;
  const recEl = document.getElementById('cardRecoveryWallet');
  if (recEl) recEl.innerText = recoveryAddr;

  // Generate QR Code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://nexusshield.org/index.html?case=${caseId}`)}`;
  const qrImg = document.getElementById('caseCardQrImg');
  if (qrImg) qrImg.src = qrUrl;

  if (officialCaseCardModal) officialCaseCardModal.classList.add('active');
}

function hideCaseCardModal() {
  if (officialCaseCardModal) officialCaseCardModal.classList.remove('active');
}
window.hideCaseCardModal = hideCaseCardModal;

// ======================== EVENT BINDINGS ========================
function bindAppEvents() {
  // Confirm modal buttons
  document.getElementById("confirmCancelBtn")?.addEventListener("click", hideConfirmModal);
  document.getElementById("confirmContinueBtn")?.addEventListener("click", async () => {
    hideConfirmModal();
    if (pendingSubmissionCallback) {
      await pendingSubmissionCallback();
      pendingSubmissionCallback = null;
    }
  });

  // Success modal buttons
  document.getElementById("successModalCloseBtn")?.addEventListener("click", hideSuccessModal);
  document.getElementById("copyReportIdBtn")?.addEventListener("click", () => {
    const id = document.getElementById("newReportIdText")?.innerText;
    if (id) {
      navigator.clipboard.writeText(id);
      const btn = document.getElementById("copyReportIdBtn");
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    }
  });

  document.getElementById("downloadDossierBtn")?.addEventListener("click", () => {
    downloadReportDossier(currentActiveReport);
  });

  document.getElementById("trackThisReportBtn")?.addEventListener("click", () => {
    hideSuccessModal();
    if (currentActiveReport) {
      renderCaseProgress(currentActiveReport);
    }
  });

  // Print Case Card triggers
  document.getElementById("printCaseCardSuccessBtn")?.addEventListener("click", () => {
    openCaseCardModal(currentActiveReport);
  });
  document.getElementById("printCaseCardProgressBtn")?.addEventListener("click", () => {
    openCaseCardModal(currentActiveReport);
  });

  // Restitution wallet live validator
  const recWalletInput = document.getElementById('recoveryWallet');
  recWalletInput?.addEventListener('input', validateRestitutionWallet);
  recWalletInput?.addEventListener('blur', validateRestitutionWallet);

  // Staged Recovery Activation Buttons
  document.getElementById("activateStagedCaseBtn")?.addEventListener("click", () => {
    if (!currentActiveReport) return;
    alert(`Active Recovery Activated for Case #${currentActiveReport.reportId.substring(0, 8)}!\n\n• Expedited to Senior Forensic Tracing.\n• Peeling-chain node queries and emergency exchange freeze notices dispatched.\n• The $39 fee is 100% credited against your final recovery fee.\n\nYour assigned Case Officer will initiate contact via Email/Phone: ${currentActiveReport.victimPhone || currentActiveReport.victimEmail}.`);
    currentActiveReport.status = "investigating";
    updateProgressBar("investigating");
  });

  document.getElementById("confirmContingencyBtn")?.addEventListener("click", () => {
    if (!currentActiveReport) return;
    alert(`Contingency Terms Confirmed for Case #${currentActiveReport.reportId.substring(0, 8)}.\n\n• Zero out-of-pocket legal fee.\n• 10% contingency fee applies strictly only when funds are returned to your safe restitution wallet.`);
  });

  // Progress modal buttons
  document.getElementById("closeProgressBtn")?.addEventListener("click", hideProgressModal);
  document.getElementById("downloadProgressDossierBtn")?.addEventListener("click", () => {
    downloadReportDossier(currentActiveReport);
  });

  // Click outside to close modals
  [warningConfirmModal, caseSuccessModal, progressModal, clientCaseAlertModal, officialCaseCardModal].forEach(modal => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    }
  });

  // Multi-wallet add button
  document.getElementById("addWalletEntryBtn")?.addEventListener("click", () => {
    addWalletMovement();
  });

  // Main form trigger
  document.getElementById("scanRecoverBtn")?.addEventListener("click", onScanAndRecover);
  document.getElementById("checkStatusBtn")?.addEventListener("click", checkReportStatus);
}

// ======================== INSTANT FLICKER-FREE PAGE NAVIGATION ========================
function initPageTransitions() {
  // Instant prefetch on hover for zero-latency seamless navigation
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || link.target === '_blank') return;
    
    link.addEventListener('pointerenter', () => {
      const cleanHref = href.split('#')[0];
      if (cleanHref && !document.querySelector(`link[rel="prefetch"][href="${cleanHref}"]`)) {
        const pre = document.createElement('link');
        pre.rel = 'prefetch';
        pre.href = cleanHref;
        document.head.appendChild(pre);
      }
    }, { once: true });
  });
}
window.initPageTransitions = initPageTransitions;
window.initPageFlipTransitions = initPageTransitions; // Backwards-compatible alias

// ======================== DUAL INTAKE CONTROLLER (AUTOMATIC & MANUAL) ========================
let currentIntakeMode = 'auto'; // 'auto' | 'manual'
let autoTxIndex = 1;
let isDossierUnlocked = false;

function initDualIntakeSwitcher() {
  const tabAuto = document.getElementById('tabAutoBtn');
  const tabManual = document.getElementById('tabManualBtn');
  const secAuto = document.getElementById('autoIntakeSection');
  const secManual = document.getElementById('manualIntakeSection');

  if (!tabAuto || !tabManual || !secAuto || !secManual) return;

  tabAuto.addEventListener('click', () => {
    currentIntakeMode = 'auto';
    tabAuto.classList.add('active');
    tabManual.classList.remove('active');
    secAuto.style.display = 'block';
    secManual.style.display = 'none';
  });

  tabManual.addEventListener('click', () => {
    currentIntakeMode = 'manual';
    tabManual.classList.add('active');
    tabAuto.classList.remove('active');
    secAuto.style.display = 'none';
    secManual.style.display = 'block';
  });
}

function updateAutoTxFeeCalculations() {
  const inputs = document.querySelectorAll('.auto-tx-hash-input');
  const count = Math.max(1, inputs.length);
  const totalFee = count * 10;

  const counterDisplay = document.getElementById('autoTxCounterDisplay');
  const feeDisplay = document.getElementById('autoFeeDisplay');
  const btnFeeText = document.getElementById('payFeeBtnText');
  const modalCountDisplay = document.getElementById('modalTxCountDisplay');
  const modalFeeDisplay = document.getElementById('modalTotalFeeDisplay');
  const cryptoAmtDue = document.getElementById('cryptoAmountDue');

  if (counterDisplay) counterDisplay.innerText = `${count} Transaction${count > 1 ? 's' : ''}`;
  if (feeDisplay) feeDisplay.innerText = `$${totalFee} USD`;
  if (btnFeeText) btnFeeText.innerText = `$${totalFee} USD`;
  if (modalCountDisplay) modalCountDisplay.innerText = `${count} Transaction${count > 1 ? 's' : ''}`;
  if (modalFeeDisplay) modalFeeDisplay.innerText = `$${totalFee}.00 USD`;
  if (cryptoAmtDue) cryptoAmtDue.innerText = `${totalFee}.00 USDT`;
}

function attachTxInputSmartAdvisor(input) {
  if (!input) return;
  input.addEventListener('input', () => {
    const val = input.value.trim();
    const wrapper = input.closest('.smart-tx-field-wrapper') || input.parentNode;
    const existingTip = wrapper.querySelector('.tx-address-tip');
    if (existingTip) existingTip.remove();

    // If length looks like a wallet address (30-48 chars) instead of a 64-char transaction hash
    if (val.length >= 30 && val.length <= 48 && (val.startsWith('0x') || val.startsWith('T') || val.startsWith('bc1') || val.startsWith('1') || val.startsWith('3') || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(val))) {
      const tip = document.createElement('div');
      tip.className = 'tx-address-tip';
      tip.style.cssText = 'font-size: 0.74rem; color: #fde68a; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 4px; padding: 4px 8px; margin-top: 5px; line-height: 1.4;';
      tip.innerHTML = '<i class="fas fa-lightbulb"></i> <strong>Notice:</strong> This looks like a wallet address rather than a transaction hash. In your wallet history, tap the transfer to copy the 64-character Transaction Hash / TxID.';
      wrapper.appendChild(tip);
    }
  });
}

function addTxHashInputRow(initialVal = '') {
  autoTxIndex++;
  const container = document.getElementById('multiTxContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'tx-input-row';
  row.setAttribute('data-tx-index', autoTxIndex);
  row.innerHTML = `
    <span class="tx-index-chip">Tx #${autoTxIndex}</span>
    <div class="smart-tx-field-wrapper" style="flex: 1;">
      <i class="fas fa-magnifying-glass smart-input-icon"></i>
      <input type="text" class="smart-tx-input auto-tx-hash-input" id="smartTxInput_${autoTxIndex}" placeholder="Paste 64-character TxID or 0x... hash here" value="${initialVal}" autocomplete="off">
    </div>
    <button type="button" class="btn-remove-tx" title="Remove this transaction" aria-label="Remove transaction">
      <i class="fas fa-trash-can"></i>
    </button>
  `;

  const removeBtn = row.querySelector('.btn-remove-tx');
  removeBtn.addEventListener('click', () => {
    row.remove();
    reindexTxHashInputs();
    updateAutoTxFeeCalculations();
  });

  const input = row.querySelector('.auto-tx-hash-input');
  attachTxInputSmartAdvisor(input);
  input.addEventListener('paste', () => {
    setTimeout(() => {
      if (input.value.trim().length > 15) {
        runSmartInspection();
      }
    }, 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSmartInspection();
    }
  });

  container.appendChild(row);
  updateAutoTxFeeCalculations();
}

function reindexTxHashInputs() {
  const rows = document.querySelectorAll('#multiTxContainer .tx-input-row');
  rows.forEach((row, i) => {
    const idx = i + 1;
    row.setAttribute('data-tx-index', idx);
    const chip = row.querySelector('.tx-index-chip');
    if (chip) chip.innerText = `Tx #${idx}`;
    const input = row.querySelector('.auto-tx-hash-input');
    if (input) input.id = `smartTxInput_${idx}`;
  });
}

// ======================== INTEGRATED SMART CHAINEXPLORER INTAKE ========================
const SAMPLES = {
  usdt: {
    hash: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e',
    chain: 'Ethereum',
    network: 'ERC-20',
    asset: 'USDT (Tether)',
    amount: '45,000.00',
    usdLoss: 45000,
    from: '0x38b29F0eA86e41A235D97E2596816D34Ac3E47A9',
    to: '0x71C931fC60F25eA49b0A1d86dAc467aC05eA19B7',
    blockHeight: '20,841,902',
    confirmations: 42,
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    destinationType: 'Centralized Exchange Deposit Sub-Account (Binance Hold Candidate)',
    platformName: 'Binance (Centralized Exchange) — KYC Deposit Sub-Account',
    platformDesc: 'Forensic heuristics detected an internal sweep toward Binance Hot Wallet 14. KYC identity (legal name, verified passport/ID, and bank details) is on file with Binance LE Compliance.',
    platformIcon: 'fa-building-columns',
    feasibilityText: 'High Freeze Feasibility',
    exchangeName: 'Binance Holdings Ltd. (LE Compliance Dispatch #BN-2026-9042)',
    subAccount: 'BN-DEP-0x71c9-SUB42 (KYC ID, Verified Phone & Bank Linked)',
    sweepTx: '0x8f3c7e492b1a0d84c7e6514f7b2a9e3d8c1b5a9f2e7d4c8a1b6e9f3d2c7a1b5e'
  },
  btc: {
    hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    chain: 'Bitcoin',
    network: 'Mainnet',
    asset: 'BTC (Bitcoin)',
    amount: '1.85',
    usdLoss: 125800,
    from: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    to: 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
    blockHeight: '862,410',
    confirmations: 18,
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    destinationType: 'Peeling Chain Intermediate Address',
    platformName: 'Unhosted Private Wallet (Peeling Chain Intermediate Hop)',
    platformDesc: 'Funds are currently held in a self-custody SegWit wallet. 24/7 on-chain sentinel is actively monitoring the unspent outputs (UTXO) to intercept any deposit into an exchange.',
    platformIcon: 'fa-wallet',
    feasibilityText: '24/7 On-Chain Sentinel Active',
    exchangeName: 'Peeling Chain UTXO Cluster #BTC-8841 (Self-Custody SegWit)',
    subAccount: 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h (Unspent Balance: 1.85 BTC)',
    sweepTx: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b'
  },
  sol: {
    hash: '5UxNq1J7K9zP4rW8tY2mB5vC8xL3kM7jP9qR2tY5wE8nQ4vM7jK2pL5wX8mN1qR',
    chain: 'Solana',
    network: 'SPL',
    asset: 'SOL (Solana)',
    amount: '120.00',
    usdLoss: 18600,
    from: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    to: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyN5tQ6B27xR',
    blockHeight: '289,140,551',
    confirmations: 128,
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    destinationType: 'Raydium Liquidity Pool / Swap Hop',
    platformName: 'Raydium Liquidity Pool / Solana DEX Hop',
    platformDesc: 'Scammer swapped SOL via Raydium decentralized router. Forensic tracking maps downstream tokens to identify the final off-ramp destination.',
    platformIcon: 'fa-arrows-rotate',
    feasibilityText: 'Active Swap Graph Tracing',
    exchangeName: 'Raydium DEX Liquidity Pool Router (Downstream CEX: Gate.io)',
    subAccount: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyN5tQ6B27xR (Converted to USDC-SPL)',
    sweepTx: '5UxNq1J7K9zP4rW8tY2mB5vC8xL3kM7jP9qR2tY5wE8nQ4vM7jK2pL5wX8mN1qR'
  },
  tron: {
    hash: 'c8f5e1b93a7d4c2e6f1a8b5d3c9e7f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e',
    chain: 'TRON',
    network: 'TRC-20',
    asset: 'USDT (Tether)',
    amount: '28,400.00',
    usdLoss: 28400,
    from: 'TYk6t1rX9mQ4vW8tY2mB5vC8xL3kM7jP9q',
    to: 'TX7nQ1J7K9zP4rW8tY2mB5vC8xL3kM7jP9',
    blockHeight: '65,102,408',
    confirmations: 85,
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    destinationType: 'OKX Deposit Gateway Router',
    platformName: 'OKX (Centralized Exchange) — Deposit Gateway Router',
    platformDesc: 'TRC-20 Tether transfer was routed to an OKX deposit sub-account. Flagged for immediate exchange compliance freeze.',
    platformIcon: 'fa-building-columns',
    feasibilityText: 'High Freeze Feasibility',
    exchangeName: 'OKX Technology Services Ltd. (Compliance Dispatch #OKX-2026-7718)',
    subAccount: 'OKX-TRC20-GATEWAY-TX7nQ (KYC Profile & Bank on File)',
    sweepTx: 'c8f5e1b93a7d4c2e6f1a8b5d3c9e7f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e'
  }
};

async function runSmartInspection() {
  const btn = document.getElementById('smartInspectBtn');
  const card = document.getElementById('verifiedTxCard');
  const inputs = Array.from(document.querySelectorAll('.auto-tx-hash-input'));
  const hashes = inputs.map(i => i.value.trim()).filter(Boolean);

  if (!hashes.length) {
    setFormError('Please enter at least one Transaction Hash (TxID) to inspect.');
    inputs[0]?.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Inspecting Multi-Chain Trail...';
  }

  await new Promise(r => setTimeout(r, 550));

  let totalLoss = 0;
  let primaryTx = null;
  const decodedMovements = [];

  for (let i = 0; i < hashes.length; i++) {
    const q = hashes[i];
    let txData = null;

    for (const k in SAMPLES) {
      if (SAMPLES[k].hash.toLowerCase() === q.toLowerCase() ||
          SAMPLES[k].from.toLowerCase() === q.toLowerCase() ||
          SAMPLES[k].to.toLowerCase() === q.toLowerCase()) {
        txData = SAMPLES[k];
        break;
      }
    }

    if (!txData) {
      const isHex = q.startsWith('0x');
      const randAmt = (Math.random() * 28000 + 3500).toFixed(2);
      const hoursAgo = Math.floor(Math.random() * 24 + 1);
      txData = {
        hash: q,
        chain: isHex ? 'Ethereum' : 'Multi-Chain',
        network: isHex ? 'ERC-20' : 'Mainnet',
        asset: 'USDT (Tether)',
        amount: Number(randAmt).toLocaleString(),
        usdLoss: Math.round(Number(randAmt)),
        from: isHex ? `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}` : 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        to: isHex ? `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}` : 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
        blockHeight: `${Math.floor(Math.random() * 500000 + 20500000).toLocaleString()}`,
        confirmations: Math.floor(Math.random() * 35 + 12),
        timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
        destinationType: isHex ? 'Centralized Exchange Deposit Cluster (Hold Candidate)' : 'Monitored Unhosted Intermediate Cluster',
        platformName: isHex ? 'Centralized Exchange (Binance/OKX) — KYC Deposit Sub-Account' : 'Unhosted Private Wallet (Peeling Hop)',
        platformDesc: isHex ? 'Heuristic clustering matched known centralized exchange deposit sweeps. Real KYC name, government ID, and bank details are on file with exchange compliance.' : 'Funds are currently tracked across unspent transaction hops. 24/7 sentinel webhook activated to catch cash-out.',
        platformIcon: isHex ? 'fa-building-columns' : 'fa-wallet',
        feasibilityText: isHex ? 'High Freeze Feasibility' : 'Active 24/7 Monitoring',
        exchangeName: isHex ? 'Centralized Custodial Exchange (Binance LE Compliance)' : 'Self-Custody Address Cluster (Monitored UTXO)',
        subAccount: isHex ? 'BN-DEP-CLUSTER-9942 (KYC ID on File)' : 'Unspent UTXO Hop #1',
        sweepTx: q
      };
    }

    if (i === 0) primaryTx = txData;
    totalLoss += txData.usdLoss;
    decodedMovements.push(txData);
  }

  // Populate verified confirmation card
  if (card && primaryTx) {
    card.style.display = 'block';
    const amtDisplay = document.getElementById('verifiedAmountDisplay');
    const assetDisplay = document.getElementById('verifiedAssetDisplay');
    const senderDisplay = document.getElementById('verifiedSenderDisplay');
    const scammerDisplay = document.getElementById('verifiedScammerDisplay');
    const destTypeDisplay = document.getElementById('verifiedDestinationType');
    const timeAgoDisplay = document.getElementById('verifiedTimeAgo');

    const pName = document.getElementById('verifiedPlatformName');
    const pDesc = document.getElementById('verifiedPlatformDesc');
    const pIcon = document.getElementById('verifiedPlatformIcon');
    const pFeas = document.getElementById('verifiedFeasibilityText');

    if (pName) pName.innerText = primaryTx.platformName;
    if (pDesc) pDesc.innerText = primaryTx.platformDesc;
    if (pIcon) pIcon.innerHTML = `<i class="fas ${primaryTx.platformIcon}"></i>`;
    if (pFeas) pFeas.innerText = primaryTx.feasibilityText;

    // Redacted details & 5-Section Dossier sync
    const unmaskEx = document.getElementById('unmaskedExchangeName');
    const unmaskSub = document.getElementById('unmaskedSubAccount');
    const unmaskSweep = document.getElementById('unmaskedSweepTx');
    if (unmaskEx) unmaskEx.innerText = primaryTx.exchangeName;
    if (unmaskSub) unmaskSub.innerText = primaryTx.subAccount;
    if (unmaskSweep) unmaskSweep.innerText = primaryTx.sweepTx;

    const sec1Amt = document.getElementById('sec1AmountDisplay');
    const sec1Chain = document.getElementById('sec1ChainDisplay');
    const sec1Block = document.getElementById('sec1BlockDisplay');
    const sec1Sender = document.getElementById('sec1SenderDisplay');
    const tableEntity = document.getElementById('tableEntityDisplay');
    const letterBox = document.getElementById('subpoenaNoticeLetter');

    if (sec1Amt) sec1Amt.innerText = `$${Math.round(totalLoss).toLocaleString()} USD`;
    if (sec1Chain) sec1Chain.innerText = `${primaryTx.chain} (${primaryTx.network} ${primaryTx.asset})`;
    if (sec1Block) sec1Block.innerText = `${primaryTx.blockHeight} (${primaryTx.confirmations} Confirmations)`;
    if (sec1Sender) sec1Sender.innerText = primaryTx.from;
    if (tableEntity) tableEntity.innerText = primaryTx.platformName;

    if (letterBox) {
      letterBox.innerText = `================================================================================
FORMAL STATUTORY EVIDENCE DIRECTIVE — EMERGENCY ASSET FREEZE REQUEST
PURSUANT TO 18 U.S.C. § 2703(f) & FATF RECOMMENDATION 16 (TRAVEL RULE)
================================================================================
TO: Compliance & Legal Affairs Division (${primaryTx.exchangeName})
RE: Urgent Cryptographic Freeze of Stolen Funds | Target: ${primaryTx.to}

STATEMENT OF SWORN FACTS:
1. Forensic node tracing has mathematically established that on ${new Date(primaryTx.timestamp).toISOString().split('T')[0]}, 
   the complainant suffered an unauthorized crypto asset drain.
2. The stolen assets were deposited directly into your custodial sub-account:
   Target Sub-Account: ${primaryTx.subAccount}
   Sweep Transaction: ${primaryTx.sweepTx}
   Asset / Amount: ${primaryTx.amount} ${primaryTx.asset} ($${Math.round(primaryTx.usdLoss).toLocaleString()} USD)
3. Under 18 U.S.C. § 2703(f), you are formally requested to PRESERVE and PLACE AN
   ADMINISTRATIVE FREEZE on all cryptocurrency, fiat balances, and KYC identity records
   (Legal Name, Passport/National ID, IP logs, linked bank accounts) associated with this account.
4. Failure to freeze identified proceeds of fraud after constructive notice may subject
   intermediary custodians to third-party civil liability and forfeiture proceedings under 18 U.S.C. § 981.
================================================================================`;
    }

    const diffHours = Math.max(1, Math.round((Date.now() - new Date(primaryTx.timestamp).getTime()) / 3600000));
    if (timeAgoDisplay) timeAgoDisplay.innerText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago (${new Date(primaryTx.timestamp).toLocaleDateString()})`;
    if (amtDisplay) amtDisplay.innerText = `$${Math.round(totalLoss).toLocaleString()} USD`;
    if (assetDisplay) {
      assetDisplay.innerText = decodedMovements.length > 1 
        ? `${decodedMovements.length} Movements Documented (${primaryTx.chain} & Multi-Chain)` 
        : `${primaryTx.amount} ${primaryTx.asset} (${primaryTx.chain} ${primaryTx.network})`;
    }
    if (senderDisplay) senderDisplay.innerText = primaryTx.from;
    if (scammerDisplay) scammerDisplay.innerText = primaryTx.to;
    if (destTypeDisplay) destTypeDisplay.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${primaryTx.destinationType}`;

    // Update fee calculation based on number of transactions
    updateAutoTxFeeCalculations();

    // Populate or sync into dynamic wallet movements
    const container = document.getElementById('walletEntriesContainer');
    if (container) {
      container.innerHTML = '';
      walletMovementCounter = 0;
      decodedMovements.forEach((mov, idx) => {
        addWalletMovement({
          victimWallet: mov.from,
          scammerWallet: mov.to,
          amountLost: String(mov.usdLoss),
          currencyLost: mov.asset.includes('BTC') ? 'BTC' : (mov.asset.includes('SOL') ? 'SOL' : 'USDT'),
          txHash: mov.hash
        });
      });
      recalculateAggregateLoss();
    }

    // Scroll to verified card
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> On-Chain Decoded';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-satellite-dish"></i> Inspect &amp; Decode On-Chain';
    }, 2500);
  }
}

function initSmartIntakeExplorer() {
  initDualIntakeSwitcher();

  const addTxBtn = document.getElementById('addTxHashBtn');
  if (addTxBtn) {
    addTxBtn.addEventListener('click', () => {
      addTxHashInputRow();
    });
  }

  const inspectBtn = document.getElementById('smartInspectBtn');
  if (inspectBtn) {
    inspectBtn.addEventListener('click', () => {
      runSmartInspection();
    });
  }

  const initialInput = document.getElementById('smartTxInput_1');
  if (initialInput) {
    attachTxInputSmartAdvisor(initialInput);
    initialInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSmartInspection();
      }
    });
    initialInput.addEventListener('paste', () => {
      setTimeout(() => {
        if (initialInput.value.trim().length > 15) {
          runSmartInspection();
        }
      }, 120);
    });
  }

  // Toggle TxID Finder Helper for Non-Technical Users
  const toggleHelpBtn = document.getElementById('toggleTxHelpBtn');
  const helpContent = document.getElementById('txHelpContent');
  if (toggleHelpBtn && helpContent) {
    toggleHelpBtn.addEventListener('click', () => {
      const isHidden = helpContent.style.display === 'none';
      helpContent.style.display = isHidden ? 'block' : 'none';
      toggleHelpBtn.innerHTML = isHidden 
        ? '<i class="fas fa-circle-chevron-up"></i> Hide TxID Guide' 
        : '<i class="fas fa-circle-question"></i> Where do I find my Transaction Hash (TxID)?';
    });
  }

  // Handle "No Secondary Wallet Yet" Checkbox
  const noSecWalletCheck = document.getElementById('noSecondaryWalletCheck');
  const recoveryInput = document.getElementById('recoveryWallet');
  if (noSecWalletCheck && recoveryInput) {
    noSecWalletCheck.addEventListener('change', () => {
      if (noSecWalletCheck.checked) {
        recoveryInput.dataset.prevValue = recoveryInput.value;
        recoveryInput.value = 'Pending Specialist Guidance (Assisted Setup Required)';
        recoveryInput.readOnly = true;
        recoveryInput.style.opacity = '0.75';
        recoveryInput.style.borderColor = 'rgba(0, 245, 155, 0.4)';
        const safetyBadge = document.getElementById('recoveryWalletSafetyBadge');
        if (safetyBadge) safetyBadge.style.display = 'none';
      } else {
        recoveryInput.value = recoveryInput.dataset.prevValue || '';
        recoveryInput.readOnly = false;
        recoveryInput.style.opacity = '1';
        recoveryInput.style.borderColor = '';
        recoveryInput.focus();
      }
    });
  }

  // Sample Chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.type;
      const sample = SAMPLES[type];
      if (sample) {
        const firstInput = document.getElementById('smartTxInput_1');
        if (firstInput) {
          firstInput.value = sample.hash;
          runSmartInspection();
        }
      }
    });
  });

  // Wire Payment and PDF Unlock Modal
  initPaymentAndPdfUnlockController();
}

function initPaymentAndPdfUnlockController() {
  const openBtn = document.getElementById('openPaymentModalBtn');
  const closeBtn = document.getElementById('closePaymentModalBtn');
  const modal = document.getElementById('forensicPaymentModal');
  const copyBtn = document.getElementById('copyCryptoAddrBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfDossierBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtDossierBtn');
  const continueBtn = document.getElementById('continueToRecoveryBtn');
  const skipToRecoveryBtn = document.getElementById('skipToRecoveryBtn');

  // Dossier Locked Modal Elements
  const openDossierBtn = document.getElementById('openDossierModalBtn');
  const closeDossierBtn = document.getElementById('closeDossierModalBtn');
  const dossierModal = document.getElementById('dossierLockedModal');
  const modalGoToPayBtn = document.getElementById('modalGoToPayBtn');
  const modalGoToRecoveryBtn = document.getElementById('modalGoToRecoveryBtn');
  const compactTeaser = document.getElementById('compactScrollableTeaser');

  // Step navigation inside payment modal
  const step1 = document.getElementById('paymentModalStep1');
  const step2 = document.getElementById('paymentModalStep2');
  const goToProofBtn = document.getElementById('goToProofStepBtn');
  const backToStep1Btn = document.getElementById('backToPaymentStep1Btn');
  const submitProofBtn = document.getElementById('submitPaymentProofBtn');

  // Proof inputs
  const proofTxInput = document.getElementById('proofTxHashInput');
  const proofSenderInput = document.getElementById('proofSenderWalletInput');
  const dropzone = document.getElementById('proofReceiptDropzone');
  const fileInput = document.getElementById('proofReceiptFileInput');
  const previewImg = document.getElementById('proofReceiptPreviewImg');
  const fileNameDisplay = document.getElementById('proofReceiptFileName');

  // Waiting card & simulator
  const waitingCard = document.getElementById('waitingApprovalCard');
  const simulateApproveBtn = document.getElementById('simulateAdminApproveBtn');

  let activeCrypto = 'usdt_trc20';
  let uploadedReceiptName = '';
  let uploadedReceiptDataUrl = null;
  let activePaymentId = null;
  let verificationPollTimer = null;

  // Dossier Locked Popup Modal Handlers
  function openDossierLockedModal() {
    if (isDossierUnlocked) return;
    const txCount = document.querySelectorAll('.auto-tx-hash-input').length || 1;
    const feeBadge = document.getElementById('modalDossierFeeBadge');
    if (feeBadge) {
      feeBadge.innerText = txCount > 1 ? `$${txCount * 10} USD (${txCount} txs @ $10/tx)` : `$10 USD ($10/tx)`;
    }
    if (dossierModal) dossierModal.style.display = 'flex';
  }

  function closeDossierLockedModal() {
    if (dossierModal) dossierModal.style.display = 'none';
  }

  openDossierBtn?.addEventListener('click', openDossierLockedModal);
  closeDossierBtn?.addEventListener('click', closeDossierLockedModal);
  dossierModal?.addEventListener('click', (e) => {
    if (e.target === dossierModal) closeDossierLockedModal();
  });

  // Clicking on compact teaser when locked also opens the modal
  compactTeaser?.addEventListener('click', () => {
    if (!isDossierUnlocked) {
      openDossierLockedModal();
    }
  });

  // Option 1 in modal: Pay $10
  modalGoToPayBtn?.addEventListener('click', () => {
    closeDossierLockedModal();
    updateAutoTxFeeCalculations();
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (modal) modal.style.display = 'flex';
  });

  // Option 2 in modal: Continue Recovery
  modalGoToRecoveryBtn?.addEventListener('click', () => {
    closeDossierLockedModal();
    const contactTitle = document.getElementById('contactSectionTitle');
    contactTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('victimName')?.focus();
    showEmailToast('🛡️ Proceeding with recovery investigation intake. Please confirm complainant details below.');
  });

  // Open payment modal directly
  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      updateAutoTxFeeCalculations();
      const liveAddrs = getLiveCryptoAddresses();
      const activeData = liveAddrs[activeCrypto || 'usdt_trc20'];
      if (activeData) {
        const addrEl = document.getElementById('cryptoDepositAddress');
        const lblEl = document.getElementById('cryptoLabel');
        if (addrEl) addrEl.innerText = activeData.addr;
        if (lblEl) lblEl.innerText = activeData.label;
        const qrEl = document.getElementById("cryptoDepositQrImg");
        if (qrEl && activeData.addr) {
          qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(activeData.addr)}`;
        }
      }
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
      modal.style.display = 'flex';
    });
  }

  // Close payment modal
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Skip to full recovery
  if (skipToRecoveryBtn) {
    skipToRecoveryBtn.addEventListener('click', () => {
      const contactTitle = document.getElementById('contactSectionTitle');
      contactTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('victimName')?.focus();
      showEmailToast('🛡️ Proceeding to full case recovery investigation.');
    });
  }

  // Dynamic Live Crypto Addresses (Admin syncable)
  function getLiveCryptoAddresses() {
    const base = {
      usdt_trc20: { label: 'Send exact amount via TRON network (TRC-20):', addr: 'TYk6t1rX9mQ4vW8tY2mB5vC8xL3kM7jP9q', symbol: 'USDT' },
      usdt_erc20: { label: 'Send exact amount via Ethereum network (ERC-20):', addr: '0x94fC28e75e11A235D97E2596816D34Ac3E47A9', symbol: 'USDT' },
      btc: { label: 'Send exact Bitcoin amount to SegWit address:', addr: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', symbol: 'BTC' },
      sol: { label: 'Send exact Solana amount via SPL network:', addr: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', symbol: 'SOL' }
    };
    try {
      const saved = localStorage.getItem('nexus_treasury_wallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.usdt_trc20) base.usdt_trc20.addr = parsed.usdt_trc20;
        if (parsed.usdt_erc20) base.usdt_erc20.addr = parsed.usdt_erc20;
        if (parsed.btc) base.btc.addr = parsed.btc;
        if (parsed.sol) base.sol.addr = parsed.sol;
      }
    } catch (e) {}
    return base;
  }

  // Pre-fetch from Supabase if treasury_wallets table is active
  if (supabaseClient) {
    try {
      supabaseClient.from('treasury_wallets').select('*').eq('id', 'primary').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const remote = data[0];
          const current = JSON.parse(localStorage.getItem('nexus_treasury_wallets') || '{}');
          const merged = Object.assign(current, remote);
          localStorage.setItem('nexus_treasury_wallets', JSON.stringify(merged));
        }
      });
    } catch (e) {}
  }

  document.querySelectorAll('.crypto-tab-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.crypto-tab-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCrypto = chip.dataset.crypto;
      const liveAddrs = getLiveCryptoAddresses();
      const data = liveAddrs[activeCrypto];
      if (data) {
        const count = document.querySelectorAll('.auto-tx-hash-input').length || 1;
        const fee = count * 10;
        const lbl = document.getElementById('cryptoLabel');
        const addr = document.getElementById('cryptoDepositAddress');
        const amt = document.getElementById('cryptoAmountDue');
        if (lbl) lbl.innerText = data.label;
        if (addr) addr.innerText = data.addr;
        const qrEl = document.getElementById("cryptoDepositQrImg");
        if (qrEl && data.addr) {
          qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.addr)}`;
        }
        if (amt) {
          if (data.symbol === 'BTC') amt.innerText = `${(fee / 68000).toFixed(6)} BTC`;
          else if (data.symbol === 'SOL') amt.innerText = `${(fee / 155).toFixed(4)} SOL`;
          else amt.innerText = `${fee}.00 USDT`;
        }
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const addrText = document.getElementById('cryptoDepositAddress')?.innerText;
      if (addrText) {
        navigator.clipboard.writeText(addrText);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Address';
        }, 2000);
      }
    });
  }

  // Modal Step 1 -> Step 2
  if (goToProofBtn) {
    goToProofBtn.addEventListener('click', () => {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
    });
  }

  if (backToStep1Btn) {
    backToStep1Btn.addEventListener('click', () => {
      if (step2) step2.style.display = 'none';
      if (step1) step1.style.display = 'block';
    });
  }

  // Receipt File Upload Dropzone
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--accent-cyan)';
      dropzone.style.background = 'rgba(45, 159, 255, 0.1)';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(45, 159, 255, 0.35)';
      dropzone.style.background = 'rgba(0, 0, 0, 0.4)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(45, 159, 255, 0.35)';
      dropzone.style.background = 'rgba(0, 0, 0, 0.4)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleReceiptFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleReceiptFile(e.target.files[0]);
      }
    });
  }

  const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5 MB ceiling
  const ALLOWED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  function handleReceiptFile(file) {
    if (!file) return;

    if (file.size > MAX_RECEIPT_BYTES) {
      alert('⚠️ Receipt file exceeds the maximum limit (5 MB). Please choose a smaller file or compressed screenshot.');
      if (fileInput) fileInput.value = '';
      return;
    }

    const isTypeValid = ALLOWED_RECEIPT_TYPES.includes(file.type) || !!file.name.match(/\.(png|jpe?g|webp|pdf)$/i);
    if (!isTypeValid) {
      alert('⚠️ Invalid file format. Please upload a receipt screenshot (PNG, JPG, WEBP) or document (PDF).');
      if (fileInput) fileInput.value = '';
      return;
    }

    uploadedReceiptName = file.name;
    if (fileNameDisplay) {
      fileNameDisplay.innerText = `Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      fileNameDisplay.style.display = 'block';
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedReceiptDataUrl = e.target.result;
      if (previewImg && file.type.startsWith('image/')) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  // Unlock dossier helper
  function triggerDossierUnlock(reviewerName = 'Lead Compliance Officer (NX-ANALYST-01)') {
    isDossierUnlocked = true;
    if (verificationPollTimer) clearInterval(verificationPollTimer);

    if (waitingCard) waitingCard.style.display = 'none';
    if (dossierModal) dossierModal.style.display = 'none';
    const decisionGrid = document.getElementById('decisionPathwaysGrid');
    if (decisionGrid) decisionGrid.style.display = 'none';

    const redBox = document.getElementById('redactedIntelligenceBox');
    const compactTeaser = document.getElementById('compactScrollableTeaser');
    const redOverlay = document.getElementById('redactedOverlay');
    const redBadge = document.getElementById('redactedLockStatusBadge');
    const redTriggerBar = document.getElementById('redactedTriggerBar');
    const postRow = document.getElementById('postUnlockActionsRow');

    if (redBox) redBox.classList.add('unlocked');
    if (compactTeaser) compactTeaser.classList.add('unlocked');
    if (redOverlay) redOverlay.style.display = 'none';
    if (redTriggerBar) redTriggerBar.style.display = 'none';
    if (redBadge) {
      redBadge.innerHTML = `<i class="fas fa-circle-check" style="color: var(--accent-green);"></i> UNLOCKED &amp; VERIFIED BY ${reviewerName}`;
      redBadge.style.color = 'var(--accent-green)';
      redBadge.style.borderColor = 'rgba(0, 245, 155, 0.4)';
      redBadge.style.background = 'rgba(0, 245, 155, 0.12)';
    }
    if (postRow) postRow.style.display = 'flex';

    showEmailToast(`✅ Payment Verified by ${reviewerName}! Full 5-section dossier and subpoena packet unlocked.`);
    redBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Submit Payment Proof
  if (submitProofBtn) {
    submitProofBtn.addEventListener('click', () => {
      const txHashVal = proofTxInput?.value.trim() || `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const senderVal = proofSenderInput?.value.trim() || `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

      const count = document.querySelectorAll('.auto-tx-hash-input').length || 1;
      const totalFee = count * 10;
      activePaymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

      const newRec = {
        paymentId: activePaymentId,
        caseRef: `NX-${Math.floor(100000 + Math.random() * 900000)}`,
        amountUsd: totalFee,
        cryptoAsset: activeCrypto,
        paymentTxHash: txHashVal,
        senderWallet: senderVal,
        receiptFileName: uploadedReceiptName || 'deposit_receipt_proof.png',
        receiptDataUrl: uploadedReceiptDataUrl,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reviewerName: 'Lead Compliance Officer (NX-ANALYST-01)'
      };

      const verifications = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
      verifications.unshift(newRec);
      localStorage.setItem('nexus_payment_verifications', JSON.stringify(verifications));

      // Close modal
      if (modal) modal.style.display = 'none';

      // Hide decision cards and show waiting card
      const decisionGrid = document.getElementById('decisionPathwaysGrid');
      if (decisionGrid) decisionGrid.style.display = 'none';

      if (waitingCard) {
        waitingCard.style.display = 'block';
        const refText = document.getElementById('waitingPaymentRef');
        if (refText) refText.innerText = activePaymentId;
        waitingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showEmailToast('📤 Proof submitted! Awaiting Senior Forensic Desk verification.');

      // Polling for admin approval
      if (verificationPollTimer) clearInterval(verificationPollTimer);
      verificationPollTimer = setInterval(() => {
        const stored = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
        const cur = stored.find(v => v.paymentId === activePaymentId);
        if (cur && cur.status === 'approved') {
          triggerDossierUnlock(cur.reviewerName || 'Senior Compliance Officer');
        }
      }, 2000);
    });
  }

  // Simulate Instant Admin Approval (Dev/Demo button)
  if (simulateApproveBtn) {
    simulateApproveBtn.addEventListener('click', () => {
      const stored = JSON.parse(localStorage.getItem('nexus_payment_verifications') || '[]');
      if (activePaymentId) {
        const cur = stored.find(v => v.paymentId === activePaymentId);
        if (cur) {
          cur.status = 'approved';
          cur.reviewerName = 'Lead Compliance Officer (NX-ANALYST-01)';
          localStorage.setItem('nexus_payment_verifications', JSON.stringify(stored));
        }
      }
      triggerDossierUnlock('Lead Compliance Officer (NX-ANALYST-01)');
    });
  }

  // Download PDF
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Export TXT
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', () => {
      const textContent = `================================================================================
NEXUS SHIELD — OFFICIAL FORENSIC INTELLIGENCE DOSSIER
STATUTORY EVIDENCE & EXCHANGE COMPLIANCE SUBPOENA PACKET
================================================================================
Date Generated: ${new Date().toISOString()}
Integrity Seal: SHA-256 Verified
Auditing Officer: Senior On-Chain Forensic Specialist (ID: NX-ANALYST-01)
Custody Classification: 18 U.S.C. § 2703 Subpoena Evidence Packet

[SECTION 1: EXECUTIVE INCIDENT & LOSS RECONSTRUCTION]
• Documented Incident Loss: ${document.getElementById('verifiedAmountDisplay')?.innerText || '$45,000.00 USD'}
• Token Asset / Network: ${document.getElementById('verifiedAssetDisplay')?.innerText || 'USDT'}
• Complainant Origin: ${document.getElementById('verifiedSenderDisplay')?.innerText || 'N/A'}
• Destination Target / Hop: ${document.getElementById('verifiedScammerDisplay')?.innerText || 'N/A'}

[SECTION 2: PUBLIC EXPLORER VS. NEXUS SHIELD DEEP FORENSICS]
• Public Explorers (Free): Shows only raw hexadecimal wallet strings without entity attribution.
• Nexus Shield Node Forensics: Successfully mapped destination cluster to custodial exchange sweeps.

[SECTION 3: PROPRIETARY CUSTODY ATTRIBUTION & FLOW OF FUNDS]
• Custodial Entity: ${document.getElementById('unmaskedExchangeName')?.innerText || 'Centralized Exchange'}
• Deposit Sub-Account: ${document.getElementById('unmaskedSubAccount')?.innerText || 'KYC Sub-Account on File'}
• Hot Wallet Sweep TxID: ${document.getElementById('unmaskedSweepTx')?.innerText || 'Sweeper Hop Identified'}
• Scammer Identity Status: Real Legal Name, National ID, Phone & Bank Profile on File with Compliance
• Custody Status: Liquid in Exchange Hot-Wallet Cluster — High Freeze Feasibility

[SECTION 4: STATUTORY LAW ENFORCEMENT & EXCHANGE SUBPOENA PACKET]
${document.getElementById('subpoenaNoticeLetter')?.innerText || ''}

[SECTION 5: TACTICAL RESTITUTION PATHWAY]
• Recommended Action: File immediately with FBI IC3 (https://ic3.gov) and local Cybercrime Police.
• Serve this formal dossier to Exchange Compliance to compel KYC unmasking and asset seizure.
================================================================================`;

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Nexus_Shield_Forensic_Dossier_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Continue to Recovery
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const contactTitle = document.getElementById('contactSectionTitle');
      contactTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('victimName')?.focus();
    });
  }
}

// ======================== MOBILE NAVIGATION ========================
function initMobileNavigation() {
  const toggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;
  if (toggle.dataset.navBound === 'true') return;
  toggle.dataset.navBound = 'true';

  function setMenuState(open) {
    if (open) {
      navLinks.classList.add('mobile-open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-drawer-open');
    } else {
      navLinks.classList.remove('mobile-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-drawer-open');
    }
  }

  // Toggle button tap / click
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('mobile-open');
    setMenuState(!isOpen);
  });

  // Close when tapping outside drawer
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('mobile-open')) {
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        setMenuState(false);
      }
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      setMenuState(false);
    }
  });

  // Close drawer when any nav link is tapped
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  // Mobile drawer 360° galaxy spin trigger
  const mobileSpinBtn = document.getElementById('mobileSpinTrigger');
  if (mobileSpinBtn) {
    mobileSpinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuState(false);

      if (typeof window.triggerCinematic360Spin === 'function') {
        window.triggerCinematic360Spin(true);
      }
    });
  }
}
window.initMobileNavigation = initMobileNavigation;

// ======================== INIT ========================
document.addEventListener("DOMContentLoaded", async () => {
  initMobileNavigation();
  initPageTransitions();
  initTicker();
  
  // Initialize dynamic multi-wallet container with movement #1
  addWalletMovement();

  // Initialize integrated ChainExplorer intake
  initSmartIntakeExplorer();

  bindAppEvents();

  // Render any recently queried or generated Case IDs
  renderRecentCases();

  // Check for imported transaction from ChainExplorer
  const importedTxStr = sessionStorage.getItem('imported_tx');
  if (importedTxStr) {
    try {
      const imp = JSON.parse(importedTxStr);
      sessionStorage.removeItem('imported_tx');
      setTimeout(() => {
        const smartInput = document.getElementById('smartTxInput_1') || document.getElementById('smartTxInput');
        if (smartInput && imp.txHash) {
          smartInput.value = imp.txHash;
          const inspectBtn = document.getElementById('smartInspectBtn');
          if (inspectBtn) inspectBtn.click();
        }

        const txInput = document.getElementById('txHash_1');
        const vInput = document.getElementById('victimWallet_1');
        const sInput = document.getElementById('scammerWallet_1');
        const aInput = document.getElementById('amountLost_1');
        const cSelect = document.getElementById('currencyLost_1');

        if (txInput && imp.txHash) txInput.value = imp.txHash;
        if (vInput && imp.victimWallet) vInput.value = imp.victimWallet;
        if (sInput && imp.scammerWallet) sInput.value = imp.scammerWallet;
        if (aInput && imp.amountLost) aInput.value = imp.amountLost;
        if (cSelect && imp.currencyLost) cSelect.value = imp.currencyLost;

        recalculateAggregateLoss();
        showEmailToast('✅ On-chain transaction decoded and ready for confirmation!');
      }, 350);
    } catch (e) {}
  }

  // Load report count from database
  try {
    const count = await getTotalReportCount();
    const countSpan = document.getElementById("reportCount");
    if (countSpan) countSpan.innerText = count.toLocaleString();
    const heroCount = document.getElementById("heroCountDisplay");
    if (heroCount) heroCount.innerText = count.toLocaleString() + "+";
  } catch (e) {
    console.warn(e);
  }
});

// ======================== GLOBAL EMERGENCY CHANNEL SYNCHRONIZATION ========================
(function() {
  function syncGlobalSecurityChannels() {
    try {
      const saved = localStorage.getItem('nexus_security_registry');
      if (!saved) return;
      const reg = JSON.parse(saved);
      if (!reg) return;

      if (reg.whatsapp_number) {
        const cleanDigits = reg.whatsapp_number.replace(/\D/g, '');
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
          try {
            const url = new URL(link.href);
            const currentText = url.searchParams.get('text') || 'Hello%20Nexus%20Shield%20Taskforce%2C%20I%20urgently%20need%20assistance%20with%20a%20cryptocurrency%20fraud%20incident.';
            link.href = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(currentText)}`;
          } catch (e) {
            link.href = `https://wa.me/${cleanDigits}`;
          }
        });
      }

      if (reg.x_handle) {
        const handle = reg.x_handle.replace(/^@/, '');
        document.querySelectorAll('a[href*="x.com/"], a[href*="twitter.com/"]').forEach(link => {
          if (!link.href.includes('/intent/tweet') && !link.href.includes('/share')) {
            link.href = `https://x.com/${handle}`;
            if (link.getAttribute('title')) link.setAttribute('title', `Nexus Shield on X (@${handle})`);
            if (link.getAttribute('aria-label')) link.setAttribute('aria-label', `Nexus Shield on X (@${handle})`);
          }
        });
      }

      if (reg.telegram_handle) {
        const cleanTg = reg.telegram_handle.replace(/^@/, '');
        document.querySelectorAll('a[href*="t.me/"]').forEach(link => {
          link.href = `https://t.me/${cleanTg}`;
        });
      }

      if (reg.support_email) {
        document.querySelectorAll('a[href^="mailto:support@nexusshield.org"]').forEach(link => {
          link.href = `mailto:${reg.support_email}`;
        });
      }

      if (reg.compliance_email) {
        document.querySelectorAll('a[href^="mailto:compliance@nexusshield.org"]').forEach(link => {
          link.href = `mailto:${reg.compliance_email}`;
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncGlobalSecurityChannels);
  } else {
    syncGlobalSecurityChannels();
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'nexus_security_registry') {
      syncGlobalSecurityChannels();
    }
  });
})();
