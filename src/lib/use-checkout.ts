"use client";

import { useState } from "react";

const PLAN_KEYS = ["STARTER", "GROWTH", "PRO"] as const;

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  async function checkout(planIndex: number, annual: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: PLAN_KEYS[planIndex],
          billingCycle: annual ? "ANNUAL" : "MONTHLY",
        }),
      });

      if (res.status === 401) {
        // Not authenticated — redirect to signin
        window.location.href = "/auth/signin";
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return { checkout, loading };
}
