import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { Resend as ResendClient } from "resend";
import { prisma } from "./prisma";

function magicLinkHtml(url: string): string {
  return `
<body style="background:#FDFBF7;font-family:-apple-system,'SF Pro Text','Segoe UI',sans-serif;margin:0;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr>
      <td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
        <span style="color:#C9A84C;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">Web<span style="color:white;">Mori</span></span>
        <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">ウェブ守り</span>
      </td>
    </tr>
    <tr>
      <td style="background:white;padding:40px 32px 32px;border:1px solid #EDE9E3;border-top:none;">
        <h2 style="margin:0 0 8px;color:#0F1923;font-size:20px;font-weight:600;">ログインリンク</h2>
        <p style="margin:0 0 32px;color:#5A6478;font-size:14px;line-height:1.7;">
          下のボタンをクリックしてWebMoriダッシュボードにログインしてください。<br>
          このリンクは24時間有効です。
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:8px;background:#C9A84C;">
              <a href="${url}"
                target="_blank"
                style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#0F1923;text-decoration:none;border-radius:8px;letter-spacing:-0.2px;">
                ダッシュボードにログイン
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:#5A6478;font-size:12px;line-height:1.7;">
          このメールに心当たりがない場合は、無視していただいて構いません。<br>
          ボタンが機能しない場合は以下のURLをブラウザに貼り付けてください：<br>
          <a href="${url}" style="color:#C9A84C;word-break:break-all;">${url}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 0;text-align:center;">
        <span style="color:#5A6478;font-size:12px;">
          © ${new Date().getFullYear()} WebMori（ウェブ守り）
          · <a href="https://webmori.jp" style="color:#5A6478;">webmori.jp</a>
        </span>
      </td>
    </tr>
  </table>
</body>
  `.trim();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      from: process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>",
      apiKey: process.env.RESEND_API_KEY,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const resend = new ResendClient(provider.apiKey as string);
        await resend.emails.send({
          from: provider.from as string,
          to: [identifier],
          subject: "WebMoriへのログイン",
          html: magicLinkHtml(url),
          text: `WebMoriダッシュボードにログインするには以下のリンクをクリックしてください:\n${url}`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        (session.user as { role?: string }).role = (user as { role?: string }).role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create an organization for every new user
      const org = await prisma.organization.create({
        data: {
          name: user.email?.split("@")[0] ?? "My Organization",
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id },
      });
    },
  },
});
