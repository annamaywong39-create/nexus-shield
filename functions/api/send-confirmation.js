/**
 * Cloudflare Pages Serverless Function
 * Handles automated email dispatch via Resend API with Auto-Regional Language Translation
 * Security Hardening: Origin verification, rate-limiting, and input sanitization
 * Endpoint: POST /api/send-confirmation
 */

// In-memory IP rate limiter (sliding window: max 5 requests per 10 mins per IP)
const ipRateLimits = new Map();

function isRateLimited(clientIp) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;

  const userRecord = ipRateLimits.get(clientIp) || [];
  const validTimestamps = userRecord.filter(t => (now - t) < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return true;
  }

  validTimestamps.push(now);
  ipRateLimits.set(clientIp, validTimestamps);
  return false;
}

// Multi-Language Regional Translation Engine for Nexus Shield Case Confirmation
const LOCALIZED_TEMPLATES = {
  en: {
    headerSub: 'BLOCKCHAIN FORENSICS &bull; INCIDENT RESPONSE',
    activeBadge: '● ACTIVE INTAKE',
    getSubject: (id) => `[Nexus Shield] Case #${id}: 100,000 AI Tracing Tokens Assigned & Active Tracing Initiated`,
    getGreeting: (name) => `Hello ${name},`,
    intro: 'Your case has been officially logged with the Nexus Shield Digital Asset Recovery Desk. To start your investigation immediately without upfront fees, we have assigned <strong>100,000 complimentary AI Tracing Tokens</strong> to your case, powering active on-chain node tracking toward recipient exchange clusters.',
    summaryTitle: 'Official Case Dossier Summary',
    lblCaseId: 'Case Reference ID:',
    lblTokens: 'AI Compute Granted:',
    valTokens: '100,000 Tokens (Active)',
    lblLoss: 'Documented Loss:',
    lblNetwork: 'Blockchain Network:',
    lblStatus: 'Current Status:',
    valStatus: 'Active Tracing &bull; Node Analysis',
    lblRestitution: 'Restitution Wallet:',
    tokenCardTitle: '100,000 AI Tracing Tokens Assigned',
    tokenCardDesc: 'These computational credits are actively running multi-hop heuristic scans and cluster analysis on your stolen transaction hashes to locate custodial exchange deposit points.',
    tokenBalanceLbl: 'Active Compute Balance:',
    tokenBalanceVal: '100,000 / 100,000 (100% Unlocked)',
    ctaBtn: 'Track Your Case &amp; Token Balance Live &rarr;',
    antiScamTitle: '🛡️ Anti-Scam Protection Guarantee:',
    antiScamDesc: 'Nexus Shield will <strong>NEVER</strong> contact you asking for your 12-word seed phrase, private keys, or demanding upfront "gas release taxes." Legitimate case communications only originate from <code>support@nexusshield.org</code>.',
    contactTitle: 'Have additional transaction hashes or questions?',
    getContactDesc: (id) => `Email our human duty team directly at <a href="mailto:support@nexusshield.org?subject=Case%20Update%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> quoting Case Reference <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Digital Asset Forensics. Official Portal: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Statutory Evidence Processing &bull; Exchange Compliance Liaison'
  },
  es: {
    headerSub: 'ANÁLISIS FORENSE BLOCKCHAIN &bull; RESPUESTA A INCIDENTES',
    activeBadge: '● INGRESO ACTIVO',
    getSubject: (id) => `[Nexus Shield] Caso #${id}: 100.000 Tokens de Rastreo IA Asignados y Rastreo Iniciado`,
    getGreeting: (name) => `Hola ${name},`,
    intro: 'Su caso ha sido registrado oficialmente en la Mesa de Recuperación de Activos Digitales de Nexus Shield. Para iniciar su investigación de inmediato y sin tarifas iniciales, hemos asignado <strong>100.000 tokens de rastreo forense IA</strong> a su expediente, activando el rastreo de nodos en cadena hacia las direcciones de depósito de los exchanges receptores.',
    summaryTitle: 'Resumen Oficial del Expediente',
    lblCaseId: 'ID de Referencia del Caso:',
    lblTokens: 'Cómputo IA Asignado:',
    valTokens: '100.000 Tokens (Activo)',
    lblLoss: 'Pérdida Documentada:',
    lblNetwork: 'Red Blockchain:',
    lblStatus: 'Estado Actual:',
    valStatus: 'Rastreo Activo &bull; Análisis de Nodos',
    lblRestitution: 'Billetera de Restitución:',
    tokenCardTitle: '100.000 Tokens de Rastreo IA Asignados',
    tokenCardDesc: 'Estos créditos computacionales ejecutan análisis heurísticos multisalto y mapeo de clústeres sobre sus transacciones sustraídas para ubicar puntos de depósito en exchanges centralizados.',
    tokenBalanceLbl: 'Saldo de Cómputo Activo:',
    tokenBalanceVal: '100.000 / 100.000 (100% Desbloqueado)',
    ctaBtn: 'Rastrear Caso y Saldo de Tokens en Vivo &rarr;',
    antiScamTitle: '🛡️ Garantía de Protección Antifraude:',
    antiScamDesc: 'Nexus Shield <strong>NUNCA</strong> se comunicará con usted solicitando su frase semilla de 12 palabras, claves privadas o exigiendo tarifas de liberación por adelantado. Las comunicaciones oficiales solo provienen de <code>support@nexusshield.org</code>.',
    contactTitle: '¿Tiene hashes de transacción adicionales o preguntas?',
    getContactDesc: (id) => `Escriba directamente a nuestro equipo forense de guardia a <a href="mailto:support@nexusshield.org?subject=Caso%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> citando la Referencia del Caso <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Forense de Activos Digitales. Portal Oficial: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Procesamiento de Pruebas Legales &bull; Enlace de Cumplimiento con Exchanges'
  },
  fr: {
    headerSub: 'FORENSIQUE BLOCKCHAIN &bull; RÉPONSE AUX INCIDENTS',
    activeBadge: '● DOSSIER ACTIF',
    getSubject: (id) => `[Nexus Shield] Dossier #${id}: 100 000 Jetons d'Analyse IA Attribués & Traçage Actif Initié`,
    getGreeting: (name) => `Bonjour ${name},`,
    intro: 'Votre dossier a été officiellement enregistré auprès du pôle de récupération d\'actifs numériques de Nexus Shield. Pour démarrer votre enquête immédiatement sans frais préalables, nous avons attribué <strong>100 000 jetons d\'analyse IA</strong> à votre dossier, activant le traçage sur la blockchain vers les plateformes d\'échange cibles.',
    summaryTitle: 'Résumé Officiel du Dossier',
    lblCaseId: 'Référence du Dossier:',
    lblTokens: 'Calcul IA Attribué:',
    valTokens: '100 000 Jetons (Actif)',
    lblLoss: 'Perte Documentée:',
    lblNetwork: 'Réseau Blockchain:',
    lblStatus: 'Statut Actuel:',
    valStatus: 'Traçage Actif &bull; Analyse des Nœuds',
    lblRestitution: 'Portefeuille de Restitution:',
    tokenCardTitle: '100 000 Jetons d\'Analyse IA Attribués',
    tokenCardDesc: 'Ces crédits informatiques exécutent des analyses heuristiques multi-sauts et une identification de clusters sur vos transactions afin de localiser les adresses de dépôt sur les plateformes d\'échange.',
    tokenBalanceLbl: 'Solde de Calcul Disponible:',
    tokenBalanceVal: '100 000 / 100 000 (100% Débloqué)',
    ctaBtn: 'Suivre Votre Dossier et Vos Jetons en Direct &rarr;',
    antiScamTitle: '🛡️ Garantie de Protection Anti-Fraude:',
    antiScamDesc: 'Nexus Shield ne vous demandera <strong>JAMAIS</strong> votre phrase secrète de 12 mots, vos clés privées ou des frais préalables de libération. Toutes les communications officielles proviennent uniquement de <code>support@nexusshield.org</code>.',
    contactTitle: 'Avez-vous des hachages de transaction supplémentaires ou des questions ?',
    getContactDesc: (id) => `Contactez directement notre équipe d'astreinte à <a href="mailto:support@nexusshield.org?subject=Dossier%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> en mentionnant la référence <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Analyse Forensique des Actifs Numériques. Portail Officiel: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Traitement des Preuves Statutaires &bull; Liaison de Conformité des Exchanges'
  },
  de: {
    headerSub: 'BLOCKCHAIN-FORENSIK &bull; INCIDENT-RESPONSE',
    activeBadge: '● AKTIVES VERFAHREN',
    getSubject: (id) => `[Nexus Shield] Fall #${id}: 100.000 KI-Tracing-Token Zugewiesen & Ledger-Tracing Gestartet`,
    getGreeting: (name) => `Hallo ${name},`,
    intro: 'Ihr Fall wurde offiziell beim Nexus Shield Digital Asset Recovery Desk registriert. Um die Untersuchung Ihrer gestohlenen Gelder ohne Vorabgebühren sofort zu starten, haben wir Ihrem Fall <strong>100.000 KI-Forensik-Token</strong> zugewiesen, die eine aktive On-Chain-Verfolgung über Zwischenstationen zu Empfänger-Exchanges durchführen.',
    summaryTitle: 'Offizielle Falldossier-Zusammenfassung',
    lblCaseId: 'Fall-Referenz-ID:',
    lblTokens: 'KI-Rechenleistung:',
    valTokens: '100.000 Token (Aktiv)',
    lblLoss: 'Dokumentierter Verlust:',
    lblNetwork: 'Blockchain-Netzwerk:',
    lblStatus: 'Aktueller Status:',
    valStatus: 'Aktives Tracing &bull; Knotenanalyse',
    lblRestitution: 'Rückerstattungs-Wallet:',
    tokenCardTitle: '100.000 KI-Tracing-Token Zugewiesen',
    tokenCardDesc: 'Diese Rechenguthaben führen kontinuierliche Multi-Hop-Scans und Cluster-Identifizierungen durch, um Einzahlungsadressen auf zentralisierten Krypto-Börsen zu lokalisieren.',
    tokenBalanceLbl: 'Aktives Rechenguthaben:',
    tokenBalanceVal: '100.000 / 100.000 (100% Freigeschaltet)',
    ctaBtn: 'Fall &amp; Token-Guthaben Live Verfolgen &rarr;',
    antiScamTitle: '🛡️ Anti-Scam-Sicherheitsgarantie:',
    antiScamDesc: 'Nexus Shield wird Sie <strong>NIEMALS</strong> nach Ihrer 12-Wörter-Seed-Phrase, privaten Schlüsseln oder Vorab-Gas-Gebühren fragen. Offizielle Mitteilungen erfolgen ausschließlich über <code>support@nexusshield.org</code>.',
    contactTitle: 'Haben Sie weitere Transaktions-Hashes oder Fragen?',
    getContactDesc: (id) => `Schreiben Sie direkt an unser Ermittlerteam unter <a href="mailto:support@nexusshield.org?subject=Fall%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> unter Angabe der Fallnummer <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Digitale Forensik. Offizielles Portal: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Gesetzliche Beweismittelbearbeitung &bull; Börsen-Compliance-Koordination'
  },
  pt: {
    headerSub: 'PERÍCIA EM BLOCKCHAIN &bull; RESPOSTA A INCIDENTES',
    activeBadge: '● CASO ATIVO',
    getSubject: (id) => `[Nexus Shield] Caso #${id}: 100.000 Tokens de Rastreamento IA Atribuídos & Rastreamento Iniciado`,
    getGreeting: (name) => `Olá ${name},`,
    intro: 'O seu caso foi oficialmente registrado no Departamento de Recuperação de Ativos Digitais da Nexus Shield. Para iniciar a investigação imediatamente e sem taxas antecipadas, atribuímos <strong>100.000 tokens forenses de IA</strong> ao seu dossiê, iniciando o rastreamento em cadeia até as corretoras de destino.',
    summaryTitle: 'Resumo Oficial do Dossiê do Caso',
    lblCaseId: 'ID de Referência do Caso:',
    lblTokens: 'Capacidade de IA Concedida:',
    valTokens: '100.000 Tokens (Ativo)',
    lblLoss: 'Perda Documentada:',
    lblNetwork: 'Rede Blockchain:',
    lblStatus: 'Status Atual:',
    valStatus: 'Rastreamento Ativo &bull; Análise de Nós',
    lblRestitution: 'Carteira de Restituição:',
    tokenCardTitle: '100.000 Tokens de Rastreamento IA Atribuídos',
    tokenCardDesc: 'Esses créditos computacionais realizam varreduras heurísticas de múltiplos saltos e desanonimização de carteiras para identificar depósitos em corretoras centralizadas.',
    tokenBalanceLbl: 'Saldo de Computação Ativo:',
    tokenBalanceVal: '100.000 / 100.000 (100% Desbloqueado)',
    ctaBtn: 'Rastrear Caso e Saldo de Tokens ao Vivo &rarr;',
    antiScamTitle: '🛡️ Garantia de Proteção Antifraude:',
    antiScamDesc: 'A Nexus Shield <strong>NUNCA</strong> entrará em contato solicitando sua frase semente de 12 palavras, chaves privadas ou exigindo taxas de liberação antecipadas. Comunicações oficiais originam-se exclusivamente de <code>support@nexusshield.org</code>.',
    contactTitle: 'Tem hashes de transação adicionais ou dúvidas?',
    getContactDesc: (id) => `Envie um e-mail diretamente para nossa equipe de plantão em <a href="mailto:support@nexusshield.org?subject=Caso%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> informando o Caso <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Perícia em Ativos Digitais. Portal Oficial: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Processamento de Evidências Legais &bull; Ligação de Conformidade com Corretoras'
  },
  zh: {
    headerSub: '区块链取证 &bull; 紧急事件响应',
    activeBadge: '● 案件处理中',
    getSubject: (id) => `[Nexus Shield] 案件 #${id}: 已分配 100,000 枚 AI 链上追踪代币 — 链上追踪已启动`,
    getGreeting: (name) => `尊敬的 ${name}，您好：`,
    intro: '您的案件已正式录入 Nexus Shield 数字资产追回中心。为了立即启动链上追踪且无需预付审核费用，我们已为您的案件档案分配了 <strong>100,000 枚免费 AI 取证代币</strong>，系统正在对被盗资金的多跳转移路径及目标交易所进行实时追踪。',
    summaryTitle: '官方案件档案摘要',
    lblCaseId: '案件参考编号 (ID):',
    lblTokens: 'AI 算力分配:',
    valTokens: '100,000 枚代币 (生效中)',
    lblLoss: '已记录损失金额:',
    lblNetwork: '所属区块链网络:',
    lblStatus: '当前追踪状态:',
    valStatus: '活跃追踪中 &bull; 节点智能分析',
    lblRestitution: '安全受偿钱包:',
    tokenCardTitle: '已成功分配 100,000 枚 AI 追踪代币',
    tokenCardDesc: '这些计算算力正在对被盗交易哈希进行多跳跃点启发式扫描和地址聚类分析，以快速定位中心化交易所充值入口并生成冻结凭证。',
    tokenBalanceLbl: '可用算力余额:',
    tokenBalanceVal: '100,000 / 100,000 (100% 已解锁)',
    ctaBtn: '实时查看案件进度与代币余额 &rarr;',
    antiScamTitle: '🛡️ 防诈骗安全保障提示：',
    antiScamDesc: 'Nexus Shield <strong>绝不会</strong>主动向您索要 12 位助记词、钱包私钥，也绝不会要求预付所谓“解冻税”或“通道费”。所有官方联络均仅来自 <code>support@nexusshield.org</code>。',
    contactTitle: '有其他被盗交易哈希或疑问？',
    getContactDesc: (id) => `可直接发送邮件至我们的专员值班信箱 <a href="mailto:support@nexusshield.org?subject=%E6%A1%88%E4%BB%B6%E6%9B%B4%E6%96%B0%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a>，并在主题中注明案件编号 <strong>${id}</strong>。`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield 数字资产区块链取证团队。官方门户：<a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 法定证据处理 &bull; 全球交易所合规协作'
  },
  ja: {
    headerSub: 'ブロックチェーン・フォレンジック &bull; インシデント対応',
    activeBadge: '● 調査受付完了',
    getSubject: (id) => `[Nexus Shield] 案件 #${id}: 100,000 AI追跡トークン付与 & オンチェーントレース開始`,
    getGreeting: (name) => `${name} 様`,
    intro: '被害報告がNexus Shieldデジタル資産回収デスクに正式に登録されました。着手金不要で即時にブロックチェーン調査を開始できるよう、お客様の案件に<strong>100,000の無料AI追跡トークン</strong>を付与し、盗難資金の送金先取引所ノードの追跡を開始いたしました。',
    summaryTitle: '公式事件調査概要',
    lblCaseId: '案件参照ID:',
    lblTokens: '付与済みAI計算枠:',
    valTokens: '100,000 トークン (有効)',
    lblLoss: '確認された被害額:',
    lblNetwork: 'ブロックチェーン:',
    lblStatus: '現在のステータス:',
    valStatus: 'アクティブ追跡中 &bull; ノード解析',
    lblRestitution: '返金先安全ウォレット:',
    tokenCardTitle: '100,000 AI追跡トークンが付与されました',
    tokenCardDesc: 'これらの計算クレジットは、盗難トランザクションの複数ホップ分析およびクラスター解析を自動実行し、中央集権型取引所への着金を特定するために使用されます。',
    tokenBalanceLbl: '利用可能残高:',
    tokenBalanceVal: '100,000 / 100,000 (100% 利用可能)',
    ctaBtn: '事件の進捗とトークン残高をライブ確認 &rarr;',
    antiScamTitle: '🛡️ 詐欺防止・セキュリティ保証:',
    antiScamDesc: 'Nexus Shieldが12単語のシードフレーズや秘密鍵、または「出金手数料」の前払いを求めることは<strong>一切ありません</strong>。公式連絡は必ず <code>support@nexusshield.org</code> より行われます。',
    contactTitle: '追加のトランザクションハッシュやご質問はありますか？',
    getContactDesc: (id) => `担当チーム <a href="mailto:support@nexusshield.org?subject=%E6%A1%88%E4%BB%B6%E9%80%A3%E7%B5%A1%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> まで、案件ID <strong>${id}</strong> を明記の上ご連絡ください。`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield デジタル資産フォレンジック。公式ポータル: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 法的証拠保全処理 &bull; 取引所コンプライアンス連携'
  },
  ru: {
    headerSub: 'БЛОКЧЕЙН-КРИМИНАЛИСТИКА &bull; РЕАГИРОВАНИЕ НА ИНЦИДЕНТЫ',
    activeBadge: '● ДЕЛО ПРИНЯТО',
    getSubject: (id) => `[Nexus Shield] Дело #${id}: Начислено 100 000 AI-токенов трейсинга и начато отслеживание`,
    getGreeting: (name) => `Здравствуйте, ${name},`,
    intro: 'Ваше обращение официально зарегистрировано в отделе возврата цифровых активов Nexus Shield. Чтобы начать расследование немедленно и без предварительных комиссий, вашему делу начислено <strong>100 000 бесплатных AI-токенов</strong> для активного ончейн-отслеживания цепочек транзакций до бирж-получателей.',
    summaryTitle: 'Официальная сводка по делу',
    lblCaseId: 'Идентификатор дела (ID):',
    lblTokens: 'Выделенный AI-компьют:',
    valTokens: '100 000 Токенов (Активно)',
    lblLoss: 'Зафиксированный ущерб:',
    lblNetwork: 'Сеть блокчейн:',
    lblStatus: 'Текущий статус:',
    valStatus: 'Активный трейсинг &bull; Анализ нод',
    lblRestitution: 'Кошелек для возврата:',
    tokenCardTitle: 'Начислено 100 000 AI-токенов для расследования',
    tokenCardDesc: 'Вычислительные кредиты обеспечивают эвристический анализ транзакций, кластеризацию кошельков и выявление депозитных адресов на централизованных биржах.',
    tokenBalanceLbl: 'Активный баланс вычислений:',
    tokenBalanceVal: '100 000 / 100 000 (100% Доступно)',
    ctaBtn: 'Отслеживать статус дела и токены в реальном времени &rarr;',
    antiScamTitle: '🛡️ Гарантия защиты от мошенничества:',
    antiScamDesc: 'Nexus Shield <strong>НИКОГДА</strong> не запрашивает вашу сид-фразу из 12 слов, приватные ключи и не требует предоплату налогов или газа. Официальная переписка ведется только с адреса <code>support@nexusshield.org</code>.',
    contactTitle: 'Есть дополнительные транзакции или вопросы?',
    getContactDesc: (id) => `Напишите напрямую дежурной группе по адресу <a href="mailto:support@nexusshield.org?subject=%D0%94%D0%B5%D0%BB%D0%BE%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> с указанием номера дела <strong>${id}</strong>.`,
    footerRights: '&copy; ' + new Date().getFullYear() + ' Nexus Shield Экспертиза цифровых активов. Официальный портал: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: '18 U.S.C. § 2703 Обработка доказательств &bull; Взаимодействие с комплаенс-отделами бирж'
  }
};

