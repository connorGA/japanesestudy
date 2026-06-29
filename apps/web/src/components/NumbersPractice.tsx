"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { getAudioAsset } from "@/lib/api";
import {
  buildNumberQuizOptions,
  filterNumbers,
  NUMBER_CATEGORIES,
  NUMBER_ITEMS,
  type NumberItem,
} from "@/lib/numbers";
import { STORAGE_KEYS } from "@/lib/progress";

type Mode = "flashcards" | "quiz";

export function NumbersPractice() {
  const [mode, setMode] = useState<Mode>("flashcards");
  const [categories, setCategories] = useState<string[]>(["basic"]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [quizItem, setQuizItem] = useState<NumberItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<NumberItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const pool = useMemo(() => filterNumbers(categories), [categories]);
  const current = pool[index % Math.max(pool.length, 1)];

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.numbersMastery);
    if (stored) {
      try {
        setMastery(JSON.parse(stored) as Record<string, number>);
      } catch {
        setMastery({});
      }
    }
  }, []);

  useEffect(() => {
    if (mode !== "quiz" || !pool.length) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    setQuizItem(item);
    setQuizOptions(buildNumberQuizOptions(item, pool));
    setFeedback(null);
  }, [mode, pool, categories]);

  function updateMastery(id: string, delta: 1 | -1) {
    const next = { ...mastery, [id]: Math.max(0, (mastery[id] ?? 0) + delta) };
    setMastery(next);
    window.localStorage.setItem(STORAGE_KEYS.numbersMastery, JSON.stringify(next));
  }

  async function playAudio(text: string) {
    try {
      const asset = await getAudioAsset(text);
      if (asset.public_url) await new Audio(asset.public_url).play();
    } catch {
      /* optional */
    }
  }

  function nextCard() {
    setFlipped(false);
    setIndex((value) => value + 1);
  }

  function handleQuizPick(option: NumberItem) {
    if (!quizItem || feedback) return;
    const correct = option.id === quizItem.id;
    setFeedback(correct ? "correct" : "wrong");
    updateMastery(quizItem.id, correct ? 1 : -1);
    if (correct) {
      window.setTimeout(() => {
        const item = pool[Math.floor(Math.random() * pool.length)];
        setQuizItem(item);
        setQuizOptions(buildNumberQuizOptions(item, pool));
        setFeedback(null);
      }, 650);
    }
  }

  function toggleCategory(id: string) {
    setCategories((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
    setIndex(0);
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">Numbers</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">Numbers, Time & Counters</h2>
        </div>
        <div className="flex gap-2">
          <Chip active={mode === "flashcards"} label="Flashcards" onClick={() => setMode("flashcards")} />
          <Chip active={mode === "quiz"} label="Quiz" onClick={() => setMode("quiz")} />
          <button
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            type="button"
          >
            <RotateCcw className="inline h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {NUMBER_CATEGORIES.map((category) => (
          <button
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              categories.includes(category.id) ? "bg-ink text-white" : "bg-washi text-slate-600"
            }`}
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {!pool.length || !current ? (
        <p className="mt-8 text-center text-slate-600">Select at least one category.</p>
      ) : mode === "flashcards" ? (
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="w-full max-w-xl rounded-[2rem] border border-black/10 bg-washi p-8">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">{current.category}</span>
              <button
                className="rounded-full bg-ink p-2 text-white"
                onClick={() => void playAudio(current.japanese)}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <button className="mt-6 w-full text-left" onClick={() => setFlipped((v) => !v)} type="button">
              <p className="text-sm font-semibold text-matcha">English</p>
              <p className="mt-2 text-3xl font-bold text-ink">{current.english}</p>
              {flipped ? (
                <>
                  <p className="mt-6 text-4xl font-bold">{current.japanese}</p>
                  <p className="mt-2 text-xl text-slate-600">{current.romaji}</p>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Tap to reveal</p>
              )}
            </button>
          </div>
          {flipped ? (
            <div className="flex gap-3">
              <button
                className="rounded-full bg-red-100 px-5 py-3 text-sm font-semibold text-red-700"
                onClick={() => {
                  updateMastery(current.id, -1);
                  nextCard();
                }}
                type="button"
              >
                <X className="inline h-4 w-4" /> Again
              </button>
              <button
                className="rounded-full bg-green-100 px-5 py-3 text-sm font-semibold text-green-700"
                onClick={() => {
                  updateMastery(current.id, 1);
                  nextCard();
                }}
                type="button"
              >
                <Check className="inline h-4 w-4" /> Got it
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-4">
          {quizItem ? (
            <>
              <p className="text-2xl font-bold">{quizItem.english}</p>
              <div className="grid w-full max-w-xl grid-cols-2 gap-3">
                {quizOptions.map((option) => (
                  <button
                    className={`rounded-2xl bg-washi px-4 py-4 text-left font-semibold ${
                      feedback && option.id === quizItem.id ? "bg-green-100" : ""
                    }`}
                    disabled={Boolean(feedback)}
                    key={option.id}
                    onClick={() => handleQuizPick(option)}
                    type="button"
                  >
                    {option.japanese}
                    <span className="mt-1 block text-sm font-normal text-slate-500">
                      {option.romaji}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Mastered {Object.values(mastery).filter((s) => s >= 2).length} / {NUMBER_ITEMS.length}
      </p>
    </section>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-ink text-white" : "border border-black/10 text-slate-600"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
