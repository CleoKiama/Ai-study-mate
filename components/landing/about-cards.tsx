"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const about = [
  {
    title: "Designed for Flow",
    desc: "Minimal clicks to insight. StudyMate keeps you focused and in the zone.",
  },
  {
    title: "Grounded Answers",
    desc: "Summaries and quizzes draw directly from your materials — with citations.",
  },
  {
    title: "Built for Teams",
    desc: "Share sets, compare progress, and prepare together for exams.",
  },
];

export function AboutCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <motion.h2
        className="mb-10 text-center text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        Why StudyMate?
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-3">
        {about.map((a, i) => (
          <motion.div
            key={a.title}
            className="group relative"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            <Card className="relative h-full border border-border/60 transition-transform duration-300 will-change-transform group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl">{a.title}</CardTitle>
                <CardDescription>{a.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}