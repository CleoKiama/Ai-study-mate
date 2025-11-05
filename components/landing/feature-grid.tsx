"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileUp, Sparkles, Brain, BarChart3, ShieldCheck, Zap,
} from "lucide-react";

const features = [
  {
    icon: FileUp,
    title: "Smart Ingestion",
    desc: "Upload PDFs, notes, or slides and we parse the essentials.",
  },
  {
    icon: Sparkles,
    title: "AI Summaries",
    desc: "Digestible takeaways with definitions, examples, and key points.",
  },
  {
    icon: Brain,
    title: "Adaptive Quizzes",
    desc: "Questions that adapt to your strengths and weak spots.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    desc: "Visualize trends, streaks, and readiness over time.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    desc: "Your content stays yours. We protect your data.",
  },
  {
    icon: Zap,
    title: "Fast & Fluid",
    desc: "Built for speed with a slick, responsive experience.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <motion.h2
        className="mb-10 text-center text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        Everything you need to study smarter
      </motion.h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}