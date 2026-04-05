"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Shield, Zap, Globe, Code, LineChart, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

/* ---------- Terminal scan animation ---------- */
const scanLines = [
  { text: "$ webmori scan --target client-site.jp", color: "text-primary" },
  { text: "  [1/5] Security audit .............. PASS", color: "text-emerald-400" },
  { text: "  [2/5] Performance check ........... 3 issues", color: "text-amber-400" },
  { text: "  [3/5] LINE API review ............. PASS", color: "text-emerald-400" },
  { text: "  [4/5] i18n / Japanese UX .......... 1 issue", color: "text-yellow-400" },
  { text: "  [5/5] Maintainability ............. PASS", color: "text-emerald-400" },
  { text: "  Report generated: report-ja.pdf", color: "text-primary" },
];

function TerminalScan() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < scanLines.length) {
      const timeout = setTimeout(
        () => setVisibleLines((v) => v + 1),
        visibleLines === 0 ? 800 : 400,
      );
      return () => clearTimeout(timeout);
    }
  }, [visibleLines]);

  return (
    <div className="rounded-2xl bg-stone-900 p-5 shadow-2xl border border-stone-700/50 font-mono text-sm leading-relaxed">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-700/50">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-xs text-stone-500">webmori-audit</span>
      </div>

      {/* Scan lines */}
      <div className="space-y-1.5 min-h-[220px]">
        <AnimatePresence>
          {scanLines.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={line.color}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        {visibleLines < scanLines.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary"
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Hero Section ---------- */
export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-32 pb-14 sm:pb-20">
      {/* Warm gradient mesh background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-subtle via-surface to-surface" />
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-accent-subtle/30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Centered text block */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6">{t("badge")}</Badge>
            <h1 className="text-[1.75rem] font-bold leading-tight text-ink sm:text-5xl lg:text-6xl [text-wrap:balance]">
              {t("title")}
              <br />
              <span className="text-primary">{t("titleHighlight")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted leading-relaxed text-balance">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">{t("cta")}</Button>
            </Link>
            <Link href="/sample-report" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {t("ctaSecondary")}
              </Button>
            </Link>
          </motion.div>

          {/* No credit card note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-2 text-xs text-ink-muted"
          >
            {t("noCreditCard")}
          </motion.p>

          {/* Social proof line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{t("socialProof")}</span>
          </motion.div>
        </div>

        {/* Terminal scan animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-14 max-w-2xl"
        >
          <TerminalScan />
        </motion.div>
      </div>
    </section>
  );
}
