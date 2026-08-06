"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, Volume2, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { getFlashcards } from "@/lib/api";
import {
  isPlayInterruptedError,
  playAudioElement,
  replaceAudio,
} from "@/lib/audioPlayback";
import type { AudioAsset, Flashcard, FlashcardSection } from "@/types/study";

type Mode = "study" | "library";

const sections: { id: FlashcardSection; label: string }[] = [
  { id: "vocabulary", label: "Vocabulary" },
  { id: "hiragana", label: "Hiragana" },
  { id: "katakana", label: "Katakana" },
  { id: "kanji", label: "Kanji" },
];

const SCORE_STORAGE_KEY = "japanese-study.flashcard-scores";

export function FlashcardDeck() {
  const [section, setSection] = useState<FlashcardSection>("vocabulary");
  const [cardsBySection, setCardsBySection] = useState<
    Partial<Record<FlashcardSection, Flashcard[]>>
  >({});
  const [mode, setMode] = useState<Mode>("study");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("Loading flashcards…");
  const cards = useMemo(() => cardsBySection[section] ?? [], [cardsBySection, section]);

  useEffect(() => {
    if (cardsBySection[section]) return;

    let cancelled = false;
    setStatus(`Loading ${section} cards…`);
    getFlashcards(section)
      .then((items) => {
        if (cancelled) return;
        setCardsBySection((current) => ({ ...current, [section]: items }));
        setStatus("");
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus(err instanceof Error ? err.message : "Could not load flashcards");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardsBySection, section]);

  useEffect(() => {
    const stored = window.localStorage.getItem(`${SCORE_STORAGE_KEY}.${section}`);
    try {
      setScores(stored ? (JSON.parse(stored) as Record<string, number>) : {});
    } catch {
      setScores({});
    }
    setActiveCardId(null);
    setFlipped(false);
    setQuery("");
  }, [section]);

  useEffect(() => {
    if (!cards.length || activeCardId) return;
    setActiveCardId(pickWeightedCard(cards, scores).id);
  }, [activeCardId, cards, scores]);

  const filteredCards = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return cards;

    return cards.filter((card) =>
      [
        card.english,
        card.kana,
        card.romaji,
        card.onyomi,
        card.kunyomi,
        card.example_reading,
        card.example_english,
        card.example_kana,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [cards, query]);

  const activeCard =
    cards.find((card) => card.id === activeCardId) ?? filteredCards[0] ?? cards[0];

  function chooseSection(nextSection: FlashcardSection) {
    if (!cardsBySection[nextSection]) {
      setStatus(`Loading ${nextSection} cards…`);
    }
    setSection(nextSection);
    setMode("study");
  }

  function updateScore(cardId: string, delta: 1 | -1) {
    const nextScores = {
      ...scores,
      [cardId]: Math.max(0, (scores[cardId] ?? 0) + delta),
    };
    setScores(nextScores);
    window.localStorage.setItem(
      `${SCORE_STORAGE_KEY}.${section}`,
      JSON.stringify(nextScores),
    );
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
      <div
        className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:justify-center"
        aria-label="Flashcard decks"
      >
        {sections.map((item) => (
          <button
            className={twMerge(
              "rounded-full border px-2 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm",
              section === item.id
                ? "border-matcha bg-matcha text-white shadow-sm"
                : "border-black/10 bg-white/75 text-slate-600 hover:bg-white hover:text-ink",
            )}
            key={item.id}
            onClick={() => chooseSection(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

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
        <label className="flex w-full flex-none items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm shadow-sm sm:w-auto sm:min-w-72 sm:flex-1">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="w-full min-w-0 bg-transparent text-base outline-none sm:text-sm"
            onChange={(event) => {
              setQuery(event.target.value);
              setMode("library");
            }}
            placeholder={`Search ${section}…`}
            value={query}
          />
        </label>
      </div>

      {!activeCard ? (
        <p className="text-center text-slate-600">
          {status || `No ${section} flashcards available yet.`}
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
                aria-label="Needs more practice"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-sm transition hover:bg-red-200"
                onClick={() => updateScore(activeCard.id, -1)}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                aria-label="I knew this"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm transition hover:bg-green-200"
                onClick={() => updateScore(activeCard.id, 1)}
                type="button"
              >
                <Check className="h-6 w-6" />
              </button>
            </div>
          ) : null}

          {mode === "library" ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {filteredCards.map((card) => (
                <button
                  className="rounded-2xl border border-black/10 bg-white/75 p-3 text-left text-sm shadow-sm transition hover:border-matcha hover:bg-white"
                  key={card.id}
                  onClick={() => showLibraryCard(card)}
                  type="button"
                >
                  <span
                    className={twMerge(
                      "block font-semibold text-ink",
                      card.section !== "vocabulary" && "text-2xl",
                    )}
                  >
                    {card.section === "vocabulary" ? card.english : card.kana}
                  </span>
                  <span className="mt-1 block text-slate-500">
                    {card.section === "kanji" ? card.english : card.romaji}
                  </span>
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
  const characterFirst = card.section !== "vocabulary";
  const frontLabel = characterFirst ? sectionLabel(card.section) : "English";
  const frontText = characterFirst ? card.kana : card.english;

  return (
    <div
      className="group h-[26rem] w-full max-w-xl [perspective:1200px] sm:h-[30rem]"
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
          className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 bg-washi p-5 text-left shadow-xl [backface-visibility:hidden] sm:p-8 ${
            flipped ? "pointer-events-none" : "pointer-events-auto cursor-pointer"
          }`}
          onClick={onFlip}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sakura/45 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-matcha/10 blur-3xl" />
          <Image
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 w-[24rem] -translate-x-8 translate-y-6 opacity-80"
            height={384}
            src="/flashcards/sakura-branch-transparent.png"
            width={384}
          />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">
                {frontLabel}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600">
                Score {score}
              </span>
            </div>
            <p
              className={twMerge(
                "text-center font-semibold tracking-tight text-ink",
                characterFirst ? "text-7xl sm:text-8xl" : "text-4xl sm:text-5xl",
              )}
            >
              {frontText}
            </p>
            <p className="text-center text-sm font-semibold text-slate-500">Click to flip</p>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col overflow-y-auto rounded-[2rem] border border-black/10 bg-washi p-5 text-left shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8 ${
            flipped ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
          }`}
          onClick={onFlip}
        >
          {card.section === "vocabulary" ? (
            <VocabularyAnswer card={card} />
          ) : card.section === "kanji" ? (
            <KanjiAnswer card={card} />
          ) : (
            <KanaAnswer card={card} />
          )}
        </div>
      </div>
    </div>
  );
}

function VocabularyAnswer({ card }: { card: Flashcard }) {
  return (
    <>
      <AnswerHeader label="Japanese">
        <AudioButton asset={card.word_audio} label={card.kana} />
      </AnswerHeader>
      <div className="mt-6 sm:mt-8">
        <p className="text-4xl font-semibold text-ink sm:text-5xl">{card.kana}</p>
        <p className="mt-2 text-lg font-semibold text-slate-600 sm:text-xl">{card.romaji}</p>
      </div>
      <Example card={card} />
    </>
  );
}

function KanaAnswer({ card }: { card: Flashcard }) {
  return (
    <>
      <AnswerHeader label={`${sectionLabel(card.section)} reading`}>
        <AudioButton asset={card.word_audio} label={card.kana} />
      </AnswerHeader>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-6xl font-semibold text-ink sm:text-7xl">{card.romaji}</p>
        <p className="mt-4 text-4xl text-slate-500 sm:mt-5 sm:text-5xl">{card.kana}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-matcha sm:mt-6 sm:text-sm">
          {card.kind}
        </p>
      </div>
    </>
  );
}

function KanjiAnswer({ card }: { card: Flashcard }) {
  return (
    <>
      <AnswerHeader label="Kanji">
        {card.example_audio ? (
          <AudioButton
            asset={card.example_audio}
            label={card.example_reading ?? card.example_kana ?? card.kana}
          />
        ) : null}
      </AnswerHeader>
      <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:gap-6">
        <p className="text-6xl font-semibold text-ink sm:text-7xl">{card.kana}</p>
        <div className="min-w-0">
          <p className="text-xl font-bold text-ink sm:text-2xl">{card.english}</p>
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-matcha">On:</span> {card.onyomi || "—"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold text-matcha">Kun:</span> {card.kunyomi || "—"}
          </p>
        </div>
      </div>
      <Example card={card} />
    </>
  );
}

function AnswerHeader({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">
        {label}
      </span>
      {children}
    </div>
  );
}

function Example({ card }: { card: Flashcard }) {
  if (!card.example_kana) {
    return (
      <p className="mt-6 rounded-3xl bg-white/85 p-4 text-sm text-slate-600 sm:mt-8 sm:p-5">
        Practice this expression as one unit.
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-3xl bg-white/85 p-4 sm:mt-7 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">Example</p>
        {card.section === "vocabulary" ? (
          <AudioButton asset={card.example_audio} label={card.example_kana} />
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-ink sm:text-2xl">{card.example_kana}</p>
      {card.example_reading ? (
        <p className="mt-1 text-sm text-slate-600">{card.example_reading}</p>
      ) : null}
      <p className="mt-1 text-sm text-slate-600">{card.example_romaji}</p>
      <p className="mt-1 text-sm text-slate-700">{card.example_english}</p>
    </div>
  );
}

function sectionLabel(section: FlashcardSection) {
  return sections.find((item) => item.id === section)?.label ?? section;
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

let sharedPronunciationAudio: HTMLAudioElement | null = null;

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
    try {
      const audio = replaceAudio(sharedPronunciationAudio, asset.public_url);
      sharedPronunciationAudio = audio;
      await playAudioElement(audio);
    } catch (err) {
      if (isPlayInterruptedError(err)) return;
      setMessage(err instanceof Error ? err.message : "Could not play audio.");
    }
  }

  return (
    <span
      className="relative z-20 inline-flex items-center gap-2"
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
