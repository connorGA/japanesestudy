"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  X,
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

type Round = {
  target: Kana;
  faces: Kana[];
};

type Feedback = {
  correct: boolean;
  target: Kana;
  chosen: Kana | null;
  gained: number;
  isLast: boolean;
};

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

const FACE_COUNT = 4;
const ROUNDS_PER_RUN = 10;
const STARTING_LIVES = 3;
const ROUND_SECONDS = 12;
const BEST_SCORE_KEY = "japanese-study.kana-cube.best";

/** Faces 0-3 wrap around the cube's vertical axis; 4 and 5 are the decorative lid and base. */
const FACE_TRANSFORMS = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(-90deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildRound(pool: Kana[]): Round {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const sameRow = shuffle(pool.filter((k) => k.row === target.row && k.char !== target.char));
  const otherRows = shuffle(pool.filter((k) => k.row !== target.row && k.char !== target.char));

  // Lead with same-row neighbours so the distractors stay genuinely confusable.
  const distractors = [...sameRow, ...otherRows].slice(0, FACE_COUNT - 1);
  return { target, faces: shuffle([target, ...distractors]) };
}

/**
 * Integer-only hash so server and client agree bit for bit. Math.sin is not
 * guaranteed identical across engines, which shows up as a hydration mismatch.
 */
function seeded(index: number, salt: number): number {
  let hash = (index * 374761393 + salt * 668265263) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 0;
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

/** Short, stable decimals keep the serialized CSS identical on both sides. */
function roundTo(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

export function KanaCubeGame() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [setId, setSetId] = useState("basics");
  const [timed, setTimed] = useState(true);

  const [round, setRound] = useState<Round | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<Kana[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [bestScore, setBestScore] = useState(0);

  const [yaw, setYaw] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [audioByChar, setAudioByChar] = useState<Map<string, AudioAsset>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startYaw: number } | null>(null);
  const timeLeftRef = useRef(ROUND_SECONDS);

  const pool = useMemo(() => {
    const active = KANA_SETS.find((item) => item.id === setId) ?? KANA_SETS[0];
    return KANA.filter((kana) => active.rows.includes(kana.row));
  }, [setId]);

  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        left: roundTo(seeded(index, 1) * 100, 2),
        delay: roundTo(seeded(index, 2) * 9, 2),
        duration: roundTo(8 + seeded(index, 3) * 7, 2),
        size: roundTo(7 + seeded(index, 4) * 8, 1),
        drift: roundTo((seeded(index, 5) * 2 - 1) * 4, 2),
        depth: roundTo(-180 + seeded(index, 6) * 240, 1),
      })),
    [],
  );

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

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
        // The game stays fully playable without pronunciation audio.
      });

    return () => {
      active = false;
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

  const activeFace = ((Math.round(-yaw / 90) % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;
  const frontKana = round?.faces[activeFace] ?? null;

  const startRound = useCallback(() => {
    setRound(buildRound(pool));
    setYaw(0);
    setTimeLeft(ROUND_SECONDS);
    setFeedback(null);
    setRoundNumber((value) => value + 1);
  }, [pool]);

  function startRun() {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(STARTING_LIVES);
    setCorrectCount(0);
    setMissed([]);
    setRoundNumber(0);
    setPhase("playing");
    startRound();
  }

  const finishRound = useCallback(
    (chosen: Kana | null) => {
      if (!round) return;

      const correct = chosen?.char === round.target.char;
      const timeBonus = timed && correct ? Math.round(timeLeftRef.current * 8) : 0;
      const comboBonus = correct ? combo * 25 : 0;
      const gained = correct ? 100 + timeBonus + comboBonus : 0;
      const isLast = roundNumber >= ROUNDS_PER_RUN || (!correct && lives <= 1);

      if (correct) {
        recordStudyActivity("japanese", "arcade_correct", "kana_cube", {
          character: round.target.char,
        });
        setScore((value) => value + gained);
        setCorrectCount((value) => value + 1);
        setCombo((value) => {
          const next = value + 1;
          setBestCombo((best) => Math.max(best, next));
          return next;
        });
      } else {
        setCombo(0);
        setLives((value) => Math.max(0, value - 1));
        setMissed((value) => [...value, round.target]);
      }

      playKana(round.target.char);
      setFeedback({ correct, target: round.target, chosen, gained, isLast });
    },
    [round, timed, combo, lives, roundNumber, playKana],
  );

  // Countdown for the current round.
  useEffect(() => {
    if (phase !== "playing" || feedback || !timed || !round) return;

    const id = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, Number((value - 0.1).toFixed(1))));
    }, 100);

    return () => window.clearInterval(id);
  }, [phase, feedback, timed, round]);

  // Running out of time counts as a miss.
  useEffect(() => {
    if (phase !== "playing" || feedback || !timed || timeLeft > 0) return;
    finishRound(null);
  }, [phase, feedback, timed, timeLeft, finishRound]);

  // Hold the result on screen, then move on.
  useEffect(() => {
    if (!feedback) return;

    const id = window.setTimeout(
      () => {
        if (feedback.isLast) {
          setPhase("gameover");
          setFeedback(null);
          setRound(null);
        } else {
          startRound();
        }
      },
      feedback.correct ? 1000 : 1750,
    );

    return () => window.clearTimeout(id);
  }, [feedback, startRound]);

  useEffect(() => {
    if (phase !== "gameover") return;

    setBestScore((current) => {
      if (score <= current) return current;
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
      return score;
    });
  }, [phase, score]);

  // Keyboard controls mirror the on-screen rotate and lock-in buttons.
  useEffect(() => {
    if (phase !== "playing") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setYaw((value) => Math.round(value / 90) * 90 + 90);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setYaw((value) => Math.round(value / 90) * 90 - 90);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!feedback && frontKana) finishRound(frontKana);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, feedback, frontKana, finishRound]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (feedback) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startYaw: yaw };
    setIsDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setYaw(drag.startYaw + (event.clientX - drag.startX) * 0.55);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    setYaw((value) => Math.round(value / 90) * 90);
  }

  const accuracy = roundNumber > 0 ? Math.round((correctCount / roundNumber) * 100) : 0;
  const activeSet = KANA_SETS.find((item) => item.id === setId) ?? KANA_SETS[0];

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      {phase === "playing" ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <Stat icon={Trophy} label="Score" value={score.toLocaleString()} />
          <Stat icon={Sparkles} label="Combo" value={combo > 0 ? `${combo}×` : "—"} />
          <Stat
            icon={Heart}
            label="Lives"
            value={"♥".repeat(lives) + "♡".repeat(STARTING_LIVES - lives)}
          />
          <Stat icon={Timer} label="Round" value={`${roundNumber} / ${ROUNDS_PER_RUN}`} />
        </div>
      ) : null}

      <div
        className="relative isolate overflow-hidden rounded-[2rem] border border-black/10 bg-gradient-to-b from-[#fce7ec] via-[#fff5ec] to-[#eef3e6] shadow-sm"
        style={{ perspective: "900px", perspectiveOrigin: "50% 42%" }}
      >
        <Scenery petals={petals} />

        <div className="relative z-10 flex min-h-[26rem] flex-col items-center justify-between gap-5 px-4 py-6 sm:min-h-[30rem] sm:gap-6 sm:px-6 sm:py-8">
          {phase === "playing" && round ? (
            <>
              <div className="text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-matcha">
                  Spin to find
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                  {round.target.romaji}
                </p>
                {timed ? (
                  <div className="mx-auto mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-ink/10 sm:w-44">
                    <div
                      className={twMerge(
                        "h-full rounded-full transition-[width] duration-100 ease-linear",
                        timeLeft < 4 ? "bg-[#c8434b]" : "bg-matcha",
                      )}
                      style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
                    />
                  </div>
                ) : null}
              </div>

              <Cube
                activeFace={activeFace}
                faces={round.faces}
                feedback={feedback}
                isDragging={isDragging}
                onPointerCancel={onPointerUp}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                yaw={yaw}
              />

              <div className="flex w-full max-w-sm items-center justify-center gap-2.5 sm:gap-3">
                <RotateButton
                  direction="left"
                  disabled={Boolean(feedback)}
                  onClick={() => setYaw((value) => Math.round(value / 90) * 90 + 90)}
                />
                <button
                  className="flex-1 rounded-full bg-ink px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-ink/90 disabled:opacity-40 sm:text-base"
                  disabled={Boolean(feedback) || !frontKana}
                  onClick={() => frontKana && finishRound(frontKana)}
                  type="button"
                >
                  Lock in {frontKana ? frontKana.char : ""}
                </button>
                <RotateButton
                  direction="right"
                  disabled={Boolean(feedback)}
                  onClick={() => setYaw((value) => Math.round(value / 90) * 90 - 90)}
                />
              </div>
            </>
          ) : null}

          {phase === "menu" ? (
            <MenuCard
              activeSetId={setId}
              onSelectSet={setSetId}
              onStart={startRun}
              onToggleTimed={() => setTimed((value) => !value)}
              poolSize={pool.length}
              timed={timed}
            />
          ) : null}

          {phase === "gameover" ? (
            <GameOverCard
              accuracy={accuracy}
              bestCombo={bestCombo}
              bestScore={bestScore}
              missed={missed}
              onPlayAgain={startRun}
              onPlayKana={playKana}
              onReturnToMenu={() => setPhase("menu")}
              score={score}
              setLabel={activeSet.label}
            />
          ) : null}
        </div>

        {feedback ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
            <div
              className={twMerge(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg",
                feedback.correct ? "bg-matcha" : "bg-[#c8434b]",
              )}
            >
              {feedback.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {feedback.correct
                ? `+${feedback.gained}`
                : `${feedback.target.romaji} is ${feedback.target.char}`}
            </div>
          </div>
        ) : null}
      </div>

      {phase === "playing" ? (
        <p className="text-center text-xs text-slate-500">
          Swipe the cube or use the arrow keys, then lock in your answer.
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5 text-matcha" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function RotateButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={direction === "left" ? "Rotate cube left" : "Rotate cube right"}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/10 bg-white/85 text-ink shadow-sm transition hover:bg-white disabled:opacity-40 sm:h-14 sm:w-14"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function Cube({
  activeFace,
  faces,
  feedback,
  isDragging,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  yaw,
}: {
  activeFace: number;
  faces: Kana[];
  feedback: Feedback | null;
  isDragging: boolean;
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  yaw: number;
}) {
  const size = "clamp(8.5rem, 40vw, 13rem)";

  return (
    <div
      className={twMerge(
        "touch-pan-y select-none",
        feedback?.correct === false && "kana-shake",
        !isDragging && !feedback && "kana-float",
      )}
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ width: size, height: size, cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        className={twMerge(
          "relative h-full w-full",
          !isDragging && "transition-transform duration-500 ease-out",
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(-14deg) rotateY(${yaw}deg)`,
        }}
      >
        {FACE_TRANSFORMS.map((transform, index) => {
          const kana = faces[index];
          const isFront = index === activeFace;
          const isDecorative = index >= FACE_COUNT;
          const showCorrect = feedback && kana?.char === feedback.target.char;
          const showWrong = feedback && !feedback.correct && isFront && !showCorrect;

          return (
            <div
              className={twMerge(
                "absolute inset-0 grid place-items-center rounded-[1.25rem] border-2 shadow-lg",
                isDecorative
                  ? "kana-seigaiha border-matcha/25 bg-washi"
                  : "border-ink/10 bg-gradient-to-br from-white via-washi to-sakura/45",
                !isDecorative && isFront && !feedback && "border-matcha/70",
                showCorrect && "border-matcha bg-matcha/25",
                showWrong && "border-[#c8434b] bg-[#c8434b]/15",
              )}
              key={transform}
              style={{
                transform: `${transform} translateZ(calc(${size} / 2))`,
                backfaceVisibility: "hidden",
              }}
            >
              {isDecorative ? (
                <span className="text-2xl font-bold text-matcha/45">仮</span>
              ) : (
                <span className="text-[clamp(3rem,15vw,5rem)] font-bold leading-none text-ink">
                  {kana?.char}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MenuCard({
  activeSetId,
  onSelectSet,
  onStart,
  onToggleTimed,
  poolSize,
  timed,
}: {
  activeSetId: string;
  onSelectSet: (id: string) => void;
  onStart: () => void;
  onToggleTimed: () => void;
  poolSize: number;
  timed: boolean;
}) {
  return (
    <div className="my-auto w-full max-w-md rounded-[1.75rem] border border-black/10 bg-white/85 p-5 text-center shadow-lg backdrop-blur sm:p-6">
      <p className="text-3xl font-bold text-ink">かなキューブ</p>
      <p className="mt-1 text-sm text-slate-600">
        Spin the cube to the hiragana that matches the romaji.
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

      <button
        className={twMerge(
          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition",
          timed
            ? "border-ink/15 bg-washi text-ink hover:bg-white"
            : "border-black/10 bg-white text-slate-500 hover:text-ink",
        )}
        onClick={onToggleTimed}
        type="button"
      >
        <Timer className="h-4 w-4" />
        {timed ? `Timed · ${ROUND_SECONDS}s per round` : "Relaxed · no timer"}
      </button>

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
    <div className="my-auto w-full max-w-md rounded-[1.75rem] border border-black/10 bg-white/85 p-5 text-center shadow-lg backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">
        {setLabel} run complete
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

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-washi px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Accuracy
          </p>
          <p className="text-lg font-bold tabular-nums text-ink">{accuracy}%</p>
        </div>
        <div className="rounded-2xl bg-washi px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Best combo
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
        <p className="mt-4 text-sm font-semibold text-matcha">Perfect run. Nothing to review.</p>
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

function Scenery({
  petals,
}: {
  petals: { left: number; delay: number; duration: number; size: number; drift: number; depth: number }[];
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#f7b9c6] to-[#ef94ab] opacity-60 blur-[2px] sm:h-40 sm:w-40" />

      <div
        className="absolute bottom-16 left-1/2 h-32 w-[26rem] -translate-x-1/2 bg-[#cdd8c6] opacity-70 sm:h-40 sm:w-[34rem]"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />
      <div
        className="absolute bottom-16 left-1/2 h-10 w-[26rem] -translate-x-1/2 bg-white/80 sm:h-12 sm:w-[34rem]"
        style={{ clipPath: "polygon(50% 0%, 62% 38%, 38% 38%)" }}
      />

      <Torii />

      <div className="kana-seigaiha absolute inset-x-0 bottom-0 h-16 opacity-70" />

      {petals.map((petal, index) => (
        <span
          className="kana-petal absolute top-0 rounded-[100%_0_100%_0] bg-[#f3a9bd]/70"
          key={index}
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            transform: `translateZ(${petal.depth}px)`,
            ["--petal-drift" as string]: `${petal.drift}rem`,
          }}
        />
      ))}
    </div>
  );
}

function Torii() {
  return (
    <div className="absolute bottom-16 left-1/2 h-28 w-40 -translate-x-1/2 opacity-30 sm:h-36 sm:w-52">
      <div className="absolute left-1/2 top-0 h-2.5 w-full -translate-x-1/2 rounded-sm bg-[#c8434b]" />
      <div className="absolute left-1/2 top-5 h-1.5 w-[86%] -translate-x-1/2 rounded-sm bg-[#c8434b]" />
      <div className="absolute bottom-0 left-[16%] top-2 w-2.5 rounded-sm bg-[#c8434b]" />
      <div className="absolute bottom-0 right-[16%] top-2 w-2.5 rounded-sm bg-[#c8434b]" />
    </div>
  );
}
