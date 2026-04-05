"use client";

import { useInView, useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  // Extract numeric part and suffix (e.g., "500+" -> 500, "+")
  // Non-numeric values like "PR" have no leading digits — skip animation entirely.
  const match = value.match(/^([\d,]+)(.*)$/);
  const numericTarget = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1500, bounce: 0 });

  useEffect(() => {
    if (isInView && numericTarget !== null) {
      motionValue.set(numericTarget);
    }
  }, [isInView, numericTarget, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      if (ref.current && numericTarget !== null) {
        ref.current.textContent =
          Math.round(v).toLocaleString() + suffix;
      }
    });
    return unsubscribe;
  }, [spring, suffix, numericTarget]);

  return (
    <motion.span ref={ref} className={className}>
      {value}
    </motion.span>
  );
}
