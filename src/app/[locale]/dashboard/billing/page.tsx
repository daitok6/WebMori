"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardError } from "@/components/dashboard/dashboard-error";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { Link } from "@/i18n/navigation";
import { CreditCard, ExternalLink, Loader2, Download, Check, ArrowUpRight } from "lucide-react";

interface BillingData {
  plan: string | null;
  status: string | null;
  billingCycle: string | null;
  currentPeriodEnd: string | null;
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    stripeInvoiceId: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
}

export default function BillingPage() {
  const t = useTranslations("dashboard.billing");
  const locale = useLocale();
  const { data, loading, error, retry } = useDashboardData<BillingData>("/api/dashboard/billing");
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    if (!data?.plan) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      }
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error || !data) return <DashboardError message={error ?? "Unknown error"} onRetry={retry} />;

  const planVariant =
    data.plan === "PRO"
      ? "pro"
      : data.plan === "GROWTH"
        ? "growth"
        : data.plan === "STARTER"
          ? "starter"
          : "default";

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Subscription card */}
      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">{t("currentPlan")}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-ink">
                  {data.plan ?? t("inactive")}
                </span>
                {data.plan && (
                  <Badge variant={planVariant as "pro" | "growth" | "starter"}>
                    {data.status ?? "ACTIVE"}
                  </Badge>
                )}
              </div>
              {data.currentPeriodEnd && (
                <p className="text-xs text-ink-muted mt-1">
                  {data.billingCycle === "ANNUAL" ? t("annual") : t("monthly")} ·{" "}
                  {t("renews")}{" "}
                  {new Date(data.currentPeriodEnd).toLocaleDateString(locale)}
                </p>
              )}
            </div>
          </div>
          {data.plan ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={openPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-1.5 h-4 w-4" />
              )}
              {t("manage")}
            </Button>
          ) : (
            <Link href="/pricing">
              <Button variant="primary" size="sm">
                {t("choosePlan")}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Plan upgrade comparison */}
      {data.plan && data.plan !== "PRO" && (() => {
        const isStarter = data.plan === "STARTER";
        const title = isStarter ? t("upgradeToGrowthTitle") : t("upgradeToProTitle");
        const price = isStarter ? t("upgradeToGrowthPrice") : t("upgradeToProPrice");
        const features = (t.raw(isStarter ? "upgradeToGrowthFeatures" : "upgradeToProFeatures") as string[]);
        return (
          <Card className="mt-4 border-primary/30 bg-primary/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs font-medium text-primary mb-3">{price}</p>
                <ul className="space-y-1.5">
                  {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink">
                      <Check className="h-3.5 w-3.5 shrink-0 text-severity-good" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <Link href="/pricing">
                  <Button variant="primary" size="sm">
                    <ArrowUpRight className="mr-1.5 h-4 w-4" />
                    {t("viewPlans")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })()}
      {data.plan === "PRO" && (
        <Card className="mt-4">
          <p className="text-sm text-ink-muted text-center py-1">{t("onTopTier")}</p>
        </Card>
      )}

      {/* Payment history */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-ink mb-4">
          {t("history")}
        </h2>

        {!data.payments || data.payments.length === 0 ? (
          <div className="text-center py-8 text-ink-muted text-sm">
            {t("noHistory")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-ink-muted">
                    {t("date")}
                  </th>
                  <th className="pb-2 font-medium text-ink-muted">
                    {t("amount")}
                  </th>
                  <th className="pb-2 font-medium text-ink-muted">
                    {t("status")}
                  </th>
                  <th className="pb-2 font-medium text-ink-muted">
                    {t("invoice")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-ink">
                      {new Date(
                        p.paidAt ?? p.createdAt,
                      ).toLocaleDateString(locale)}
                    </td>
                    <td className="py-3 text-ink">
                      ¥{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          p.status === "paid"
                            ? "good"
                            : p.status === "failed"
                              ? "critical"
                              : "default"
                        }
                      >
                        {p.status === "paid"
                          ? t("paid")
                          : p.status === "failed"
                            ? t("failed")
                            : t("pending")}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {p.stripeInvoiceId && p.status === "paid" ? (
                        <a
                          href={`/api/dashboard/billing/invoice?id=${p.stripeInvoiceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("download")}
                        </a>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
