"use client";

import { motion } from "motion/react";

const steps = [
  {
    step: "1",
    title: "Upload",
    desc: "Drop PDFs, lecture notes, or slides. We'll parse the rest.",
  },
  {
    step: "2",
    title: "Summarize",
    desc: "Get structured summaries with key points and examples.",
  },
  {
    step: "3",
    title: "Master",
    desc: "Practice with adaptive quizzes and track your progress.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <motion.h2
        className="mb-10 text-center text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        How it works
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative"
          >
            <div className="mb-4 h-10 w-10 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center font-semibold">
              {s.step}
            </div>
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}