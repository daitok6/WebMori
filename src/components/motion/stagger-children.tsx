"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

const container = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      custom={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { item as staggerItem };
