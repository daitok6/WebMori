"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Shield, Zap, Globe, Code, LineChart } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bg-cream to-white pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4">{t("badge")}</Badge>
            <h1 className="text-4xl font-bold leading-tight text-navy-dark sm:text-5xl lg:text-6xl">
              {t("title")}
              <span className="text-gold">{t("titleHighlight")}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-muted leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg">{t("cta")}</Button>
              </Link>
              <Link href="/features">
                <Button variant="secondary" size="lg">
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated report mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white p-6 shadow-xl border border-border-light">
              {/* Mock report header */}
              <div className="flex items-center gap-3 border-b border-border-light pb-4 mb-4">
                <div className="h-3 w-3 rounded-full bg-severity-good" />
                <div className="h-3 w-3 rounded-full bg-severity-medium" />
                <div className="h-3 w-3 rounded-full bg-severity-critical" />
                <span className="ml-2 text-sm text-text-muted">audit-report.pdf</span>
              </div>

              {/* Mock findings */}
              <div className="space-y-3">
                {[
                  { icon: Shield, label: "Security", color: "text-severity-good", status: "Pass" },
                  { icon: Zap, label: "Performance", color: "text-severity-medium", status: "3 issues" },
                  { icon: LineChart, label: "LINE API", color: "text-severity-good", status: "Pass" },
                  { icon: Globe, label: "i18n", color: "text-severity-low", status: "1 issue" },
                  { icon: Code, label: "Maintainability", color: "text-severity-good", status: "Pass" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-bg-cream px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <span className="text-sm font-medium text-text-body">{item.label}</span>
                    </div>
                    <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -z-10 -top-8 -right-8 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute -z-10 -bottom-8 -left-8 h-48 w-48 rounded-full bg-navy/5 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
