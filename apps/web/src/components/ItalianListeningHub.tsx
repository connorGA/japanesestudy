"use client";

import { useEffect, useState } from "react";
import { Headphones, MessagesSquare } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ListeningPractice } from "@/components/ListeningPractice";
import { PassiveListeningPlayer } from "@/components/PassiveListeningPlayer";

type ListeningMode = "passive" | "scenarios";

const modes: {
  id: ListeningMode;
  label: string;
  description: string;
  icon: typeof Headphones;
}[] = [
  {
    id: "passive",
    label: "Passive listening",
    description: "English-to-Italian drills that keep playing.",
    icon: Headphones,
  },
  {
    id: "scenarios",
    label: "Scenario library",
    description: "Follow complete conversations line by line.",
    icon: MessagesSquare,
  },
];

export function ItalianListeningHub() {
  const [mode, setMode] = useState<ListeningMode>("passive");

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "passive" || requestedMode === "scenarios") {
      setMode(requestedMode);
    }
  }, []);

  function selectMode(nextMode: ListeningMode) {
    setMode(nextMode);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState({}, "", url);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 md:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 md:gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">
            Listening
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Train your ear at your pace.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Run hands-free drills or study natural conversations one line at a time.
          </p>
        </div>

        <div
          aria-label="Listening mode"
          className="flex w-full rounded-2xl border border-black/10 bg-white/65 p-1.5 shadow-sm sm:inline-flex sm:w-auto"
          role="tablist"
        >
          {modes.map((item) => {
            const Icon = item.icon;
            const active = item.id === mode;
            return (
              <button
                aria-selected={active}
                className={twMerge(
                  "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-ink",
                )}
                key={item.id}
                onClick={() => selectMode(item.id)}
                role="tab"
                type="button"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <p className="-mt-3 text-xs text-slate-500">
        {modes.find((item) => item.id === mode)?.description}
      </p>

      <div
        className={twMerge(
          "min-h-0 flex-1",
          mode === "passive"
            ? "lg:overflow-hidden"
            : "lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2",
        )}
      >
        {mode === "passive" ? (
          <PassiveListeningPlayer language="italian" />
        ) : (
          <ListeningPractice language="italian" />
        )}
      </div>
    </div>
  );
}
