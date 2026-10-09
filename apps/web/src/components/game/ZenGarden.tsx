"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  gardenStageIndex,
  isOverdue,
  levelInfo,
  masteryCounts,
  rankForLevel,
  setCardTheme,
  activeTheme,
  useGameState,
  useNow,
} from "@/lib/game";
import { CARD_THEMES, GARDEN_STAGES, RANKS, type GardenStage } from "@/lib/gameRewards";

const SEEN_STAGE_KEY = "japanese-study.garden.seen-stage";
const WILT_THRESHOLD = 20;

// Positions are percentages of the 16:9 scene; every stage shares one composition.
const LANTERN = { left: 66.2, top: 58.2 };
const POND = { left: 14.5, top: 66, width: 40, height: 23 };

export function ZenGarden() {
  const game = useGameState();
  const now = useNow(60_000);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const stageIndex = gardenStageIndex(game);
  const stage = GARDEN_STAGES[stageIndex];
  const next = GARDEN_STAGES[stageIndex + 1] ?? null;
  const { level, into, needed } = levelInfo(game.xp);
  const rank = rankForLevel(level);
  const counts = masteryCounts(game);
  const overdue = useMemo(
    () => Object.values(game.mastery).filter((item) => isOverdue(item, now)).length,
    [game.mastery, now],
  );
  const wilting = overdue >= WILT_THRESHOLD;
  const [viewStage, setViewStage] = useState<number | null>(null);
  const [reveal, setReveal] = useState<{ from: number; to: number } | null>(null);
  const theme = activeTheme(game);

  useEffect(() => {
    if (!hydrated) return;
    const seen = Number(window.localStorage.getItem(SEEN_STAGE_KEY) ?? stageIndex);
    if (stageIndex > seen) setReveal({ from: seen, to: stageIndex });
    window.localStorage.setItem(SEEN_STAGE_KEY, String(stageIndex));
  }, [hydrated, stageIndex]);

  const shown = GARDEN_STAGES[viewStage ?? stageIndex];
  const viewingPast = viewStage !== null && viewStage !== stageIndex;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Your garden · 庭</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{stage.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            It grows as your cards reach Gold and beyond, and as you level up.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stat label="Level" value={hydrated ? String(level) : "–"} />
          <Stat label="Gold+" value={hydrated ? String(counts.gold) : "–"} />
          <Stat label="Mastered" value={hydrated ? String(counts.mastered) : "–"} />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-washi shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
          {hydrated ? (
            <div className="absolute inset-y-0 left-[-12%] w-[133.4%] [container-type:size] sm:left-0 sm:w-full">
              {reveal && !viewingPast ? (
                <SceneImage priority stage={GARDEN_STAGES[reveal.from]} />
              ) : null}
              <div
                className={twMerge(
                  "absolute inset-0 transition-[filter] duration-1000",
                  reveal && !viewingPast && "garden-fade-in",
                  wilting && !viewingPast && "saturate-[0.5] sepia-[0.18] brightness-[0.9]",
                )}
                key={shown.stage}
              >
                <SceneImage priority stage={shown} />
                <SceneLife stage={shown.stage} wilting={wilting && !viewingPast} />
              </div>
              {wilting && !viewingPast ? (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(90,100,120,0.25),transparent_60%)]" />
              ) : null}
            </div>
          ) : null}

          {reveal && !viewingPast ? (
            <div className="toast-in absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow-lg backdrop-blur">
              <Sparkles className="mr-1.5 inline h-4 w-4 text-[#d4688c]" />
              New in your garden: {stage.name}
            </div>
          ) : null}
          {viewingPast ? (
            <button
              className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-ink"
              onClick={() => setViewStage(null)}
              type="button"
            >
              Viewing a past stage · Back to today
            </button>
          ) : null}
        </div>

        {wilting ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-[#eef0f4] px-5 py-3 text-sm text-slate-700">
            <span>
              Your garden is wilting. <strong>{overdue} cards</strong> are overdue for review.
            </span>
            <Link
              className="rounded-full bg-ink px-4 py-1.5 font-semibold text-white transition hover:bg-matcha"
              href="/japanese/flashcards"
            >
              Review now
            </Link>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {next ? (
          <NextUnlock
            gold={counts.gold}
            level={level}
            mastered={counts.mastered}
            next={next}
          />
        ) : (
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Complete</p>
            <p className="mt-2 text-2xl font-bold text-ink">Your garden is in full bloom.</p>
            <p className="mt-1 text-sm text-slate-600">Keep reviewing to keep it from wilting.</p>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Growth</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {GARDEN_STAGES.map((item) => {
              const unlocked = hydrated && item.stage <= stageIndex;
              const selected = (viewStage ?? stageIndex) === item.stage;
              return (
                <button
                  aria-label={unlocked ? `View ${item.name}` : `${item.name} (locked)`}
                  className={twMerge(
                    "group relative aspect-video overflow-hidden rounded-xl border transition",
                    selected ? "border-ink ring-2 ring-ink/20" : "border-black/10",
                    unlocked ? "hover:-translate-y-0.5" : "cursor-default",
                  )}
                  disabled={!unlocked}
                  key={item.stage}
                  onClick={() => setViewStage(item.stage === stageIndex ? null : item.stage)}
                  title={item.name}
                  type="button"
                >
                  <Image
                    alt=""
                    className={twMerge("object-cover", !unlocked && "blur-[3px] grayscale brightness-[1.15] opacity-50")}
                    fill
                    sizes="140px"
                    src={item.image}
                  />
                  {!unlocked ? (
                    <Lock className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Card themes</p>
            <p className="mt-1 text-sm text-slate-600">Unlock new flashcard designs as you level up.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CARD_THEMES.map((item) => {
            const unlocked = hydrated && level >= item.minLevel;
            const selected = hydrated && theme.id === item.id;
            return (
              <button
                className={twMerge(
                  "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl border p-3 text-left shadow-sm transition",
                  item.faceClass,
                  selected ? "border-ink ring-2 ring-ink/25" : "border-black/10",
                  unlocked ? "hover:-translate-y-1 hover:shadow-lg" : "cursor-default",
                )}
                disabled={!unlocked}
                key={item.id}
                onClick={() => setCardTheme(item.id)}
                type="button"
              >
                <div className={twMerge("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl", item.glowClass)} />
                <Image
                  alt=""
                  className={twMerge(
                    "pointer-events-none absolute -bottom-2 -left-4 w-[115%] max-w-none transition",
                    !unlocked && "opacity-25 brightness-0",
                  )}
                  height={384}
                  src={item.art}
                  width={384}
                />
                <span className={twMerge("relative z-10 rounded-2xl px-2.5 py-1.5 backdrop-blur-sm", item.chipClass)}>
                  <span className="block text-sm font-bold">{item.name}</span>
                  <span className="block text-xs opacity-80">
                    {unlocked ? (selected ? "Selected" : "Tap to use") : `Unlocks at Lv ${item.minLevel}`}
                  </span>
                </span>
                {selected ? (
                  <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ink text-white">
                    <Check className="h-4 w-4" />
                  </span>
                ) : !unlocked ? (
                  <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/80 text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Ranks</p>
            <p className="mt-1 text-sm text-slate-600">
              {hydrated ? (
                <>
                  {rank.title} · {rank.english} — {needed - into} XP to level {level + 1}
                </>
              ) : (
                " "
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {RANKS.map((item) => {
            const unlocked = hydrated && level >= item.minLevel;
            const current = hydrated && item.title === rank.title;
            return (
              <div
                className={twMerge(
                  "flex flex-col items-center rounded-3xl p-3 text-center transition",
                  current ? "bg-[linear-gradient(160deg,#fff,#fde7ef)] shadow-md ring-1 ring-[#d4688c]/30" : "",
                )}
                key={item.title}
              >
                <Image
                  alt=""
                  className={twMerge("h-20 w-20 object-contain drop-shadow", !unlocked && "opacity-40 blur-[1.5px] grayscale")}
                  height={160}
                  src={item.crest}
                  width={160}
                />
                <p className={twMerge("mt-2 text-lg font-bold", unlocked ? "text-ink" : "text-slate-400")}>
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {unlocked ? item.english : `Lv ${item.minLevel}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SceneImage({ stage, priority }: { stage: GardenStage; priority?: boolean }) {
  return (
    <Image
      alt={`Zen garden: ${stage.name}`}
      className="object-cover"
      fill
      priority={priority}
      sizes="(min-width: 1280px) 1216px, 100vw"
      src={stage.image}
    />
  );
}

function SceneLife({ stage, wilting }: { stage: number; wilting: boolean }) {
  const petals = useMemo(() => {
    const count = wilting ? 10 : stage >= 8 ? 26 : stage >= 7 ? 14 : 3 + Math.floor(stage / 2);
    return Array.from({ length: count }, (_, index) => ({
      left: seeded(index, 1) * 100,
      size: 7 + seeded(index, 2) * 8,
      duration: 9 + seeded(index, 3) * 9,
      delay: -seeded(index, 4) * 18,
      drift: (seeded(index, 5) * 18 + 4) * (stage >= 7 ? 1 : 0.6),
      spin: 180 + seeded(index, 6) * 540,
    }));
  }, [stage, wilting]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stage >= 3 ? (
        <div
          className="pond-shimmer absolute rounded-[50%] opacity-80"
          style={{ left: `${POND.left}%`, top: `${POND.top}%`, width: `${POND.width}%`, height: `${POND.height}%` }}
        />
      ) : null}
      {stage >= 2 ? (
        <div
          className="lantern-glow absolute aspect-square w-[9%] rounded-full bg-[radial-gradient(circle,rgba(255,206,120,0.85),rgba(255,180,90,0.35)_40%,transparent_70%)] mix-blend-screen"
          style={{ left: `${LANTERN.left}%`, top: `${LANTERN.top}%` }}
        />
      ) : null}
      {petals.map((petal, index) => (
        <span
          className={twMerge(
            "garden-petal absolute -top-4 block rounded-[60%_0_60%_0]",
            wilting
              ? "bg-[linear-gradient(135deg,#c9a46a,#8f6a3a)]"
              : "bg-[linear-gradient(135deg,#ffe1ea,#f3a6c0)] shadow-[0_0_2px_rgba(255,255,255,0.6)]",
          )}
          key={index}
          style={
            {
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size * 0.8,
              "--duration": `${petal.duration}s`,
              "--delay": `${petal.delay}s`,
              "--drift": `${petal.drift}vw`,
              "--spin": `${petal.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function NextUnlock({
  next,
  gold,
  level,
  mastered,
}: {
  next: GardenStage;
  gold: number;
  level: number;
  mastered: number;
}) {
  const requirements = [
    { label: "Gold+ cards", unit: ["Gold+ card", "Gold+ cards"], have: gold, need: next.minGold },
    { label: "Level", unit: ["level", "levels"], have: level, need: next.minLevel },
    ...(next.minMastered
      ? [{ label: "Mastered cards", unit: ["mastered card", "mastered cards"], have: mastered, need: next.minMastered }]
      : []),
  ].filter((item) => item.need > 0);
  const missing = requirements.find((item) => item.have < item.need);
  const remaining = missing ? missing.need - missing.have : 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-sm sm:flex-row">
      <div className="relative aspect-[5/2] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-56">
        <Image
          alt=""
          className="scale-110 object-cover blur-[6px] grayscale-[0.5]"
          fill
          sizes="224px"
          src={next.image}
        />
        <div className="absolute inset-0 grid place-items-center bg-white/20">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/85 text-slate-600 shadow">
            <Lock className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="flex-1 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Next unlock</p>
        <p className="mt-1 text-xl font-bold text-ink">{next.name}</p>
        <p className="text-sm text-slate-600">
          {missing ? `${remaining} more ${missing.unit[remaining === 1 ? 0 : 1]}` : next.description}
        </p>
        <div className="mt-4 space-y-3">
          {requirements.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{item.label}</span>
                <span>
                  {Math.min(item.have, item.need)} / {item.need}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#7a9b76,#d4688c)] transition-[width] duration-700"
                  style={{ width: `${Math.min(100, (item.have / item.need) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-2xl bg-white/80 px-4 py-2 text-center shadow-sm">
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}

function seeded(index: number, salt: number) {
  const x = Math.sin(index * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}
