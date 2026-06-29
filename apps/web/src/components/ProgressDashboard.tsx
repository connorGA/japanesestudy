"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDueReviews } from "@/lib/api";
import { getUnifiedProgress } from "@/lib/progress";

export function ProgressDashboard() {
  const [progress, setProgress] = useState(getUnifiedProgress());
  const [dueReviews, setDueReviews] = useState(0);

  useEffect(() => {
    setProgress(getUnifiedProgress());
    getDueReviews()
      .then((items) => setDueReviews(items.length))
      .catch(() => setDueReviews(0));
  }, []);

  const cards = [
    {
      title: "Hiragana",
      value: `${progress.hiragana.mastered}/${progress.hiragana.total}`,
      href: "/hiragana",
      detail: "characters mastered",
    },
    {
      title: "Katakana",
      value: `${progress.katakana.mastered}/${progress.katakana.total}`,
      href: "/katakana",
      detail: "characters mastered",
    },
    {
      title: "Phrase packs",
      value: `${progress.phrases.packsCompleted}/${progress.phrases.packsTotal}`,
      href: "/phrases",
      detail: "packs completed",
    },
    {
      title: "Numbers",
      value: `${progress.numbers.mastered}/${progress.numbers.total}`,
      href: "/numbers",
      detail: "items mastered",
    },
    {
      title: "Sentences",
      value: `${progress.sentences.completed}/${progress.sentences.total}`,
      href: "/sentences",
      detail: "exercises done",
    },
    {
      title: "Stroke order",
      value: `${progress.strokeOrder.completed}/${progress.strokeOrder.total}`,
      href: "/hiragana?tab=stroke",
      detail: "characters traced",
    },
    {
      title: "Learning path",
      value: `${progress.learningPath.completed}/${progress.learningPath.total}`,
      href: "/path",
      detail: "steps completed",
    },
    {
      title: "Flashcards",
      value: String(progress.flashcards.positive),
      href: "/flashcards",
      detail: "cards with positive score",
    },
    {
      title: "Reviews due",
      value: String(dueReviews),
      href: "/reviews",
      detail: "spaced repetition queue",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Link
          className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm transition hover:border-matcha hover:shadow-md"
          href={card.href}
          key={card.title}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-matcha">
            {card.title}
          </p>
          <p className="mt-3 text-4xl font-bold text-ink">{card.value}</p>
          <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
        </Link>
      ))}
    </div>
  );
}
