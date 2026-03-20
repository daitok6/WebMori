import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/r2";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const contact = await prisma.contactRequest.findUnique({
    where: { id },
    include: {
      organization: {
        include: { users: { select: { email: true, emailNotifications: true }, take: 1 } },
      },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "ファイルサイズが10MBを超えています" }, { status: 400 });
  }

  // Validate MIME type
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDFファイルのみアップロードできます" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Validate PDF magic bytes (%PDF-)
  if (
    buffer.length < 5 ||
    buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46 || buffer[4] !== 0x2d
  ) {
    return NextResponse.json({ error: "有効なPDFファイルではありません" }, { status: 400 });
  }

  const resend = getResend();
  const siteLabel = contact.url ?? "あなたのサイト";

  if (contact.organizationId && contact.organization) {
    // Registered user — upload to R2, send dashboard link
    const reportId = crypto.randomUUID();
    const pdfKey = `free-evals/${contact.organizationId}/${reportId}.pdf`;

    try {
      await uploadPdf(pdfKey, buffer);
    } catch (e) {
      console.error("[contacts/send-report] R2 upload failed:", e);
      return NextResponse.json(
        { error: "ファイルのアップロードに失敗しました" },
        { status: 500 },
      );
    }

    await prisma.freeEvalReport.create({
      data: { id: reportId, organizationId: contact.organizationId, siteUrl: contact.url, pdfKey },
    });

    const clientUser = contact.organization.users[0];
    const clientEmail = clientUser?.emailNotifications !== false ? clientUser?.email : null;
    if (clientEmail && resend) {
      await resend.emails.send({
        from: EMAIL_FROM,
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
        <strong>${esc(siteLabel)}</strong> の無料診断レポートをお届けします。<br>
        ダッシュボードからPDFをダウンロードしてご確認ください。
      </p>
      <a href="https://webmori.jp/ja/dashboard/reports"
        style="background:#C9A84C;color:#0F1923;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        レポートをダウンロードする
      </a>
    </td></tr>
  </table>
</body>`,
      }).catch(() => {/* non-fatal */});
    }
  } else {
    // Non-registered contact — send PDF as email attachment directly
    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [contact.email],
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
        <strong>${esc(contact.name)}</strong> 様、<strong>${esc(siteLabel)}</strong> の無料診断レポートを添付しております。<br>
        ご確認いただき、ご不明な点はお気軽にご返信ください。
      </p>
    </td></tr>
  </table>
</body>`,
      attachments: [
        {
          filename: "webmori-report.pdf",
          content: buffer,
        },
      ],
    });
  }

  // Flip status to COMPLETED
  await prisma.contactRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ ok: true });
}
