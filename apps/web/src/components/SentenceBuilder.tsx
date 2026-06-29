"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { SENTENCE_EXERCISES, type SentenceExercise } from "@/lib/sentences";
import { STORAGE_KEYS } from "@/lib/progress";

export function SentenceBuilder() {
  const [activeId, setActiveId] = useState(SENTENCE_EXERCISES[0]?.id ?? "");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const exercise =
    SENTENCE_EXERCISES.find((item) => item.id === activeId) ?? SENTENCE_EXERCISES[0];

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.sentenceBuilder);
    if (stored) {
      try {
        setCompleted(JSON.parse(stored) as Record<string, boolean>);
      } catch {
        setCompleted({});
      }
    }
  }, []);

  function resetExercise() {
    setSelections({});
    setFeedback(null);
  }

  function checkExercise(item: SentenceExercise) {
    const allCorrect = item.slots.every((slot) => selections[slot.id] === slot.correct);
    if (allCorrect) {
      const next = { ...completed, [item.id]: true };
      setCompleted(next);
      window.localStorage.setItem(STORAGE_KEYS.sentenceBuilder, JSON.stringify(next));
      setFeedback("Perfect! " + item.reading);
    } else {
      setFeedback("Not quite — check the particles and try again.");
    }
  }

  if (!exercise) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-2">
        {SENTENCE_EXERCISES.map((item) => (
          <button
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
              item.id === activeId ? "bg-ink text-white" : "bg-white text-ink"
            }`}
            key={item.id}
            onClick={() => {
              setActiveId(item.id);
              resetExercise();
            }}
            type="button"
          >
            {completed[item.id] ? "✓ " : ""}
            {item.title}
          </button>
        ))}
      </aside>

      <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-matcha">
          Sentence builder
        </p>
        <h2 className="mt-2 text-3xl font-bold text-ink">{exercise.title}</h2>
        <p className="mt-2 text-lg text-slate-600">{exercise.english}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {exercise.slots.map((slot) => (
            <div key={slot.id}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {slot.hint ?? "Word"}
              </label>
              <select
                className="rounded-2xl border border-black/10 bg-washi px-4 py-3 text-lg font-semibold"
                onChange={(event) =>
                  setSelections((current) => ({ ...current, [slot.id]: event.target.value }))
                }
                value={selections[slot.id] ?? ""}
              >
                <option value="">…</option>
                {slot.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-washi p-4 text-xl font-semibold text-ink">
          {exercise.slots.map((slot) => selections[slot.id] ?? "___").join(" ")}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-matcha px-5 py-3 text-sm font-semibold text-white"
            onClick={() => checkExercise(exercise)}
            type="button"
          >
            <Check className="h-4 w-4" /> Check
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold"
            onClick={resetExercise}
            type="button"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        {feedback ? <p className="mt-4 font-semibold text-ink">{feedback}</p> : null}
      </section>
    </div>
  );
}
