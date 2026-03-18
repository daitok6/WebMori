"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Mail } from "lucide-react";

export default function SignInPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, callbackUrl: "/dashboard" });
    setLoading(false);
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

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? t("sending") : t("sendMagicLink")}
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
