"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Volume2, X } from "lucide-react";
import { getAudioAsset } from "@/lib/api";
import {
  buildPhraseQuizOptions,
  PHRASE_PACKS,
  type PhraseItem,
  type PhrasePack,
} from "@/lib/phrases";
import { STORAGE_KEYS } from "@/lib/progress";
import type { AudioAsset } from "@/types/study";

type Mode = "learn" | "quiz";

export function PhrasePacks() {
  const [activePackId, setActivePackId] = useState(PHRASE_PACKS[0]?.id ?? "greetings");
  const [mode, setMode] = useState<Mode>("learn");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [quizItem, setQuizItem] = useState<PhraseItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<PhraseItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, AudioAsset>>({});

  const activePack = PHRASE_PACKS.find((pack) => pack.id === activePackId) ?? PHRASE_PACKS[0];
  const activePhrase = activePack?.phrases[activeIndex];

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.phrasePackProgress);
    if (stored) {
      try {
        setProgress(JSON.parse(stored) as Record<string, number>);
      } catch {
        setProgress({});
      }
    }
  }, []);

  useEffect(() => {
    if (!activePack || mode !== "quiz") return;
    const item = activePack.phrases[Math.floor(Math.random() * activePack.phrases.length)];
    setQuizItem(item);
    setQuizOptions(buildPhraseQuizOptions(item, activePack.phrases));
    setFeedback(null);
  }, [activePack, mode, activePackId]);

  function saveProgress(packId: string, count: number) {
    const next = { ...progress, [packId]: Math.max(progress[packId] ?? 0, count) };
    setProgress(next);
    window.localStorage.setItem(STORAGE_KEYS.phrasePackProgress, JSON.stringify(next));
  }

  async function playPhrase(text: string) {
    const cached = audioCache[text];
    if (cached?.public_url && cached.status === "ready") {
      await new Audio(cached.public_url).play();
      return;
    }
    try {
      const asset = await getAudioAsset(text);
      setAudioCache((current) => ({ ...current, [text]: asset }));
      if (asset.public_url) await new Audio(asset.public_url).play();
    } catch {
      /* audio optional */
    }
  }

  function markKnown() {
    if (!activePack || !activePhrase) return;
    saveProgress(activePack.id, (progress[activePack.id] ?? 0) + 1);
    setFlipped(false);
    setActiveIndex((index) => (index + 1) % activePack.phrases.length);
  }

  function handleQuizPick(option: PhraseItem) {
    if (!quizItem || feedback) return;
    const correct = option.id === quizItem.id;
    setFeedback(correct ? "correct" : "wrong");
    if (correct && activePack) {
      saveProgress(activePack.id, (progress[activePack.id] ?? 0) + 1);
      window.setTimeout(() => {
        const item = activePack.phrases[Math.floor(Math.random() * activePack.phrases.length)];
        setQuizItem(item);
        setQuizOptions(buildPhraseQuizOptions(item, activePack.phrases));
        setFeedback(null);
      }, 700);
    }
  }

  if (!activePack || !activePhrase) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-2">
        {PHRASE_PACKS.map((pack) => (
          <PackButton
            active={pack.id === activePackId}
            key={pack.id}
            onClick={() => {
              setActivePackId(pack.id);
              setActiveIndex(0);
              setFlipped(false);
              setMode("learn");
            }}
            pack={pack}
            practiced={progress[pack.id] ?? 0}
          />
        ))}
      </aside>

      <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">
              {activePack.emoji} Phrase pack
            </p>
            <h2 className="mt-2 text-3xl font-bold text-ink">{activePack.title}</h2>
            <p className="mt-2 text-slate-600">{activePack.description}</p>
          </div>
          <div className="flex gap-2">
            <ModeChip active={mode === "learn"} onClick={() => setMode("learn")} label="Learn" />
            <ModeChip active={mode === "quiz"} onClick={() => setMode("quiz")} label="Quiz" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {activePack.roleplayScenarioId ? (
            <Link
              className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              href={`/roleplay?scenario=${activePack.roleplayScenarioId}`}
            >
              Try in roleplay <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          {activePack.listeningCategoryId ? (
            <Link
              className="inline-flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-700"
              href="/listening"
            >
              Related listening
            </Link>
          ) : null}
        </div>

        {mode === "learn" ? (
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="w-full max-w-xl rounded-[2rem] border border-black/10 bg-gradient-to-br from-washi via-white to-sakura/30 p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  {activeIndex + 1} / {activePack.phrases.length}
                </span>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white"
                  onClick={() => void playPhrase(activePhrase.japanese)}
                  type="button"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <button
                className="mt-6 w-full text-left"
                onClick={() => setFlipped((value) => !value)}
                type="button"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-matcha">
                  English
                </p>
                <p className="mt-3 text-3xl font-bold text-ink">{activePhrase.english}</p>
                {flipped ? (
                  <>
                    <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-matcha">
                      Japanese
                    </p>
                    <p className="mt-2 text-4xl font-bold text-ink">{activePhrase.japanese}</p>
                    <p className="mt-2 text-xl text-slate-600">{activePhrase.romaji}</p>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">Tap to reveal Japanese</p>
                )}
              </button>
            </div>
            {flipped ? (
              <div className="flex gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 text-sm font-semibold text-red-700"
                  onClick={() => {
                    setFlipped(false);
                    setActiveIndex((index) => (index + 1) % activePack.phrases.length);
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" /> Still learning
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-3 text-sm font-semibold text-green-700"
                  onClick={markKnown}
                  type="button"
                >
                  <Check className="h-4 w-4" /> Got it
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-5">
            {quizItem ? (
              <>
                <p className="text-2xl font-bold text-ink">{quizItem.english}</p>
                <p className="text-sm text-slate-500">Which Japanese phrase matches?</p>
                <div className="grid w-full max-w-xl grid-cols-2 gap-3">
                  {quizOptions.map((option) => (
                    <button
                      className={`rounded-2xl px-4 py-4 text-left text-sm font-semibold ${
                        feedback && option.id === quizItem.id
                          ? "bg-green-100 text-green-800"
                          : "bg-washi text-ink hover:bg-white"
                      }`}
                      disabled={Boolean(feedback)}
                      key={option.id}
                      onClick={() => handleQuizPick(option)}
                      type="button"
                    >
                      {option.japanese}
                    </button>
                  ))}
                </div>
                {feedback === "wrong" ? (
                  <p className="text-red-700">Answer: {quizItem.japanese}</p>
                ) : null}
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function PackButton({
  pack,
  active,
  practiced,
  onClick,
}: {
  pack: PhrasePack;
  active: boolean;
  practiced: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-full rounded-2xl px-4 py-3 text-left transition ${
        active ? "bg-ink text-white shadow-sm" : "bg-white/80 text-ink hover:bg-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-lg">{pack.emoji}</span>
      <p className="mt-1 font-semibold">{pack.title}</p>
      <p className={`mt-1 text-xs ${active ? "text-white/75" : "text-slate-500"}`}>
        {practiced}/{pack.phrases.length} practiced
      </p>
    </button>
  );
}

function ModeChip({
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
