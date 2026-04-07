import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getResend, EMAIL_FROM } from "./email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      // Set admin marker cookie for middleware (UI-level gate only).
      const adminEmails = process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
      let isAdminUser = !!(session.user?.email && adminEmails.includes(session.user.email.toLowerCase()));
      if (!isAdminUser) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        isAdminUser = dbUser?.role === "ADMIN";
      }

      try {
        const cookieStore = await cookies();
        if (isAdminUser) {
          cookieStore.set("webmori-admin", "1", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        } else {
          cookieStore.delete("webmori-admin");
        }
      } catch {
        // cookies() throws in Edge runtime or non-request contexts — safe to ignore
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

      // Send welcome email
      const resend = getResend();
      if (resend && user.email) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [user.email],
          subject: "【WebMori】ようこそ！アカウント登録が完了しました",
          html: `
<body style="background:#FAFAF9;font-family:-apple-system,'SF Pro Text','Segoe UI',sans-serif;margin:0;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr>
      <td style="background:#1C1917;padding:24px 32px;border-radius:8px 8px 0 0;">
        <span style="color:#D97706;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">Web<span style="color:white;">Mori</span></span>
        <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">ウェブ守り</span>
      </td>
    </tr>
    <tr>
      <td style="background:white;padding:40px 32px 32px;border:1px solid #E7E5E4;border-top:none;">
        <h2 style="margin:0 0 12px;color:#1C1917;font-size:20px;font-weight:600;">ようこそ、WebMoriへ！</h2>
        <p style="margin:0 0 24px;color:#78716C;font-size:14px;line-height:1.8;">
          アカウント登録ありがとうございます。<br>
          WebMoriはあなたのウェブサイトのセキュリティ・パフォーマンスを<br>
          毎月チェックし、改善提案をお届けするサービスです。
        </p>
        <h3 style="margin:0 0 12px;color:#1C1917;font-size:16px;font-weight:600;">はじめの3ステップ</h3>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="padding:8px 12px 8px 0;color:#D97706;font-size:18px;font-weight:bold;vertical-align:top;">1.</td>
            <td style="padding:8px 0;color:#1C1917;font-size:14px;">プロフィールを設定する</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#D97706;font-size:18px;font-weight:bold;vertical-align:top;">2.</td>
            <td style="padding:8px 0;color:#1C1917;font-size:14px;">サイトのリポジトリを追加する</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#D97706;font-size:18px;font-weight:bold;vertical-align:top;">3.</td>
            <td style="padding:8px 0;color:#1C1917;font-size:14px;">無料診断をリクエストする</td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:8px;background:#D97706;">
              <a href="https://webmori.jp/ja/dashboard"
                target="_blank"
                style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#1C1917;text-decoration:none;border-radius:8px;">
                ダッシュボードを開く
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 0;text-align:center;">
        <span style="color:#78716C;font-size:12px;">
          © ${new Date().getFullYear()} WebMori（ウェブ守り）
          · <a href="https://webmori.jp" style="color:#78716C;">webmori.jp</a>
        </span>
      </td>
    </tr>
  </table>
</body>`.trim(),
        }).catch(() => {/* non-fatal */});
      }
    },
  },
});
