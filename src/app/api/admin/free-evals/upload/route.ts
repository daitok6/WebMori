import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/r2";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const siteUrl = (form.get("siteUrl") as string) || null;
  const contactId = (form.get("contactId") as string) || null;
  const file = form.get("file") as File | null;

  if (!orgId || !file) {
    return NextResponse.json({ error: "Missing orgId or file" }, { status: 400 });
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

  // Generate a unique ID for the record first
  const id = crypto.randomUUID();
  const pdfKey = `free-evals/${orgId}/${id}.pdf`;

  try {
    await uploadPdf(pdfKey, buffer);
  } catch (e) {
    console.error("[free-evals/upload] R2 upload failed:", e);
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
  }

  let report;
  try {
    report = await prisma.freeEvalReport.create({
      data: { id, organizationId: orgId, siteUrl, pdfKey },
    });
  } catch (e) {
    console.error("[free-evals/upload] DB create failed:", e);
    return NextResponse.json({ error: "データの保存に失敗しました" }, { status: 500 });
  }

  // Auto-complete the contact request if contactId provided
  if (contactId) {
    await prisma.contactRequest.update({
      where: { id: contactId },
      data: { status: "COMPLETED" },
    }).catch(() => {/* non-fatal if contact not found */});
  }

  // Email the client
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { users: { select: { email: true, emailNotifications: true } } },
  });

  const clientUser = org?.users[0];
  const clientEmail = clientUser?.emailNotifications !== false ? clientUser?.email : null;
  const resend = getResend();
  if (clientEmail && resend) {
    const siteLabel = siteUrl ?? "あなたのサイト";
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [clientEmail],
        subject: "【WebMori】無料診断レポートが届いています",
        html: `
<body style="background:#FAFAF9;font-family:-apple-system,sans-serif;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr><td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:#D97706;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
    </td></tr>
    <tr><td style="background:white;padding:32px;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 12px;color:#1C1917;font-size:18px;">無料診断レポートが完成しました</h2>
      <p style="color:#78716C;font-size:14px;line-height:1.7;margin:0 0 24px;">
        <strong>${esc(siteLabel)}</strong> の無料診断レポートをお届けします。<br>
        ダッシュボードからPDFをダウンロードしてご確認ください。
      </p>
      <a href="https://webmori.jp/ja/dashboard/reports"
        style="background:#D97706;color:#1C1917;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        レポートをダウンロードする
      </a>
    </td></tr>
  </table>
</body>
        `,
      });
    } catch (e) {
      console.error("[free-evals/upload] Email send failed:", e);
      return NextResponse.json({ ...report, emailError: "メール送信に失敗しました" }, { status: 201 });
    }
  }

  return NextResponse.json(report, { status: 201 });
}
