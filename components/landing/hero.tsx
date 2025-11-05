"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AnimatedShapes } from "./animated-shapes";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <AnimatedShapes />
      <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
        <motion.h1
          className="text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
          StudyMate
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your AI-powered study companion — upload documents, get instant summaries,
          and master topics with interactive quizzes tailored to you.
        </motion.p>
        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}