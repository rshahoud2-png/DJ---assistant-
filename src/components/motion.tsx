"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {value.toLocaleString()}
    </motion.span>
  );
}
