"use client";

import { useEffect, useState } from "react";
import { getDueReviews, gradeReview } from "@/lib/api";
import { recordStudyActivity } from "@/lib/progress";
import type { ReviewItem } from "@/types/study";
import { Panel } from "./Panel";

const ratings = ["again", "hard", "good", "easy"] as const;

export function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getDueReviews()
      .then(setItems)
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load reviews"),
      );
  }, []);

  const active = items[activeIndex];

  async function submitRating(rating: (typeof ratings)[number]) {
    if (!active) return;
    const updated = await gradeReview({ reviewItemId: active.id, rating });
    recordStudyActivity("japanese", "srs_review", "review_queue", {
      review_item_id: active.id,
      rating,
    });
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    setShowAnswer(false);
  }

  return (
    <Panel eyebrow="SRS" title="Review Queue">
      {active ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-ink p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-sakura">
              {active.item_type}
            </p>
            <p className="mt-3 text-2xl font-semibold">{active.prompt}</p>
            {active.context ? (
              <p className="mt-3 text-sm text-white/70">{active.context}</p>
            ) : null}
          </div>
          {showAnswer ? (
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Answer</p>
              <p className="mt-1 text-lg">{active.answer}</p>
            </div>
          ) : (
            <button
              className="rounded-full bg-matcha px-4 py-2 font-semibold text-white"
              onClick={() => setShowAnswer(true)}
              type="button"
            >
              Reveal answer
            </button>
          )}
          {showAnswer ? (
            <div className="grid grid-cols-2 gap-2">
              {ratings.map((rating) => (
                <button
                  className="rounded-full border border-ink/15 px-3 py-2 text-sm font-semibold capitalize"
                  key={rating}
                  onClick={() => void submitRating(rating)}
                  type="button"
                >
                  {rating}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-slate-600">
          {status ?? "No due cards yet. Save tutor suggestions to start reviewing."}
        </p>
      )}
    </Panel>
  );
}
