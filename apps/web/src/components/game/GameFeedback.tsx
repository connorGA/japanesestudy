"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GAME_FEEDBACK_EVENT, rankForLevel, type GameFeedback as Feedback } from "@/lib/game";
import { TIERS, type CardTheme, type GardenStage, type MasteryStage, type Rank } from "@/lib/gameRewards";
import { playCombo, playCorrect, playLevelUp, playTierUp } from "@/lib/gameSounds";

type Pop = { id: number; amount: number; multiplier: number; correct: boolean; offset: number };
type Toast =
  | { id: number; kind: "tier"; label: string; stage: MasteryStage }
  | { id: number; kind: "garden"; stage: GardenStage };
type Combo = { id: number; combo: number; multiplier: number };
type LevelUp = { level: number; rank: Rank | null; themes: CardTheme[]; garden: GardenStage | null };

let nextId = 0;

export function GameFeedback() {
  const [pops, setPops] = useState<Pop[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [levelUps, setLevelUps] = useState<LevelUp[]>([]);
  const pendingGarden = useRef<GardenStage | null>(null);

  useEffect(() => {
    function onFeedback(event: Event) {
      const detail = (event as CustomEvent<Feedback>).detail;
      const id = nextId++;

      if (detail.kind === "xp") {
        if (detail.correct) playCorrect(detail.multiplier);
        setPops((current) => [
          ...current.slice(-4),
          { id, ...detail, offset: Math.round((Math.random() - 0.5) * 80) },
        ]);
        window.setTimeout(() => setPops((current) => current.filter((pop) => pop.id !== id)), 1400);
      } else if (detail.kind === "combo") {
        playCombo();
        setCombo({ id, combo: detail.combo, multiplier: detail.multiplier });
        window.setTimeout(() => setCombo((current) => (current?.id === id ? null : current)), 1600);
      } else if (detail.kind === "tier") {
        playTierUp();
        pushToast({ id, kind: "tier", label: detail.label, stage: detail.stage }, 3200);
      } else if (detail.kind === "level") {
        playLevelUp();
        const garden = pendingGarden.current;
        pendingGarden.current = null;
        setLevelUps((current) => [
          ...current,
          { level: detail.level, rank: detail.rank, themes: detail.themes, garden },
        ]);
      } else if (detail.kind === "garden") {
        pendingGarden.current = detail.stage;
        // A level-up dispatched in the same commit folds the garden unlock into its modal.
        queueMicrotask(() => {
          if (pendingGarden.current !== detail.stage) return;
          pendingGarden.current = null;
          playTierUp();
          pushToast({ id, kind: "garden", stage: detail.stage }, 6000);
        });
      }
    }

    function pushToast(toast: Toast, duration: number) {
      setToasts((current) => [...current.slice(-2), toast]);
      window.setTimeout(
        () => setToasts((current) => current.filter((item) => item.id !== toast.id)),
        duration,
      );
    }

    window.addEventListener(GAME_FEEDBACK_EVENT, onFeedback);
    return () => window.removeEventListener(GAME_FEEDBACK_EVENT, onFeedback);
  }, []);

  const levelUp = levelUps[0];

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[34%] z-40 flex justify-center">
        {pops.map((pop) => (
          <span
            className="xp-pop absolute whitespace-nowrap text-2xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]"
            key={pop.id}
            style={{ marginLeft: pop.offset }}
          >
            <span className={pop.correct ? "text-matcha" : "text-slate-500"}>+{pop.amount} XP</span>
            {pop.multiplier > 1 ? (
              <span className="ml-2 rounded-full bg-[#d4688c] px-2 py-0.5 align-middle text-sm text-white">
                ×{pop.multiplier}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      {combo ? (
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[22%] z-40 flex justify-center">
          <div className="combo-burst rounded-full bg-ink/90 px-6 py-3 text-center text-white shadow-2xl" key={combo.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sakura">Combo {combo.combo}</p>
            <p className="text-3xl font-black">×{combo.multiplier} XP</p>
          </div>
        </div>
      ) : null}

      <div aria-live="polite" className="fixed right-4 top-24 z-40 flex w-72 flex-col gap-2">
        {toasts.map((toast) =>
          toast.kind === "tier" ? (
            <TierToast key={toast.id} label={toast.label} stage={toast.stage} />
          ) : (
            <GardenToast key={toast.id} stage={toast.stage} />
          ),
        )}
      </div>

      {levelUp ? (
        <LevelUpModal
          key={levelUp.level}
          levelUp={levelUp}
          onClose={() => setLevelUps((current) => current.slice(1))}
        />
      ) : null}
    </>
  );
}

function TierToast({ label, stage }: { label: string; stage: MasteryStage }) {
  const tier = TIERS[stage];
  return (
    <div className="toast-in flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur">
      {tier.medallion ? (
        <Image alt="" className="h-12 w-12 shrink-0 object-contain" height={96} src={tier.medallion} width={96} />
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Tier up</p>
        <p className="line-clamp-2 break-words text-sm font-semibold text-ink">
          <span className="text-lg">{label}</span> reached {tier.name}
        </p>
      </div>
    </div>
  );
}

function GardenToast({ stage }: { stage: GardenStage }) {
  return (
    <Link
      className="toast-in block overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-xl backdrop-blur transition hover:scale-[1.02]"
      href="/japanese/garden"
    >
      <span className="relative block h-24 w-full">
        <Image alt="" className="object-cover" fill sizes="288px" src={stage.image} />
      </span>
      <span className="block p-3">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Your garden grew</span>
        <span className="block text-sm font-semibold text-ink">{stage.name}</span>
      </span>
    </Link>
  );
}

function LevelUpModal({ levelUp, onClose }: { levelUp: LevelUp; onClose: () => void }) {
  const rank = rankForLevel(levelUp.level);
  const [petals] = useState(() =>
    Array.from({ length: 28 }, (_, index) => {
      const angle = (index / 28) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 160 + Math.random() * 220;
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotate: Math.random() * 540 - 270,
        delay: Math.random() * 0.25,
        size: 10 + Math.random() * 10,
      };
    }),
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
        {petals.map((petal, index) => (
          <span
            className="petal-burst absolute block rounded-[60%_0_60%_0] bg-[linear-gradient(135deg,#ffd6e3,#f19ab8)]"
            key={index}
            style={
              {
                width: petal.size,
                height: petal.size,
                animationDelay: `${petal.delay}s`,
                "--dx": `${petal.dx}px`,
                "--dy": `${petal.dy}px`,
                "--rot": `${petal.rotate}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="level-up-card relative max-h-full w-full max-w-sm overflow-y-auto overflow-x-hidden rounded-[2rem] border border-white/70 bg-washi p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sakura/50 blur-2xl" />
        <Image
          alt={`${rank.english} crest`}
          className="relative mx-auto h-36 w-36 object-contain drop-shadow-lg"
          height={288}
          priority
          src={rank.crest}
          width={288}
        />
        <p className="relative mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-matcha">Level up</p>
        <p className="relative text-6xl font-black tracking-tight text-ink">{levelUp.level}</p>

        {levelUp.rank ? (
          <div className="relative mt-3 rounded-2xl bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4688c]">New rank</p>
            <p className="text-2xl font-bold text-ink">{levelUp.rank.title}</p>
            <p className="text-sm text-slate-600">
              {levelUp.rank.romaji} · {levelUp.rank.english}
            </p>
          </div>
        ) : (
          <p className="relative mt-1 text-sm font-semibold text-slate-600">
            {rank.title} · {rank.english}
          </p>
        )}

        {levelUp.themes.length || levelUp.garden ? (
          <div className="relative mt-4 space-y-2 text-left">
            {levelUp.themes.map((theme) => (
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-2" key={theme.id}>
                <Image alt="" className="h-12 w-12 object-contain" height={96} src={theme.art} width={96} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Card theme unlocked</p>
                  <p className="text-sm font-semibold text-ink">{theme.name}</p>
                </div>
              </div>
            ))}
            {levelUp.garden ? (
              <Link
                className="flex items-center gap-3 rounded-2xl bg-white/80 p-2 transition hover:bg-white"
                href="/japanese/garden"
                onClick={onClose}
              >
                <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image alt="" className="object-cover" fill sizes="80px" src={levelUp.garden.image} />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Your garden grew</span>
                  <span className="block text-sm font-semibold text-ink">{levelUp.garden.name}</span>
                </span>
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-matcha"
          onClick={onClose}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          Continue
        </button>
      </div>
    </div>
  );
}
