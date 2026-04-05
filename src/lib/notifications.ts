import { prisma } from "./prisma";
import { esc, getResend, EMAIL_FROM } from "./email";
import { buildEmail } from "./email-template";
import { env } from "./env";
import { sendLineFlexMessage, sendLinePush, buildAuditCompleteCard, buildAuditScheduledCard } from "./line";

// ─── Helpers ─────────────────────────────────────────────

async function getOrgUser(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          emailNotifications: true,
          notifyAuditComplete: true,
          notifyAlerts: true,
          notifyQuarterly: true,
          notifyFollowUp: true,
          notifyMarketing: true,
        },
        take: 1,
      },
    },
  });
  return org?.users[0] ?? null;
}

function canNotify(user: Awaited<ReturnType<typeof getOrgUser>>, category: "audit" | "alerts" | "quarterly" | "followUp" | "marketing"): user is NonNullable<Awaited<ReturnType<typeof getOrgUser>>> {
  if (!user?.email) return false;
  if (user.emailNotifications === false) return false;
  if (category === "audit" && user.notifyAuditComplete === false) return false;
  if (category === "alerts" && user.notifyAlerts === false) return false;
  if (category === "quarterly" && user.notifyQuarterly === false) return false;
  if (category === "followUp" && user.notifyFollowUp === false) return false;
  if (category === "marketing" && user.notifyMarketing === false) return false;
  return true;
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

/**
 * Returns true if the org should receive LINE notifications.
 * Requires: LINE userId linked, org.lineNotifications=true, user.notifyLine=true,
 * and subscription plan is GROWTH or PRO (ACTIVE or TRIALING).
 */
async function shouldSendLine(organizationId: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      lineUserId: true,
      lineNotifications: true,
      users: { select: { notifyLine: true }, take: 1 },
      subscription: { select: { plan: true, status: true } },
    },
  });
  if (!org?.lineUserId) return false;
  if (!org.lineNotifications) return false;
  if (org.users[0]?.notifyLine === false) return false;
  if (!org.subscription) return false;
  if (!["GROWTH", "PRO"].includes(org.subscription.plan)) return false;
  if (!["ACTIVE", "TRIALING"].includes(org.subscription.status)) return false;
  return true;
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
  if (!user?.email || user.emailNotifications === false) {
    console.log(`[sendAuditCompleteEmail] skipped for org=${organizationId}: email=${user?.email ?? "none"} emailNotifications=${user?.emailNotifications}`);
    return;
  }

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
  }).catch((err) => { console.error("[sendAuditCompleteEmail] Resend error:", err); });

  // Also send via LINE for Growth/Pro clients who have it linked
  if (await shouldSendLine(organizationId)) {
    const orgForLine = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, lineUserId: true },
    });
    if (orgForLine?.lineUserId) {
      await sendLineFlexMessage(
        orgForLine.lineUserId,
        "監査レポートが完成しました",
        buildAuditCompleteCard({
          orgName: orgForLine.name,
          repoName: auditDetails.repoName,
          findingsCount: auditDetails.findingsCount,
          reportUrl: dashboardLink,
        }),
      );
    }
  }
}

/**
 * Send setup-incomplete reminder to Growth/Pro clients who haven't linked LINE.
 * Sent once per org (logged in NotificationLog). Triggered on first audit delivery.
 */
export async function sendSetupIncompleteEmail(organizationId: string) {
  const resend = getResend();
  if (!resend) return;

  // Only send once
  if (await hasNotificationBeenSent(organizationId, "setup_incomplete_line")) return;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      users: {
        select: { id: true, email: true, emailNotifications: true, notifyFollowUp: true },
        take: 1,
      },
      subscription: { select: { plan: true, status: true } },
    },
  });

  const user = org?.users[0];
  if (!user?.email || user.emailNotifications === false || user.notifyFollowUp === false) return;

  // Only for Growth/Pro active subscriptions that haven't linked LINE
  const isPaidPlan = ["GROWTH", "PRO"].includes(org?.subscription?.plan ?? "");
  const isActive = ["ACTIVE", "TRIALING"].includes(org?.subscription?.status ?? "");
  if (!isPaidPlan || !isActive || org?.lineUserId) return;

  const settingsUrl = "https://webmori.jp/ja/dashboard/settings";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】セットアップが未完了です — LINE連携でより便利に",
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">セットアップが未完了です</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        ${esc(org?.name ?? "")} 様、いつもWebMoriをご利用いただきありがとうございます。
      </p>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        現在、<strong>LINE連携が未完了</strong>のため、監査レポートの完成通知がLINEで届きません。
        設定ページからLINEアカウントを連携することで、監査完了時にLINEでもお知らせします。
      </p>
      <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;color:#92400E;font-size:13px;line-height:1.6;">
          <strong>設定手順:</strong><br>
          1. ダッシュボード → 設定 → LINE連携<br>
          2. 表示された6桁のコードをWebMoriのLINE公式アカウントに送信<br>
          3. 連携完了 — 次回の監査からLINE通知が届きます
        </p>
      </div>
      <a href="${esc(settingsUrl)}"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        設定を完了する
      </a>
      <p style="color:#A8A29E;font-size:12px;margin:24px 0 0;">
        このメールはWebMoriよりお送りしています。通知設定はダッシュボードの設定ページから変更できます。
      </p>
    </td></tr>
  </table>
