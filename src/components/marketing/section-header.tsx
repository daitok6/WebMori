"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <ScrollReveal
      className={cn(
        align === "center" && "text-center",
        className,
      )}
    >
      <h2
        className={cn(
          "text-3xl font-bold sm:text-4xl",
          light ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-2xl text-lg leading-relaxed",
            light ? "text-white/70" : "text-ink-muted",
            align === "center" && "text-center",
          )}
        >
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}
