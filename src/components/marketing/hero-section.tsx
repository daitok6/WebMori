"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ProductPreviewCard } from "./product-preview-card";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-surface min-h-screen flex flex-col justify-center pt-20 pb-0">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Amber top-left accent rule */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-[3px]"
        style={{ width: "40%", background: "linear-gradient(90deg, #D97706, transparent)" }}
      />

      {/* "守" kanji watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute right-[-40px] top-1/2 -translate-y-1/2 font-black leading-none text-ink opacity-[0.045] text-[300px] max-[900px]:text-[160px] max-[900px]:right-[-20px]"
        style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
      >
        守
      </div>

      {/* Split grid */}
      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-5 sm:px-10 lg:px-20 flex flex-col gap-10 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-16 py-12 min-[900px]:py-16">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-5">{t("badge")}</Badge>
          </motion.div>

          {/* Amber rule */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ transformOrigin: "left" }}
            className="mb-5 h-[3px] w-12 rounded-full bg-primary"
          />

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-[clamp(26px,2.8vw,36px)] font-black leading-[1.12] tracking-[-0.04em] text-ink mb-5"
          >
            {t("title1")}
            <span className="text-primary">{t("titleHighlight")}</span>
            <br />
            <span className="whitespace-nowrap">{t("title2")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-[15px] sm:text-base text-ink-muted leading-relaxed max-w-[460px] mb-7"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3"
          >
            <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                {t("cta")} →
              </Button>
            </Link>
            <Link href="/sample-report" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto whitespace-nowrap">
                {t("ctaSecondary")}
              </Button>
            </Link>
          </motion.div>

          {/* Microcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-[11px] text-ink-muted mb-7"
          >
            {t("noCreditCard")}
          </motion.p>

          {/* Proof bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-5 border-t border-border"
          >
            <span className="text-[11px] text-ink-muted">✓ {t("proofOwasp")}</span>
            <span className="text-ink-muted text-[11px]">·</span>
            <span className="text-[11px] text-ink-muted">✓ {t("proofIpa")}</span>
            <span className="text-ink-muted text-[11px]">·</span>
            <span className="text-[11px] text-ink-muted">✓ {t("proofLine")}</span>
            <span className="text-ink-muted text-[11px]">·</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-raised border border-border px-2.5 py-1 text-[11px] text-ink-muted font-medium">
              {t("proofClients")}
            </span>
          </motion.div>
        </div>

        {/* ── Right column — Product card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full min-[900px]:w-[380px] shrink-0"
        >
          <ProductPreviewCard />
        </motion.div>

      </div>

      {/* Bottom platform strip */}
      <div className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-10 lg:px-20 py-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-[11px] text-ink-muted">対応スタック:</span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { icon: "🛍", name: "Shopify" },
              { icon: "📝", name: "WordPress" },
              { icon: "⚡", name: "Next.js" },
              { icon: "💬", name: "LINE Mini App" },
            ].map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised border border-border px-3 py-1.5 text-[11px] text-ink-muted"
              >
                {p.icon} {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
