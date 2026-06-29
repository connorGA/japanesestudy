"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { STROKE_CHARACTERS, type StrokeCharacter } from "@/lib/stroke-order";
import { STORAGE_KEYS } from "@/lib/progress";

export function StrokeOrderPractice() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const character = STROKE_CHARACTERS[activeIndex];

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.strokeOrder);
    if (stored) {
      try {
        setCompleted(JSON.parse(stored) as Record<string, boolean>);
      } catch {
        setCompleted({});
      }
    }
  }, []);

  useEffect(() => {
    if (!playing || !character) return;
    if (strokeIndex >= character.strokes.length) {
      setPlaying(false);
      const next = { ...completed, [character.character]: true };
      setCompleted(next);
      window.localStorage.setItem(STORAGE_KEYS.strokeOrder, JSON.stringify(next));
      return;
    }

    const timer = window.setTimeout(
      () => setStrokeIndex((value) => value + 1),
      character.strokes[strokeIndex]?.durationMs ?? 500,
    );
    return () => window.clearTimeout(timer);
  }, [character, completed, playing, strokeIndex]);

  function startAnimation() {
    setStrokeIndex(0);
    setPlaying(true);
  }

  function resetAnimation() {
    setPlaying(false);
    setStrokeIndex(0);
  }

  if (!character) return null;

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">
            Stroke order
          </p>
          <h2 className="mt-2 text-3xl font-bold text-ink">Write hiragana step by step</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={startAnimation}
            type="button"
          >
            <Play className="h-4 w-4" /> Animate
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
            onClick={resetAnimation}
            type="button"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STROKE_CHARACTERS.map((item, index) => (
          <button
            className={`rounded-full px-3 py-1.5 text-lg font-semibold ${
              index === activeIndex ? "bg-ink text-white" : "bg-washi text-ink"
            }`}
            key={item.character}
            onClick={() => {
              setActiveIndex(index);
              resetAnimation();
            }}
            type="button"
          >
            {item.character}
            {completed[item.character] ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <StrokeCanvas character={character} visibleStrokes={playing ? strokeIndex : character.strokes.length} />
        <p className="text-2xl font-semibold text-matcha">{character.reading}</p>
        <p className="text-sm text-slate-600">
          {playing
            ? `Stroke ${Math.min(strokeIndex + 1, character.strokes.length)} of ${character.strokes.length}`
            : `${character.strokes.length} strokes — follow the animation order`}
        </p>
      </div>
    </section>
  );
}

function StrokeCanvas({
  character,
  visibleStrokes,
}: {
  character: StrokeCharacter;
  visibleStrokes: number;
}) {
  return (
    <svg
      className="h-64 w-64 rounded-[2rem] border border-black/10 bg-washi"
      viewBox={character.viewBox ?? "0 0 100 100"}
    >
      {character.strokes.slice(0, visibleStrokes).map((stroke, index) => (
        <path
          d={stroke.d}
          fill="none"
          key={`${character.character}-${index}`}
          stroke="#101828"
          strokeLinecap="round"
          strokeWidth="4"
        />
      ))}
    </svg>
  );
}