</body>`,
  }).catch((err) => { console.error("[sendSetupIncompleteEmail] Resend error:", err); });

  await logNotification(organizationId, "setup_incomplete_line", user.id);
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
  if (!canNotify(user, "marketing")) return;

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
  if (!canNotify(user, "audit")) return;

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

  // Also send via LINE for Growth/Pro clients
  if (await shouldSendLine(organizationId)) {
    const orgForLine = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, lineUserId: true },
    });
    if (orgForLine?.lineUserId) {
      await sendLineFlexMessage(
        orgForLine.lineUserId,
        "月次監査のお知らせ",
        buildAuditScheduledCard({
          orgName: orgForLine.name,
          auditDateLabel: dateStr,
        }),
      );
    }
  }

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
  if (!canNotify(user, "quarterly")) return;

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

// ─── Alert notification ───────────────────────────────────

const CHECK_TYPE_LABELS: Record<string, string> = {
  uptime: "サイトの応答",
  ssl_expiry: "SSL証明書",
  security_headers: "セキュリティヘッダー",
  performance: "パフォーマンス",
};

/**
 * Send an alert email when a daily health check degrades to WARNING or CRITICAL.
 */
export async function sendAlertEmail(
  organizationId: string,
  alert: { checkType: string; severity: string; message: string; siteUrl: string; alertId: string },
) {
  const resend = getResend();
  if (!resend) return;

  const user = await getOrgUser(organizationId);
  if (!canNotify(user, "alerts")) return;

  const checkLabel = CHECK_TYPE_LABELS[alert.checkType] ?? alert.checkType;
  const isCritical = alert.severity === "CRITICAL";
  const severityColor = isCritical ? "#DC2626" : "#D97706";
  const severityLabel = isCritical ? "🔴 緊急" : "🟠 警告";

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">サイト監視アラート</h2>
    <div style="border-left:4px solid ${severityColor};padding:12px 16px;background:#FEF2F2;border-radius:0 8px 8px 0;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:${severityColor};">${severityLabel} — ${esc(checkLabel)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1C1917;">${esc(alert.message)}</p>
    </div>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 8px;">
      <strong>対象サイト:</strong> ${esc(alert.siteUrl)}
    </p>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      問題が解決されると、自動的にアラートはクリアされます。<br>
      ご不明な点はダッシュボードのメッセージからお問い合わせください。
    </p>
    <a href="https://webmori.jp/ja/dashboard"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      ダッシュボードを確認する
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user!.email!],
    subject: `【WebMori】サイト監視アラート — ${checkLabel}`,
    html,
  }).catch(() => {});
}

// ─── Post-delivery follow-up (7 days after audit) ───────

/**
 * Send a follow-up email 7 days after an audit is delivered.
 * Reminds the client to review the report and act on the top 3 priorities.
 * Deduped per auditId so it fires exactly once.
 */
export async function sendPostDeliveryFollowUpEmail(
  organizationId: string,
  auditId: string,
  auditDetails: { repoName: string; reportUrl: string; topPriorities: string[] },
) {
  const resend = getResend();
  if (!resend) return;

  const notifKey = `post_delivery_followup_${auditId}`;
  if (await hasNotificationBeenSent(organizationId, notifKey)) return;

  const user = await getOrgUser(organizationId);
  if (!canNotify(user, "followUp")) return;

  const safeRepo = esc(auditDetails.repoName);
  const priorityItems = auditDetails.topPriorities
    .slice(0, 3)
    .map((p, i) => `<li style="margin:6px 0;color:#1C1917;font-size:14px;">${i + 1}. ${esc(p)}</li>`)
    .join("");

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">レポートはご確認いただけましたか？</h2>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
      先日お届けした <strong>${safeRepo}</strong> の監査レポートについて、
      今月の優先対応事項を改めてご案内いたします。
    </p>
    ${priorityItems.length > 0 ? `
    <div style="background:#F8F5EE;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1C1917;">今月の優先対応</p>
      <ol style="margin:0;padding-left:20px;">
        ${priorityItems}
      </ol>
    </div>` : ""}
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      ご不明な点やご相談がございましたら、ダッシュボードのメッセージからお気軽にお声がけください。
    </p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="${esc(auditDetails.reportUrl)}"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        レポートを確認する
      </a>
      <a href="https://webmori.jp/ja/dashboard/feedback?auditId=${esc(auditId)}"
        style="background:white;color:#D97706;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;border:1.5px solid #D97706;">
        ★ 今月の評価をする
      </a>
    </div>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】監査レポートのフォローアップ",
    html,
  }).catch(() => {});

  await logNotification(organizationId, notifKey, user.id);
}

// ─── Post-onboarding welcome email ───────────────────────

/**
 * Send a welcome email immediately after onboarding is completed.
 * Sets expectations: plan name, timeline, what to expect.
 * Fires once per org (deduped).
 */
export async function sendWelcomeEmail(
  organizationId: string,
  plan: string,
) {
  const resend = getResend();
  if (!resend) return;

  if (await hasNotificationBeenSent(organizationId, "welcome_email")) return;

  const user = await getOrgUser(organizationId);
  if (!canNotify(user, "audit")) return;

  const planNames: Record<string, string> = {
    STARTER: "Starterプラン",
    GROWTH: "Growthプラン",
    PRO: "Proプラン",
  };
  const planDescriptions: Record<string, string> = {
    STARTER: "セキュリティとパフォーマンスの2つの視点から毎月監査いたします。",
    GROWTH: "セキュリティ・パフォーマンス・LINE API・国際化・保守性の5つの視点から毎月監査いたします。",
    PRO: "全6レンズの深層監査で、2サイトを毎月しっかりと守ります。",
  };

  const planName = planNames[plan] ?? plan;
  const planDesc = planDescriptions[plan] ?? "";

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">WebMoriへようこそ！</h2>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
      ご登録ありがとうございます。<strong>${esc(planName)}</strong>でのご利用が始まりました。
    </p>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
      ${esc(planDesc)}
    </p>
    <div style="background:#F8F5EE;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1C1917;">これからの流れ</p>
      <ol style="margin:0;padding-left:20px;color:#1C1917;font-size:14px;line-height:2;">
        <li>ウェルカム監査を実施します（通常1〜2営業日以内）</li>
        <li>監査が完了したらレポートとPRをお届けします</li>
        <li>その後は毎月同じ曜日に定期監査を行います</li>
      </ol>
    </div>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      ご不明な点がございましたら、ダッシュボードのメッセージからいつでもご連絡ください。
    </p>
    <a href="https://webmori.jp/ja/dashboard"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      ダッシュボードを確認する
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: "【WebMori】ご登録ありがとうございます",
    html,
  }).catch(() => {});

  await logNotification(organizationId, "welcome_email", user.id);
}

// ─── Quarterly progress summary ──────────────────────────

/**
 * Send a quarterly progress summary on the last day of Mar/Jun/Sep/Dec.
 * Aggregates 3 months of audit data: total found vs fixed, severity trend.
 * All tiers receive this.
 */
export async function sendQuarterlyProgressEmail(organizationId: string) {
  const resend = getResend();
  if (!resend) return;

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  const notifKey = `quarterly_progress_${year}_Q${quarter}`;
  if (await hasNotificationBeenSent(organizationId, notifKey)) return;

  const user = await getOrgUser(organizationId);
  if (!canNotify(user, "quarterly")) return;

  // 3-month window
  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 1);

  const [totalFindings, fixedFindings, criticalFindings, auditsCount] = await Promise.all([
    prisma.finding.count({
      where: { audit: { organizationId, createdAt: { gte: quarterStart, lt: quarterEnd } } },
    }),
    prisma.finding.count({
      where: { audit: { organizationId, createdAt: { gte: quarterStart, lt: quarterEnd } }, prUrl: { not: null } },
    }),
    prisma.finding.count({
      where: { audit: { organizationId, createdAt: { gte: quarterStart, lt: quarterEnd } }, severity: "CRITICAL" },
    }),
    prisma.audit.count({
      where: { organizationId, createdAt: { gte: quarterStart, lt: quarterEnd }, status: { in: ["DELIVERED", "COMPLETED"] } },
    }),
  ]);

  if (auditsCount === 0) return; // No audits this quarter — skip

  const fixRate = totalFindings > 0 ? Math.round((fixedFindings / totalFindings) * 100) : 0;
  const quarterLabel = `${year}年 第${quarter}四半期`;

  const html = buildEmail(`
    <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">${esc(quarterLabel)} 進捗サマリー</h2>
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 20px;">
      この3ヶ月間の監査結果をまとめました。
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:bold;color:#1C1917;">${auditsCount}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">実施した監査</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:bold;color:#1C1917;">${totalFindings}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">検出された問題</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#F8F5EE;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:bold;color:#D97706;">${fixRate}%</p>
          <p style="margin:4px 0 0;font-size:12px;color:#78716C;">修正率</p>
        </td>
      </tr>
    </table>
    ${criticalFindings === 0 ? `
    <p style="color:#16A34A;font-size:14px;font-weight:600;margin:0 0 16px;">
      この3ヶ月間、緊急（Critical）の問題はありませんでした。
    </p>` : `
    <p style="color:#DC2626;font-size:14px;font-weight:600;margin:0 0 16px;">
      この3ヶ月間で${criticalFindings}件の緊急問題が検出されました。対応状況をご確認ください。
    </p>`}
    <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
      詳細はダッシュボードでご確認いただけます。ご不明な点はいつでもメッセージでお問い合わせください。
    </p>
    <a href="https://webmori.jp/ja/dashboard"
      style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
      ダッシュボードで詳細を確認
    </a>
  `);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [user.email],
    subject: `【WebMori】${quarterLabel} 進捗サマリー`,
    html,
  }).catch(() => {});

  await logNotification(organizationId, notifKey, user.id);
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
  if (!canNotify(user, "marketing")) return;

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

// ─── Operator alerts ──────────────────────────────────────

/**
 * Alert the operator that an audit has reached REVIEW status.
 * Called automatically when the audit pipeline publishes results.
 */
export async function sendOperatorReviewAlert(
  auditId: string,
  orgName: string,
  reportCode: string | null,
) {
  const resend = getResend();
  if (!resend) return;

  const adminUrl = `https://webmori.jp/ja/admin/audits`;
  const label = reportCode ? `${esc(reportCode)} — ${esc(orgName)}` : esc(orgName);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [env.OPERATOR_EMAIL],
    subject: `【WebMori 管理】レビュー待ち: ${orgName}`,
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
      <span style="color:#78716C;font-size:12px;margin-left:12px;">管理通知</span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">監査レポートのレビューが必要です</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 8px;">
        以下の監査が完了し、レビュー待ちになっています。
      </p>
      <div style="background:#F8F5EE;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#1C1917;">${label}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#78716C;">Audit ID: ${esc(auditId)}</p>
      </div>
      <a href="${esc(adminUrl)}"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        管理画面でレビューする
      </a>
    </td></tr>
  </table>
