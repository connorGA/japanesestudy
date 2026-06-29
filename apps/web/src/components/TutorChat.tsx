"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { getPassiveListeningCategories } from "@/lib/api";
import type { AudioAsset, PassiveListeningCategory } from "@/types/study";

const PROGRESS_STORAGE_KEY = "japanese-study.passive-listening-progress";

export function TutorChat() {
  const [categories, setCategories] = useState<PassiveListeningCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [status, setStatus] = useState("Loading passive listening library...");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    getPassiveListeningCategories()
      .then((items) => {
        const storedProgress = getStoredProgress();
        setCategories(items);
        setActiveCategoryId(storedProgress?.categoryId ?? items[0]?.id ?? null);
        setItemIndex(storedProgress?.itemIndex ?? 0);
        setStatus("");
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load passive listening"),
      );

    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];
  const activeItem = activeCategory?.items[itemIndex] ?? activeCategory?.items[0];
  const sequence = useMemo(
    () => (activeItem ? buildSequence(activeItem) : []),
    [activeItem],
  );
  const activeStep = sequence[stepIndex];

  useEffect(() => {
    if (!activeCategoryId) return;

    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ categoryId: activeCategoryId, itemIndex }),
    );
  }, [activeCategoryId, itemIndex]);

  function clearPauseTimer() {
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }

  function stopPlayback() {
    clearPauseTimer();
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }

  function playStep(nextItemIndex = itemIndex, nextStepIndex = stepIndex) {
    if (!activeCategory) return;

    const item = activeCategory.items[nextItemIndex];
    if (!item) {
      stopPlayback();
      setItemIndex(0);
      setStepIndex(0);
      setStatus("Category complete. Press play to repeat it.");
      return;
    }

    const steps = buildSequence(item);
    const step = steps[nextStepIndex];
    if (!step) {
      playStep(nextItemIndex + 1, 0);
      return;
    }

    if (!step.audio?.public_url || step.audio.status !== "ready") {
      setStatus(`${step.label} audio is still being prepared.`);
      stopPlayback();
      return;
    }

    clearPauseTimer();
    audioRef.current?.pause();
    const audio = new Audio(step.audio.public_url);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    setItemIndex(nextItemIndex);
    setStepIndex(nextStepIndex);
    setIsPlaying(true);
    setStatus("");
    audio.onended = () => {
      pauseTimerRef.current = window.setTimeout(() => {
        playStep(nextItemIndex, nextStepIndex + 1);
      }, 650);
    };
    audio.onerror = () => {
      setStatus("Could not play this audio.");
      stopPlayback();
    };
    void audio.play();
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    playStep(itemIndex, stepIndex);
  }

  function selectCategory(categoryId: string) {
    stopPlayback();
    setActiveCategoryId(categoryId);
    setItemIndex(0);
    setStepIndex(0);
    setStatus("");
  }

  function goToItem(nextIndex: number) {
    if (!activeCategory) return;
    const clampedIndex = Math.max(0, Math.min(nextIndex, activeCategory.items.length - 1));
    stopPlayback();
    setItemIndex(clampedIndex);
    setStepIndex(0);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-[2rem] border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
          Categories
        </p>
        <div className="mt-4 space-y-2">
          {categories.map((category) => (
            <button
              className={`w-full rounded-2xl p-4 text-left transition ${
                category.id === activeCategory?.id
                  ? "bg-matcha text-white shadow-sm"
                  : "bg-washi text-ink hover:bg-sakura/40"
              }`}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              type="button"
            >
              <span className="block font-semibold">{category.title}</span>
              <span
                className={`mt-1 block text-sm ${
                  category.id === activeCategory?.id ? "text-white/75" : "text-slate-600"
                }`}
              >
                {category.items.length} items
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
        {activeCategory && activeItem ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
                  Passive Tutor
                </p>
                <h1 className="mt-2 text-3xl font-bold text-ink">{activeCategory.title}</h1>
                <p className="mt-2 max-w-2xl text-slate-600">{activeCategory.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[0.75, 1, 1.25].map((rate) => (
                  <button
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      playbackRate === rate
                        ? "bg-matcha text-white"
                        : "border border-black/10 bg-white text-slate-600"
                    }`}
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      if (audioRef.current) audioRef.current.playbackRate = rate;
                    }}
                    type="button"
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] bg-washi p-8 text-center">
              <p className="text-sm font-semibold text-slate-500">
                {itemIndex + 1} / {activeCategory.items.length}
              </p>
              <p className="mt-6 text-4xl font-bold text-ink">{activeItem.english}</p>
              <p className="mt-4 text-5xl font-bold text-ink">{activeItem.japanese}</p>
              <p className="mt-3 text-xl font-semibold text-slate-600">{activeItem.romaji}</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-matcha">
                {activeStep?.label ?? "Ready"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => goToItem(itemIndex - 1)}
                type="button"
              >
                <SkipBack className="h-4 w-4" />
                Previous
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => {
                  stopPlayback();
                  setItemIndex(0);
                  setStepIndex(0);
                  playStep(0, 0);
                }}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Replay category
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => goToItem(itemIndex + 1)}
                type="button"
              >
                Next
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-600">{status || "No passive listening categories yet."}</p>
        )}

        {status ? (
          <p className="mt-4 rounded-2xl bg-washi p-4 text-sm text-slate-700">{status}</p>
        ) : null}
      </section>
    </div>
  );
}

function buildSequence(item: {
  english_audio?: AudioAsset | null;
  japanese_audio?: AudioAsset | null;
}) {
  return [
    { label: "English", audio: item.english_audio },
    { label: "Japanese 1", audio: item.japanese_audio },
    { label: "Japanese 2", audio: item.japanese_audio },
    { label: "Japanese 3", audio: item.japanese_audio },
  ];
}

function getStoredProgress() {
  try {
    const value = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return value ? (JSON.parse(value) as { categoryId: string; itemIndex: number }) : null;
  } catch {
    return null;
  }
}
