"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { getFlashcards } from "@/lib/api";
import { isDue, useGameState, useNow, type CardMastery } from "@/lib/game";
import { TIERS } from "@/lib/gameRewards";
import type { Flashcard, FlashcardSection } from "@/types/study";

type Filter = "all" | "due" | "weak" | "mastered";

const SETS: { id: FlashcardSection; label: string; native: string }[] = [
  { id: "hiragana", label: "Hiragana", native: "ひらがな" },
  { id: "katakana", label: "Katakana", native: "カタカナ" },
  { id: "kanji", label: "Kanji", native: "漢字" },
  { id: "vocabulary", label: "Vocabulary", native: "語彙" },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "due", label: "Due" },
  { id: "weak", label: "Weak" },
  { id: "mastered", label: "Mastered" },
];

export function CollectionGrid() {
  const [cardsBySet, setCardsBySet] = useState<Partial<Record<FlashcardSection, Flashcard[]>>>({});
  const [status, setStatus] = useState("Loading your collection…");
  const [filter, setFilter] = useState<Filter>("all");
  const game = useGameState();
  const now = useNow();

  useEffect(() => {
    let cancelled = false;
    Promise.all(SETS.map((set) => getFlashcards(set.id)))
      .then((results) => {
        if (cancelled) return;
        setCardsBySet(Object.fromEntries(SETS.map((set, index) => [set.id, results[index]])));
        setStatus("");
      })
      .catch((err) => {
        if (!cancelled) setStatus(err instanceof Error ? err.message : "Could not load cards");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allCards = useMemo(() => SETS.flatMap((set) => cardsBySet[set.id] ?? []), [cardsBySet]);
  const tierCounts = useMemo(() => {
    const counts = TIERS.map(() => 0);
    for (const card of allCards) {
      const mastery = game.mastery[card.id];
      if (mastery) counts[mastery.stage] += 1;
    }
    return counts;
  }, [allCards, game.mastery]);
  const collected = tierCounts.reduce((sum, count) => sum + count, 0) - tierCounts[0];

  function matches(mastery: CardMastery | undefined) {
    if (filter === "all") return true;
    if (!mastery) return false;
    if (filter === "due") return isDue(mastery, now);
    if (filter === "weak") return mastery.stage === 0 || mastery.lapses >= 2;
    return mastery.stage === 5;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sakura/50 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Collection</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {collected}
              <span className="text-slate-400"> / {allCards.length || "…"}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Cards climb a tier when you recall them after a rest. Gold and beyond take days, not minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIERS.slice(1).map((tier) => (
              <div
                className="flex items-center gap-2 rounded-2xl bg-white/85 py-1.5 pl-1.5 pr-3 shadow-sm"
                key={tier.stage}
                title={tier.name}
              >
                {tier.medallion ? (
                  <Image alt="" className="h-8 w-8 object-contain" height={64} src={tier.medallion} width={64} />
                ) : null}
                <span className="text-sm font-bold text-ink">{tierCounts[tier.stage]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        {FILTERS.map((item) => (
          <button
            className={twMerge(
              "rounded-full border px-5 py-2 text-sm font-semibold transition",
              filter === item.id
                ? "border-ink bg-ink text-white"
                : "border-black/10 bg-white/75 text-slate-600 hover:bg-white hover:text-ink",
            )}
            key={item.id}
            onClick={() => setFilter(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {status ? <p className="text-center text-slate-600">{status}</p> : null}

      {SETS.map((set) => {
        const cards = cardsBySet[set.id] ?? [];
        if (!cards.length) return null;
        const visible = cards.filter((card) => matches(game.mastery[card.id]));
        const gold = cards.filter((card) => (game.mastery[card.id]?.stage ?? 0) >= 3).length;
        const complete = gold === cards.length;
        if (!visible.length && filter !== "all") return null;

        return (
          <section className="flex flex-col gap-3" key={set.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-ink">
                  {set.label} <span className="font-semibold text-slate-400">{set.native}</span>
                </h2>
                {complete ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf3d4] py-1 pl-1 pr-3 text-xs font-bold text-[#7a5a0e]">
                    <Image alt="" className="h-5 w-5" height={40} src="/game/medallion-gold.png" width={40} />
                    Set complete
                  </span>
                ) : null}
              </div>
              <div className="flex min-w-48 flex-1 items-center gap-3 sm:max-w-xs">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#d9a92e,#f0c95a)]"
                    style={{ width: `${(gold / cards.length) * 100}%` }}
                  />
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-slate-600">
                  {gold}/{cards.length} Gold+
                </span>
              </div>
            </div>

            <div
              className={twMerge(
                "grid gap-2",
                set.id === "vocabulary"
                  ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
                  : "grid-cols-5 sm:grid-cols-8 lg:grid-cols-12",
              )}
            >
              {visible.map((card) => (
                <CollectionTile card={card} key={card.id} mastery={game.mastery[card.id]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CollectionTile({ card, mastery }: { card: Flashcard; mastery: CardMastery | undefined }) {
  const tier = mastery ? TIERS[mastery.stage] : null;
  const vocabulary = card.section === "vocabulary";

  return (
    <Link
      className={twMerge(
        "group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        vocabulary ? "min-h-20 px-2 py-3" : "aspect-square",
        tier ? tier.tileClass : "border-dashed border-slate-300 bg-white/40",
        mastery?.stage === 5 && "ring-2 ring-[#f19ab8]/40",
      )}
      href={`/japanese/flashcards?section=${card.section}&card=${encodeURIComponent(card.id)}`}
      title={tier ? `${card.english} · ${tier.name}` : `${card.english} · not collected yet`}
    >
      <span
        className={twMerge(
          "font-semibold leading-tight",
          vocabulary ? "line-clamp-2 text-base" : "text-2xl sm:text-3xl",
          !tier && "text-slate-400 opacity-40 blur-[1.5px] transition group-hover:opacity-70 group-hover:blur-0",
        )}
      >
        {card.kana}
      </span>
      {vocabulary ? (
        <span className={twMerge("mt-1 line-clamp-1 text-xs", tier ? "opacity-70" : "text-slate-400 opacity-60")}>
          {tier ? card.english : "???"}
        </span>
      ) : null}
      {tier?.medallion ? (
        <Image
          alt=""
          className="absolute right-1 top-1 h-4 w-4 object-contain sm:h-5 sm:w-5"
          height={40}
          src={tier.medallion}
          width={40}
        />
      ) : null}
    </Link>
  );
}