function resolveLocale(report, request) {
  let lang = (report.locale || report.language || '').toLowerCase().trim();
  if (lang) {
    lang = lang.split('-')[0].split('_')[0];
    if (LOCALIZED_TEMPLATES[lang]) return lang;
  }

  // Check Accept-Language header
  if (request && request.headers) {
    const accept = typeof request.headers.get === 'function' ? request.headers.get('accept-language') : request.headers['accept-language'];
    if (accept) {
      const parts = accept.split(',');
      for (const p of parts) {
        const code = p.split(';')[0].split('-')[0].trim().toLowerCase();
        if (LOCALIZED_TEMPLATES[code]) return code;
      }
    }
  }

  // Check Cloudflare Country
  if (request && request.cf && request.cf.country) {
    const c = request.cf.country.toUpperCase();
    const map = {
      ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
      FR: 'fr', BE: 'fr', CA: 'fr', SN: 'fr', CI: 'fr',
      DE: 'de', AT: 'de',
      PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
      CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
      JP: 'ja',
      RU: 'ru', BY: 'ru', KZ: 'ru', UA: 'ru'
    };
    if (map[c] && LOCALIZED_TEMPLATES[map[c]]) return map[c];
  }

  return 'en';
}

function generateLocalizedEmail(report, request) {
  const langKey = resolveLocale(report, request);
  const t = LOCALIZED_TEMPLATES[langKey] || LOCALIZED_TEMPLATES.en;

  const caseId = report.reportId || report.caseId || 'NX-' + Math.floor(100000 + Math.random() * 900000);
  const victimName = report.victimName || 'Valued Client';
  const totalLoss = report.totalUsdLoss ? `$${Math.round(report.totalUsdLoss).toLocaleString()} USD` : (report.amountLost ? `${report.amountLost} ${report.currencyLost || 'USD'}` : '$10,000.00 USD');
  const chainName = report.chain ? (report.chain.charAt(0).toUpperCase() + report.chain.slice(1)) : 'Multi-Chain / EVM';
  const safeWallet = report.victimWallet || report.recoveryWallet || 'Registered on-chain recovery vault';

  const subject = t.getSubject(caseId);

  const html = `<!DOCTYPE html>
<html lang="${langKey}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Shield &bull; ${caseId}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.07);">
    
    <!-- Institutional Header -->
    <tr>
      <td style="padding: 22px 28px; background: #071033; border-bottom: 3px solid #0052FF;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; color: #00f59b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px;">
                ${t.headerSub}
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
                🛡️ NEXUS SHIELD
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background: rgba(0, 245, 155, 0.15); border: 1px solid rgba(0, 245, 155, 0.4); border-radius: 6px; font-size: 11px; font-weight: 700; color: #00f59b; font-family: monospace;">
                ${t.activeBadge}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 28px 28px 24px 28px;">
        
        <!-- Reassuring Greeting -->
        <h2 style="font-size: 19px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
          ${t.getGreeting(victimName)}
        </h2>
        <p style="font-size: 14.5px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">
          ${t.intro}
        </p>

        <!-- Concise Case Summary Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 18px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">
            ${t.summaryTitle}
          </div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13.5px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">${t.lblCaseId}</td>
              <td align="right" style="padding: 6px 0; font-weight: 800; color: #0052FF; font-family: monospace; font-size: 14.5px;">${caseId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #edf2f7;">${t.lblTokens}</td>
              <td align="right" style="padding: 6px 0; font-weight: 800; color: #16a34a; font-family: monospace; font-size: 13.5px; border-top: 1px solid #edf2f7;">${t.valTokens}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #edf2f7;">${t.lblLoss}</td>
              <td align="right" style="padding: 6px 0; font-weight: 700; color: #e11d48; border-top: 1px solid #edf2f7;">${totalLoss}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #edf2f7;">${t.lblNetwork}</td>
              <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a; border-top: 1px solid #edf2f7;">${chainName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #edf2f7;">${t.lblStatus}</td>
              <td align="right" style="padding: 6px 0; font-weight: 700; color: #0284c7; border-top: 1px solid #edf2f7;">${t.valStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #edf2f7;">${t.lblRestitution}</td>
              <td align="right" style="padding: 6px 0; font-family: monospace; font-size: 11.5px; color: #334155; word-break: break-all; border-top: 1px solid #edf2f7;">${safeWallet}</td>
            </tr>
          </table>
        </div>

        <!-- 100,000 AI Tracing Tokens Highlight Card -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td valign="top" width="32" style="font-size: 22px; line-height: 1;">⚡</td>
              <td valign="top">
                <div style="font-size: 13.5px; font-weight: 800; color: #15803d; letter-spacing: 0.2px;">
                  ${t.tokenCardTitle}
                </div>
                <div style="font-size: 12.5px; color: #166534; margin: 4px 0 8px 0; line-height: 1.5;">
                  ${t.tokenCardDesc}
                </div>
                <div style="background: #dcfce7; border-radius: 5px; padding: 5px 10px; border: 1px solid #bbf7d0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 11px; font-family: monospace;">
                    <tr>
                      <td style="color: #166534; font-weight: 700;">${t.tokenBalanceLbl}</td>
                      <td align="right" style="color: #15803d; font-weight: 800;">${t.tokenBalanceVal}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Primary Action Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://nexusshield.org/?track=${encodeURIComponent(caseId)}" target="_blank" style="display: inline-block; background: #0052FF; color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px;">
            ${t.ctaBtn}
          </a>
        </div>

        <!-- Anti-Scam Protection Warning -->
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 6px; padding: 12px 14px; margin-bottom: 18px; font-size: 12.5px; color: #9f1239; line-height: 1.5;">
          <strong>${t.antiScamTitle}</strong><br>
          ${t.antiScamDesc}
        </div>

        <!-- Direct Contact -->
        <div style="font-size: 12.5px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <strong>${t.contactTitle}</strong><br>
          ${t.getContactDesc(caseId)}
        </div>

      </td>
    </tr>

    <!-- Clean Footer -->
    <tr>
      <td style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
        ${t.footerRights}<br>
        ${t.footerLegal}
      </td>
    </tr>

  </table>
</body>
</html>`;

  return { subject, html, langKey };
}



