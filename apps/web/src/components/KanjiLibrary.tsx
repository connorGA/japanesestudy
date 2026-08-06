"use client";

import { useEffect, useState } from "react";
import { getFlashcards } from "@/lib/api";
import type { Flashcard } from "@/types/study";
import { KanjiGrid } from "@/components/CharacterStudy";

export function KanjiLibrary() {
  const [items, setItems] = useState<Flashcard[]>([]);
  const [status, setStatus] = useState("Loading the top 100 kanji…");

  useEffect(() => {
    getFlashcards("kanji")
      .then((cards) => {
        setItems(cards);
        setStatus("");
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load the kanji library"),
      );
  }, []);

  if (!items.length) {
    return <p className="text-sm text-slate-600">{status}</p>;
  }

  return (
    <KanjiGrid
      items={items.map((card) => ({
        character: card.kana,
        meaning: card.english,
        onyomi: card.onyomi ?? "—",
        kunyomi: card.kunyomi ?? "—",
        example: `${card.example_kana} (${card.example_reading}) — ${card.example_english}`,
      }))}
    />
  );
}
