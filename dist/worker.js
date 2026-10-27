var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var workerRateLimits = /* @__PURE__ */ new Map();
function isWorkerRateLimited(clientIp) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1e3;
  const maxRequests = 5;
  const userRecord = workerRateLimits.get(clientIp) || [];
  const validTimestamps = userRecord.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= maxRequests) {
    return true;
  }
  validTimestamps.push(now);
  workerRateLimits.set(clientIp, validTimestamps);
  return false;
}
__name(isWorkerRateLimited, "isWorkerRateLimited");
var LOCALIZED_TEMPLATES = {
  en: {
    headerSub: "BLOCKCHAIN FORENSICS &bull; INCIDENT RESPONSE",
    activeBadge: "\u25CF ACTIVE INTAKE",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] Case #${id}: 100,000 AI Tracing Tokens Assigned & Active Tracing Initiated`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `Hello ${name},`, "getGreeting"),
    intro: "Your case has been officially logged with the Nexus Shield Digital Asset Recovery Desk. To start your investigation immediately without upfront fees, we have assigned <strong>100,000 complimentary AI Tracing Tokens</strong> to your case, powering active on-chain node tracking toward recipient exchange clusters.",
    summaryTitle: "Official Case Dossier Summary",
    lblCaseId: "Case Reference ID:",
    lblTokens: "AI Compute Granted:",
    valTokens: "100,000 Tokens (Active)",
    lblLoss: "Documented Loss:",
    lblNetwork: "Blockchain Network:",
    lblStatus: "Current Status:",
    valStatus: "Active Tracing &bull; Node Analysis",
    lblRestitution: "Restitution Wallet:",
    tokenCardTitle: "100,000 AI Tracing Tokens Assigned",
    tokenCardDesc: "These computational credits are actively running multi-hop heuristic scans and cluster analysis on your stolen transaction hashes to locate custodial exchange deposit points.",
    tokenBalanceLbl: "Active Compute Balance:",
    tokenBalanceVal: "100,000 / 100,000 (100% Unlocked)",
    ctaBtn: "Track Your Case &amp; Token Balance Live &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F Anti-Scam Protection Guarantee:",
    antiScamDesc: 'Nexus Shield will <strong>NEVER</strong> contact you asking for your 12-word seed phrase, private keys, or demanding upfront "gas release taxes." Legitimate case communications only originate from <code>support@nexusshield.org</code>.',
    contactTitle: "Have additional transaction hashes or questions?",
    getContactDesc: /* @__PURE__ */ __name((id) => `Email our human duty team directly at <a href="mailto:support@nexusshield.org?subject=Case%20Update%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> quoting Case Reference <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield Digital Asset Forensics. Official Portal: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 Statutory Evidence Processing &bull; Exchange Compliance Liaison"
  },
  es: {
    headerSub: "AN\xC1LISIS FORENSE BLOCKCHAIN &bull; RESPUESTA A INCIDENTES",
    activeBadge: "\u25CF INGRESO ACTIVO",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] Caso #${id}: 100.000 Tokens de Rastreo IA Asignados y Rastreo Iniciado`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `Hola ${name},`, "getGreeting"),
    intro: "Su caso ha sido registrado oficialmente en la Mesa de Recuperaci\xF3n de Activos Digitales de Nexus Shield. Para iniciar su investigaci\xF3n de inmediato y sin tarifas iniciales, hemos asignado <strong>100.000 tokens de rastreo forense IA</strong> a su expediente, activando el rastreo de nodos en cadena hacia las direcciones de dep\xF3sito de los exchanges receptores.",
    summaryTitle: "Resumen Oficial del Expediente",
    lblCaseId: "ID de Referencia del Caso:",
    lblTokens: "C\xF3mputo IA Asignado:",
    valTokens: "100.000 Tokens (Activo)",
    lblLoss: "P\xE9rdida Documentada:",
    lblNetwork: "Red Blockchain:",
    lblStatus: "Estado Actual:",
    valStatus: "Rastreo Activo &bull; An\xE1lisis de Nodos",
    lblRestitution: "Billetera de Restituci\xF3n:",
    tokenCardTitle: "100.000 Tokens de Rastreo IA Asignados",
    tokenCardDesc: "Estos cr\xE9ditos computacionales ejecutan an\xE1lisis heur\xEDsticos multisalto y mapeo de cl\xFAsteres sobre sus transacciones sustra\xEDdas para ubicar puntos de dep\xF3sito en exchanges centralizados.",
    tokenBalanceLbl: "Saldo de C\xF3mputo Activo:",
    tokenBalanceVal: "100.000 / 100.000 (100% Desbloqueado)",
    ctaBtn: "Rastrear Caso y Saldo de Tokens en Vivo &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F Garant\xEDa de Protecci\xF3n Antifraude:",
    antiScamDesc: "Nexus Shield <strong>NUNCA</strong> se comunicar\xE1 con usted solicitando su frase semilla de 12 palabras, claves privadas o exigiendo tarifas de liberaci\xF3n por adelantado. Las comunicaciones oficiales solo provienen de <code>support@nexusshield.org</code>.",
    contactTitle: "\xBFTiene hashes de transacci\xF3n adicionales o preguntas?",
    getContactDesc: /* @__PURE__ */ __name((id) => `Escriba directamente a nuestro equipo forense de guardia a <a href="mailto:support@nexusshield.org?subject=Caso%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> citando la Referencia del Caso <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield Forense de Activos Digitales. Portal Oficial: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 Procesamiento de Pruebas Legales &bull; Enlace de Cumplimiento con Exchanges"
  },
  fr: {
    headerSub: "FORENSIQUE BLOCKCHAIN &bull; R\xC9PONSE AUX INCIDENTS",
    activeBadge: "\u25CF DOSSIER ACTIF",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] Dossier #${id}: 100 000 Jetons d'Analyse IA Attribu\xE9s & Tra\xE7age Actif Initi\xE9`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `Bonjour ${name},`, "getGreeting"),
    intro: "Votre dossier a \xE9t\xE9 officiellement enregistr\xE9 aupr\xE8s du p\xF4le de r\xE9cup\xE9ration d'actifs num\xE9riques de Nexus Shield. Pour d\xE9marrer votre enqu\xEAte imm\xE9diatement sans frais pr\xE9alables, nous avons attribu\xE9 <strong>100 000 jetons d'analyse IA</strong> \xE0 votre dossier, activant le tra\xE7age sur la blockchain vers les plateformes d'\xE9change cibles.",
    summaryTitle: "R\xE9sum\xE9 Officiel du Dossier",
    lblCaseId: "R\xE9f\xE9rence du Dossier:",
    lblTokens: "Calcul IA Attribu\xE9:",
    valTokens: "100 000 Jetons (Actif)",
    lblLoss: "Perte Document\xE9e:",
    lblNetwork: "R\xE9seau Blockchain:",
    lblStatus: "Statut Actuel:",
    valStatus: "Tra\xE7age Actif &bull; Analyse des N\u0153uds",
    lblRestitution: "Portefeuille de Restitution:",
    tokenCardTitle: "100 000 Jetons d'Analyse IA Attribu\xE9s",
    tokenCardDesc: "Ces cr\xE9dits informatiques ex\xE9cutent des analyses heuristiques multi-sauts et une identification de clusters sur vos transactions afin de localiser les adresses de d\xE9p\xF4t sur les plateformes d'\xE9change.",
    tokenBalanceLbl: "Solde de Calcul Disponible:",
    tokenBalanceVal: "100 000 / 100 000 (100% D\xE9bloqu\xE9)",
    ctaBtn: "Suivre Votre Dossier et Vos Jetons en Direct &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F Garantie de Protection Anti-Fraude:",
    antiScamDesc: "Nexus Shield ne vous demandera <strong>JAMAIS</strong> votre phrase secr\xE8te de 12 mots, vos cl\xE9s priv\xE9es ou des frais pr\xE9alables de lib\xE9ration. Toutes les communications officielles proviennent uniquement de <code>support@nexusshield.org</code>.",
    contactTitle: "Avez-vous des hachages de transaction suppl\xE9mentaires ou des questions ?",
    getContactDesc: /* @__PURE__ */ __name((id) => `Contactez directement notre \xE9quipe d'astreinte \xE0 <a href="mailto:support@nexusshield.org?subject=Dossier%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> en mentionnant la r\xE9f\xE9rence <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield Analyse Forensique des Actifs Num\xE9riques. Portail Officiel: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 Traitement des Preuves Statutaires &bull; Liaison de Conformit\xE9 des Exchanges"
  },
  de: {
    headerSub: "BLOCKCHAIN-FORENSIK &bull; INCIDENT-RESPONSE",
    activeBadge: "\u25CF AKTIVES VERFAHREN",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] Fall #${id}: 100.000 KI-Tracing-Token Zugewiesen & Ledger-Tracing Gestartet`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `Hallo ${name},`, "getGreeting"),
    intro: "Ihr Fall wurde offiziell beim Nexus Shield Digital Asset Recovery Desk registriert. Um die Untersuchung Ihrer gestohlenen Gelder ohne Vorabgeb\xFChren sofort zu starten, haben wir Ihrem Fall <strong>100.000 KI-Forensik-Token</strong> zugewiesen, die eine aktive On-Chain-Verfolgung \xFCber Zwischenstationen zu Empf\xE4nger-Exchanges durchf\xFChren.",
    summaryTitle: "Offizielle Falldossier-Zusammenfassung",
    lblCaseId: "Fall-Referenz-ID:",
    lblTokens: "KI-Rechenleistung:",
    valTokens: "100.000 Token (Aktiv)",
    lblLoss: "Dokumentierter Verlust:",
    lblNetwork: "Blockchain-Netzwerk:",
    lblStatus: "Aktueller Status:",
    valStatus: "Aktives Tracing &bull; Knotenanalyse",
    lblRestitution: "R\xFCckerstattungs-Wallet:",
    tokenCardTitle: "100.000 KI-Tracing-Token Zugewiesen",
    tokenCardDesc: "Diese Rechenguthaben f\xFChren kontinuierliche Multi-Hop-Scans und Cluster-Identifizierungen durch, um Einzahlungsadressen auf zentralisierten Krypto-B\xF6rsen zu lokalisieren.",
    tokenBalanceLbl: "Aktives Rechenguthaben:",
    tokenBalanceVal: "100.000 / 100.000 (100% Freigeschaltet)",
    ctaBtn: "Fall &amp; Token-Guthaben Live Verfolgen &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F Anti-Scam-Sicherheitsgarantie:",
    antiScamDesc: "Nexus Shield wird Sie <strong>NIEMALS</strong> nach Ihrer 12-W\xF6rter-Seed-Phrase, privaten Schl\xFCsseln oder Vorab-Gas-Geb\xFChren fragen. Offizielle Mitteilungen erfolgen ausschlie\xDFlich \xFCber <code>support@nexusshield.org</code>.",
    contactTitle: "Haben Sie weitere Transaktions-Hashes oder Fragen?",
    getContactDesc: /* @__PURE__ */ __name((id) => `Schreiben Sie direkt an unser Ermittlerteam unter <a href="mailto:support@nexusshield.org?subject=Fall%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> unter Angabe der Fallnummer <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield Digitale Forensik. Offizielles Portal: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 Gesetzliche Beweismittelbearbeitung &bull; B\xF6rsen-Compliance-Koordination"
  },
  pt: {
    headerSub: "PER\xCDCIA EM BLOCKCHAIN &bull; RESPOSTA A INCIDENTES",
    activeBadge: "\u25CF CASO ATIVO",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] Caso #${id}: 100.000 Tokens de Rastreamento IA Atribu\xEDdos & Rastreamento Iniciado`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `Ol\xE1 ${name},`, "getGreeting"),
    intro: "O seu caso foi oficialmente registrado no Departamento de Recupera\xE7\xE3o de Ativos Digitais da Nexus Shield. Para iniciar a investiga\xE7\xE3o imediatamente e sem taxas antecipadas, atribu\xEDmos <strong>100.000 tokens forenses de IA</strong> ao seu dossi\xEA, iniciando o rastreamento em cadeia at\xE9 as corretoras de destino.",
    summaryTitle: "Resumo Oficial do Dossi\xEA do Caso",
    lblCaseId: "ID de Refer\xEAncia do Caso:",
    lblTokens: "Capacidade de IA Concedida:",
    valTokens: "100.000 Tokens (Ativo)",
    lblLoss: "Perda Documentada:",
    lblNetwork: "Rede Blockchain:",
    lblStatus: "Status Atual:",
    valStatus: "Rastreamento Ativo &bull; An\xE1lise de N\xF3s",
    lblRestitution: "Carteira de Restitui\xE7\xE3o:",
    tokenCardTitle: "100.000 Tokens de Rastreamento IA Atribu\xEDdos",
    tokenCardDesc: "Esses cr\xE9ditos computacionais realizam varreduras heur\xEDsticas de m\xFAltiplos saltos e desanonimiza\xE7\xE3o de carteiras para identificar dep\xF3sitos em corretoras centralizadas.",
    tokenBalanceLbl: "Saldo de Computa\xE7\xE3o Ativo:",
    tokenBalanceVal: "100.000 / 100.000 (100% Desbloqueado)",
    ctaBtn: "Rastrear Caso e Saldo de Tokens ao Vivo &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F Garantia de Prote\xE7\xE3o Antifraude:",
    antiScamDesc: "A Nexus Shield <strong>NUNCA</strong> entrar\xE1 em contato solicitando sua frase semente de 12 palavras, chaves privadas ou exigindo taxas de libera\xE7\xE3o antecipadas. Comunica\xE7\xF5es oficiais originam-se exclusivamente de <code>support@nexusshield.org</code>.",
    contactTitle: "Tem hashes de transa\xE7\xE3o adicionais ou d\xFAvidas?",
    getContactDesc: /* @__PURE__ */ __name((id) => `Envie um e-mail diretamente para nossa equipe de plant\xE3o em <a href="mailto:support@nexusshield.org?subject=Caso%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> informando o Caso <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield Per\xEDcia em Ativos Digitais. Portal Oficial: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 Processamento de Evid\xEAncias Legais &bull; Liga\xE7\xE3o de Conformidade com Corretoras"
  },
  zh: {
    headerSub: "\u533A\u5757\u94FE\u53D6\u8BC1 &bull; \u7D27\u6025\u4E8B\u4EF6\u54CD\u5E94",
    activeBadge: "\u25CF \u6848\u4EF6\u5904\u7406\u4E2D",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] \u6848\u4EF6 #${id}: \u5DF2\u5206\u914D 100,000 \u679A AI \u94FE\u4E0A\u8FFD\u8E2A\u4EE3\u5E01 \u2014 \u94FE\u4E0A\u8FFD\u8E2A\u5DF2\u542F\u52A8`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `\u5C0A\u656C\u7684 ${name}\uFF0C\u60A8\u597D\uFF1A`, "getGreeting"),
    intro: "\u60A8\u7684\u6848\u4EF6\u5DF2\u6B63\u5F0F\u5F55\u5165 Nexus Shield \u6570\u5B57\u8D44\u4EA7\u8FFD\u56DE\u4E2D\u5FC3\u3002\u4E3A\u4E86\u7ACB\u5373\u542F\u52A8\u94FE\u4E0A\u8FFD\u8E2A\u4E14\u65E0\u9700\u9884\u4ED8\u5BA1\u6838\u8D39\u7528\uFF0C\u6211\u4EEC\u5DF2\u4E3A\u60A8\u7684\u6848\u4EF6\u6863\u6848\u5206\u914D\u4E86 <strong>100,000 \u679A\u514D\u8D39 AI \u53D6\u8BC1\u4EE3\u5E01</strong>\uFF0C\u7CFB\u7EDF\u6B63\u5728\u5BF9\u88AB\u76D7\u8D44\u91D1\u7684\u591A\u8DF3\u8F6C\u79FB\u8DEF\u5F84\u53CA\u76EE\u6807\u4EA4\u6613\u6240\u8FDB\u884C\u5B9E\u65F6\u8FFD\u8E2A\u3002",
    summaryTitle: "\u5B98\u65B9\u6848\u4EF6\u6863\u6848\u6458\u8981",
    lblCaseId: "\u6848\u4EF6\u53C2\u8003\u7F16\u53F7 (ID):",
    lblTokens: "AI \u7B97\u529B\u5206\u914D:",
    valTokens: "100,000 \u679A\u4EE3\u5E01 (\u751F\u6548\u4E2D)",
    lblLoss: "\u5DF2\u8BB0\u5F55\u635F\u5931\u91D1\u989D:",
    lblNetwork: "\u6240\u5C5E\u533A\u5757\u94FE\u7F51\u7EDC:",
    lblStatus: "\u5F53\u524D\u8FFD\u8E2A\u72B6\u6001:",
    valStatus: "\u6D3B\u8DC3\u8FFD\u8E2A\u4E2D &bull; \u8282\u70B9\u667A\u80FD\u5206\u6790",
    lblRestitution: "\u5B89\u5168\u53D7\u507F\u94B1\u5305:",
    tokenCardTitle: "\u5DF2\u6210\u529F\u5206\u914D 100,000 \u679A AI \u8FFD\u8E2A\u4EE3\u5E01",
    tokenCardDesc: "\u8FD9\u4E9B\u8BA1\u7B97\u7B97\u529B\u6B63\u5728\u5BF9\u88AB\u76D7\u4EA4\u6613\u54C8\u5E0C\u8FDB\u884C\u591A\u8DF3\u8DC3\u70B9\u542F\u53D1\u5F0F\u626B\u63CF\u548C\u5730\u5740\u805A\u7C7B\u5206\u6790\uFF0C\u4EE5\u5FEB\u901F\u5B9A\u4F4D\u4E2D\u5FC3\u5316\u4EA4\u6613\u6240\u5145\u503C\u5165\u53E3\u5E76\u751F\u6210\u51BB\u7ED3\u51ED\u8BC1\u3002",
    tokenBalanceLbl: "\u53EF\u7528\u7B97\u529B\u4F59\u989D:",
    tokenBalanceVal: "100,000 / 100,000 (100% \u5DF2\u89E3\u9501)",
    ctaBtn: "\u5B9E\u65F6\u67E5\u770B\u6848\u4EF6\u8FDB\u5EA6\u4E0E\u4EE3\u5E01\u4F59\u989D &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F \u9632\u8BC8\u9A97\u5B89\u5168\u4FDD\u969C\u63D0\u793A\uFF1A",
    antiScamDesc: "Nexus Shield <strong>\u7EDD\u4E0D\u4F1A</strong>\u4E3B\u52A8\u5411\u60A8\u7D22\u8981 12 \u4F4D\u52A9\u8BB0\u8BCD\u3001\u94B1\u5305\u79C1\u94A5\uFF0C\u4E5F\u7EDD\u4E0D\u4F1A\u8981\u6C42\u9884\u4ED8\u6240\u8C13\u201C\u89E3\u51BB\u7A0E\u201D\u6216\u201C\u901A\u9053\u8D39\u201D\u3002\u6240\u6709\u5B98\u65B9\u8054\u7EDC\u5747\u4EC5\u6765\u81EA <code>support@nexusshield.org</code>\u3002",
    contactTitle: "\u6709\u5176\u4ED6\u88AB\u76D7\u4EA4\u6613\u54C8\u5E0C\u6216\u7591\u95EE\uFF1F",
    getContactDesc: /* @__PURE__ */ __name((id) => `\u53EF\u76F4\u63A5\u53D1\u9001\u90AE\u4EF6\u81F3\u6211\u4EEC\u7684\u4E13\u5458\u503C\u73ED\u4FE1\u7BB1 <a href="mailto:support@nexusshield.org?subject=%E6%A1%88%E4%BB%B6%E6%9B%B4%E6%96%B0%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a>\uFF0C\u5E76\u5728\u4E3B\u9898\u4E2D\u6CE8\u660E\u6848\u4EF6\u7F16\u53F7 <strong>${id}</strong>\u3002`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield \u6570\u5B57\u8D44\u4EA7\u533A\u5757\u94FE\u53D6\u8BC1\u56E2\u961F\u3002\u5B98\u65B9\u95E8\u6237\uFF1A<a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 \u6CD5\u5B9A\u8BC1\u636E\u5904\u7406 &bull; \u5168\u7403\u4EA4\u6613\u6240\u5408\u89C4\u534F\u4F5C"
  },
  ja: {
    headerSub: "\u30D6\u30ED\u30C3\u30AF\u30C1\u30A7\u30FC\u30F3\u30FB\u30D5\u30A9\u30EC\u30F3\u30B8\u30C3\u30AF &bull; \u30A4\u30F3\u30B7\u30C7\u30F3\u30C8\u5BFE\u5FDC",
    activeBadge: "\u25CF \u8ABF\u67FB\u53D7\u4ED8\u5B8C\u4E86",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] \u6848\u4EF6 #${id}: 100,000 AI\u8FFD\u8DE1\u30C8\u30FC\u30AF\u30F3\u4ED8\u4E0E & \u30AA\u30F3\u30C1\u30A7\u30FC\u30F3\u30C8\u30EC\u30FC\u30B9\u958B\u59CB`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `${name} \u69D8`, "getGreeting"),
    intro: "\u88AB\u5BB3\u5831\u544A\u304CNexus Shield\u30C7\u30B8\u30BF\u30EB\u8CC7\u7523\u56DE\u53CE\u30C7\u30B9\u30AF\u306B\u6B63\u5F0F\u306B\u767B\u9332\u3055\u308C\u307E\u3057\u305F\u3002\u7740\u624B\u91D1\u4E0D\u8981\u3067\u5373\u6642\u306B\u30D6\u30ED\u30C3\u30AF\u30C1\u30A7\u30FC\u30F3\u8ABF\u67FB\u3092\u958B\u59CB\u3067\u304D\u308B\u3088\u3046\u3001\u304A\u5BA2\u69D8\u306E\u6848\u4EF6\u306B<strong>100,000\u306E\u7121\u6599AI\u8FFD\u8DE1\u30C8\u30FC\u30AF\u30F3</strong>\u3092\u4ED8\u4E0E\u3057\u3001\u76D7\u96E3\u8CC7\u91D1\u306E\u9001\u91D1\u5148\u53D6\u5F15\u6240\u30CE\u30FC\u30C9\u306E\u8FFD\u8DE1\u3092\u958B\u59CB\u3044\u305F\u3057\u307E\u3057\u305F\u3002",
    summaryTitle: "\u516C\u5F0F\u4E8B\u4EF6\u8ABF\u67FB\u6982\u8981",
    lblCaseId: "\u6848\u4EF6\u53C2\u7167ID:",
    lblTokens: "\u4ED8\u4E0E\u6E08\u307FAI\u8A08\u7B97\u67A0:",
    valTokens: "100,000 \u30C8\u30FC\u30AF\u30F3 (\u6709\u52B9)",
    lblLoss: "\u78BA\u8A8D\u3055\u308C\u305F\u88AB\u5BB3\u984D:",
    lblNetwork: "\u30D6\u30ED\u30C3\u30AF\u30C1\u30A7\u30FC\u30F3:",
    lblStatus: "\u73FE\u5728\u306E\u30B9\u30C6\u30FC\u30BF\u30B9:",
    valStatus: "\u30A2\u30AF\u30C6\u30A3\u30D6\u8FFD\u8DE1\u4E2D &bull; \u30CE\u30FC\u30C9\u89E3\u6790",
    lblRestitution: "\u8FD4\u91D1\u5148\u5B89\u5168\u30A6\u30A9\u30EC\u30C3\u30C8:",
    tokenCardTitle: "100,000 AI\u8FFD\u8DE1\u30C8\u30FC\u30AF\u30F3\u304C\u4ED8\u4E0E\u3055\u308C\u307E\u3057\u305F",
    tokenCardDesc: "\u3053\u308C\u3089\u306E\u8A08\u7B97\u30AF\u30EC\u30B8\u30C3\u30C8\u306F\u3001\u76D7\u96E3\u30C8\u30E9\u30F3\u30B6\u30AF\u30B7\u30E7\u30F3\u306E\u8907\u6570\u30DB\u30C3\u30D7\u5206\u6790\u304A\u3088\u3073\u30AF\u30E9\u30B9\u30BF\u30FC\u89E3\u6790\u3092\u81EA\u52D5\u5B9F\u884C\u3057\u3001\u4E2D\u592E\u96C6\u6A29\u578B\u53D6\u5F15\u6240\u3078\u306E\u7740\u91D1\u3092\u7279\u5B9A\u3059\u308B\u305F\u3081\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002",
    tokenBalanceLbl: "\u5229\u7528\u53EF\u80FD\u6B8B\u9AD8:",
    tokenBalanceVal: "100,000 / 100,000 (100% \u5229\u7528\u53EF\u80FD)",
    ctaBtn: "\u4E8B\u4EF6\u306E\u9032\u6357\u3068\u30C8\u30FC\u30AF\u30F3\u6B8B\u9AD8\u3092\u30E9\u30A4\u30D6\u78BA\u8A8D &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F \u8A50\u6B3A\u9632\u6B62\u30FB\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u4FDD\u8A3C:",
    antiScamDesc: "Nexus Shield\u304C12\u5358\u8A9E\u306E\u30B7\u30FC\u30C9\u30D5\u30EC\u30FC\u30BA\u3084\u79D8\u5BC6\u9375\u3001\u307E\u305F\u306F\u300C\u51FA\u91D1\u624B\u6570\u6599\u300D\u306E\u524D\u6255\u3044\u3092\u6C42\u3081\u308B\u3053\u3068\u306F<strong>\u4E00\u5207\u3042\u308A\u307E\u305B\u3093</strong>\u3002\u516C\u5F0F\u9023\u7D61\u306F\u5FC5\u305A <code>${supportEmail}</code> \u3088\u308A\u884C\u308F\u308C\u307E\u3059\u3002",
    contactTitle: "\u8FFD\u52A0\u306E\u30C8\u30E9\u30F3\u30B6\u30AF\u30B7\u30E7\u30F3\u30CF\u30C3\u30B7\u30E5\u3084\u3054\u8CEA\u554F\u306F\u3042\u308A\u307E\u3059\u304B\uFF1F",
    getContactDesc: /* @__PURE__ */ __name((id) => `\u62C5\u5F53\u30C1\u30FC\u30E0 <a href="mailto:support@nexusshield.org?subject=%E6%A1%88%E4%BB%B6%E9%80%A3%E7%B5%A1%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> \u307E\u3067\u3001\u6848\u4EF6ID <strong>${id}</strong> \u3092\u660E\u8A18\u306E\u4E0A\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\u3002`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield \u30C7\u30B8\u30BF\u30EB\u8CC7\u7523\u30D5\u30A9\u30EC\u30F3\u30B8\u30C3\u30AF\u3002\u516C\u5F0F\u30DD\u30FC\u30BF\u30EB: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 \u6CD5\u7684\u8A3C\u62E0\u4FDD\u5168\u51E6\u7406 &bull; \u53D6\u5F15\u6240\u30B3\u30F3\u30D7\u30E9\u30A4\u30A2\u30F3\u30B9\u9023\u643A"
  },
  ru: {
    headerSub: "\u0411\u041B\u041E\u041A\u0427\u0415\u0419\u041D-\u041A\u0420\u0418\u041C\u0418\u041D\u0410\u041B\u0418\u0421\u0422\u0418\u041A\u0410 &bull; \u0420\u0415\u0410\u0413\u0418\u0420\u041E\u0412\u0410\u041D\u0418\u0415 \u041D\u0410 \u0418\u041D\u0426\u0418\u0414\u0415\u041D\u0422\u042B",
    activeBadge: "\u25CF \u0414\u0415\u041B\u041E \u041F\u0420\u0418\u041D\u042F\u0422\u041E",
    getSubject: /* @__PURE__ */ __name((id) => `[Nexus Shield] \u0414\u0435\u043B\u043E #${id}: \u041D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E 100 000 AI-\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0442\u0440\u0435\u0439\u0441\u0438\u043D\u0433\u0430 \u0438 \u043D\u0430\u0447\u0430\u0442\u043E \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435`, "getSubject"),
    getGreeting: /* @__PURE__ */ __name((name) => `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${name},`, "getGreeting"),
    intro: "\u0412\u0430\u0448\u0435 \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0432 \u043E\u0442\u0434\u0435\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0446\u0438\u0444\u0440\u043E\u0432\u044B\u0445 \u0430\u043A\u0442\u0438\u0432\u043E\u0432 Nexus Shield. \u0427\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0440\u0430\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u0435 \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u0438 \u0431\u0435\u0437 \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0439, \u0432\u0430\u0448\u0435\u043C\u0443 \u0434\u0435\u043B\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E <strong>100 000 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0445 AI-\u0442\u043E\u043A\u0435\u043D\u043E\u0432</strong> \u0434\u043B\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u043E\u043D\u0447\u0435\u0439\u043D-\u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0446\u0435\u043F\u043E\u0447\u0435\u043A \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 \u0434\u043E \u0431\u0438\u0440\u0436-\u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u0435\u0439.",
    summaryTitle: "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0432\u043E\u0434\u043A\u0430 \u043F\u043E \u0434\u0435\u043B\u0443",
    lblCaseId: "\u0418\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u0434\u0435\u043B\u0430 (ID):",
    lblTokens: "\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0439 AI-\u043A\u043E\u043C\u043F\u044C\u044E\u0442:",
    valTokens: "100 000 \u0422\u043E\u043A\u0435\u043D\u043E\u0432 (\u0410\u043A\u0442\u0438\u0432\u043D\u043E)",
    lblLoss: "\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0443\u0449\u0435\u0440\u0431:",
    lblNetwork: "\u0421\u0435\u0442\u044C \u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D:",
    lblStatus: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441:",
    valStatus: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0442\u0440\u0435\u0439\u0441\u0438\u043D\u0433 &bull; \u0410\u043D\u0430\u043B\u0438\u0437 \u043D\u043E\u0434",
    lblRestitution: "\u041A\u043E\u0448\u0435\u043B\u0435\u043A \u0434\u043B\u044F \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430:",
    tokenCardTitle: "\u041D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E 100 000 AI-\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0434\u043B\u044F \u0440\u0430\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u044F",
    tokenCardDesc: "\u0412\u044B\u0447\u0438\u0441\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043A\u0440\u0435\u0434\u0438\u0442\u044B \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u044E\u0442 \u044D\u0432\u0440\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439, \u043A\u043B\u0430\u0441\u0442\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u043E\u0432 \u0438 \u0432\u044B\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u0434\u0435\u043F\u043E\u0437\u0438\u0442\u043D\u044B\u0445 \u0430\u0434\u0440\u0435\u0441\u043E\u0432 \u043D\u0430 \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u0431\u0438\u0440\u0436\u0430\u0445.",
    tokenBalanceLbl: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0432\u044B\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u0439:",
    tokenBalanceVal: "100 000 / 100 000 (100% \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E)",
    ctaBtn: "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441 \u0434\u0435\u043B\u0430 \u0438 \u0442\u043E\u043A\u0435\u043D\u044B \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438 &rarr;",
    antiScamTitle: "\u{1F6E1}\uFE0F \u0413\u0430\u0440\u0430\u043D\u0442\u0438\u044F \u0437\u0430\u0449\u0438\u0442\u044B \u043E\u0442 \u043C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u0430:",
    antiScamDesc: "Nexus Shield <strong>\u041D\u0418\u041A\u041E\u0413\u0414\u0410</strong> \u043D\u0435 \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u0442 \u0432\u0430\u0448\u0443 \u0441\u0438\u0434-\u0444\u0440\u0430\u0437\u0443 \u0438\u0437 12 \u0441\u043B\u043E\u0432, \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u044B\u0435 \u043A\u043B\u044E\u0447\u0438 \u0438 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0440\u0435\u0434\u043E\u043F\u043B\u0430\u0442\u0443 \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0438\u043B\u0438 \u0433\u0430\u0437\u0430. \u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430 \u0432\u0435\u0434\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u0430\u0434\u0440\u0435\u0441\u0430 <code>support@nexusshield.org</code>.",
    contactTitle: "\u0415\u0441\u0442\u044C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438 \u0438\u043B\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B?",
    getContactDesc: /* @__PURE__ */ __name((id) => `\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0434\u0435\u0436\u0443\u0440\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443 <a href="mailto:support@nexusshield.org?subject=%D0%94%D0%B5%D0%BB%D0%BE%20${encodeURIComponent(id)}" style="color: #0052FF; font-weight: 600; text-decoration: underline;">support@nexusshield.org</a> \u0441 \u0443\u043A\u0430\u0437\u0430\u043D\u0438\u0435\u043C \u043D\u043E\u043C\u0435\u0440\u0430 \u0434\u0435\u043B\u0430 <strong>${id}</strong>.`, "getContactDesc"),
    footerRights: "&copy; " + (/* @__PURE__ */ new Date()).getFullYear() + ' Nexus Shield \u042D\u043A\u0441\u043F\u0435\u0440\u0442\u0438\u0437\u0430 \u0446\u0438\u0444\u0440\u043E\u0432\u044B\u0445 \u0430\u043A\u0442\u0438\u0432\u043E\u0432. \u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0430\u043B: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a>',
    footerLegal: "18 U.S.C. \xA7 2703 \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0434\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432 &bull; \u0412\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441 \u043A\u043E\u043C\u043F\u043B\u0430\u0435\u043D\u0441-\u043E\u0442\u0434\u0435\u043B\u0430\u043C\u0438 \u0431\u0438\u0440\u0436"
  }
};
function resolveLocale(report, request) {
  let lang = (report.locale || report.language || "").toLowerCase().trim();
  if (lang) {
    lang = lang.split("-")[0].split("_")[0];
    if (LOCALIZED_TEMPLATES[lang]) return lang;
  }
  if (request && request.headers) {
    const accept = typeof request.headers.get === "function" ? request.headers.get("accept-language") : request.headers["accept-language"];
    if (accept) {
      const parts = accept.split(",");
      for (const p of parts) {
        const code = p.split(";")[0].split("-")[0].trim().toLowerCase();
        if (LOCALIZED_TEMPLATES[code]) return code;
      }
    }
  }
  if (request && request.cf && request.cf.country) {
    const c = request.cf.country.toUpperCase();
    const map = {
      ES: "es",
      MX: "es",
      AR: "es",
      CO: "es",
      CL: "es",
      PE: "es",
      VE: "es",
      EC: "es",
      GT: "es",
      CU: "es",
      BO: "es",
      DO: "es",
      HN: "es",
      PY: "es",
      SV: "es",
      NI: "es",
      CR: "es",
      PA: "es",
      UY: "es",
      FR: "fr",
      BE: "fr",
      CA: "fr",
      SN: "fr",
      CI: "fr",
      DE: "de",
      AT: "de",
      PT: "pt",
      BR: "pt",
      AO: "pt",
      MZ: "pt",
      CN: "zh",
      TW: "zh",
      HK: "zh",
      SG: "zh",
      JP: "ja",
      RU: "ru",
      BY: "ru",
      KZ: "ru",
      UA: "ru"
    };
    if (map[c] && LOCALIZED_TEMPLATES[map[c]]) return map[c];
  }
  return "en";
}
__name(resolveLocale, "resolveLocale");
function generateLocalizedEmail(report, request) {
  const langKey = resolveLocale(report, request);
  const t = LOCALIZED_TEMPLATES[langKey] || LOCALIZED_TEMPLATES.en;
  const caseId = report.reportId || report.caseId || "NX-" + Math.floor(1e5 + Math.random() * 9e5);
  const victimName = report.victimName || "Valued Client";
  const totalLoss = report.totalUsdLoss ? `$${Math.round(report.totalUsdLoss).toLocaleString()} USD` : report.amountLost ? `${report.amountLost} ${report.currencyLost || "USD"}` : "$10,000.00 USD";
  const chainName = report.chain ? report.chain.charAt(0).toUpperCase() + report.chain.slice(1) : "Multi-Chain / EVM";
  const safeWallet = report.victimWallet || report.recoveryWallet || "Registered on-chain recovery vault";
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
                \u{1F6E1}\uFE0F NEXUS SHIELD
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
              <td valign="top" width="32" style="font-size: 22px; line-height: 1;">\u26A1</td>
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
__name(generateLocalizedEmail, "generateLocalizedEmail");
async function handleSendConfirmation(request, env) {
  try {
    const origin = request.headers.get("Origin") || "";
    const referer = request.headers.get("Referer") || "";
    const allowed = ["nexusshield.org", "www.nexusshield.org", "localhost", "127.0.0.1", "pages.dev"];
    const isOriginAllowed = allowed.some((domain) => origin.includes(domain) || referer.includes(domain));
    if (!isOriginAllowed && origin) {
      return new Response(JSON.stringify({ error: "Forbidden: Request origin unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
    if (isWorkerRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again in 10 minutes." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "600" }
      });
    }
    const report = await request.json();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!report || !report.victimEmail || !emailRegex.test(report.victimEmail)) {
      return new Response(JSON.stringify({ error: "Valid complainant email address required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiKey = env.RESEND_API_KEY || atob("cmVfTmNDbkN0ektfQmhXd29ocTdxZjhjVFpYWmNtWjd0aGlv");
    if (!apiKey) {
      console.warn("RESEND_API_KEY environment variable is not configured.");
      return new Response(JSON.stringify({
        success: false,
        message: "RESEND_API_KEY is not configured in Worker environment variables."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { subject, html, langKey } = generateLocalizedEmail(report, request);
    const resendPayload = {
      from: "Nexus Shield Case Desk <no-reply@nexusshield.org>",
      to: [report.victimEmail],
      subject,
      html
    };
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resendPayload)
    });
    const resData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend API Error:", resData);
      return new Response(JSON.stringify({ success: false, error: resData }), {
        status: resendRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      id: resData.id,
      locale: langKey
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error in /api/send-confirmation:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleSendConfirmation, "handleSendConfirmation");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/send-confirmation" && request.method === "POST") {
      return handleSendConfirmation(request, env);
    }
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
