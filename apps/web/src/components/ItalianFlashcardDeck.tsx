"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, Volume2, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { italianCards, type ItalianCard, type ItalianDeck } from "@/data/italian";
import { recordStudyActivity } from "@/lib/progress";

type Mode = "study" | "library";
const decks: { id: ItalianDeck; label: string }[] = [
  { id: "vocabulary", label: "Vocabulary" },
  { id: "phrases", label: "Phrases" },
  { id: "verbs", label: "Verbs" },
  { id: "travel", label: "Travel" },
];
const SCORE_KEY = "italian-study.flashcard-scores";

export function ItalianFlashcardDeck() {
  const [deck, setDeck] = useState<ItalianDeck>("vocabulary");
  const [mode, setMode] = useState<Mode>("study");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const cards = useMemo(() => italianCards.filter((card) => card.deck === deck), [deck]);
  const filteredCards = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("it");
    if (!term) return cards;
    return cards.filter((card) => [card.italian, card.english, card.example, card.exampleEnglish, card.note].filter(Boolean).some((value) => value?.toLocaleLowerCase("it").includes(term)));
  }, [cards, query]);
  const activeCard = cards.find((card) => card.id === activeId) ?? filteredCards[0] ?? cards[0];

  useEffect(() => {
    try {
      setScores(JSON.parse(window.localStorage.getItem(`${SCORE_KEY}.${deck}`) ?? "{}") as Record<string, number>);
    } catch {
      setScores({});
    }
    setActiveId(null);
    setFlipped(false);
    setQuery("");
  }, [deck]);

  useEffect(() => {
    if (!activeId && cards.length) setActiveId(pickCard(cards, scores).id);
  }, [activeId, cards, scores]);

  function updateScore(delta: 1 | -1) {
    if (!activeCard) return;
    const next = { ...scores, [activeCard.id]: Math.max(0, (scores[activeCard.id] ?? 0) + delta) };
    setScores(next);
    window.localStorage.setItem(`${SCORE_KEY}.${deck}`, JSON.stringify(next));
    recordStudyActivity(
      "italian",
      delta > 0 ? "flashcard_mastered" : "flashcard_retry",
      "flashcards",
      { card_id: activeCard.id, deck },
    );
    setActiveId(pickCard(cards, next, activeCard.id).id);
    setFlipped(false);
  }

  return (
    <div className="theme-italian flex flex-1 flex-col gap-6">
      <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:justify-center" aria-label="Italian flashcard decks">
        {decks.map((item) => (
          <button className={twMerge("rounded-full border px-2 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm", deck === item.id ? "border-matcha bg-matcha text-white shadow-sm" : "border-black/10 bg-white/75 text-slate-600 hover:bg-white hover:text-ink")} key={item.id} onClick={() => { setDeck(item.id); setMode("study"); }} type="button">{item.label}</button>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
        <button className={modeButton(mode === "study")} onClick={() => { setMode("study"); setActiveId(pickCard(cards, scores, activeCard?.id).id); setFlipped(false); }} type="button">Study mode</button>
        <button className={modeButton(mode === "library")} onClick={() => setMode("library")} type="button">Library</button>
        <label className="flex w-full flex-none items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm shadow-sm sm:w-auto sm:min-w-72 sm:flex-1">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input className="w-full min-w-0 bg-transparent text-base outline-none sm:text-sm" onChange={(event) => { setQuery(event.target.value); setMode("library"); }} placeholder={`Search ${deck}…`} value={query} />
        </label>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <ItalianFlipCard card={activeCard} flipped={flipped} score={scores[activeCard.id] ?? 0} onFlip={() => setFlipped((value) => !value)} />
        {mode === "study" && flipped ? (
          <div className="flex gap-3">
            <button aria-label="Needs more practice" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-sm transition hover:bg-red-200" onClick={() => updateScore(-1)} type="button"><X className="h-6 w-6" /></button>
            <button aria-label="I knew this" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm transition hover:bg-green-200" onClick={() => updateScore(1)} type="button"><Check className="h-6 w-6" /></button>
          </div>
        ) : null}
        {mode === "library" ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCards.map((card) => (
              <button className="rounded-2xl border border-black/10 bg-white/75 p-3 text-left text-sm shadow-sm transition hover:border-matcha hover:bg-white" key={card.id} onClick={() => { setActiveId(card.id); setFlipped(false); }} type="button">
                <span className="block font-semibold text-ink">{card.italian}</span>
                <span className="mt-1 block text-slate-500">{card.english}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ItalianFlipCard({ card, flipped, score, onFlip }: { card: ItalianCard; flipped: boolean; score: number; onFlip: () => void }) {
  return (
    <div className="flashcard-scene group h-[26rem] w-full max-w-xl sm:h-[30rem]" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onFlip(); } }} role="button" tabIndex={0}>
      <div className={twMerge("flashcard-inner rounded-[2rem]", flipped && "is-flipped")}>
        <div className={twMerge("flashcard-face absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 bg-washi p-5 text-left shadow-xl sm:p-8", flipped ? "pointer-events-none" : "pointer-events-auto cursor-pointer")} onClick={onFlip}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#bd463f]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-matcha/15 blur-3xl" />
          <Image alt="" className="pointer-events-none absolute -bottom-9 -left-20 w-[20rem] opacity-75 sm:-left-10 sm:w-[24rem]" height={420} priority src="/italian/roman-bust-olive-transparent.png" width={420} />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">English</span>
              <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-slate-600">Score {score}</span>
            </div>
            <p className="text-center text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{card.english}</p>
            <p className="text-center text-sm font-semibold text-slate-500">Click to flip</p>
          </div>
        </div>

        <div className={twMerge("flashcard-face flashcard-face-back absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 bg-washi shadow-xl", flipped ? "pointer-events-auto cursor-pointer" : "pointer-events-none")} onClick={onFlip}>
          <div className="absolute inset-0 overflow-y-auto p-5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Italiano</span>
              <button aria-label={`Hear ${card.italian}`} className="grid h-11 w-11 place-items-center rounded-full bg-matcha text-white shadow-sm transition hover:scale-105" onClick={(event) => { event.stopPropagation(); speakItalian(card.italian); recordStudyActivity("italian", "pronunciation_play", "flashcards", { card_id: card.id }); }} type="button"><Volume2 className="h-5 w-5" /></button>
            </div>
            <p className="mt-8 text-4xl font-semibold text-ink sm:text-5xl">{card.italian}</p>
            {card.note ? <p className="mt-3 rounded-2xl bg-white/75 p-3 text-sm leading-6 text-slate-600">{card.note}</p> : null}
            <div className="mt-8 border-t border-black/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">In context</p>
              <p className="mt-3 text-xl font-semibold text-ink">{card.example}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.exampleEnglish}</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-matcha/25 bg-white/70 px-3 py-2 text-xs font-semibold text-matcha" onClick={(event) => { event.stopPropagation(); speakItalian(card.example); }} type="button"><Volume2 className="h-4 w-4" />Hear example</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function speakItalian(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 0.86;
  const italianVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("it"));
  if (italianVoice) utterance.voice = italianVoice;
  window.speechSynthesis.speak(utterance);
}

function pickCard(cards: ItalianCard[], scores: Record<string, number>, exclude?: string) {
  const pool = cards.filter((card) => card.id !== exclude);
  const available = pool.length ? pool : cards;
  const weighted = available.flatMap((card) => Array.from({ length: Math.max(1, 5 - (scores[card.id] ?? 0)) }, () => card));
  return weighted[Math.floor(Math.random() * weighted.length)] ?? cards[0];
}

function modeButton(active: boolean) {
  return twMerge("rounded-full border px-4 py-2 text-sm font-semibold transition", active ? "border-ink bg-ink text-white" : "border-black/10 bg-white/75 text-slate-600 hover:bg-white");
}
