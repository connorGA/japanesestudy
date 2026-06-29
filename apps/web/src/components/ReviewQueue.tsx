"use client";

import { useEffect, useState } from "react";
import { createReviewItems, getDueReviews, gradeReview } from "@/lib/api";
import { BEGINNER_REVIEW_SEEDS } from "@/lib/review-seeds";
import type { ReviewItem } from "@/types/study";
import { Panel } from "./Panel";

const ratings = ["again", "hard", "good", "easy"] as const;

export function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReviews() {
    setLoading(true);
    try {
      setItems(await getDueReviews());
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  const active = items[activeIndex];

  async function submitRating(rating: (typeof ratings)[number]) {
    if (!active) return;
    const updated = await gradeReview({ reviewItemId: active.id, rating });
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setActiveIndex((index) => Math.min(index + 1, Math.max(items.length - 1, 0)));
    setShowAnswer(false);
    void loadReviews();
  }

  async function seedBeginnerReviews() {
    setStatus("Creating starter reviews...");
    try {
      await createReviewItems(BEGINNER_REVIEW_SEEDS);
      await loadReviews();
      setActiveIndex(0);
      setStatus("Starter reviews added to your queue.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not create reviews");
    }
  }

  return (
    <Panel eyebrow="SRS" title="Review Queue">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          onClick={() => void seedBeginnerReviews()}
          type="button"
        >
          Load starter reviews
        </button>
        <button
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600"
          onClick={() => void loadReviews()}
          type="button"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading reviews...</p>
      ) : active ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-ink p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-sakura">{active.item_type}</p>
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
          <p className="text-sm text-slate-500">
            Card {activeIndex + 1} of {items.length}
          </p>
        </div>
      ) : (
        <p className="text-slate-600">
          {status ?? "No due cards yet. Load starter reviews or practice more to build your queue."}
        </p>
      )}
    </Panel>
  );
}
