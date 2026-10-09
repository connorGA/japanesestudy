"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { levelInfo, rankForLevel, useGameState } from "@/lib/game";
import { isMuted, MUTE_EVENT, setMuted } from "@/lib/gameSounds";

export function XpBar({ transparent }: { transparent: boolean }) {
  const game = useGameState();
  const { level, into, needed } = levelInfo(game.xp);
  const rank = rankForLevel(level);
  const percent = Math.min(100, (into / needed) * 100);
  const track = transparent ? "rgba(255,255,255,0.3)" : "rgba(23,32,51,0.1)";

  return (
    <div
      className={twMerge(
        "flex shrink-0 items-center gap-1 rounded-full border p-1 backdrop-blur-md transition-colors sm:pr-1.5",
        transparent
          ? "border-white/25 bg-white/10 text-white"
          : "border-white/60 bg-white/70 text-ink shadow-sm",
      )}
    >
      <Link
        aria-label={`Level ${level} ${rank.english}. ${into} of ${needed} XP to the next level. Open garden.`}
        className="flex items-center gap-2 rounded-full sm:pr-1 xl:pr-0 2xl:pr-1"
        href="/japanese/garden"
        title={`${rank.title} · ${rank.english}`}
      >
        <span className="relative h-10 w-10 shrink-0 sm:h-9 sm:w-9 lg:h-10 lg:w-10">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full transition-[background] duration-700 sm:hidden xl:block 2xl:hidden"
            style={{ background: `conic-gradient(#d4688c ${percent * 3.6}deg, ${track} 0)` }}
          />
          <Image
            alt=""
            className="object-contain p-[3px] drop-shadow sm:p-0 xl:p-[3px] 2xl:p-0"
            fill
            sizes="40px"
            src={rank.crest}
          />
          <span className="absolute -bottom-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-white shadow sm:hidden xl:grid 2xl:hidden">
            {level}
          </span>
        </span>
        <span className="hidden sm:block xl:hidden 2xl:block">
          <span className="flex items-baseline gap-1.5 whitespace-nowrap text-xs font-bold leading-none">
            Lv {level}
            <span className={twMerge("font-semibold", transparent ? "text-white/80" : "text-slate-500")}>
              {rank.title}
            </span>
          </span>
          <span
            className={twMerge(
              "mt-1.5 block h-1.5 w-24 overflow-hidden rounded-full",
              transparent ? "bg-white/25" : "bg-ink/10",
            )}
          >
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#7a9b76,#d4688c)] transition-[width] duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </span>
        </span>
      </Link>
      <MuteButton
        className={twMerge(
          "hidden h-7 w-7 shrink-0 place-items-center rounded-full transition sm:grid",
          transparent ? "hover:bg-white/20" : "text-slate-500 hover:bg-white hover:text-ink",
        )}
        iconClassName="h-3.5 w-3.5"
      />
    </div>
  );
}

export function MuteButton({
  className,
  iconClassName,
  showLabel = false,
}: {
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
}) {
  const muted = useMuted();
  const Icon = muted ? VolumeX : Volume2;
  return (
    <button
      aria-label={showLabel ? undefined : muted ? "Unmute game sounds" : "Mute game sounds"}
      className={className}
      onClick={() => setMuted(!muted)}
      type="button"
    >
      <Icon className={iconClassName} />
      {showLabel ? <span>{muted ? "Game sounds off" : "Game sounds on"}</span> : null}
    </button>
  );
}

function useMuted() {
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    const sync = () => setMutedState(isMuted());
    sync();
    window.addEventListener(MUTE_EVENT, sync);
    return () => window.removeEventListener(MUTE_EVENT, sync);
  }, []);
  return muted;
}
