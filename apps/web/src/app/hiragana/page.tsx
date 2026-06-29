"use client";

import { useState } from "react";
import { HiraganaFlashcardGame } from "@/components/HiraganaFlashcardGame";
import { HiraganaPronunciationChart } from "@/components/HiraganaPronunciationChart";

type Tab = "game" | "chart";

export default function HiraganaPage() {
  const [tab, setTab] = useState<Tab>("game");

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "game"} onClick={() => setTab("game")}>
          Flashcard Game
        </TabButton>
        <TabButton active={tab === "chart"} onClick={() => setTab("chart")}>
          Pronunciation Chart
        </TabButton>
      </div>

      {tab === "game" ? <HiraganaFlashcardGame /> : <HiraganaPronunciationChart />}
    </main>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
        active
          ? "bg-ink text-white shadow-sm"
          : "border border-black/10 bg-white/80 text-slate-600 hover:bg-white hover:text-ink"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
