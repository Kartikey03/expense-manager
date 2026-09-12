"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass ${hover ? "glass-hover" : ""} rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
