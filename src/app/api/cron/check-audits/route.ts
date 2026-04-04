import { NextRequest, NextResponse } from "next/server";
import { scheduleMonthlyAudits } from "@/lib/audit-scheduler";
import { prisma } from "@/lib/prisma";
import { sendOperatorFailureAlert } from "@/lib/notifications";
import { env } from "@/lib/env";
import { getResend, EMAIL_FROM } from "@/lib/email";

const STALE_THRESHOLD_HOURS = 24;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scheduled = await scheduleMonthlyAudits();

  // Alert operator about stale SCHEDULED audits (>24h overdue, never started)
  const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000);
  const staleAudits = await prisma.audit.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: staleThreshold },
    },
    include: {
      organization: { select: { name: true } },
    },
  });

  if (staleAudits.length > 0) {
    const resend = getResend();
    if (resend) {
      const staleList = staleAudits
        .map((a) => `• ${a.organization.name} (ID: ${a.id}, scheduled: ${a.scheduledAt?.toISOString() ?? "unknown"})`)
        .join("\n");

      await resend.emails.send({
        from: EMAIL_FROM,
        to: [env.OPERATOR_EMAIL],
        subject: `【WebMori 管理】未実行の監査が${staleAudits.length}件あります`,
        html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#92400E;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#FDE68A;font-size:20px;font-weight:bold;">WebMori</span>
      <span style="color:#FDE68A;font-size:12px;margin-left:12px;">⚠️ スケジュール警告</span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#92400E;font-size:18px;">${staleAudits.length}件の監査が24時間以上未実行です</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 16px;">
        スケジュール済みの監査が自動トリガーされていない可能性があります。
        手動での確認・実行が必要です。
      </p>
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin:0 0 24px;">
        <pre style="margin:0;font-size:13px;color:#1C1917;white-space:pre-wrap;">${staleList}</pre>
      </div>
      <a href="https://webmori.jp/ja/admin/audits"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        管理画面で確認する
      </a>
    </td></tr>
  </table>
</body>`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    scheduled: scheduled.length,
    audits: scheduled,
    staleAudits: staleAudits.length,
    timestamp: new Date().toISOString(),
  });
}
