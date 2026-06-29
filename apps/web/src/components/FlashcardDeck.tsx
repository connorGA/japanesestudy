"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, Volume2, X } from "lucide-react";
import { getFlashcards } from "@/lib/api";
import type { AudioAsset, Flashcard } from "@/types/study";

type Mode = "study" | "library";

const SCORE_STORAGE_KEY = "japanese-study.flashcard-scores";

export function FlashcardDeck() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [mode, setMode] = useState<Mode>("study");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("Loading flashcards...");

  useEffect(() => {
    getFlashcards()
      .then((items) => {
        setCards(items);
        setStatus("");
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load flashcards"),
      );
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(SCORE_STORAGE_KEY);
    if (!stored) return;

    try {
      setScores(JSON.parse(stored) as Record<string, number>);
    } catch {
      setScores({});
    }
  }, []);

  useEffect(() => {
    if (!cards.length || activeCardId) return;
    setActiveCardId(pickWeightedCard(cards, scores).id);
  }, [activeCardId, cards, scores]);

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const term = query.trim().toLowerCase();
        if (!term) return true;

        return [card.english, card.kana, card.romaji, card.example_english, card.example_kana]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(term));
      }),
    [cards, query],
  );

  const activeCard =
    cards.find((card) => card.id === activeCardId) ?? filteredCards[0] ?? cards[0];

  function updateScore(cardId: string, delta: 1 | -1) {
    const nextScores = {
      ...scores,
      [cardId]: Math.max(0, (scores[cardId] ?? 0) + delta),
    };
    setScores(nextScores);
    window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(nextScores));
    showNextStudyCard(nextScores);
  }

  function showNextStudyCard(nextScores = scores) {
    if (!cards.length) return;
    setActiveCardId(pickWeightedCard(cards, nextScores, activeCard?.id).id);
    setFlipped(false);
  }

  function showLibraryCard(card: Flashcard) {
    setMode("library");
    setActiveCardId(card.id);
    setFlipped(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
        <button
          className={modeButtonClass(mode === "study")}
          onClick={() => {
            setMode("study");
            showNextStudyCard();
          }}
          type="button"
        >
          Study mode
        </button>
        <button
          className={modeButtonClass(mode === "library")}
          onClick={() => setMode("library")}
          type="button"
        >
          Library
        </button>
        <label className="flex min-w-72 flex-1 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-transparent outline-none"
            onChange={(event) => {
              setQuery(event.target.value);
              setMode("library");
            }}
            placeholder="Search English, kana, romaji..."
            value={query}
          />
        </label>
      </div>

      {!activeCard ? (
        <p className="text-center text-slate-600">
          {status || "No flashcards available yet."}
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <FlipCard
            card={activeCard}
            flipped={flipped}
            score={scores[activeCard.id] ?? 0}
            onFlip={() => setFlipped((value) => !value)}
          />

          {mode === "study" && flipped ? (
            <div className="flex gap-3">
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-sm transition hover:bg-red-200"
                onClick={() => updateScore(activeCard.id, -1)}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm transition hover:bg-green-200"
                onClick={() => updateScore(activeCard.id, 1)}
                type="button"
              >
                <Check className="h-6 w-6" />
              </button>
            </div>
          ) : null}

          {mode === "library" ? (
            <div className="grid w-full max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {filteredCards.map((card) => (
                <button
                  className="rounded-2xl border border-black/10 bg-white/75 p-3 text-left text-sm shadow-sm transition hover:border-matcha hover:bg-white"
                  key={card.id}
                  onClick={() => showLibraryCard(card)}
                  type="button"
                >
                  <span className="block font-semibold text-ink">{card.english}</span>
                  <span className="mt-1 block text-slate-500">{card.kana}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function FlipCard({
  card,
  flipped,
  score,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  score: number;
  onFlip: () => void;
}) {
  return (
    <div
      className="group h-[30rem] w-full max-w-xl [perspective:1200px]"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`relative h-full w-full rounded-[2rem] transition duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 bg-washi p-8 text-left shadow-xl [backface-visibility:hidden] ${
            flipped ? "pointer-events-none" : "pointer-events-auto cursor-pointer"
          }`}
          onClick={onFlip}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sakura/45 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-matcha/10 blur-3xl" />
          <img
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 w-[24rem] -translate-x-8 translate-y-6 opacity-80"
            src="/flashcards/sakura-branch-transparent.png"
          />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">
                English
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600">
                Score {score}
              </span>
            </div>
            <p className="text-center text-5xl font-semibold tracking-tight text-ink">
              {card.english}
            </p>
            <p className="text-center text-sm font-semibold text-slate-500">
              Click to flip
            </p>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col rounded-[2rem] border border-black/10 bg-washi p-8 text-left shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
            flipped ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
          }`}
          onClick={onFlip}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">
              Japanese
            </span>
            <AudioButton asset={card.word_audio} label={card.kana} />
          </div>

          <div className="mt-8">
            <p className="text-5xl font-semibold text-ink">{card.kana}</p>
            <p className="mt-2 text-xl font-semibold text-slate-600">{card.romaji}</p>
          </div>

          {card.example_kana ? (
            <div className="mt-8 rounded-3xl bg-white/85 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Example</p>
                <AudioButton asset={card.example_audio} label={card.example_kana} />
              </div>
              <p className="mt-3 text-2xl font-semibold text-ink">{card.example_kana}</p>
              <p className="mt-2 text-sm text-slate-600">{card.example_romaji}</p>
              <p className="mt-1 text-sm text-slate-700">{card.example_english}</p>
            </div>
          ) : (
            <p className="mt-8 rounded-3xl bg-white/85 p-5 text-sm text-slate-600">
              Phrase card. Practice this expression as one unit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function modeButtonClass(active: boolean) {
  return active
    ? "rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-sm"
    : "rounded-full border border-black/10 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-ink";
}

function pickWeightedCard(
  cards: Flashcard[],
  scores: Record<string, number>,
  excludeId?: string,
) {
  const pool = cards.length > 1 ? cards.filter((card) => card.id !== excludeId) : cards;
  const weighted = pool.flatMap((card) => {
    const score = scores[card.id] ?? 0;
    const weight = Math.max(1, 8 - score);
    return Array.from({ length: weight }, () => card);
  });

  return weighted[Math.floor(Math.random() * weighted.length)] ?? pool[0];
}

function AudioButton({ asset, label }: { asset?: AudioAsset | null; label: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function playAudio() {
    if (!asset || asset.status === "pending") {
      setMessage("Audio is still being generated.");
      return;
    }

    if (asset.status === "failed" || !asset.public_url) {
      setMessage(asset.error_message ?? "Audio is not available yet.");
      return;
    }

    setMessage(null);
    await new Audio(asset.public_url).play();
  }

  return (
    <span
      className="relative z-20 inline-flex items-center gap-2"
      data-no-card-flip
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        aria-label={`Play ${label}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:bg-matcha"
        onClick={(event) => {
          event.stopPropagation();
          void playAudio();
        }}
        type="button"
      >
        <Volume2 className="h-4 w-4" />
      </button>
      {message ? <span className="max-w-xs text-xs text-red-600">{message}</span> : null}
    </span>
  );
}
