/**
 * Cloudflare Pages Serverless Function
 * Handles automated email dispatch via Resend API
 * Endpoint: POST /api/send-confirmation
 */

async function handleSendConfirmation(request, env) {

  try {
    const report = await request.json();

    if (!report || !report.victimEmail) {
      return new Response(JSON.stringify({ error: 'Missing complainant email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.RESEND_API_KEY;
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

    const caseId = report.reportId || report.report_id || 'NX-000000';
    const victimName = report.victimName || report.victim_name || 'Valued Client';
    const totalLoss = report.totalUsdLoss 
      ? `$${Math.round(report.totalUsdLoss).toLocaleString()} USD` 
      : `${report.amountLost || report.amount_lost || '0'} ${report.currencyLost || report.currency_lost || 'USD'}`;
    const safeWallet = report.recoveryWallet || report.recovery_wallet || 'Pending Verification';
    const chainName = report.chain || (report.usdtNetwork ? `USDT (${report.usdtNetwork})` : 'Multi-Chain');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Shield Case Intake Confirmation</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #050814; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      
      <!-- Brand Header -->
      <tr>
        <td style="padding: 28px 32px; background: linear-gradient(135deg, #071033 0%, #0d1b47 50%, #0a2566 100%); border-bottom: 2px solid #2D9FFF;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <div style="font-size: 11px; font-weight: 700; color: #00F59B; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">
                  CRYPTOGRAPHIC FORENSICS &bull; ASSET RECOVERY
                </div>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                  🛡️ NEXUS SHIELD
                </div>
              </td>
              <td align="right" valign="middle">
                <span style="display: inline-block; padding: 5px 12px; background: rgba(0, 245, 155, 0.15); border: 1px solid #00F59B; border-radius: 20px; font-size: 11px; font-weight: 700; color: #00F59B; font-family: monospace;">
                  ● ACTIVE INTAKE
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Case Reference Ribbon -->
      <tr>
        <td style="padding: 14px 32px; background-color: #0f172a; border-bottom: 1px solid #1e293b;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                Official Case Reference:
              </td>
              <td align="right" style="font-size: 16px; font-weight: 800; color: #38bdf8; font-family: monospace;">
                ${caseId}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Email Content -->
      <tr>
        <td style="padding: 32px 32px 24px 32px;">
          
          <!-- Warm, Empathetic Greeting -->
          <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 14px;">
            Hello ${victimName},
          </h2>
          <p style="font-size: 15px; color: #cbd5e1; line-height: 1.65; margin: 0 0 16px 0;">
            Thank you for reaching out to Nexus Shield. First and foremost, please know that <strong style="color: #ffffff;">you are not alone in this</strong>. Experiencing a cryptocurrency loss is an extremely distressing and overwhelming ordeal, but taking this step to document your incident is the most important action toward tracing and recovering your stolen funds.
          </p>
          <p style="font-size: 14.5px; color: #cbd5e1; line-height: 1.65; margin: 0 0 24px 0;">
            Your report has been securely registered in our cryptographic investigation repository, and our automated ledger systems along with our senior tracing analysts have initiated immediate tracking.
          </p>

          <!-- 100,000 AI TOKENS ALLOCATION CARD (PROFESSIONAL & TRANSPARENT) -->
          <div style="background: linear-gradient(145deg, rgba(14, 30, 68, 0.7) 0%, rgba(10, 20, 48, 0.85) 100%); border: 1px solid #2D9FFF; border-radius: 10px; padding: 22px; margin-bottom: 26px; box-shadow: 0 8px 24px rgba(45, 159, 255, 0.12);">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <div style="display: inline-block; background: rgba(45, 159, 255, 0.2); border: 1px solid #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                    ⚡ AI FORENSIC COMPUTE ALLOCATION
                  </div>
                  <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
                    100,000 Complimentary Investigation Tokens Assigned
                  </div>
                  
                  <!-- Token Meter Bar -->
                  <div style="background: #080d1a; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; border: 1px solid #1e293b;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                      <span style="color: #94a3b8; font-family: monospace;">Active Compute Balance:</span>
                      <strong style="color: #00F59B; font-family: monospace;">100,000 / 100,000 Tokens (100% Available)</strong>
                    </div>
                    <div style="width: 100%; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden;">
                      <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #00F59B, #2D9FFF); border-radius: 4px;"></div>
                    </div>
                  </div>

                  <!-- Professional Explanation -->
                  <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin: 0 0 12px 0;">
                    To initiate your blockchain investigation immediately without upfront audit fees, Nexus Shield has credited <strong style="color: #ffffff;">100,000 complimentary AI Forensic Tokens</strong> directly to your case dossier.
                  </p>
                  
                  <div style="font-size: 13px; color: #94a3b8; line-height: 1.55; margin-bottom: 12px;">
                    <strong style="color: #e2e8f0;">How your tokens work:</strong> Our automated neural tracking algorithms consume these computational credits to perform high-speed on-chain analysis—scanning thousands of transaction hops, de-anonymizing wallet clusters, and tracing fund movements toward destination deposit addresses at centralized exchanges (such as Binance, OKX, Bybit, Coinbase, and Kraken).
                  </div>

                  <!-- Transparent Depth & Recharge Notice -->
                  <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: 0 6px 6px 0;">
                    <div style="font-size: 12px; font-weight: 700; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
                      ℹ️ Investigation Depth &amp; Token Usage Notice
                    </div>
                    <div style="font-size: 12.5px; color: #fde68a; line-height: 1.55;">
                      Standard and direct transaction traces are typically covered by your complimentary 100,000 token grant. However, in cases involving complex multi-chain bridges, decentralized mixers, or deep peel chains, computational consumption increases with the depth of the search. 
                      <br><br>
                      <strong style="color: #ffffff;">These complimentary tokens can finish along the line as deeper multi-hop tracing progresses.</strong> If your token balance is exhausted during the investigation, you will have the opportunity to acquire supplemental compute tokens directly through your live Case Dashboard to maintain uninterrupted scanning until the funds are fully mapped.
                    </div>
                  </div>

                </td>
              </tr>
            </table>
          </div>

          <!-- Human Senior Analyst Assignment -->
          <div style="background: #0d1527; border: 1px solid #1e293b; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="36" valign="top">
                  <div style="font-size: 24px; line-height: 1;">👨‍💼</div>
                </td>
                <td style="padding-left: 12px;">
                  <div style="font-size: 11px; font-weight: 700; color: #00F59B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">
                    HUMAN FORENSIC OVERSIGHT
                  </div>
                  <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                    Assigned Lead: Senior On-Chain Forensic Examiner (Desk: Digital Asset Recovery)
                  </div>
                  <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                    While AI tokens handle rapid ledger scanning, a dedicated human investigator personally reviews your case evidence, verifies suspect counterparty identities, and coordinates formal subpoena documentation for exchange compliance legal departments.
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Case Summary Table -->
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            📋 Your Case Summary at a Glance:
          </div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080d1a; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 26px; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">Documented Loss:</td>
              <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 14px; font-weight: 700; color: #f87171;">${totalLoss}</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">Blockchain Network:</td>
              <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #f1f5f9; font-weight: 600;">${chainName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">Initial Compute Credits:</td>
              <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #00F59B; font-weight: 700; font-family: monospace;">100,000 Tokens (Active)</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; font-size: 13px; color: #94a3b8;">Safe Restitution Wallet:</td>
              <td align="right" style="padding: 12px 18px; font-size: 11.5px; font-family: monospace; color: #38bdf8; word-break: break-all;">${safeWallet}</td>
            </tr>
          </table>

          <!-- Friendly 3-Step What Happens Next -->
          <div style="background-color: #0c1427; border: 1px solid #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
              🔍 What Happens Next:
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="28" valign="top" style="font-size: 14px; font-weight: 800; color: #00F59B; font-family: monospace;">1.</td>
                <td style="padding-bottom: 10px; font-size: 13px; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Continuous On-Chain Node Tracing:</strong> Using your allocated 100,000 tokens, our algorithms scan all outgoing hops from the scammer's wallet.
                </td>
              </tr>
              <tr>
                <td width="28" valign="top" style="font-size: 14px; font-weight: 800; color: #00F59B; font-family: monospace;">2.</td>
                <td style="padding-bottom: 10px; font-size: 13px; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Exchange Pinpointing &amp; Freeze Dossier:</strong> When tokens reach a custodial exchange (e.g. Binance, OKX), an emergency evidentiary packet is assembled to request a compliance freeze.
                </td>
              </tr>
              <tr>
                <td width="28" valign="top" style="font-size: 14px; font-weight: 800; color: #00F59B; font-family: monospace;">3.</td>
                <td style="font-size: 13px; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Restitution Coordination:</strong> We assist in guiding frozen assets directly back to your designated safe restitution wallet.
                </td>
              </tr>
            </table>
          </div>

          <!-- Urgent Phishing / Malicious Approval Alert (Revoke.cash) -->
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 800; color: #f87171; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              🚨 URGENT ACTION IF YOU CLICKED A PHISHING LINK
            </div>
            <div style="font-size: 13px; color: #fecdd3; line-height: 1.55; margin-bottom: 10px;">
              If your loss happened after interacting with a phishing link, fake airdrop, or unauthorized smart contract, scammers may still have <strong>active spending approvals</strong> on your wallet. 
            </div>
            <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.55;">
              👉 Immediately open <a href="https://revoke.cash" target="_blank" rel="noopener noreferrer" style="color: #ffffff; background: #dc2626; padding: 3px 8px; border-radius: 4px; font-weight: 700; text-decoration: none;">Revoke.cash &rarr;</a> to inspect and cancel all active allowances, then transfer any remaining safe funds to a newly created wallet.
            </div>
          </div>

          <!-- Non-Reply Notice & Friendly Support Direct Routing -->
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 18px 20px; margin-bottom: 26px;">
            <div style="font-size: 12px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              ⚠️ AUTOMATED TRANSMISSION &bull; DO NOT REPLY DIRECTLY
            </div>
            <p style="font-size: 13px; color: #fde68a; line-height: 1.6; margin: 0 0 10px 0;">
              This confirmation is sent from an unmonitored automated notification address (<code>no-reply@nexusshield.org</code>). <strong>Replies sent directly to this email will not reach our investigative team.</strong>
            </p>
            <div style="border-top: 1px dashed rgba(245, 158, 11, 0.3); padding-top: 10px; font-size: 13px; color: #e2e8f0;">
              <strong>Have extra evidence, screenshots, or questions?</strong><br>
              Our dedicated support team is ready to assist you. Simply email:
              <div style="margin-top: 6px;">
                📧 <a href="mailto:support@nexusshield.org?subject=Case%20Evidence%20${encodeURIComponent(caseId)}" style="color: #38bdf8; font-weight: 700; text-decoration: underline;">support@nexusshield.org</a>
              </div>
              <span style="font-size: 12px; color: #94a3b8;">(Please always include your Case ID <strong>${caseId}</strong> in the subject line).</span>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 26px;">
            <a href="https://nexusshield.org/index.html?case=${encodeURIComponent(caseId)}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0500FF, #0051ff); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 6px 20px rgba(5,0,255,0.45);">
              Open Live Case &amp; Token Dashboard &rarr;
            </a>
          </div>

          <!-- Gentle Anti-Scam Security Advisory -->
          <div style="border-top: 1px solid #1e293b; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.6;">
            <strong style="color: #94a3b8;">A caring reminder for your protection:</strong> Nexus Shield investigators will <strong style="color: #cbd5e1;">NEVER</strong> contact you on Telegram, WhatsApp, or Instagram asking for your 12-word seed phrase, private keys, or demanding "advance release taxes." Authentic communication takes place solely through <code>support@nexusshield.org</code>, our official X account <a href="https://x.com/NEXUSSHIELDhq" style="color: #38bdf8; text-decoration: underline;" target="_blank">@NEXUSSHIELDhq</a>, and our official domain <code>nexusshield.org</code>.
          </div>

        </td>
      </tr>

      <!-- Footer Bar -->
      <tr>
        <td style="padding: 20px 32px; background-color: #060a16; border-top: 1px solid #1e293b; font-size: 11.5px; color: #475569; text-align: center; line-height: 1.6;">
          &copy; ${new Date().getFullYear()} Nexus Shield Forensics Taskforce. All rights reserved.<br>
          Official Portal: <a href="https://nexusshield.org" style="color: #64748b; text-decoration: none;">nexusshield.org</a> &bull; Support Desk: <a href="mailto:support@nexusshield.org" style="color: #64748b; text-decoration: none;">support@nexusshield.org</a> &bull; Official X: <a href="https://x.com/NEXUSSHIELDhq" style="color: #64748b; text-decoration: none;" target="_blank">@NEXUSSHIELDhq</a><br>
          <span style="font-size: 10.5px; color: #334155;">Non-Custodial Asset Recovery &bull; Chain Intelligence &bull; Global Sanctions Compliance</span>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
    `;

    const resendPayload = {
      from: 'Nexus Shield Case Desk <no-reply@nexusshield.org>',
      to: [report.victimEmail],
      subject: `[Nexus Shield] Case #${caseId.substring(0, 8)}: Received — 100,000 AI Tracing Tokens Assigned [DO NOT REPLY]`,
      html: htmlContent
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

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
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


export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API endpoint for automated confirmation email dispatch
    if (url.pathname === '/api/send-confirmation' && request.method === 'POST') {
      return handleSendConfirmation(request, env);
    }

    // Pass through to static assets
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