</body>`,
  }).catch(() => {});

  // Also push to operator's LINE if configured
  if (env.OPERATOR_LINE_USER_ID) {
    const codeStr = reportCode ? ` [${reportCode}]` : "";
    await sendLinePush(
      env.OPERATOR_LINE_USER_ID,
      `📋 レビュー待ち${codeStr}\n${orgName}\n\n管理画面で確認・承認してください。\nhttps://webmori.jp/ja/admin/audits`,
    );
  }
}

/**
 * Alert the operator that an audit has failed.
 * Called when the audit pipeline encounters an unrecoverable error.
 */
export async function sendOperatorFailureAlert(
  auditId: string,
  orgName: string,
  failureReason: string,
) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [env.OPERATOR_EMAIL],
    subject: `【WebMori 管理】監査失敗: ${orgName}`,
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#7F1D1D;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#FCA5A5;font-size:20px;font-weight:bold;">WebMori</span>
      <span style="color:#FCA5A5;font-size:12px;margin-left:12px;">⚠️ 監査失敗</span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#DC2626;font-size:18px;">監査が失敗しました</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 8px;">
        以下の監査が失敗しました。手動での対応が必要です。
      </p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin:0 0 16px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#1C1917;">${esc(orgName)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#78716C;">Audit ID: ${esc(auditId)}</p>
      </div>
      <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;">
        <p style="margin:0;font-size:13px;color:#DC2626;font-weight:600;">エラー内容:</p>
        <p style="margin:4px 0 0;font-size:13px;color:#1C1917;white-space:pre-wrap;">${esc(failureReason)}</p>
      </div>
      <a href="https://webmori.jp/ja/admin/audits"
        style="background:#DC2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        管理画面で確認する
      </a>
    </td></tr>
  </table>
</body>`,
  }).catch(() => {});

  // Also push to operator's LINE if configured
  if (env.OPERATOR_LINE_USER_ID) {
    await sendLinePush(
      env.OPERATOR_LINE_USER_ID,
      `⚠️ 監査失敗: ${orgName}\n\n${failureReason.slice(0, 200)}\n\nhttps://webmori.jp/ja/admin/audits`,
    );
  }
}
