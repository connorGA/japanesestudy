"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MousePointerClick,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { getHiraganaAudioAssets } from "@/lib/api";
import { detachAudio, playAudioElement, replaceAudio } from "@/lib/audioPlayback";
import { recordStudyActivity } from "@/lib/progress";
import type { AudioAsset } from "@/types/study";

type RowId = "vowel" | "k" | "s" | "t" | "n" | "h" | "m" | "y" | "r" | "w";

type Kana = {
  char: string;
  romaji: string;
  row: RowId;
};

type Phase = "menu" | "playing" | "gameover";

const KANA: Kana[] = [
  { char: "あ", romaji: "a", row: "vowel" },
  { char: "い", romaji: "i", row: "vowel" },
  { char: "う", romaji: "u", row: "vowel" },
  { char: "え", romaji: "e", row: "vowel" },
  { char: "お", romaji: "o", row: "vowel" },
  { char: "か", romaji: "ka", row: "k" },
  { char: "き", romaji: "ki", row: "k" },
  { char: "く", romaji: "ku", row: "k" },
  { char: "け", romaji: "ke", row: "k" },
  { char: "こ", romaji: "ko", row: "k" },
  { char: "さ", romaji: "sa", row: "s" },
  { char: "し", romaji: "shi", row: "s" },
  { char: "す", romaji: "su", row: "s" },
  { char: "せ", romaji: "se", row: "s" },
  { char: "そ", romaji: "so", row: "s" },
  { char: "た", romaji: "ta", row: "t" },
  { char: "ち", romaji: "chi", row: "t" },
  { char: "つ", romaji: "tsu", row: "t" },
  { char: "て", romaji: "te", row: "t" },
  { char: "と", romaji: "to", row: "t" },
  { char: "な", romaji: "na", row: "n" },
  { char: "に", romaji: "ni", row: "n" },
  { char: "ぬ", romaji: "nu", row: "n" },
  { char: "ね", romaji: "ne", row: "n" },
  { char: "の", romaji: "no", row: "n" },
  { char: "は", romaji: "ha", row: "h" },
  { char: "ひ", romaji: "hi", row: "h" },
  { char: "ふ", romaji: "fu", row: "h" },
  { char: "へ", romaji: "he", row: "h" },
  { char: "ほ", romaji: "ho", row: "h" },
  { char: "ま", romaji: "ma", row: "m" },
  { char: "み", romaji: "mi", row: "m" },
  { char: "む", romaji: "mu", row: "m" },
  { char: "め", romaji: "me", row: "m" },
  { char: "も", romaji: "mo", row: "m" },
  { char: "や", romaji: "ya", row: "y" },
  { char: "ゆ", romaji: "yu", row: "y" },
  { char: "よ", romaji: "yo", row: "y" },
  { char: "ら", romaji: "ra", row: "r" },
  { char: "り", romaji: "ri", row: "r" },
  { char: "る", romaji: "ru", row: "r" },
  { char: "れ", romaji: "re", row: "r" },
  { char: "ろ", romaji: "ro", row: "r" },
  { char: "わ", romaji: "wa", row: "w" },
  { char: "を", romaji: "wo", row: "w" },
  { char: "ん", romaji: "n", row: "w" },
];

const KANA_SETS: { id: string; label: string; japanese: string; rows: RowId[] }[] = [
  { id: "basics", label: "Basics", japanese: "基本", rows: ["vowel", "k", "s"] },
  { id: "middle", label: "Middle", japanese: "中級", rows: ["t", "n", "h", "m"] },
  { id: "advanced", label: "Advanced", japanese: "上級", rows: ["y", "r", "w"] },
  {
    id: "all",
    label: "Everything",
    japanese: "全部",
    rows: ["vowel", "k", "s", "t", "n", "h", "m", "y", "r", "w"],
  },
];

