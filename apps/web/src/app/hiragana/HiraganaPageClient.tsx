"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiraganaFlashcardGame } from "@/components/HiraganaFlashcardGame";
import { HiraganaPronunciationChart } from "@/components/HiraganaPronunciationChart";
import { StrokeOrderPractice } from "@/components/StrokeOrderPractice";

type Tab = "game" | "chart" | "stroke";

export default function HiraganaPageClient() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("game");

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested === "chart" || requested === "stroke" || requested === "game") {
      setTab(requested);
    }
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "game"} onClick={() => setTab("game")}>
          Flashcard Game
        </TabButton>
        <TabButton active={tab === "chart"} onClick={() => setTab("chart")}>
          Pronunciation Chart
        </TabButton>
        <TabButton active={tab === "stroke"} onClick={() => setTab("stroke")}>
          Stroke Order
        </TabButton>
      </div>

      {tab === "game" ? (
        <HiraganaFlashcardGame />
      ) : tab === "chart" ? (
        <HiraganaPronunciationChart />
      ) : (
        <StrokeOrderPractice />
      )}
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
