"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
}

const directionVariants: Record<Direction, { initial: Record<string, number>; animate: Record<string, number> }> = {
  up: { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } },
  down: { initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  scale: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
};

export function ScrollReveal({ children, className, delay = 0, direction = "up" }: ScrollRevealProps) {
  const variant = directionVariants[direction];
  return (
    <motion.div
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
