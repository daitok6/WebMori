import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, url, stack, message } = body as {
    name: string;
    email: string;
    url?: string;
    stack?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  // Save to DB
  await prisma.contactRequest.create({
    data: { name, email, url: url || null, stack: stack || null, message: message || null },
  });

  const operatorEmail = process.env.OPERATOR_EMAIL ?? "daito.k631@gmail.com";
  const from = process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>";

  // Notify operator
  await resend.emails.send({
    from,
    to: [operatorEmail],
    subject: `【WebMori】無料診断のお申し込み: ${name}`,
    html: `
      <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;margin:0;padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
          <tr>
            <td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <h2 style="margin:0 0 20px;color:#0F1923;font-size:18px;">新しい無料診断のお申し込みがあります</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${[
                  ["お名前", name],
                  ["メールアドレス", email],
                  ["サイトURL", url || "未入力"],
                  ["スタック", stack || "未入力"],
                  ["メッセージ", message || "未入力"],
                ].map(([label, value]) => `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #EDE9E3;color:#5A6478;font-size:13px;width:140px;vertical-align:top;">${label}</td>
                    <td style="padding:10px 0;border-bottom:1px solid #EDE9E3;color:#1A1A1A;font-size:13px;">${value}</td>
                  </tr>
                `).join("")}
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  });

  // Confirm to customer
  await resend.emails.send({
    from,
    to: [email],
    subject: "【WebMori】お問い合わせを受け付けました",
    html: `
      <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;margin:0;padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
          <tr>
            <td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 16px;color:#0F1923;font-size:16px;">${name} 様</p>
              <p style="margin:0 0 16px;color:#1A1A1A;font-size:14px;line-height:1.7;">
                お問い合わせありがとうございます。<br>
                内容を確認の上、3営業日以内にご連絡いたします。
              </p>
              <p style="margin:24px 0 0;color:#5A6478;font-size:13px;">
                WebMori（ウェブ守り）<br>
                <a href="https://webmori.jp" style="color:#C9A84C;">webmori.jp</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
    `,
  });

  return NextResponse.json({ success: true });
}
