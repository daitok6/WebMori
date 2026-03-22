import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "raised" | "outlined" | "ghost";

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface border border-border shadow-sm",
  raised: "bg-surface border border-border shadow-md",
  outlined: "bg-transparent border border-border-strong",
  ghost: "bg-transparent",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  variant?: CardVariant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6",
          variantStyles[variant],
          accent && "border-l-4 border-l-primary",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 pt-4 border-t border-border", className)} {...props} />;
}