const CHOICE_COUNT = 4;
const RUN_SECONDS = 60;
const BEST_SCORE_KEY = "japanese-study.hiragana-rush.best";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildChoices(pool: Kana[], target: Kana): Kana[] {
  const sameRow = shuffle(pool.filter((k) => k.row === target.row && k.char !== target.char));
  const others = shuffle(pool.filter((k) => k.row !== target.row && k.char !== target.char));
  const distractors = [...sameRow, ...others].slice(0, CHOICE_COUNT - 1);
  return shuffle([target, ...distractors]);
}

export function HiraganaRushGame() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [setId, setSetId] = useState("basics");
  const [target, setTarget] = useState<Kana | null>(null);
  const [choices, setChoices] = useState<Kana[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RUN_SECONDS);
  const [bestScore, setBestScore] = useState(0);
  const [feedbackChar, setFeedbackChar] = useState<string | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<"correct" | "wrong" | null>(null);
  const [missed, setMissed] = useState<Kana[]>([]);
  const [audioByChar, setAudioByChar] = useState<Map<string, AudioAsset>>(new Map());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lockRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);

  const pool = useMemo(() => {
    const active = KANA_SETS.find((item) => item.id === setId) ?? KANA_SETS[0];
    return KANA.filter((kana) => active.rows.includes(kana.row));
  }, [setId]);

  const activeSet = KANA_SETS.find((item) => item.id === setId) ?? KANA_SETS[0];

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0);
    if (Number.isFinite(stored)) setBestScore(stored);
  }, []);

  useEffect(() => {
    let active = true;
    getHiraganaAudioAssets()
      .then((assets) => {
        if (active) setAudioByChar(new Map(assets.map((asset) => [asset.text, asset])));
      })
      .catch(() => {
        // Playable without audio.
      });
    return () => {
      active = false;
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      detachAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  const playKana = useCallback(
    (char: string) => {
      const asset = audioByChar.get(char);
      if (!asset?.public_url || asset.status !== "ready") return;
      const audio = replaceAudio(audioRef.current, asset.public_url);
      audioRef.current = audio;
      void playAudioElement(audio);
    },
    [audioByChar],
  );

  const nextPrompt = useCallback(() => {
    const next = pool[Math.floor(Math.random() * pool.length)];
    setTarget(next);
    setChoices(buildChoices(pool, next));
    setFeedbackChar(null);
    setFeedbackKind(null);
    lockRef.current = false;
  }, [pool]);

  function startRun() {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setMissCount(0);
    setMissed([]);
    setSecondsLeft(RUN_SECONDS);
    setPhase("playing");
    nextPrompt();
  }

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || secondsLeft > 0) return;
    setPhase("gameover");
    setTarget(null);
    setChoices([]);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "gameover") return;
    setBestScore((current) => {
      if (score <= current) return current;
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
      return score;
    });
  }, [phase, score]);

  function onPick(choice: Kana) {
    if (phase !== "playing" || !target || lockRef.current) return;

    if (choice.char === target.char) {
      lockRef.current = true;
      const nextCombo = combo + 1;
      const gained = 100 + Math.min(combo, 8) * 25;
      setScore((value) => value + gained);
      setCorrectCount((value) => value + 1);
      setCombo(nextCombo);
      setBestCombo((best) => Math.max(best, nextCombo));
      setFeedbackChar(choice.char);
      setFeedbackKind("correct");
      recordStudyActivity("japanese", "arcade_correct", "hiragana_rush", {
        character: target.char,
      });
      playKana(target.char);
      feedbackTimerRef.current = window.setTimeout(() => nextPrompt(), 220);
      return;
    }

    setMissCount((value) => value + 1);
    setCombo(0);
    setMissed((items) => [...items, target]);
    setFeedbackChar(choice.char);
    setFeedbackKind("wrong");
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackChar(null);
      setFeedbackKind(null);
    }, 280);
  }

  const accuracy =
    correctCount + missCount > 0
      ? Math.round((correctCount / (correctCount + missCount)) * 100)
      : 0;

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      {phase === "playing" ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <Stat icon={Trophy} label="Score" value={score.toLocaleString()} />
          <Stat icon={Zap} label="Combo" value={combo > 0 ? `${combo}×` : "—"} />
          <Stat icon={Sparkles} label="Hits" value={String(correctCount)} />
          <Stat
            icon={Timer}
            label="Time"
            value={`${secondsLeft}s`}
            alert={secondsLeft <= 10}
          />
        </div>
      ) : null}

      <div className="relative isolate overflow-hidden rounded-[2rem] border border-black/10 bg-gradient-to-b from-[#fce7ec] via-[#fff7f0] to-[#eef3e6] shadow-sm">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#f7b9c6] to-[#ef94ab] opacity-50 blur-[1px]" />
          <div className="kana-seigaiha absolute inset-x-0 bottom-0 h-14 opacity-60" />
        </div>

        <div className="relative z-10 flex min-h-[28rem] flex-col px-4 py-6 sm:min-h-[30rem] sm:px-6 sm:py-8">
          {phase === "menu" ? (
            <MenuCard
              activeSetId={setId}
              onSelectSet={setSetId}
              onStart={startRun}
              poolSize={pool.length}
            />
          ) : null}

          {phase === "playing" && target ? (
            <div className="flex flex-1 flex-col">
              <div className="text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-matcha">
                  Tap the kana for
                </p>
                <p className="mt-1 text-5xl font-bold tracking-tight text-ink sm:text-6xl">
                  {target.romaji}
                </p>
                <div className="mx-auto mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-ink/10 sm:w-52">
                  <div
                    className={twMerge(
                      "h-full rounded-full transition-[width] duration-1000 ease-linear",
                      secondsLeft <= 10 ? "bg-[#c8434b]" : "bg-matcha",
                    )}
                    style={{ width: `${(secondsLeft / RUN_SECONDS) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mx-auto mt-6 grid w-full max-w-md flex-1 grid-cols-2 content-center gap-3 sm:mt-8 sm:gap-4">
                {choices.map((choice) => {
                  const isCorrect = feedbackKind === "correct" && feedbackChar === choice.char;
                  const isWrong = feedbackKind === "wrong" && feedbackChar === choice.char;
                  return (
                    <button
                      className={twMerge(
                        "flex aspect-square min-h-[6.5rem] items-center justify-center rounded-[1.5rem] border-2 bg-white/90 text-5xl font-bold text-ink shadow-sm transition active:scale-[0.97] sm:min-h-[7.5rem] sm:text-6xl",
                        isCorrect && "border-matcha bg-matcha/20 text-matcha",
                        isWrong && "animate-pulse border-[#c8434b] bg-[#c8434b]/15 text-[#c8434b]",
                        !isCorrect && !isWrong && "border-black/10 hover:border-matcha/50 hover:bg-white",
                      )}
                      key={`${target.char}-${choice.char}`}
                      onClick={() => onPick(choice)}
                      type="button"
                    >
                      {choice.char}
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-xs text-slate-500">
                Wrong taps reset your combo — keep going until time runs out.
              </p>
            </div>
          ) : null}

          {phase === "gameover" ? (
            <GameOverCard
              accuracy={accuracy}
              bestCombo={bestCombo}
              bestScore={bestScore}
              correctCount={correctCount}
              missed={missed}
              onPlayAgain={startRun}
              onPlayKana={playKana}
              onReturnToMenu={() => setPhase("menu")}
              score={score}
              setLabel={activeSet.label}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  alert = false,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <Icon className={twMerge("h-3.5 w-3.5", alert ? "text-[#c8434b]" : "text-matcha")} />
        {label}
      </p>
      <p
        className={twMerge(
          "mt-0.5 truncate text-lg font-bold tabular-nums",
          alert ? "text-[#c8434b]" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MenuCard({
  activeSetId,
  onSelectSet,
  onStart,
  poolSize,
}: {
  activeSetId: string;
  onSelectSet: (id: string) => void;
  onStart: () => void;
  poolSize: number;
}) {
  return (
    <div className="my-auto w-full max-w-md self-center rounded-[1.75rem] border border-black/10 bg-white/85 p-5 text-center shadow-lg backdrop-blur sm:p-6">
      <p className="text-3xl font-bold text-ink">かなラッシュ</p>
      <p className="mt-1 text-sm text-slate-600">
        A reading appears — tap the matching hiragana as fast as you can.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {KANA_SETS.map((item) => (
          <button
            className={twMerge(
              "rounded-2xl border px-3 py-2.5 text-left transition",
              item.id === activeSetId
                ? "border-matcha bg-matcha text-white shadow-sm"
                : "border-black/10 bg-washi text-ink hover:border-matcha/40 hover:bg-white",
            )}
            key={item.id}
            onClick={() => onSelectSet(item.id)}
            type="button"
          >
            <span className="block text-sm font-bold">{item.japanese}</span>
            <span
              className={twMerge(
                "block text-xs",
                item.id === activeSetId ? "text-white/80" : "text-slate-500",
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Timer className="h-3.5 w-3.5 text-matcha" />
        {RUN_SECONDS}s rush · big tap targets
      </p>

      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-ink/90 sm:text-base"
        onClick={onStart}
        type="button"
      >
        <Play className="h-4 w-4" />
        Start · {poolSize} kana
      </button>
    </div>
  );
}

function GameOverCard({
  accuracy,
  bestCombo,
  bestScore,
  correctCount,
  missed,
  onPlayAgain,
  onPlayKana,
  onReturnToMenu,
  score,
  setLabel,
}: {
  accuracy: number;
  bestCombo: number;
  bestScore: number;
  correctCount: number;
  missed: Kana[];
  onPlayAgain: () => void;
  onPlayKana: (char: string) => void;
  onReturnToMenu: () => void;
  score: number;
  setLabel: string;
}) {
  const uniqueMissed = Array.from(new Map(missed.map((kana) => [kana.char, kana])).values());
  const isRecord = score >= bestScore && score > 0;

  return (
    <div className="my-auto w-full max-w-md self-center rounded-[1.75rem] border border-black/10 bg-white/85 p-5 text-center shadow-lg backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">
        {setLabel} rush complete
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-ink sm:text-5xl">
        {score.toLocaleString()}
      </p>
      {isRecord ? (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-matcha">
          <Trophy className="h-4 w-4" />
          New best score
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Best {bestScore.toLocaleString()}</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-washi px-2 py-2.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Hits
          </p>
          <p className="text-lg font-bold tabular-nums text-ink">{correctCount}</p>
        </div>
        <div className="rounded-2xl bg-washi px-2 py-2.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Accuracy
          </p>
          <p className="text-lg font-bold tabular-nums text-ink">{accuracy}%</p>
        </div>
        <div className="rounded-2xl bg-washi px-2 py-2.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Combo
          </p>
          <p className="text-lg font-bold tabular-nums text-ink">{bestCombo}×</p>
        </div>
      </div>

      {uniqueMissed.length > 0 ? (
        <div className="mt-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Review these
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueMissed.map((kana) => (
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-washi px-3 py-1.5 transition hover:border-matcha/40 hover:bg-white"
                key={kana.char}
                onClick={() => onPlayKana(kana.char)}
                type="button"
              >
                <span className="text-lg font-bold leading-none text-ink">{kana.char}</span>
                <span className="text-xs text-slate-500">{kana.romaji}</span>
                <Volume2 className="h-3.5 w-3.5 text-matcha" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-matcha">
          <MousePointerClick className="h-4 w-4" />
          Clean run — nothing to review.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink/90"
          onClick={onPlayAgain}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Play again
        </button>
        <button
          className="inline-flex flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-washi"
          onClick={onReturnToMenu}
          type="button"
        >
          Change set
        </button>
      </div>
    </div>
  );
}
