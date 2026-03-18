import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-white border border-border-light p-6 shadow-sm",
          accent && "border-l-4 border-l-gold",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
