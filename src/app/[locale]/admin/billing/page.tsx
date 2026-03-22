"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, CreditCard } from "lucide-react";

interface BillingOverview {
  mrr: number;
  activeCount: number;
  subscriptions: {
    id: string;
    orgName: string;
    plan: string;
    billingCycle: string;
    status: string;
    currentPeriodEnd: string | null;
    createdAt: string;
  }[];
  payments: {
    id: string;
    orgName: string;
    plan: string;
    amount: number;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }[];
}

const planVariant: Record<string, "starter" | "growth" | "pro"> = {
  STARTER: "starter",
  GROWTH: "growth",
  PRO: "pro",
};

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!data) return <p className="text-ink-muted">Failed to load billing data.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Billing Dashboard</h1>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">MRR</p>
              <p className="text-xl font-bold text-ink">
                ¥{data.mrr.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-severity-good/10 p-2.5">
              <Users className="h-5 w-5 text-severity-good" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Active Subscriptions</p>
              <p className="text-xl font-bold text-ink">{data.activeCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-ink-subtle/10 p-2.5">
              <CreditCard className="h-5 w-5 text-ink-muted" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Total Subscriptions</p>
              <p className="text-xl font-bold text-ink">{data.subscriptions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active subscriptions */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Subscriptions</h2>
        {data.subscriptions.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-8">No subscriptions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-ink-muted">Organization</th>
                  <th className="pb-2 font-medium text-ink-muted">Plan</th>
                  <th className="pb-2 font-medium text-ink-muted">Cycle</th>
                  <th className="pb-2 font-medium text-ink-muted">Status</th>
                  <th className="pb-2 font-medium text-ink-muted">Period End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 font-medium text-ink">{s.orgName}</td>
                    <td className="py-3">
                      <Badge variant={planVariant[s.plan] ?? "default"}>{s.plan}</Badge>
                    </td>
                    <td className="py-3 text-ink-muted">{s.billingCycle}</td>
                    <td className="py-3">
                      <Badge variant={s.status === "ACTIVE" ? "good" : "default"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-ink-muted">
                      {s.currentPeriodEnd
                        ? new Date(s.currentPeriodEnd).toLocaleDateString("ja-JP")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent payments */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Recent Payments</h2>
        {data.payments.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-8">No payments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-ink-muted">Organization</th>
                  <th className="pb-2 font-medium text-ink-muted">Plan</th>
                  <th className="pb-2 font-medium text-ink-muted">Amount</th>
                  <th className="pb-2 font-medium text-ink-muted">Status</th>
                  <th className="pb-2 font-medium text-ink-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium text-ink">{p.orgName}</td>
                    <td className="py-3">
                      <Badge variant={planVariant[p.plan] ?? "default"}>{p.plan}</Badge>
                    </td>
                    <td className="py-3 text-ink">¥{p.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge variant={p.status === "paid" ? "good" : p.status === "failed" ? "critical" : "default"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-ink-muted">
                      {new Date(p.paidAt ?? p.createdAt).toLocaleDateString("ja-JP")}
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
