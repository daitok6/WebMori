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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!data) return <p className="text-text-muted">Failed to load billing data.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">Billing Dashboard</h1>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gold/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-text-muted">MRR</p>
              <p className="text-xl font-bold text-navy-dark">
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
              <p className="text-xs text-text-muted">Active Subscriptions</p>
              <p className="text-xl font-bold text-navy-dark">{data.activeCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-navy-light/10 p-2.5">
              <CreditCard className="h-5 w-5 text-navy-light" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Subscriptions</p>
              <p className="text-xl font-bold text-navy-dark">{data.subscriptions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active subscriptions */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-navy-dark mb-4">Subscriptions</h2>
        {data.subscriptions.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No subscriptions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-text-muted">Organization</th>
                  <th className="pb-2 font-medium text-text-muted">Plan</th>
                  <th className="pb-2 font-medium text-text-muted">Cycle</th>
                  <th className="pb-2 font-medium text-text-muted">Status</th>
                  <th className="pb-2 font-medium text-text-muted">Period End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 font-medium text-navy-dark">{s.orgName}</td>
                    <td className="py-3">
                      <Badge variant={planVariant[s.plan] ?? "default"}>{s.plan}</Badge>
                    </td>
                    <td className="py-3 text-text-muted">{s.billingCycle}</td>
                    <td className="py-3">
                      <Badge variant={s.status === "ACTIVE" ? "good" : "default"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-text-muted">
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
        <h2 className="text-lg font-semibold text-navy-dark mb-4">Recent Payments</h2>
        {data.payments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No payments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-text-muted">Organization</th>
                  <th className="pb-2 font-medium text-text-muted">Plan</th>
                  <th className="pb-2 font-medium text-text-muted">Amount</th>
                  <th className="pb-2 font-medium text-text-muted">Status</th>
                  <th className="pb-2 font-medium text-text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium text-navy-dark">{p.orgName}</td>
                    <td className="py-3">
                      <Badge variant={planVariant[p.plan] ?? "default"}>{p.plan}</Badge>
                    </td>
                    <td className="py-3 text-navy-dark">¥{p.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge variant={p.status === "paid" ? "good" : p.status === "failed" ? "critical" : "default"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-text-muted">
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
