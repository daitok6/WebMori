"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Loader2, ExternalLink } from "lucide-react";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isLineWebView, setIsLineWebView] = useState(false);

  useEffect(() => {
    // LINE's in-app browser identifies itself with "Line/" in the user agent.
    // Google OAuth refuses to run inside WebViews (Error 403: disallowed_useragent).
    if (/Line\//i.test(navigator.userAgent)) {
      setIsLineWebView(true);
    }
  }, []);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${locale}/dashboard` });
    setGoogleLoading(false);
  }

  if (isLineWebView) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center bg-surface-raised px-6 pt-20">
        <ScrollReveal>
          <Card className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <ExternalLink className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-ink mb-2">ブラウザで開いてください</h1>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              LINEのアプリ内ブラウザではGoogleログインに対応していません。
              右上の「…」メニューから<strong>「ブラウザで開く」</strong>を選択してください。
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800 space-y-2">
              <p className="font-medium">手順</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>右上の <strong>「…」</strong> をタップ</li>
                <li><strong>「ブラウザで開く」</strong> を選択</li>
                <li>SafariまたはChromeでログイン</li>
              </ol>
            </div>
          </Card>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-surface-raised px-6 pt-20">
      <ScrollReveal>
        <Card className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <GoogleIcon />
            </div>
            <h1 className="text-2xl font-bold text-ink">{t("signInTitle")}</h1>
            <p className="mt-2 text-sm text-ink-muted">{t("signInDescription")}</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-surface-raised transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
            ) : (
              <GoogleIcon />
            )}
            {t("signInWithGoogle")}
          </button>

          <p className="mt-4 text-center text-xs text-ink-muted">
            {t("signInFooter")}
          </p>
        </Card>
      </ScrollReveal>
    </section>
  );
}