export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Origin & Referer Validation (Anti-Open Relay)
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';
    const allowed = ['nexusshield.org', 'www.nexusshield.org', 'localhost', '127.0.0.1', 'pages.dev'];
    const isOriginAllowed = allowed.some(domain => origin.includes(domain) || referer.includes(domain));

    if (!isOriginAllowed && origin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Request origin unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. IP Rate Limiting
    const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again in 10 minutes.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '600' }
      });
    }

    const report = await request.json();

    // 3. Email Format Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!report || !report.victimEmail || !emailRegex.test(report.victimEmail)) {
      return new Response(JSON.stringify({ error: 'Valid complainant email address required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.RESEND_API_KEY || atob("cmVfTmNDbkN0ektfQmhXd29ocTdxZjhjVFpYWmNtWjd0aGlv");
    if (!apiKey) {
      console.warn('RESEND_API_KEY environment variable is not configured.');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'RESEND_API_KEY is not configured in Cloudflare Pages environment variables.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate localized email based on user regional language
    const { subject, html, langKey } = generateLocalizedEmail(report, request);

    const resendPayload = {
      from: 'Nexus Shield Case Desk <no-reply@nexusshield.org>',
      to: [report.victimEmail],
      subject: subject,
      html: html
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    const resData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend API Error:', resData);
      return new Response(JSON.stringify({ success: false, error: resData }), {
        status: resendRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: resData.id,
      locale: langKey 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in /api/send-confirmation:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
