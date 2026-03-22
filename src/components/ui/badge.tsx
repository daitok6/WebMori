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
  default: "bg-surface-raised text-ink-muted",
  critical: "bg-severity-critical/10 text-severity-critical",
  high: "bg-severity-high/10 text-severity-high",
  medium: "bg-severity-medium/10 text-severity-medium",
  low: "bg-severity-low/10 text-severity-low",
  good: "bg-severity-good/10 text-severity-good",
  starter: "bg-ink-subtle/10 text-ink-muted",
  growth: "bg-primary/10 text-primary",
  pro: "bg-accent/10 text-accent",
};

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
