"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LEARNING_PATH_STEPS } from "@/lib/learning-path";
import { getLearningPathProgress, markLearningPathStep } from "@/lib/progress";

export function LearningPath() {
  const progress = getLearningPathProgress();

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">
        Beginner path
      </p>
      <h2 className="mt-2 text-3xl font-bold text-ink md:text-4xl">Day 1 → Week 1</h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        Follow these steps in order. Each one links to the right practice mode in the app.
      </p>

      <ol className="mt-8 space-y-4">
        {LEARNING_PATH_STEPS.map((step) => {
          const done = progress[step.id] ?? false;
          return (
            <li
              className="flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-black/10 bg-washi p-4"
              key={step.id}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-ink shadow-sm">
                {step.day}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-matcha">
                  Goal: {step.milestone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  href={step.href}
                >
                  Start
                </Link>
                <button
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                  className="rounded-full p-2 text-matcha transition hover:bg-white"
                  onClick={() => markLearningPathStep(step.id)}
                  type="button"
                >
                  {done ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-400" />
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
