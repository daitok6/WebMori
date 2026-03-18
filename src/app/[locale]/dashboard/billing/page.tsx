"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

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
    paidAt: string | null;
    createdAt: string;
  }[];
}

export default function BillingPage() {
  const t = useTranslations("dashboard.billing");
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  const planVariant =
    data?.plan === "PRO"
      ? "pro"
      : data?.plan === "GROWTH"
        ? "growth"
        : data?.plan === "STARTER"
          ? "starter"
          : "default";

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">{t("title")}</h1>

      {/* Subscription card */}
      <Card className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
              <CreditCard className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t("currentPlan")}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-navy-dark">
                  {data?.plan ?? t("inactive")}
                </span>
                {data?.plan && (
                  <Badge variant={planVariant as "pro" | "growth" | "starter"}>
                    {data.status ?? "ACTIVE"}
                  </Badge>
                )}
              </div>
              {data?.currentPeriodEnd && (
                <p className="text-xs text-text-muted mt-1">
                  {data.billingCycle === "ANNUAL" ? "Annual" : "Monthly"} ·
                  Renews{" "}
                  {new Date(data.currentPeriodEnd).toLocaleDateString("ja-JP")}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={openPortal}
            disabled={portalLoading || !data?.plan}
            title={!data?.plan ? "No active subscription" : undefined}
          >
            {portalLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-1.5 h-4 w-4" />
            )}
            {t("manage")}
          </Button>
        </div>
      </Card>

      {/* Payment history */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-navy-dark mb-4">
          {t("history")}
        </h2>

        {!data?.payments || data.payments.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            {t("noHistory")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-text-muted">
                    {t("date")}
                  </th>
                  <th className="pb-2 font-medium text-text-muted">
                    {t("amount")}
                  </th>
                  <th className="pb-2 font-medium text-text-muted">
                    {t("status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-navy-dark">
                      {new Date(
                        p.paidAt ?? p.createdAt,
                      ).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 text-navy-dark">
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
