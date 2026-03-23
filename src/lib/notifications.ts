import { prisma } from "./prisma";
import { esc, getResend, EMAIL_FROM } from "./email";
import { buildEmail } from "./email-template";

// ─── Helpers ─────────────────────────────────────────────

async function getOrgUser(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { users: { select: { id: true, email: true, emailNotifications: true }, take: 1 } },
  });
  return org?.users[0] ?? null;
}

async function hasNotificationBeenSent(organizationId: string, type: string): Promise<boolean> {
  const existing = await prisma.notificationLog.findFirst({
    where: { organizationId, type },
  });
  return !!existing;
}

async function logNotification(organizationId: string, type: string, userId?: string) {
  await prisma.notificationLog.create({
    data: { organizationId, type, userId },
  });
}

// ─── Existing notifications ──────────────────────────────

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

// ─── Onboarding reminder emails ──────────────────────────

export async function sendOnboardingReminderEmail(
  organizationId: string,
  stage: "onboarding_24h" | "onboarding_72h" | "onboarding_7d",
) {
  const resend = getResend();
  if (!resend) return;
  if (await hasNotificationBeenSent(organizationId, stage)) return;

  const user = await getOrgUser(organizationId);
  if (!user?.email || user.emailNotifications === false) return;

  const subjects: Record<string, string> = {
    onboarding_24h: "【WebMori】セットアップを完了しましょう",
    onboarding_72h: "【WebMori】リポジトリの登録をお忘れではないですか？",
    onboarding_7d: "【WebMori】初回監査を始める準備はできていますか？",
  };

  const bodies: Record<string, string> = {
    onboarding_24h: `
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">セットアップを完了しましょう</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        ご登録ありがとうございます！<br>
        リポジトリを登録していただくと、すぐに初回監査を開始できます。
      </p>`,
    onboarding_72h: `
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">リポジトリの登録をお忘れではないですか？</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        まだリポジトリが登録されていないようです。<br>
        登録が完了すると、セキュリティ・パフォーマンスの初回監査が自動的に開始されます。
      </p>`,
    onboarding_7d: `
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">初回監査の準備はできていますか？</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        セットアップがまだ完了していません。<br>
        ご不明点がございましたら、お気軽にメッセージでお問い合わせください。
      </p>`,
  };

  const html = buildEmail(`
    ${bodies[stage]}
    <a href="https://webmori.jp/ja/dashboard/onboarding"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;margin-top:8px;">
      セットアップを続ける
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: subjects[stage],
    html,
  }).catch(() => {});

  await logNotification(organizationId, stage, user.id);
}

// ─── Audit scheduled reminder ────────────────────────────

export async function sendAuditScheduledEmail(
  organizationId: string,
  auditDate: Date,
) {
  const resend = getResend();
  if (!resend) return;

  const notifKey = `audit_scheduled_${auditDate.toISOString().slice(0, 10)}`;
  if (await hasNotificationBeenSent(organizationId, notifKey)) return;

  const user = await getOrgUser(organizationId);
  if (!user?.email || user.emailNotifications === false) return;

  const dateStr = auditDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">月次監査のお知らせ</h2>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
      次回の監査は <strong>${esc(dateStr)}</strong> に予定されています。
    </p>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      監査が完了しましたら、レポートをお届けいたします。
    </p>
    <a href="https://webmori.jp/ja/dashboard"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      ダッシュボードを確認する
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】月次監査のお知らせ",
    html,
  }).catch(() => {});

  await logNotification(organizationId, notifKey, user.id);
}

// ─── PR fixes notification ───────────────────────────────

export async function sendPrFixesEmail(
  organizationId: string,
  prLinks: string[],
) {
  const resend = getResend();
  if (!resend) return;

  const user = await getOrgUser(organizationId);
  if (!user?.email || user.emailNotifications === false) return;

  const prList = prLinks.map((url) => `<li style="margin:4px 0;"><a href="${esc(url)}" style="color:#D97706;">${esc(url)}</a></li>`).join("");

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">修正プルリクエストが作成されました</h2>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
      監査で検出された問題に対して、${prLinks.length}件のプルリクエストを作成しました。
    </p>
    <ul style="color:#1C1917;font-size:14px;line-height:1.7;margin:0 0 24px;padding-left:20px;">
      ${prList}
    </ul>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      内容を確認の上、マージしてください。
    </p>
    <a href="https://webmori.jp/ja/dashboard/reports"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      レポートを確認する
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】修正プルリクエストが作成されました",
    html,
  }).catch(() => {});

  await logNotification(organizationId, "pr_fixes", user.id);
}

// ─── Monthly summary digest ──────────────────────────────

export async function sendMonthlySummaryEmail(organizationId: string) {
  const resend = getResend();
  if (!resend) return;

  const monthKey = new Date().toISOString().slice(0, 7);
  if (await hasNotificationBeenSent(organizationId, `monthly_digest_${monthKey}`)) return;

  const user = await getOrgUser(organizationId);
  if (!user?.email || user.emailNotifications === false) return;

  // Gather stats for the month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalFindings, fixedFindings, auditsThisMonth] = await Promise.all([
    prisma.finding.count({
      where: { audit: { organizationId, createdAt: { gte: startOfMonth, lt: endOfMonth } } },
    }),
    prisma.finding.count({
      where: { audit: { organizationId, createdAt: { gte: startOfMonth, lt: endOfMonth } }, prUrl: { not: null } },
    }),
    prisma.audit.count({
      where: { organizationId, createdAt: { gte: startOfMonth, lt: endOfMonth }, status: { in: ["DELIVERED", "COMPLETED"] } },
    }),
  ]);

  const monthName = now.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">${esc(monthName)}の監査サマリー</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;width:33%;">
          <p style="margin:0;font-size:24px;font-weight:bold;color:#1C1917;">${auditsThisMonth}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">監査実施</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;width:33%;">
          <p style="margin:0;font-size:24px;font-weight:bold;color:#1C1917;">${totalFindings}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">検出された問題</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;width:33%;">
          <p style="margin:0;font-size:24px;font-weight:bold;color:#1C1917;">${fixedFindings}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">修正済み</p>
        </td>
      </tr>
    </table>
    <a href="https://webmori.jp/ja/dashboard"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      ダッシュボードで詳細を確認
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: `【WebMori】${monthName}の監査サマリー`,
    html,
  }).catch(() => {});

  await logNotification(organizationId, `monthly_digest_${monthKey}`, user.id);
}

// ─── Free tier email drip ────────────────────────────────

export async function sendDripEmail(
  organizationId: string,
  stage: "drip_1" | "drip_2" | "drip_3",
) {
  const resend = getResend();
  if (!resend) return;
  if (await hasNotificationBeenSent(organizationId, stage)) return;

  const user = await getOrgUser(organizationId);
  if (!user?.email || user.emailNotifications === false) return;

  const configs: Record<string, { subject: string; body: string }> = {
    drip_1: {
      subject: "【WebMori】無料監査レポートが完成しました",
      body: `
        <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">無料監査レポートが完成しました</h2>
        <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
          あなたのサイトの監査レポートが完成しました。<br>
          ダッシュボードで結果をご確認ください。
        </p>`,
    },
    drip_2: {
      subject: "【WebMori】サイト改善のための3つのヒント",
      body: `
        <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">サイト改善のための3つのヒント</h2>
        <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
          監査レポートの内容を元に、すぐに実践できるヒントをお届けします。
        </p>
        <ol style="color:#1C1917;font-size:14px;line-height:2;margin:0 0 24px;padding-left:20px;">
          <li>クリティカルな問題から優先的に修正しましょう</li>
          <li>定期的な監査でサイトの健全性を維持しましょう</li>
          <li>パフォーマンスの改善はSEOにも効果的です</li>
        </ol>`,
    },
    drip_3: {
      subject: "【WebMori】検出された問題を修正する準備はできていますか？",
      body: `
        <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">問題を修正する準備はできていますか？</h2>
        <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
          無料監査で検出された問題を、毎月継続的に改善していきませんか？<br>
          Starterプランなら月額¥19,800で、セキュリティとパフォーマンスの定期監査が受けられます。
        </p>`,
    },
  };

  const config = configs[stage];
  const html = buildEmail(`
    ${config.body}
    <a href="https://webmori.jp/ja/pricing"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      プランを確認する
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: config.subject,
    html,
  }).catch(() => {});

  await logNotification(organizationId, stage, user.id);
}
