import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/r2";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const siteUrl = (form.get("siteUrl") as string) || null;
  const file = form.get("file") as File | null;

  if (!orgId || !file) {
    return NextResponse.json({ error: "Missing orgId or file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique ID for the record first
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const pdfKey = `free-evals/${orgId}/${id}.pdf`;

  try {
    await uploadPdf(pdfKey, buffer);
  } catch (e) {
    console.error("[free-evals/upload] R2 upload failed:", e);
    return NextResponse.json({ error: `R2アップロード失敗: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }

  let report;
  try {
    report = await prisma.freeEvalReport.create({
      data: { id, organizationId: orgId, siteUrl, pdfKey },
    });
  } catch (e) {
    console.error("[free-evals/upload] DB create failed:", e);
    return NextResponse.json({ error: `DB保存失敗: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }

  // Email the client
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { users: { select: { email: true } } },
  });

  const clientEmail = org?.users[0]?.email;
  if (clientEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>";
    const siteLabel = siteUrl ?? "あなたのサイト";
    try {
      await resend.emails.send({
        from,
        to: [clientEmail],
        subject: "【WebMori】無料診断レポートが届いています",
        html: `
<body style="background:#FDFBF7;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#0F1923;font-size:18px;">無料診断レポートが完成しました</h2>
      <p style="color:#5A6478;font-size:14px;line-height:1.7;margin:0 0 24px;">
        <strong>${siteLabel}</strong> の無料診断レポートをお届けします。<br>
        ダッシュボードからPDFをダウンロードしてご確認ください。
      </p>
      <a href="https://webmori.jp/ja/dashboard/reports"
        style="background:#C9A84C;color:#0F1923;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        レポートをダウンロードする
      </a>
    </td></tr>
  </table>
</body>
        `,
      });
    } catch (e) {
      console.error("[free-evals/upload] Email send failed:", e);
      // Don't fail the whole request — report was saved, just email didn't send
      return NextResponse.json({ ...report, emailError: `メール送信失敗: ${e instanceof Error ? e.message : String(e)}` }, { status: 201 });
    }
  }

  return NextResponse.json(report, { status: 201 });
}
