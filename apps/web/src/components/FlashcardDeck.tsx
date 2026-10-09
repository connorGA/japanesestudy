"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, Flame, Search, Sparkles, Volume2, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { recordStudyActivity } from "@/lib/progress";
import { getFlashcards } from "@/lib/api";
import {
  activeTheme,
  answerCard,
  comboMultiplier,
  isDue,
  nextComboStep,
  readGame,
  tierFor,
  useGameState,
  useNow,
  type CardMastery,
} from "@/lib/game";
import type { CardTheme } from "@/lib/gameRewards";
import {
  isPlayInterruptedError,
  playAudioElement,
  replaceAudio,
} from "@/lib/audioPlayback";
import type { AudioAsset, Flashcard, FlashcardSection } from "@/types/study";

type Mode = "study" | "library";
type Prompt = "english" | "japanese";

const sections: { id: FlashcardSection; label: string }[] = [
  { id: "vocabulary", label: "Vocabulary" },
  { id: "hiragana", label: "Hiragana" },
  { id: "katakana", label: "Katakana" },
  { id: "kanji", label: "Kanji" },
];

export function FlashcardDeck() {
  const searchParams = useSearchParams();
  const [section, setSection] = useState<FlashcardSection>(() =>
    parseSection(searchParams.get("section")),
  );
  const [cardsBySection, setCardsBySection] = useState<
    Partial<Record<FlashcardSection, Flashcard[]>>
  >({});
  const [mode, setMode] = useState<Mode>("study");
  const [activeCardId, setActiveCardId] = useState<string | null>(() => searchParams.get("card"));
  const [flipped, setFlipped] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>("english");
  const [query, setQuery] = useState("");
  const [combo, setCombo] = useState(0);
  const [status, setStatus] = useState("Loading flashcards…");
  const game = useGameState();
  const now = useNow();
  const cards = useMemo(() => cardsBySection[section] ?? [], [cardsBySection, section]);
  const counts = useMemo(() => {
    let due = 0;
    let fresh = 0;
    for (const card of cards) {
      const mastery = game.mastery[card.id];
      if (!mastery) fresh += 1;
      else if (isDue(mastery, now)) due += 1;
    }
    return { due, fresh };
  }, [cards, game.mastery, now]);

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
    if (!cards.length || activeCardId) return;
    setActiveCardId(pickNextCard(cards, readGame().mastery, Date.now()).id);
    setPrompt(randomPrompt());
  }, [activeCardId, cards]);

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
    setActiveCardId(null);
    setFlipped(false);
    setQuery("");
  }

  function answer(card: Flashcard, correct: boolean) {
    const nextCombo = correct ? combo + 1 : 0;
    answerCard({ cardId: card.id, label: card.kana, correct, combo: nextCombo });
    setCombo(nextCombo);
    recordStudyActivity(
      "japanese",
      correct ? "flashcard_mastered" : "flashcard_retry",
      "flashcards",
      { card_id: card.id, deck: section },
    );
    showNextStudyCard();
  }

  function showNextStudyCard() {
    if (!cards.length) return;
    setActiveCardId(pickNextCard(cards, readGame().mastery, Date.now(), activeCard?.id).id);
    setPrompt(randomPrompt());
    setFlipped(false);
  }

  function showLibraryCard(card: Flashcard) {
    setMode("library");
    setActiveCardId(card.id);
    setPrompt("english");
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
        {cards.length ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            <span className={counts.due ? "text-[#c0456f]" : undefined}>{counts.due} due</span>
            <span className="text-slate-300">·</span>
            <span>{counts.fresh} new</span>
          </span>
        ) : null}
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
            prompt={prompt}
            mastery={game.mastery[activeCard.id]}
            theme={activeTheme(game)}
            onFlip={() => setFlipped((value) => !value)}
          />

          {mode === "study" ? <ComboMeter combo={combo} /> : null}

          {mode === "study" && flipped ? (
            <div className="flex gap-3">
              <button
                aria-label="Needs more practice"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-sm transition hover:bg-red-200"
                onClick={() => answer(activeCard, false)}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                aria-label="I knew this"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm transition hover:bg-green-200"
                onClick={() => answer(activeCard, true)}
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
  prompt,
  mastery,
  theme,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  prompt: Prompt;
  mastery: CardMastery | undefined;
  theme: CardTheme;
  onFlip: () => void;
}) {
  // The back face stays visible for the first half of the unflip, so it must keep
  // showing the previous answer until the card is flipped again.
  const [revealed, setRevealed] = useState({ card, prompt });
  if (flipped && (revealed.card.id !== card.id || revealed.prompt !== prompt)) {
    setRevealed({ card, prompt });
  }

  const characterFirst = card.section !== "vocabulary";
  const japaneseFirst = !characterFirst && prompt === "japanese";
  const frontLabel = characterFirst
    ? sectionLabel(card.section)
    : japaneseFirst
      ? "Japanese"
      : "English";
  const frontText = characterFirst || japaneseFirst ? card.kana : card.english;

  return (
    <div
      className="flashcard-scene group h-[26rem] w-full max-w-xl sm:h-[30rem]"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={twMerge("flashcard-inner rounded-[2rem]", flipped && "is-flipped")}>
        <div
          className={twMerge(
            "flashcard-face absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 p-5 text-left shadow-xl sm:p-8",
            theme.faceClass,
            flipped ? "pointer-events-none" : "pointer-events-auto cursor-pointer",
          )}
          onClick={onFlip}
        >
          <div
            className={twMerge(
              "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-2xl",
              theme.glowClass,
            )}
          />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-matcha/10 blur-3xl" />
          <Image
            alt=""
            className={twMerge("pointer-events-none absolute", theme.artClass)}
            height={384}
            src={theme.art}
            width={384}
          />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span
                className={twMerge(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                  theme.chipClass,
                )}
              >
                {frontLabel}
              </span>
              <TierBadge chipClass={theme.chipClass} mastery={mastery} />
            </div>
            <p
              className={twMerge(
                "text-center font-semibold tracking-tight",
                theme.textClass,
                characterFirst ? "text-7xl sm:text-8xl" : "text-4xl sm:text-5xl",
              )}
            >
              {frontText}
            </p>
            <p className={twMerge("text-center text-sm font-semibold", theme.mutedClass)}>
              Click to flip
            </p>
          </div>
        </div>

        <div
          className={twMerge(
            "flashcard-face flashcard-face-back absolute inset-0 overflow-hidden rounded-[2rem] border border-black/10 bg-washi shadow-xl",
            flipped ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
          )}
          onClick={onFlip}
        >
          <div className="absolute inset-0 overflow-y-auto p-5 sm:p-8">
            {revealed.card.section === "vocabulary" ? (
              <VocabularyAnswer card={revealed.card} prompt={revealed.prompt} />
            ) : revealed.card.section === "kanji" ? (
              <KanjiAnswer card={revealed.card} />
            ) : (
              <KanaAnswer card={revealed.card} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VocabularyAnswer({ card, prompt }: { card: Flashcard; prompt: Prompt }) {
  const japaneseFirst = prompt === "japanese";

  return (
    <>
      <AnswerHeader label={japaneseFirst ? "Meaning" : "Japanese"}>
        <AudioButton asset={card.word_audio} label={card.kana} />
      </AnswerHeader>
      <div className="mt-6 sm:mt-8">
        <p className="text-4xl font-semibold text-ink sm:text-5xl">
          {japaneseFirst ? card.english : card.kana}
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-600 sm:text-xl">
          {japaneseFirst ? `${card.kana} · ${card.romaji}` : card.romaji}
        </p>
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

function TierBadge({ mastery, chipClass }: { mastery: CardMastery | undefined; chipClass: string }) {
  const tier = tierFor(mastery?.stage);
  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-semibold",
        chipClass,
        !tier?.medallion && "pl-3",
      )}
    >
      {tier?.medallion ? (
        <Image alt="" className="h-6 w-6 object-contain" height={48} src={tier.medallion} width={48} />
      ) : !tier ? (
        <Sparkles className="h-3.5 w-3.5" />
      ) : null}
      {tier ? tier.name : "New"}
    </span>
  );
}

function ComboMeter({ combo }: { combo: number }) {
  const multiplier = comboMultiplier(combo);
  const next = nextComboStep(combo);
  const previous = [0, 5, 10, 20].filter((step) => step <= combo).pop() ?? 0;
  const percent = next ? ((combo - previous) / (next.combo - previous)) * 100 : 100;

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Flame
          className={twMerge(
            "h-4 w-4 transition-colors",
            multiplier >= 2 ? "text-[#e0663a]" : combo ? "text-[#d4688c]" : "text-slate-300",
          )}
        />
        {combo ? <span>Combo {combo}</span> : <span className="text-slate-400">5 in a row for ×1.5 XP</span>}
        {multiplier > 1 ? (
          <span className="combo-pulse rounded-full bg-[#d4688c] px-2 py-0.5 text-xs font-bold text-white">
            ×{multiplier}
          </span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f19ab8,#e0663a)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {next && combo ? (
        <p className="text-xs text-slate-400">
          {next.combo - combo} more for ×{next.multiplier}
        </p>
      ) : null}
    </div>
  );
}

function parseSection(value: string | null): FlashcardSection {
  return sections.some((item) => item.id === value) ? (value as FlashcardSection) : "vocabulary";
}

function randomPrompt(): Prompt {
  return Math.random() < 0.5 ? "english" : "japanese";
}

function pickNextCard(
  cards: Flashcard[],
  mastery: Record<string, CardMastery>,
  now: number,
  excludeId?: string,
) {
  const pool = cards.length > 1 ? cards.filter((card) => card.id !== excludeId) : cards;
  const due = pool.filter((card) => mastery[card.id] && isDue(mastery[card.id], now));
  const unseen = pool.filter((card) => !mastery[card.id]);
  const roll = Math.random();

  if (due.length && roll < 0.7) return randomItem(due);
  if (unseen.length && roll < (due.length ? 0.85 : 0.5)) return randomItem(unseen);

  const weighted = pool.flatMap((card) => {
    const stage = mastery[card.id]?.stage ?? 0;
    return Array.from({ length: (6 - stage) ** 2 }, () => card);
  });
  return randomItem(weighted.length ? weighted : pool);
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
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
