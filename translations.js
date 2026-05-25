const translations = {
  en: {
    // Static UI
    site_name: "NEXUS SHIELD", subhead: "CRYPTO GUARDIAN", nav_home: "HOME", nav_about: "ABOUT",
    reports_secured: "reports secured", hero_text: "⚡ THE POWER IS IN YOUR HAND ⚡",
    portal_title: "RECOVERY INTELLIGENCE PORTAL", warning_incorrect: "Incorrect information may lead to wasted resources. Please double‑check before processing.",
    label_your_name: "Your Full Name", placeholder_your_name: "Enter your real name (for admin reference)",
    label_victim_wallet: "Victim Wallet Address", placeholder_victim: "Any crypto address (BTC, ETH, BNB, etc.)",
    label_scammer_wallet: "Scammer Wallet Address", placeholder_scammer: "Address that scammed you",
    label_amount_lost: "Total Amount Lost", label_recovery_wallet: "New Wallet for Recovered Funds",
    placeholder_recovery: "Where to send recovered assets", label_tx_hash: "Transaction Hash(es)",
    placeholder_tx_hash: "Transaction hash (e.g., 0x... or 64 hex)", label_website: "Website / Scam URL (optional)",
    placeholder_website: "https://example.com (optional)", scan_button: "SCAN & RECOVER",
    status_title: "Track Your Recovery Progress", check_status_btn: "TRACK PROGRESS",
    footer_text: "NEXUS SHIELD — bridging victims to on‑chain justice",
    about_title: "NEXUS SHIELD — Crypto Guardian",
    about_desc1: "A futuristic decentralised intelligence layer that helps victims of crypto scams document evidence and initiate on-chain recovery procedures. Our smart contract gateway detects the blockchain used by the scammer and recommends a chain‑specific recovery contract.",
    feature1: "Multi‑chain support (BTC, ETH, BNB, etc.)", feature2: "Chain‑specific smart contract triggers", feature3: "Real‑time scam tracking",
    about_desc2: "All submitted reports are stored centrally in a secure database (Supabase). The platform cross‑references scammer wallets to alert you if an address has been reported before.",
    data_integrity: "Data integrity:", data_integrity_text: "Every report (victim/scammer wallets, transaction hashes, URLs) is permanently saved and shared across all users.",
    powered_by: "Powered by multi‑chain intelligence | Futuristic Crypto Forensics",
    label_usdt_network: "USDT Network (Blockchain)", network_tron: "TRC-20 (Tron)", network_erc20: "ERC-20 (Ethereum)", network_bep20: "BEP-20 (BNB Chain)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ Selecting the wrong network will cause permanent loss of funds. Verify on the blockchain explorer.",
    option_ethereum: "Ethereum (ETH)", option_bnb: "BNB Chain (BSC)",
    current_language_label: "Current language:",

    // Error messages
    error_all_fields: "❌ All fields except Website URL are required.",
    error_victim_name: "❌ Please enter your full name.",
    error_invalid_victim: "⚠️ Victim wallet does not appear to be a valid crypto address.",
    error_invalid_scammer: "⚠️ Scammer wallet does not appear to be a valid crypto address.",
    error_invalid_recovery: "⚠️ Recovery wallet does not appear to be a valid crypto address.",
    error_recovery_eq_victim: "⚠️ Recovery wallet should be different from victim wallet for security.",
    error_recovery_eq_scammer: "⚠️ Recovery wallet cannot be the same as the scammer wallet.",
    error_positive_amount: "⚠️ Please enter a valid positive amount lost.",
    error_amount_unrealistic: "⚠️ Amount seems unrealistic. Please verify and re-enter.",
    error_invalid_txhash: (hash) => `❌ Transaction hash "${hash}" is invalid format.`,
    error_invalid_url: "⚠️ Please enter a valid URL (including http:// or https://).",
    error_usdt_network_mismatch: (network) => `⚠️ The victim wallet address does not match the selected USDT network (${network}). Please check.`,
    error_rate_limit: "⚠️ Please wait 60 seconds before submitting another report.",
    error_database: "Network error. Please check your connection and try again.",
    error_enter_report_id: "❌ Please enter a Report ID.",

    // Warnings & success
    warning_scammer_exists: "⚠️ WARNING: This scammer wallet address has been reported before by another user. Proceed with caution.",
    success_report_saved: (id) => `✅ Report saved! Your Report ID: ${id}. Use it to check status later.`,
    status_not_found: "❌ Report not found. Please check your ID.",

    // Status labels
    status_pending: "⏳ Pending review",
    status_approved: "✅ Approved",
    status_investigating: "🔍 Investigating",
    status_recovering1: "🔄 Recovering (Phase 1)",
    status_recovering2: "🔄 Recovering (Phase 2)",
    status_recovered: "🎉 Recovered",
    status_failed: "❌ Failed",

    // Modal texts
    modal_contract_title: "⚡ Smart Contract Trigger",
    modal_contract_text: (chain) => `You are about to start a smart contract on the <strong>${chain} Blockchain</strong>. This will initiate the recovery audit & fund tracing process.`,
    modal_fee_title: "⚡ Recovery Fee Required",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `To execute the recovery smart contract on <strong>${chain}</strong>, a fee of <strong>${percent}%</strong> of your lost amount is required.<br>You need to pay <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) to the following address:`,
    modal_fee_warning: "⚠️ WARNING: The gas fee (8%) may exceed your recovered amount. Proceed at your own risk.",
    btn_yes: "YES, PROCEED", btn_cancel: "CANCEL", btn_close: "CLOSE",

    // Progress popup
    progress_title: "Recovery Progress",
    status_label_popup: "Status:",
    amount_label_popup: "Amount lost:",
    submitted_label_popup: "Submitted:",
    blockchain_label_popup: "Blockchain:",
    progress_pending_msg: "Report received, waiting for review.",
    progress_approved_msg: "Case approved, recovery team assigned.",
    progress_investigating_msg: "Tracing funds, contacting exchanges.",
    progress_recovering1_msg: "Attempting to recover funds.",
    progress_recovering2_msg: "Recovery in progress, waiting for confirmation.",
    progress_recovered_msg: "Funds successfully recovered!",
    progress_failed_msg: "Recovery failed. Contact support.",

    // Warning confirmation modal
    warning_confirm_title: "⚠️ Important Notice",
    warning_confirm_text: "Incorrect information may lead to wasted resources. Please double‑check all details before proceeding.",
    warning_cancel: "CANCEL",
    warning_continue: "CONTINUE"
  },
  zh: {
    site_name: "神盾枢纽", subhead: "加密守护者", nav_home: "首页", nav_about: "关于",
    reports_secured: "份报告已保存", hero_text: "⚡ 力量掌握在你手中 ⚡",
    portal_title: "资产追回智能门户", warning_incorrect: "错误信息可能导致资源浪费。请在处理前仔细核对。",
    label_your_name: "您的全名", placeholder_your_name: "输入您的真实姓名（供管理员参考）",
    label_victim_wallet: "受害者钱包地址", placeholder_victim: "任何加密货币地址 (BTC, ETH, BNB等)",
    label_scammer_wallet: "诈骗者钱包地址", placeholder_scammer: "诈骗您的地址",
    label_amount_lost: "损失总金额", label_recovery_wallet: "追回资金接收钱包",
    placeholder_recovery: "接收追回资产的钱包地址", label_tx_hash: "交易哈希(多个)",
    placeholder_tx_hash: "交易哈希 (例如 0x... 或64位十六进制)", label_website: "网站/诈骗链接 (可选)",
    placeholder_website: "https://example.com (可选)", scan_button: "扫描并追回",
    status_title: "追踪您的追回进度", check_status_btn: "追踪进度",
    footer_text: "神盾枢纽 — 帮助受害者追回链上资产 | 模拟环境",
    about_title: "神盾枢纽 — 加密守护者",
    about_desc1: "一个未来的去中心化智能层，帮助加密货币诈骗受害者记录证据并发起链上追回程序。我们的智能合约网关可检测诈骗者使用的区块链，并推荐特定链的追回合约。",
    feature1: "多链支持 (BTC, ETH, BNB等)", feature2: "特定链智能合约触发", feature3: "实时诈骗追踪",
    about_desc2: "所有提交的报告都集中存储在安全的数据库 (Supabase) 中。平台会交叉比对诈骗者钱包，如果地址曾被举报，会向您发出警告。",
    data_integrity: "数据完整性：", data_integrity_text: "每份报告（受害者/诈骗者钱包、交易哈希、网址）都会被永久保存并在所有用户间共享。",
    powered_by: "由多链智能驱动 | 未来主义加密取证",
    label_usdt_network: "USDT 网络 (区块链)", network_tron: "TRC-20 (波场)", network_erc20: "ERC-20 (以太坊)", network_bep20: "BEP-20 (币安智能链)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ 选择错误的网络将导致资金永久损失。请在区块链浏览器上验证。",
    option_ethereum: "以太坊 (ETH)", option_bnb: "币安智能链 (BSC)",
    current_language_label: "当前语言：",

    error_all_fields: "❌ 除网站URL外所有字段均为必填。",
    error_victim_name: "❌ 请输入您的全名。",
    error_invalid_victim: "⚠️ 受害者钱包地址无效。",
    error_invalid_scammer: "⚠️ 诈骗者钱包地址无效。",
    error_invalid_recovery: "⚠️ 追回钱包地址无效。",
    error_recovery_eq_victim: "⚠️ 追回钱包不能与受害者钱包相同。",
    error_recovery_eq_scammer: "⚠️ 追回钱包不能与诈骗者钱包相同。",
    error_positive_amount: "⚠️ 请输入有效的正数损失金额。",
    error_amount_unrealistic: "⚠️ 金额不切实际，请核实后重新输入。",
    error_invalid_txhash: (hash) => `❌ 交易哈希 "${hash}" 格式无效。`,
    error_invalid_url: "⚠️ 请输入有效的URL (包含 http:// 或 https://)。",
    error_usdt_network_mismatch: (network) => `⚠️ 受害者钱包地址与所选的USDT网络 (${network}) 不匹配。请检查。`,
    error_rate_limit: "⚠️ 请等待60秒后再提交另一份报告。",
    error_database: "网络错误。请检查您的连接后重试。",
    error_enter_report_id: "❌ 请输入报告ID。",

    warning_scammer_exists: "⚠️ 警告：该诈骗者钱包地址已被其他用户举报。请谨慎操作。",
    success_report_saved: (id) => `✅ 报告已保存！您的报告ID: ${id}。以后可使用此ID查询状态。`,
    status_not_found: "❌ 未找到报告。请检查ID。",

    status_pending: "⏳ 待审核",
    status_approved: "✅ 已批准",
    status_investigating: "🔍 调查中",
    status_recovering1: "🔄 追回中 (第一阶段)",
    status_recovering2: "🔄 追回中 (第二阶段)",
    status_recovered: "🎉 已追回",
    status_failed: "❌ 失败",

    modal_contract_title: "⚡ 智能合约触发",
    modal_contract_text: (chain) => `您即将在 <strong>${chain} 区块链</strong> 上启动智能合约。这将启动追回审计和资金追踪流程。`,
    modal_fee_title: "⚡ 需要支付费用",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `为了在 <strong>${chain}</strong> 上执行追回智能合约，需要收取您损失金额 <strong>${percent}%</strong> 的费用。<br>您需要支付 <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) 到以下地址：`,
    modal_fee_warning: "⚠️ 警告：手续费 (8%) 可能超过您追回的金额。风险自负。",
    btn_yes: "是，继续", btn_cancel: "取消", btn_close: "关闭",

    progress_title: "追回进度",
    status_label_popup: "状态：",
    amount_label_popup: "损失金额：",
    submitted_label_popup: "提交时间：",
    blockchain_label_popup: "区块链：",
    progress_pending_msg: "报告已收到，等待审核。",
    progress_approved_msg: "案件已批准，追回团队已分配。",
    progress_investigating_msg: "正在追踪资金，联系交易所。",
    progress_recovering1_msg: "正在尝试追回资金。",
    progress_recovering2_msg: "追回进行中，等待确认。",
    progress_recovered_msg: "资金已成功追回！",
    progress_failed_msg: "追回失败。请联系支持。",

    warning_confirm_title: "⚠️ 重要提示",
    warning_confirm_text: "错误信息可能导致资源浪费。请在继续前仔细核对所有信息。",
    warning_cancel: "取消",
    warning_continue: "继续"
  },
  es: {
    site_name: "ESCUDO NEXUS", subhead: "GUARDIÁN CRIPTO", nav_home: "INICIO", nav_about: "ACERCA DE",
    reports_secured: "informes asegurados", hero_text: "⚡ EL PODER ESTÁ EN TU MANO ⚡",
    portal_title: "PORTAL INTELIGENTE DE RECUPERACIÓN", warning_incorrect: "La información incorrecta puede provocar un desperdicio de recursos. Verifique antes de procesar.",
    label_your_name: "Su nombre completo", placeholder_your_name: "Ingrese su nombre real (para referencia del administrador)",
    label_victim_wallet: "Dirección de la víctima", placeholder_victim: "Cualquier dirección cripto (BTC, ETH, BNB, etc.)",
    label_scammer_wallet: "Dirección del estafador", placeholder_scammer: "Dirección que te estafó",
    label_amount_lost: "Cantidad total perdida", label_recovery_wallet: "Nueva cartera para fondos recuperados",
    placeholder_recovery: "Dónde enviar los activos recuperados", label_tx_hash: "Hash(es) de transacción",
    placeholder_tx_hash: "Hash de transacción (ej. 0x... o 64 hex)", label_website: "Sitio web / URL de estafa (opcional)",
    placeholder_website: "https://ejemplo.com (opcional)", scan_button: "ESCANEAR Y RECUPERAR",
    status_title: "Seguimiento de su recuperación", check_status_btn: "VER PROGRESO",
    footer_text: "ESCUDO NEXUS — conectando víctimas con la justicia en cadena | entorno simulado",
    about_title: "ESCUDO NEXUS — Guardián Cripto",
    about_desc1: "Una capa de inteligencia descentralizada futurista que ayuda a las víctimas de estafas criptográficas a documentar evidencia e iniciar procedimientos de recuperación en cadena. Nuestra puerta de enlace de contratos inteligentes detecta la blockchain utilizada por el estafador y recomienda un contrato de recuperación específico para esa cadena.",
    feature1: "Soporte multicadena (BTC, ETH, BNB, etc.)", feature2: "Activación de contratos inteligentes por cadena", feature3: "Seguimiento de estafas en tiempo real",
    about_desc2: "Todos los informes enviados se almacenan centralmente en una base de datos segura (Supabase). La plataforma compara las carteras de estafadores para advertirle si una dirección ya ha sido reportada.",
    data_integrity: "Integridad de los datos:", data_integrity_text: "Cada informe (carteras de víctima/estafador, hashes de transacción, URLs) se guarda de forma permanente y se comparte entre todos los usuarios.",
    powered_by: "Potenciado por inteligencia multicadena | Ciencia forense criptográfica futurista",
    label_usdt_network: "Red USDT (Blockchain)", network_tron: "TRC-20 (Tron)", network_erc20: "ERC-20 (Ethereum)", network_bep20: "BEP-20 (BNB Chain)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ Seleccionar la red incorrecta provocará la pérdida permanente de los fondos. Verifique en el explorador de bloques.",
    option_ethereum: "Ethereum (ETH)", option_bnb: "BNB Chain (BSC)",
    current_language_label: "Idioma actual:",

    error_all_fields: "❌ Todos los campos excepto la URL del sitio web son obligatorios.",
    error_victim_name: "❌ Por favor, introduzca su nombre completo.",
    error_invalid_victim: "⚠️ La dirección de la víctima no parece ser una dirección cripto válida.",
    error_invalid_scammer: "⚠️ La dirección del estafador no parece ser una dirección cripto válida.",
    error_invalid_recovery: "⚠️ La dirección de recuperación no parece ser una dirección cripto válida.",
    error_recovery_eq_victim: "⚠️ La dirección de recuperación debe ser diferente de la dirección de la víctima por seguridad.",
    error_recovery_eq_scammer: "⚠️ La dirección de recuperación no puede ser la misma que la dirección del estafador.",
    error_positive_amount: "⚠️ Por favor, introduzca una cantidad positiva válida.",
    error_amount_unrealistic: "⚠️ La cantidad parece poco realista. Verifique y vuelva a introducir.",
    error_invalid_txhash: (hash) => `❌ El hash de transacción "${hash}" tiene un formato inválido.`,
    error_invalid_url: "⚠️ Por favor, introduzca una URL válida (incluyendo http:// o https://).",
    error_usdt_network_mismatch: (network) => `⚠️ La dirección de la víctima no coincide con la red USDT seleccionada (${network}). Por favor, compruebe.`,
    error_rate_limit: "⚠️ Por favor, espere 60 segundos antes de enviar otro informe.",
    error_database: "Error de red. Por favor, compruebe su conexión e intente de nuevo.",
    error_enter_report_id: "❌ Por favor, introduzca un ID de informe.",

    warning_scammer_exists: "⚠️ ADVERTENCIA: Esta dirección de estafador ya ha sido reportada por otro usuario. Proceda con precaución.",
    success_report_saved: (id) => `✅ ¡Informe guardado! Su ID de informe: ${id}. Úselo para comprobar el estado más tarde.`,
    status_not_found: "❌ Informe no encontrado. Por favor, compruebe su ID.",

    status_pending: "⏳ Pendiente de revisión",
    status_approved: "✅ Aprobado",
    status_investigating: "🔍 En investigación",
    status_recovering1: "🔄 Recuperando (Fase 1)",
    status_recovering2: "🔄 Recuperando (Fase 2)",
    status_recovered: "🎉 Recuperado",
    status_failed: "❌ Fallido",

    modal_contract_title: "⚡ Activación de Contrato Inteligente",
    modal_contract_text: (chain) => `Está a punto de iniciar un contrato inteligente en la blockchain <strong>${chain}</strong>. Esto iniciará la auditoría de recuperación y el proceso de rastreo de fondos.`,
    modal_fee_title: "⚡ Comisión de Recuperación Requerida",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `Para ejecutar el contrato inteligente de recuperación en <strong>${chain}</strong>, se requiere una comisión del <strong>${percent}%</strong> de su cantidad perdida.<br>Debe pagar <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) a la siguiente dirección:`,
    modal_fee_warning: "⚠️ ADVERTENCIA: La comisión del 8% puede exceder la cantidad recuperada. Proceda bajo su propio riesgo.",
    btn_yes: "SÍ, CONTINUAR", btn_cancel: "CANCELAR", btn_close: "CERRAR",

    progress_title: "Progreso de Recuperación",
    status_label_popup: "Estado:",
    amount_label_popup: "Cantidad perdida:",
    submitted_label_popup: "Enviado:",
    blockchain_label_popup: "Blockchain:",
    progress_pending_msg: "Informe recibido, en espera de revisión.",
    progress_approved_msg: "Caso aprobado, equipo de recuperación asignado.",
    progress_investigating_msg: "Rastreando fondos, contactando exchanges.",
    progress_recovering1_msg: "Intentando recuperar fondos.",
    progress_recovering2_msg: "Recuperación en progreso, esperando confirmación.",
    progress_recovered_msg: "¡Fondos recuperados con éxito!",
    progress_failed_msg: "Recuperación fallida. Contacte al soporte.",

    warning_confirm_title: "⚠️ Aviso Importante",
    warning_confirm_text: "La información incorrecta puede provocar un desperdicio de recursos. Verifique todos los detalles antes de continuar.",
    warning_cancel: "CANCELAR",
    warning_continue: "CONTINUAR"
  },
  fr: {
    site_name: "BOUCLIER NEXUS", subhead: "GARDIEN CRYPTO", nav_home: "ACCUEIL", nav_about: "À PROPOS",
    reports_secured: "rapports sécurisés", hero_text: "⚡ LE POUVOIR EST ENTRE VOS MAINS ⚡",
    portal_title: "PORTAIL INTELLIGENT DE RÉCUPÉRATION", warning_incorrect: "Des informations incorrectes peuvent entraîner un gaspillage de ressources. Veuillez vérifier avant de traiter.",
    label_your_name: "Votre nom complet", placeholder_your_name: "Entrez votre vrai nom (pour référence admin)",
    label_victim_wallet: "Adresse de la victime", placeholder_victim: "Toute adresse crypto (BTC, ETH, BNB, etc.)",
    label_scammer_wallet: "Adresse de l'arnaqueur", placeholder_scammer: "Adresse qui vous a escroqué",
    label_amount_lost: "Montant total perdu", label_recovery_wallet: "Nouveau portefeuille pour les fonds récupérés",
    placeholder_recovery: "Où envoyer les actifs récupérés", label_tx_hash: "Hash(s) de transaction",
    placeholder_tx_hash: "Hash de transaction (ex. 0x... ou 64 hex)", label_website: "Site web / URL d'arnaque (optionnel)",
    placeholder_website: "https://exemple.com (optionnel)", scan_button: "SCANNER ET RÉCUPÉRER",
    status_title: "Suivre votre progression", check_status_btn: "VOIR PROGRÈS",
    footer_text: "BOUCLIER NEXUS — relier les victimes à la justice en chaîne | environnement simulé",
    about_title: "BOUCLIER NEXUS — Gardien Crypto",
    about_desc1: "Une couche d'intelligence décentralisée futuriste qui aide les victimes d'arnaques crypto à documenter les preuves et à lancer des procédures de récupération en chaîne. Notre passerelle de contrats intelligents détecte la blockchain utilisée par l'arnaqueur et recommande un contrat de récupération spécifique à la chaîne.",
    feature1: "Support multi‑chaînes (BTC, ETH, BNB, etc.)", feature2: "Déclencheurs de contrats intelligents par chaîne", feature3: "Suivi des arnaques en temps réel",
    about_desc2: "Tous les rapports soumis sont stockés de manière centralisée dans une base de données sécurisée (Supabase). La plateforme croise les portefeuilles d'arnaqueurs pour vous avertir si une adresse a déjà été signalée.",
    data_integrity: "Intégrité des données :", data_integrity_text: "Chaque rapport (portefeuilles de la victime/de l'arnaqueur, hachages de transaction, URL) est sauvegardé de façon permanente et partagé entre tous les utilisateurs.",
    powered_by: "Alimenté par l'intelligence multi‑chaînes | Criminalistique crypto futuriste",
    label_usdt_network: "Réseau USDT (Blockchain)", network_tron: "TRC-20 (Tron)", network_erc20: "ERC-20 (Ethereum)", network_bep20: "BEP-20 (BNB Chain)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ Choisir le mauvais réseau entraînera une perte permanente des fonds. Vérifiez sur l'explorateur de blockchain.",
    option_ethereum: "Ethereum (ETH)", option_bnb: "BNB Chain (BSC)",
    current_language_label: "Langue actuelle :",

    error_all_fields: "❌ Tous les champs sauf l'URL du site web sont requis.",
    error_victim_name: "❌ Veuillez entrer votre nom complet.",
    error_invalid_victim: "⚠️ L'adresse de la victime ne semble pas être une adresse crypto valide.",
    error_invalid_scammer: "⚠️ L'adresse de l'arnaqueur ne semble pas être une adresse crypto valide.",
    error_invalid_recovery: "⚠️ L'adresse de récupération ne semble pas être une adresse crypto valide.",
    error_recovery_eq_victim: "⚠️ L'adresse de récupération doit être différente de l'adresse de la victime pour des raisons de sécurité.",
    error_recovery_eq_scammer: "⚠️ L'adresse de récupération ne peut pas être la même que celle de l'arnaqueur.",
    error_positive_amount: "⚠️ Veuillez entrer un montant positif valide.",
    error_amount_unrealistic: "⚠️ Le montant semble irréaliste. Veuillez vérifier et ressaisir.",
    error_invalid_txhash: (hash) => `❌ Le hachage de transaction "${hash}" est invalide.`,
    error_invalid_url: "⚠️ Veuillez entrer une URL valide (incluant http:// ou https://).",
    error_usdt_network_mismatch: (network) => `⚠️ L'adresse de la victime ne correspond pas au réseau USDT sélectionné (${network}). Veuillez vérifier.`,
    error_rate_limit: "⚠️ Veuillez attendre 60 secondes avant de soumettre un autre rapport.",
    error_database: "Erreur réseau. Veuillez vérifier votre connexion et réessayer.",
    error_enter_report_id: "❌ Veuillez entrer un ID de rapport.",

    warning_scammer_exists: "⚠️ AVERTISSEMENT : Cette adresse d'arnaqueur a déjà été signalée par un autre utilisateur. Soyez prudent.",
    success_report_saved: (id) => `✅ Rapport enregistré ! Votre ID de rapport : ${id}. Utilisez-le pour vérifier l'état ultérieurement.`,
    status_not_found: "❌ Rapport introuvable. Veuillez vérifier votre ID.",

    status_pending: "⏳ En attente d'examen",
    status_approved: "✅ Approuvé",
    status_investigating: "🔍 En cours d'enquête",
    status_recovering1: "🔄 Récupération (Phase 1)",
    status_recovering2: "🔄 Récupération (Phase 2)",
    status_recovered: "🎉 Récupéré",
    status_failed: "❌ Échec",

    modal_contract_title: "⚡ Déclenchement du contrat intelligent",
    modal_contract_text: (chain) => `Vous allez lancer un contrat intelligent sur la blockchain <strong>${chain}</strong>. Cela lancera l'audit de récupération et le processus de traçage des fonds.`,
    modal_fee_title: "⚡ Frais de récupération requis",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `Pour exécuter le contrat intelligent de récupération sur <strong>${chain}</strong>, des frais de <strong>${percent}%</strong> du montant perdu sont requis.<br>Vous devez payer <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) à l'adresse suivante :`,
    modal_fee_warning: "⚠️ AVERTISSEMENT : Les frais de 8 % peuvent dépasser le montant récupéré. Agissez à vos propres risques.",
    btn_yes: "OUI, CONTINUER", btn_cancel: "ANNULER", btn_close: "FERMER",

    progress_title: "Progrès de la récupération",
    status_label_popup: "Statut :",
    amount_label_popup: "Montant perdu :",
    submitted_label_popup: "Soumis le :",
    blockchain_label_popup: "Blockchain :",
    progress_pending_msg: "Rapport reçu, en attente d'examen.",
    progress_approved_msg: "Cas approuvé, équipe de récupération assignée.",
    progress_investigating_msg: "Recherche des fonds, contact avec les échanges.",
    progress_recovering1_msg: "Tentative de récupération des fonds.",
    progress_recovering2_msg: "Récupération en cours, en attente de confirmation.",
    progress_recovered_msg: "Fonds récupérés avec succès !",
    progress_failed_msg: "Échec de la récupération. Contactez le support.",

    warning_confirm_title: "⚠️ Avis Important",
    warning_confirm_text: "Des informations incorrectes peuvent entraîner un gaspillage de ressources. Veuillez vérifier tous les détails avant de continuer.",
    warning_cancel: "ANNULER",
    warning_continue: "CONTINUER"
  },
  de: {
    site_name: "NEXUS-SCHILD", subhead: "KRYPTO-WÄCHTER", nav_home: "STARTSEITE", nav_about: "ÜBER UNS",
    reports_secured: "Berichte gesichert", hero_text: "⚡ DIE MACHT LIEGT IN IHRER HAND ⚡",
    portal_title: "INTELLIGENTES WIEDERHERSTELLUNGSPORTAL", warning_incorrect: "Falsche Informationen können zur Verschwendung von Ressourcen führen. Bitte überprüfen Sie die Angaben vor der Verarbeitung.",
    label_your_name: "Ihr vollständiger Name", placeholder_your_name: "Geben Sie Ihren echten Namen ein (für Admin-Referenz)",
    label_victim_wallet: "Adresse des Opfers", placeholder_victim: "Jede Krypto-Adresse (BTC, ETH, BNB, usw.)",
    label_scammer_wallet: "Adresse des Betrügers", placeholder_scammer: "Adresse, die Sie betrogen hat",
    label_amount_lost: "Verlorener Gesamtbetrag", label_recovery_wallet: "Neue Wallet für wiederhergestellte Gelder",
    placeholder_recovery: "Wohin die wiederhergestellten Vermögenswerte gesendet werden sollen", label_tx_hash: "Transaktions-Hash(s)",
    placeholder_tx_hash: "Transaktions-Hash (z.B. 0x... oder 64 Hex)", label_website: "Website / Betrugs-URL (optional)",
    placeholder_website: "https://beispiel.de (optional)", scan_button: "SCANNEN & WIEDERHERSTELLEN",
    status_title: "Verfolgen Sie Ihren Fortschritt", check_status_btn: "FORTSCHRITT ANZEIGEN",
    footer_text: "NEXUS-SCHILD — Verbindung von Opfern mit der Justiz auf der Blockchain | simulierte Umgebung",
    about_title: "NEXUS-SCHILD — Krypto-Wächter",
    about_desc1: "Eine futuristische, dezentrale Intelligenzschicht, die Opfern von Krypto-Betrügereien hilft, Beweise zu dokumentieren und Wiederherstellungsverfahren auf der Blockchain einzuleiten. Unser Smart-Contract-Gateway erkennt die vom Betrüger verwendete Blockchain und empfiehlt einen kettenspezifischen Wiederherstellungsvertrag.",
    feature1: "Multi‑Chain-Unterstützung (BTC, ETH, BNB, etc.)", feature2: "Kettenspezifische Smart-Contract-Auslöser", feature3: "Echtzeit-Betrugsverfolgung",
    about_desc2: "Alle eingereichten Berichte werden zentral in einer sicheren Datenbank (Supabase) gespeichert. Die Plattform gleicht Betrüger-Wallets ab, um Sie zu warnen, wenn eine Adresse bereits gemeldet wurde.",
    data_integrity: "Datenintegrität:", data_integrity_text: "Jeder Bericht (Opfer-/Betrüger-Wallets, Transaktions-Hashes, URLs) wird dauerhaft gespeichert und für alle Benutzer freigegeben.",
    powered_by: "Unterstützt durch Multi‑Chain-Intelligenz | Futuristische Krypto-Forensik",
    label_usdt_network: "USDT-Netzwerk (Blockchain)", network_tron: "TRC-20 (Tron)", network_erc20: "ERC-20 (Ethereum)", network_bep20: "BEP-20 (BNB Chain)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ Die Auswahl des falschen Netzwerks führt zu einem dauerhaften Verlust der Gelder. Überprüfen Sie dies im Blockchain-Explorer.",
    option_ethereum: "Ethereum (ETH)", option_bnb: "BNB Chain (BSC)",
    current_language_label: "Aktuelle Sprache:",

    error_all_fields: "❌ Alle Felder außer der Website-URL sind erforderlich.",
    error_victim_name: "❌ Bitte geben Sie Ihren vollständigen Namen ein.",
    error_invalid_victim: "⚠️ Die Adresse des Opfers scheint keine gültige Krypto-Adresse zu sein.",
    error_invalid_scammer: "⚠️ Die Adresse des Betrügers scheint keine gültige Krypto-Adresse zu sein.",
    error_invalid_recovery: "⚠️ Die Wiederherstellungsadresse scheint keine gültige Krypto-Adresse zu sein.",
    error_recovery_eq_victim: "⚠️ Die Wiederherstellungsadresse sollte aus Sicherheitsgründen von der Adresse des Opfers abweichen.",
    error_recovery_eq_scammer: "⚠️ Die Wiederherstellungsadresse kann nicht dieselbe sein wie die des Betrügers.",
    error_positive_amount: "⚠️ Bitte geben Sie einen gültigen positiven Verlustbetrag ein.",
    error_amount_unrealistic: "⚠️ Der Betrag erscheint unrealistisch. Bitte überprüfen Sie ihn und geben Sie ihn erneut ein.",
    error_invalid_txhash: (hash) => `❌ Der Transaktions-Hash "${hash}" hat ein ungültiges Format.`,
    error_invalid_url: "⚠️ Bitte geben Sie eine gültige URL ein (inkl. http:// oder https://).",
    error_usdt_network_mismatch: (network) => `⚠️ Die Adresse des Opfers stimmt nicht mit dem ausgewählten USDT-Netzwerk (${network}) überein. Bitte überprüfen Sie.`,
    error_rate_limit: "⚠️ Bitte warten Sie 60 Sekunden, bevor Sie einen weiteren Bericht einreichen.",
    error_database: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    error_enter_report_id: "❌ Bitte geben Sie eine Berichts-ID ein.",

    warning_scammer_exists: "⚠️ WARNUNG: Diese Betrügeradresse wurde bereits von einem anderen Benutzer gemeldet. Seien Sie vorsichtig.",
    success_report_saved: (id) => `✅ Bericht gespeichert! Ihre Berichts-ID: ${id}. Verwenden Sie sie, um später den Status zu überprüfen.`,
    status_not_found: "❌ Bericht nicht gefunden. Bitte überprüfen Sie Ihre ID.",

    status_pending: "⏳ Ausstehende Überprüfung",
    status_approved: "✅ Genehmigt",
    status_investigating: "🔍 In Untersuchung",
    status_recovering1: "🔄 Wiederherstellung (Phase 1)",
    status_recovering2: "🔄 Wiederherstellung (Phase 2)",
    status_recovered: "🎉 Wiederhergestellt",
    status_failed: "❌ Fehlgeschlagen",

    modal_contract_title: "⚡ Smart-Contract-Auslösung",
    modal_contract_text: (chain) => `Sie sind dabei, einen Smart Contract auf der <strong>${chain}</strong>-Blockchain zu starten. Dies wird die Wiederherstellungsprüfung und die Rückverfolgung der Gelder einleiten.`,
    modal_fee_title: "⚡ Wiederherstellungsgebühr erforderlich",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `Um den Wiederherstellungs-Smart-Contract auf <strong>${chain}</strong> auszuführen, wird eine Gebühr von <strong>${percent}%</strong> Ihres verlorenen Betrags erhoben.<br>Sie müssen <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) an folgende Adresse zahlen:`,
    modal_fee_warning: "⚠️ WARNUNG: Die Gebühr von 8% kann Ihren wiederhergestellten Betrag übersteigen. Handeln Sie auf eigenes Risiko.",
    btn_yes: "JA, FORTFAHREN", btn_cancel: "ABBRECHEN", btn_close: "SCHLIESSEN",

    progress_title: "Wiederherstellungsfortschritt",
    status_label_popup: "Status:",
    amount_label_popup: "Verlorener Betrag:",
    submitted_label_popup: "Eingereicht:",
    blockchain_label_popup: "Blockchain:",
    progress_pending_msg: "Bericht empfangen, warten auf Überprüfung.",
    progress_approved_msg: "Fall genehmigt, Wiederherstellungsteam zugewiesen.",
    progress_investigating_msg: "Gelder werden verfolgt, Kontakt mit Börsen.",
    progress_recovering1_msg: "Versuch der Wiederherstellung der Gelder.",
    progress_recovering2_msg: "Wiederherstellung läuft, warten auf Bestätigung.",
    progress_recovered_msg: "Gelder erfolgreich wiederhergestellt!",
    progress_failed_msg: "Wiederherstellung fehlgeschlagen. Kontaktieren Sie den Support.",

    warning_confirm_title: "⚠️ Wichtiger Hinweis",
    warning_confirm_text: "Falsche Informationen können zur Verschwendung von Ressourcen führen. Bitte überprüfen Sie alle Details, bevor Sie fortfahren.",
    warning_cancel: "ABBRECHEN",
    warning_continue: "FORTSETZEN"
  },
  ja: {
    site_name: "ネクサスシールド", subhead: "暗号資産ガーディアン", nav_home: "ホーム", nav_about: "概要",
    reports_secured: "件の報告を保護", hero_text: "⚡ 力はあなたの手の中に ⚡",
    portal_title: "資産回収インテリジェントポータル", warning_incorrect: "誤った情報はリソースの無駄につながる可能性があります。処理前に再確認してください。",
    label_your_name: "氏名", placeholder_your_name: "実際の姓名を入力（管理者用）",
    label_victim_wallet: "被害者のウォレットアドレス", placeholder_victim: "任意の暗号資産アドレス (BTC, ETH, BNBなど)",
    label_scammer_wallet: "詐欺師のウォレットアドレス", placeholder_scammer: "あなたを騙したアドレス",
    label_amount_lost: "損失総額", label_recovery_wallet: "回収資金を受け取る新しいウォレット",
    placeholder_recovery: "回収資産の送付先", label_tx_hash: "トランザクションハッシュ(複数)",
    placeholder_tx_hash: "トランザクションハッシュ (例: 0x... または64桁の16進数)", label_website: "ウェブサイト / 詐欺URL (任意)",
    placeholder_website: "https://example.com (任意)", scan_button: "スキャンして回収",
    status_title: "進捗状況を追跡", check_status_btn: "進捗を表示",
    footer_text: "ネクサスシールド — 被害者をオンチェーンの正義につなぐ | シミュレーション環境",
    about_title: "ネクサスシールド — 暗号資産ガーディアン",
    about_desc1: "暗号資産詐欺の被害者が証拠を記録し、オンチェーンでの回収手続きを開始するのを支援する未来的な分散型インテリジェンスレイヤーです。当社のスマートコントラクトゲートウェイは詐欺師が使用したブロックチェーンを検出し、チェーン固有の回収コントラクトを推奨します。",
    feature1: "マルチチェーンサポート (BTC, ETH, BNBなど)", feature2: "チェーン固有のスマートコントラクトトリガー", feature3: "リアルタイム詐欺追跡",
    about_desc2: "提出されたすべてのレポートは、安全なデータベース (Supabase) に集中管理されます。プラットフォームは詐欺師のウォレットを相互参照し、アドレスが以前に報告された場合に警告します。",
    data_integrity: "データ整合性：", data_integrity_text: "すべてのレポート（被害者/詐欺師のウォレット、トランザクションハッシュ、URL）は永続的に保存され、全ユーザー間で共有されます。",
    powered_by: "マルチチェーンインテリジェンス搭載 | 未来的な暗号フォレンジック",
    label_usdt_network: "USDTネットワーク (ブロックチェーン)", network_tron: "TRC-20 (Tron)", network_erc20: "ERC-20 (Ethereum)", network_bep20: "BEP-20 (BNB Chain)", network_spl: "SPL (Solana)",
    usdt_warning: "⚠️ 誤ったネットワークを選択すると資金が永久に失われます。ブロックチェーンエクスプローラーで確認してください。",
    option_ethereum: "イーサリアム (ETH)", option_bnb: "BNBチェーン (BSC)",
    current_language_label: "現在の言語：",

    error_all_fields: "❌ ウェブサイトURLを除くすべてのフィールドは必須です。",
    error_victim_name: "❌ 氏名を入力してください。",
    error_invalid_victim: "⚠️ 被害者のウォレットアドレスが有効な暗号資産アドレスではないようです。",
    error_invalid_scammer: "⚠️ 詐欺師のウォレットアドレスが有効な暗号資産アドレスではないようです。",
    error_invalid_recovery: "⚠️ 回収用ウォレットアドレスが有効な暗号資産アドレスではないようです。",
    error_recovery_eq_victim: "⚠️ セキュリティのため、回収用ウォレットは被害者のウォレットとは異なるものにしてください。",
    error_recovery_eq_scammer: "⚠️ 回収用ウォレットは詐欺師のウォレットと同じにすることはできません。",
    error_positive_amount: "⚠️ 有効な正の損失額を入力してください。",
    error_amount_unrealistic: "⚠️ 金額が非現実的です。確認して再入力してください。",
    error_invalid_txhash: (hash) => `❌ トランザクションハッシュ "${hash}" の形式が無効です。`,
    error_invalid_url: "⚠️ 有効なURLを入力してください (http:// または https:// を含む)。",
    error_usdt_network_mismatch: (network) => `⚠️ 被害者のウォレットアドレスが選択されたUSDTネットワーク (${network}) と一致しません。確認してください。`,
    error_rate_limit: "⚠️ 次のレポートを送信する前に60秒お待ちください。",
    error_database: "ネットワークエラー。接続を確認してから再試行してください。",
    error_enter_report_id: "❌ レポートIDを入力してください。",

    warning_scammer_exists: "⚠️ 警告：この詐欺師のウォレットアドレスは別のユーザーによってすでに報告されています。注意して進めてください。",
    success_report_saved: (id) => `✅ レポートが保存されました！レポートID: ${id}。後で状況を確認するために使用してください。`,
    status_not_found: "❌ レポートが見つかりません。IDを確認してください。",

    status_pending: "⏳ 審査待ち",
    status_approved: "✅ 承認済み",
    status_investigating: "🔍 調査中",
    status_recovering1: "🔄 回収中 (フェーズ1)",
    status_recovering2: "🔄 回収中 (フェーズ2)",
    status_recovered: "🎉 回収完了",
    status_failed: "❌ 失敗",

    modal_contract_title: "⚡ スマートコントラクトトリガー",
    modal_contract_text: (chain) => `<strong>${chain} ブロックチェーン</strong> 上でスマートコントラクトを起動しようとしています。これにより、回収監査と資金追跡プロセスが開始されます。`,
    modal_fee_title: "⚡ 回収手数料が必要です",
    modal_fee_text: (chain, percent, amountNative, nativeCoin, feeUSD) => `<strong>${chain}</strong> で回収スマートコントラクトを実行するには、損失額の <strong>${percent}%</strong> の手数料が必要です。<br>次のアドレスに <strong>${amountNative.toFixed(6)} ${nativeCoin}</strong> (≈ $${feeUSD.toFixed(2)}) を支払う必要があります：`,
    modal_fee_warning: "⚠️ 警告：ガス代（8%）が回収額を超える可能性があります。自己責任で進めてください。",
    btn_yes: "はい、進める", btn_cancel: "キャンセル", btn_close: "閉じる",

    progress_title: "回収の進捗",
    status_label_popup: "ステータス：",
    amount_label_popup: "損失額：",
    submitted_label_popup: "提出日：",
    blockchain_label_popup: "ブロックチェーン：",
    progress_pending_msg: "レポートを受け取りました。審査をお待ちください。",
    progress_approved_msg: "ケースが承認され、回収チームが割り当てられました。",
    progress_investigating_msg: "資金を追跡し、取引所に連絡しています。",
    progress_recovering1_msg: "資金の回収を試みています。",
    progress_recovering2_msg: "回収進行中、確認を待っています。",
    progress_recovered_msg: "資金の回収に成功しました！",
    progress_failed_msg: "回収に失敗しました。サポートにお問い合わせください。",

    warning_confirm_title: "⚠️ 重要なお知らせ",
    warning_confirm_text: "誤った情報はリソースの無駄につながる可能性があります。続行する前にすべての詳細を再確認してください。",
    warning_cancel: "キャンセル",
    warning_continue: "続行"
  }
};

