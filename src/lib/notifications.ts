import { prisma } from "./prisma";
import { esc, getResend, EMAIL_FROM } from "./email";

/**
 * Send audit-complete notification to the client.
 * Checks user's emailNotifications preference before sending.
 */
export async function sendAuditCompleteEmail(
  organizationId: string,
  auditDetails: { repoName: string; findingsCount: number; reportUrl?: string },
) {
  const resend = getResend();
  if (!resend) return;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { users: { select: { email: true, emailNotifications: true }, take: 1 } },
  });

  const user = org?.users[0];
  if (!user?.email || user.emailNotifications === false) return;

  const safeRepoName = esc(auditDetails.repoName);
  const dashboardLink = auditDetails.reportUrl ?? "https://webmori.jp/ja/dashboard/reports";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】監査レポートが完成しました",
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">監査レポートが完成しました</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        <strong>${safeRepoName}</strong> の監査が完了しました。<br>
        ${auditDetails.findingsCount}件の問題が検出されました。
      </p>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
        ダッシュボードで詳細レポートをご確認ください。
      </p>
      <a href="${esc(dashboardLink)}"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        レポートを確認する
      </a>
    </td></tr>
  </table>
</body>`,
  }).catch(() => {/* non-fatal */});
}

/**
 * Send new-message notification to the client.
 * Checks user's emailNotifications preference before sending.
 * Used when the operator sends a message from the admin panel.
 */
export async function sendNewMessageEmail(
  organizationId: string,
  messageContent: string,
) {
  const resend = getResend();
  if (!resend) return;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { users: { select: { email: true, emailNotifications: true }, take: 1 } },
  });

  const user = org?.users[0];
  if (!user?.email || user.emailNotifications === false) return;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】新しいメッセージが届いています",
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <p style="color:#1C1917;font-size:16px;margin:0 0 16px;">WebMoriからメッセージが届いています。</p>
      <div style="background:#F8F5EE;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="color:#1C1917;font-size:14px;margin:0;">${esc(messageContent.trim())}</p>
      </div>
      <a href="https://webmori.jp/ja/dashboard/messages"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        ダッシュボードで確認する
      </a>
    </td></tr>
  </table>
</body>`,
  }).catch(() => {/* non-fatal */});
}
