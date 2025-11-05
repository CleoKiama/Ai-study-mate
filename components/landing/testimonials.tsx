"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";

const quotes = [
  {
    body: "The summaries are incredible — I cover twice the material in half the time.",
    author: "Mara, CS Student",
  },
  {
    body: "Adaptive quizzes pinpoint exactly what I need to review.",
    author: "Joel, Med Student",
  },
  {
    body: "Clean, fast, and actually helpful — this replaced three other tools for me.",
    author: "Aisha, MBA",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <motion.h2
        className="mb-10 text-center text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Loved by learners
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.div
            key={q.author}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <p className="text-balance text-sm text-foreground/90">&ldquo;{q.body}&rdquo;</p>
                <p className="mt-4 text-xs text-muted-foreground">— {q.author}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}