let currentLang = 'en';

function t(key, ...args) {
  let str = translations[currentLang]?.[key] || translations.en[key] || key;
  if (typeof str === 'function') return str(...args);
  return str;
}

function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem('nexus_lang', lang);
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.placeholder = translation;
    } else {
      el.innerText = translation;
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  
  const langDisplay = document.getElementById('currentLangDisplay');
  if (langDisplay) {
    const langNames = { en: 'English', zh: '中文', es: 'Español', fr: 'Français', de: 'Deutsch', ja: '日本語' };
    langDisplay.innerText = langNames[lang] || lang;
  }
  
  console.log('Language changed to:', lang);
}

async function detectLanguageByIP() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data.country_code;
    const map = { FR: 'fr', DE: 'de', JP: 'ja', CN: 'zh', ES: 'es', MX: 'es' };
    return map[country] || 'en';
  } catch (e) {
    return 'en';
  }
}

async function initLanguage() {
  const saved = localStorage.getItem('nexus_lang');
  if (saved && translations[saved]) {
    setLanguage(saved);
  } else {
    const ipLang = await detectLanguageByIP();
    setLanguage(ipLang);
  }
  const switcher = document.getElementById('languageSwitcher');
  if (switcher) {
    switcher.value = currentLang;
    switcher.addEventListener('change', (e) => setLanguage(e.target.value));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguage);
} else {
  initLanguage();
}