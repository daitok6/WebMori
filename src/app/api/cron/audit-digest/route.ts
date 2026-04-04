import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, EMAIL_FROM } from "@/lib/email";
import { env } from "@/lib/env";

/**
 * GET /api/cron/audit-digest
 * Runs daily at 01:00 UTC (10:00 JST), 1 hour after check-audits creates SCHEDULED records.
 * Sends the operator a digest of pending audits to run today.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find SCHEDULED audits due today (scheduledAt <= now)
  const pending = await prisma.audit.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      organization: {
        subscription: { status: { in: ["ACTIVE", "TRIALING"] } },
      },
    },
    include: {
      repo: { select: { name: true, url: true, isRepoless: true } },
      organization: {
        select: {
          name: true,
          users: { select: { email: true }, take: 1 },
          subscription: { select: { plan: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  if (pending.length === 0) {
    return NextResponse.json({ sent: false, reason: "No pending audits", timestamp: now.toISOString() });
  }

  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ sent: false, reason: "Resend not configured" }, { status: 500 });
  }

  const dateStr = now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Tokyo",
  });

  const rows = pending.map((audit) => {
    const email = audit.organization.users[0]?.email ?? "（メール未設定）";
    const plan = audit.organization.subscription?.plan ?? "STARTER";
    const depth = audit.auditDepth ?? "full";
    const type = audit.repo.isRepoless ? "URL監査" : "コード監査";
    const scheduled = audit.scheduledAt
      ? audit.scheduledAt.toLocaleDateString("ja-JP", { month: "long", day: "numeric", timeZone: "Asia/Tokyo" })
      : "—";

    return `
      <tr style="border-bottom:1px solid #E7E5E4;">
        <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#1C1917;">${audit.organization.name}</td>
        <td style="padding:10px 12px;font-size:13px;color:#78716C;">${email}</td>
        <td style="padding:10px 12px;font-size:13px;color:#78716C;">${plan}</td>
        <td style="padding:10px 12px;font-size:13px;color:#78716C;">${type} (${depth})</td>
        <td style="padding:10px 12px;font-size:13px;color:#78716C;">${scheduled}</td>
      </tr>`;
  }).join("");

  const commands = pending.map((audit) => {
    const email = audit.organization.users[0]?.email ?? "";
    return email ? `/audit ${email}` : `# ${audit.organization.name} — メール未設定`;
  }).join("\n");

  await resend.emails.send({
    from: EMAIL_FROM,
    to: [env.OPERATOR_EMAIL],
    subject: `【WebMori 管理】本日の監査キュー — ${pending.length}件 (${dateStr})`,
    html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
      <span style="color:#78716C;font-size:12px;margin-left:12px;">毎日の監査キュー</span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 8px;color:#1C1917;font-size:18px;">本日の監査キュー</h2>
      <p style="color:#78716C;font-size:14px;margin:0 0 24px;">${dateStr} — ${pending.length}件のスケジュール済み監査があります</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E7E5E4;border-radius:8px;overflow:hidden;margin:0 0 24px;">
        <thead>
          <tr style="background:#F5F5F4;">
            <th style="padding:10px 12px;font-size:12px;color:#78716C;text-align:left;font-weight:600;">クライアント</th>
            <th style="padding:10px 12px;font-size:12px;color:#78716C;text-align:left;font-weight:600;">メール</th>
            <th style="padding:10px 12px;font-size:12px;color:#78716C;text-align:left;font-weight:600;">プラン</th>
            <th style="padding:10px 12px;font-size:12px;color:#78716C;text-align:left;font-weight:600;">種別</th>
            <th style="padding:10px 12px;font-size:12px;color:#78716C;text-align:left;font-weight:600;">予定日</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="background:#F8F5EE;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#78716C;text-transform:uppercase;letter-spacing:0.5px;">Claude Code で実行</p>
        <pre style="margin:0;font-size:13px;color:#1C1917;white-space:pre-wrap;">${commands}</pre>
      </div>

      <a href="https://webmori.jp/ja/admin/audits"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        管理画面を開く
      </a>
    </td></tr>
  </table>
</body>`,
  }).catch(() => {});

  return NextResponse.json({
    sent: true,
    count: pending.length,
    timestamp: now.toISOString(),
  });
}
