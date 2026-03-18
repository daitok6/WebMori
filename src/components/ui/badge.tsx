import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "good"
  | "starter"
  | "growth"
  | "pro";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-cream text-text-muted",
  critical: "bg-severity-critical/10 text-severity-critical",
  high: "bg-severity-high/10 text-severity-high",
  medium: "bg-severity-medium/10 text-severity-medium",
  low: "bg-severity-low/10 text-severity-low",
  good: "bg-severity-good/10 text-severity-good",
  starter: "bg-navy-light/10 text-navy-light",
  growth: "bg-gold/10 text-gold",
  pro: "bg-navy/10 text-navy",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
