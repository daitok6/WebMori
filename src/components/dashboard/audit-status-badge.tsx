import { Badge } from "@/components/ui/badge";

type AuditStatus = "SCHEDULED" | "IN_PROGRESS" | "REVIEW" | "DELIVERED" | "COMPLETED";

const statusConfig: Record<AuditStatus, { variant: "default" | "medium" | "low" | "good" | "growth"; label: string }> = {
  SCHEDULED: { variant: "default", label: "Scheduled" },
  IN_PROGRESS: { variant: "medium", label: "In Progress" },
  REVIEW: { variant: "low", label: "Review" },
  DELIVERED: { variant: "growth", label: "Delivered" },
  COMPLETED: { variant: "good", label: "Completed" },
};

export function AuditStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as AuditStatus] ?? statusConfig.SCHEDULED;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
