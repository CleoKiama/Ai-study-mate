"use client";

import { motion } from "motion/react";

export function AnimatedShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        initial={{ x: -50, y: -50, opacity: 0.6 }}
        animate={{ x: 20, y: 10, opacity: 0.9 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        initial={{ x: 40, y: 30, opacity: 0.5 }}
        animate={{ x: -10, y: -20, opacity: 0.85 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/4 h-24 w-24 rounded-full bg-primary/10 blur-xl"
        initial={{ scale: 0.9, rotate: 0 }}
        animate={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}