"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type AuditStatus = "SCHEDULED" | "IN_PROGRESS" | "REVIEW" | "DELIVERED" | "COMPLETED";

const statusVariant: Record<AuditStatus, "default" | "medium" | "low" | "good" | "growth"> = {
  SCHEDULED: "default",
  IN_PROGRESS: "medium",
  REVIEW: "low",
  DELIVERED: "growth",
  COMPLETED: "good",
};

export function AuditStatusBadge({ status }: { status: string }) {
  const t = useTranslations("dashboard.auditStatus");
  const variant = statusVariant[status as AuditStatus] ?? "default";
  const label = t.has(status) ? t(status) : status;
  return <Badge variant={variant}>{label}</Badge>;
}
