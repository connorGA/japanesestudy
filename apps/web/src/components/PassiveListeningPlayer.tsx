"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  Footprints,
  Handshake,
  Headphones,
  LifeBuoy,
  MapPin,
  Palette,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sunrise,
  TrainFront,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { getPassiveListeningCategories } from "@/lib/api";
import { detachAudio, pauseAudio, playAudioElement, replaceAudio } from "@/lib/audioPlayback";
import type { AudioAsset, PassiveListeningCategory } from "@/types/study";

const PROGRESS_STORAGE_KEY = "japanese-study.passive-listening-progress";

const categoryIcons: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  greetings: Handshake,
  travel: TrainFront,
  "daily-life": Sunrise,
  "survival-phrases": LifeBuoy,
  "numbers-time": Clock3,
  "people-family": Users,
  "verbs-actions": Footprints,
  places: MapPin,
  adjectives: Palette,
};

function categoryIcon(categoryId: string) {
  return categoryIcons[categoryId] ?? Headphones;
}

export function PassiveListeningPlayer() {
  const [categories, setCategories] = useState<PassiveListeningCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    getPassiveListeningCategories()
      .then((items) => {
        const storedProgress = getStoredProgress();
        setCategories(items);
        setActiveCategoryId(storedProgress?.categoryId ?? items[0]?.id ?? null);
        setItemIndex(storedProgress?.itemIndex ?? 0);
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load passive listening"),
      )
      .finally(() => setIsLoading(false));

    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      detachAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];
  const activeItem = activeCategory?.items[itemIndex] ?? activeCategory?.items[0];
  const sequence = useMemo(() => (activeItem ? buildSequence(activeItem) : []), [activeItem]);

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

  function pausePlayback() {
    clearPauseTimer();
    pauseAudio(audioRef.current);
    setIsPlaying(false);
  }

  function stopPlayback() {
    clearPauseTimer();
    detachAudio(audioRef.current);
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
      setStatus("Category complete. Press play to run it again.");
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
    const audio = replaceAudio(audioRef.current, step.audio.public_url, { playbackRate });
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
    void playAudioElement(audio).then((started) => {
      if (!started) {
        setIsPlaying(false);
      }
    });
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
      return;
    }

    const audio = audioRef.current;
    if (audio && !audio.ended && audio.src) {
      setIsPlaying(true);
      void playAudioElement(audio).then((started) => {
        if (!started) {
          setIsPlaying(false);
        }
      });
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

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading passive listening library…</p>;
  }

  if (!activeCategory || !activeItem) {
    return (
      <p className="text-sm text-slate-600">{status || "No passive listening categories yet."}</p>
    );
  }

  const ActiveIcon = categoryIcon(activeCategory.id);
  const itemCount = activeCategory.items.length;
  const progress = ((itemIndex + 1) / itemCount) * 100;

  return (
    <div className="grid h-full min-h-0 gap-5 lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-6">
      <aside className="order-2 grid min-h-0 auto-rows-min grid-cols-3 gap-2.5 overflow-y-auto sm:gap-3 lg:order-none lg:pr-1">
        {categories.map((category) => {
          const Icon = categoryIcon(category.id);
          const isActive = category.id === activeCategory.id;

          return (
            <button
              className={twMerge(
                "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center transition sm:gap-2.5",
                isActive
                  ? "border-matcha bg-matcha text-white shadow-sm"
                  : "border-black/5 bg-white/80 text-slate-600 hover:border-matcha/30 hover:bg-white hover:text-ink",
              )}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              type="button"
            >
              <span
                className={twMerge(
                  "grid h-9 w-9 place-items-center rounded-xl transition sm:h-10 sm:w-10",
                  isActive ? "bg-white/20 text-white" : "bg-matcha/10 text-matcha",
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span className="text-[0.7rem] font-semibold leading-tight sm:text-xs">
                {category.title}
              </span>
            </button>
          );
        })}
      </aside>

      <section className="order-1 flex min-h-0 flex-col rounded-3xl border border-black/5 bg-white/80 shadow-sm backdrop-blur lg:order-none">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-matcha/10 text-matcha">
              <ActiveIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink">{activeCategory.title}</h2>
              <p className="text-sm text-slate-500">{activeCategory.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-washi p-1">
            {[0.75, 1, 1.25].map((rate) => (
              <button
                className={twMerge(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  playbackRate === rate ? "bg-ink text-white" : "text-slate-500 hover:text-ink",
                )}
                key={rate}
                onClick={() => {
                  setPlaybackRate(rate);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                }}
                type="button"
              >
                {rate}×
              </button>
            ))}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-7 text-center sm:px-6 sm:py-8">
          <p className="text-sm font-medium text-slate-500">{activeItem.english}</p>
          <p className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            {activeItem.japanese}
          </p>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">{activeItem.romaji}</p>

          <div className="mt-7 flex justify-center gap-1.5 sm:mt-8">
            {sequence.map((step, index) => (
              <span
                className={twMerge(
                  "h-1.5 rounded-full transition-all",
                  index === stepIndex && isPlaying ? "w-8 bg-matcha" : "w-4 bg-black/10",
                )}
                key={step.label}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 px-4 pb-6 sm:px-6">
          <button
            aria-label="Previous phrase"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-washi hover:text-ink"
            onClick={() => goToItem(itemIndex - 1)}
            type="button"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            className="grid h-14 w-14 place-items-center rounded-full bg-ink text-white transition hover:bg-ink/90"
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="ml-0.5 h-6 w-6" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <button
            aria-label="Next phrase"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-washi hover:text-ink"
            onClick={() => goToItem(itemIndex + 1)}
            type="button"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            aria-label="Restart category"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-washi hover:text-ink"
            onClick={() => {
              stopPlayback();
              setItemIndex(0);
              setStepIndex(0);
              playStep(0, 0);
            }}
            type="button"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 border-t border-black/5 px-4 py-4 sm:px-6">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-matcha transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-semibold tabular-nums text-slate-500">
            {status ? <span className="mr-3 font-medium text-slate-400">{status}</span> : null}
            {itemIndex + 1} / {itemCount}
          </p>
        </div>
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
