"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Mail, Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignInPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = (params.locale as string) ?? "ja";
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${locale}/dashboard` });
    setGoogleLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    await signIn("resend", { email, callbackUrl: `/${locale}/dashboard` });
    setEmailLoading(false);
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-bg-cream px-6 pt-20">
      <ScrollReveal>
        <Card className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Mail className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-navy-dark">{t("signInTitle")}</h1>
            <p className="mt-2 text-sm text-text-muted">{t("signInDescription")}</p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || emailLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-body shadow-sm hover:bg-bg-cream transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            ) : (
              <GoogleIcon />
            )}
            {t("signInWithGoogle")}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-text-muted">{t("or")}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Magic link */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1.5">
                {t("email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                placeholder={t("emailPlaceholder")}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={emailLoading || googleLoading}
            >
              {emailLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("sending")}</>
              ) : (
                t("sendMagicLink")
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-text-muted">
            {t("signInFooter")}
          </p>
        </Card>
      </ScrollReveal>
    </section>
  );
}
