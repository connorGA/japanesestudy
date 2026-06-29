"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Flame,
  RotateCcw,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { getKatakanaAudioAssets } from "@/lib/api";
import {
  buildKatakanaQuizOptions,
  filterKatakana,
  KATAKANA_GROUPS,
  pickWeightedKatakana,
  type KatakanaCharacter,
} from "@/lib/katakana";
import type { AudioAsset } from "@/types/study";

type GameMode = "flashcards" | "quiz" | "speed";
type Feedback = "correct" | "wrong" | null;

const MASTERY_STORAGE_KEY = "japanese-study.katakana-mastery";
const HIGH_SCORE_STORAGE_KEY = "japanese-study.katakana-high-score";
const SPEED_DURATION_SECONDS = 60;

export function KatakanaFlashcardGame() {
  const [mode, setMode] = useState<GameMode>("flashcards");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["vowels", "k-row"]);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [highScore, setHighScore] = useState(0);
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [current, setCurrent] = useState<KatakanaCharacter | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [options, setOptions] = useState<KatakanaCharacter[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SPEED_DURATION_SECONDS);
  const [speedActive, setSpeedActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const pool = useMemo(
    () => filterKatakana(selectedGroups, selectedGroups.length === KATAKANA_GROUPS.length),
    [selectedGroups],
  );

  const audioByCharacter = useMemo(
    () => new Map(assets.map((asset) => [asset.text, asset])),
    [assets],
  );

  const loadNextRef = useRef<(exclude?: string) => void>(() => {});

  useEffect(() => {
    const storedMastery = window.localStorage.getItem(MASTERY_STORAGE_KEY);
    const storedHighScore = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);

    if (storedMastery) {
      try {
        setMastery(JSON.parse(storedMastery) as Record<string, number>);
      } catch {
        setMastery({});
      }
    }

    if (storedHighScore) {
      setHighScore(Number.parseInt(storedHighScore, 10) || 0);
    }
  }, []);

  useEffect(() => {
    getKatakanaAudioAssets()
      .then(setAssets)
      .catch(() => setAssets([]));
  }, []);

  const persistMastery = useCallback((next: Record<string, number>) => {
    setMastery(next);
    window.localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const loadNext = useCallback(
    (exclude?: string) => {
      if (!pool.length) {
        setCurrent(null);
        setOptions([]);
        return;
      }

      const next = pickWeightedKatakana(pool, mastery, exclude);
      setCurrent(next);
      setFlipped(false);
      setFeedback(null);
      setOptions(buildKatakanaQuizOptions(next, pool));
    },
    [mastery, pool],
  );

  loadNextRef.current = loadNext;

  useEffect(() => {
    loadNext();
  }, [loadNext, mode, selectedGroups]);

  useEffect(() => {
    if (mode !== "speed" || !speedActive) return;

    if (timeLeft <= 0) {
      setSpeedActive(false);
      if (sessionScore > highScore) {
        setHighScore(sessionScore);
        window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(sessionScore));
      }
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [highScore, mode, sessionScore, speedActive, timeLeft]);

  function toggleGroup(groupId: string) {
    setSelectedGroups((currentGroups) => {
      if (currentGroups.includes(groupId)) {
        const next = currentGroups.filter((id) => id !== groupId);
        return next.length ? next : currentGroups;
      }
      return [...currentGroups, groupId];
    });
  }

  function selectAllGroups() {
    setSelectedGroups(KATAKANA_GROUPS.map((group) => group.id));
  }

  async function playAudio(character: string) {
    const asset = audioByCharacter.get(character);
    setAudioMessage(null);

    if (!asset || asset.status === "pending") {
      setAudioMessage("Audio is still loading...");
      return;
    }

    if (asset.status === "failed" || !asset.public_url) {
      setAudioMessage("Audio unavailable for this character.");
      return;
    }

    try {
      await new Audio(asset.public_url).play();
    } catch {
      setAudioMessage("Could not play audio.");
    }
  }

  function applyAnswer(wasCorrect: boolean) {
    if (!current) return;

    const nextMastery = {
      ...mastery,
      [current.character]: Math.max(
        0,
        (mastery[current.character] ?? 0) + (wasCorrect ? 1 : -1),
      ),
    };
    persistMastery(nextMastery);

    setAnswered((value) => value + 1);
    setFeedback(wasCorrect ? "correct" : "wrong");

    if (wasCorrect) {
      const nextStreak = streak + 1;
      const bonus = Math.min(5, Math.floor(nextStreak / 3));
      const points = 10 + bonus * 5;
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setCorrectCount((value) => value + 1);
      setSessionScore((value) => value + points);

      if (nextStreak > 0 && nextStreak % 5 === 0) {
        setShowCelebration(true);
        window.setTimeout(() => setShowCelebration(false), 1200);
      }

      window.setTimeout(() => {
        loadNextRef.current(current.character);
      }, mode === "flashcards" ? 450 : 650);
    } else {
      setStreak(0);
      window.setTimeout(() => {
        loadNextRef.current(current.character);
      }, 850);
    }
  }

  function handleFlashcardGrade(knewIt: boolean) {
    applyAnswer(knewIt);
  }

  function handleQuizPick(option: KatakanaCharacter) {
    if (feedback) return;
    applyAnswer(option.reading === current?.reading);
  }

  function startSpeedRound() {
    setMode("speed");
    setSessionScore(0);
    setStreak(0);
    setAnswered(0);
    setCorrectCount(0);
    setTimeLeft(SPEED_DURATION_SECONDS);
    setSpeedActive(true);
    loadNext();
  }

  function resetSession() {
    setSessionScore(0);
    setStreak(0);
    setAnswered(0);
    setCorrectCount(0);
    setTimeLeft(SPEED_DURATION_SECONDS);
    setSpeedActive(false);
    setFeedback(null);
    loadNext();
  }

  const accuracy = answered ? Math.round((correctCount / answered) * 100) : 0;
  const masteredCount = pool.filter((item) => (mastery[item.character] ?? 0) >= 3).length;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
      {showCelebration ? <CelebrationBurst /> : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">
            Katakana Game
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Flashcard Dojo
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Flip cards, beat the quiz, or race the clock. Build streaks, earn points, and
            master every character.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill icon={Star} label="Score" value={String(sessionScore)} />
          <StatPill icon={Flame} label="Streak" value={String(streak)} accent />
          <StatPill icon={Trophy} label="Best" value={String(highScore)} />
          <StatPill icon={Sparkles} label="Mastered" value={`${masteredCount}/${pool.length}`} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <ModeButton
          active={mode === "flashcards"}
          onClick={() => {
            setSpeedActive(false);
            setMode("flashcards");
          }}
        >
          Flashcards
        </ModeButton>
        <ModeButton
          active={mode === "quiz"}
          onClick={() => {
            setSpeedActive(false);
            setMode("quiz");
          }}
        >
          Quiz
        </ModeButton>
        <ModeButton active={mode === "speed"} onClick={startSpeedRound}>
          <Timer className="mr-1.5 h-4 w-4" />
          Speed Round
        </ModeButton>
        <button
          className="ml-auto inline-flex items-center rounded-full border border-black/10 bg-washi px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
          onClick={resetSession}
          type="button"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="mt-5 rounded-3xl bg-washi p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Character sets</p>
          <button
            className="text-sm font-semibold text-matcha transition hover:text-ink"
            onClick={selectAllGroups}
            type="button"
          >
            Select all
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {KATAKANA_GROUPS.map((group) => {
            const active = selectedGroups.includes(group.id);
            return (
              <button
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "border border-black/10 bg-white text-slate-600 hover:border-matcha"
                }`}
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                type="button"
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "speed" ? (
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl border border-sakura bg-sakura/35 px-5 py-4">
          <div className="flex items-center gap-2 text-ink">
            <Zap className="h-5 w-5 text-matcha" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">
              Speed Round
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-ink">{timeLeft}s</div>
          <div className="text-sm text-slate-700">
            {speedActive
              ? "Answer as many as you can before time runs out."
              : timeLeft === 0
                ? `Time! Final score: ${sessionScore}. Best streak: ${bestStreak}.`
                : "Press Speed Round to start the timer."}
          </div>
          {!speedActive ? (
            <button
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              onClick={startSpeedRound}
              type="button"
            >
              {timeLeft === 0 ? "Play again" : "Start timer"}
            </button>
          ) : null}
        </div>
      ) : null}

      {!pool.length || !current ? (
        <p className="mt-8 text-center text-slate-600">
          Pick at least one character set to start playing.
        </p>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-6">
          <div
            className={`relative w-full max-w-xl transition duration-300 ${
              feedback === "correct"
                ? "scale-[1.02] ring-4 ring-green-200"
                : feedback === "wrong"
                  ? "animate-[shake_0.45s_ease-in-out] ring-4 ring-red-200"
                  : ""
            }`}
          >
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-gradient-to-br from-washi via-white to-sakura/30 p-8 shadow-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sakura/50 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-matcha/15 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">
                    {mode === "flashcards" && !flipped
                      ? "What is this?"
                      : mode === "flashcards"
                        ? "Reading"
                        : "Pick the reading"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-slate-600">
                      Mastery {mastery[current.character] ?? 0}
                    </span>
                    <button
                      aria-label={`Play ${current.character}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:bg-matcha"
                      onClick={() => void playAudio(current.character)}
                      type="button"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {mode === "flashcards" ? (
                  <button
                    className="group flex min-h-[16rem] w-full flex-col items-center justify-center rounded-[1.75rem] bg-white/70 p-8 transition hover:bg-white"
                    onClick={() => setFlipped((value) => !value)}
                    type="button"
                  >
                    <p className="text-[7rem] font-bold leading-none text-ink transition group-hover:scale-105">
                      {current.character}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-slate-500">
                      {flipped ? current.reading : "Tap to reveal romaji"}
                    </p>
                    {flipped ? (
                      <p className="mt-2 text-3xl font-semibold text-matcha">{current.reading}</p>
                    ) : null}
                  </button>
                ) : (
                  <>
                    <p className="text-[7rem] font-bold leading-none text-ink">{current.character}</p>
                    <div className="grid w-full grid-cols-2 gap-3">
                      {options.map((option) => {
                        const isCorrect = option.reading === current.reading;
                        const isSelected = feedback && isCorrect;
                        const isWrongPick =
                          feedback === "wrong" && option.reading !== current.reading;

                        return (
                          <button
                            className={`rounded-2xl px-4 py-4 text-lg font-semibold transition ${
                              isSelected
                                ? "bg-green-100 text-green-800 ring-2 ring-green-300"
                                : isWrongPick
                                  ? "bg-red-50 text-red-700"
                                  : "bg-white/85 text-ink hover:bg-white hover:ring-2 hover:ring-matcha/40"
                            }`}
                            disabled={Boolean(feedback) || (mode === "speed" && !speedActive)}
                            key={`${option.character}-${option.reading}`}
                            onClick={() => handleQuizPick(option)}
                            type="button"
                          >
                            {option.reading}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {audioMessage ? (
                  <p className="text-sm text-red-600">{audioMessage}</p>
                ) : null}

                {feedback ? (
                  <p
                    className={`text-lg font-semibold ${
                      feedback === "correct" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {feedback === "correct"
                      ? streak >= 3
                        ? `Nice! ${streak} in a row — keep the combo going!`
                        : "Correct!"
                      : `Not quite — it is "${current.reading}".`}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {mode === "flashcards" && flipped && !feedback ? (
            <div className="flex gap-3">
              <GradeButton
                icon={X}
                label="Still learning"
                tone="wrong"
                onClick={() => handleFlashcardGrade(false)}
              />
              <GradeButton
                icon={Check}
                label="Got it!"
                tone="correct"
                onClick={() => handleFlashcardGrade(true)}
              />
            </div>
          ) : null}

          <div className="grid w-full max-w-xl grid-cols-3 gap-3 text-center">
            <MiniStat label="Answered" value={String(answered)} />
            <MiniStat label="Accuracy" value={`${accuracy}%`} />
            <MiniStat label="Best streak" value={String(bestStreak)} />
          </div>
        </div>
      )}
    </section>
  );
}

function ModeButton({
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

function StatPill({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        accent ? "bg-sakura/70" : "bg-washi"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-washi px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function GradeButton({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  tone: "correct" | "wrong";
  onClick: () => void;
}) {
  const styles =
    tone === "correct"
      ? "bg-green-100 text-green-700 hover:bg-green-200"
      : "bg-red-100 text-red-700 hover:bg-red-200";

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${styles}`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function CelebrationBurst() {
  const petals = Array.from({ length: 14 }, (_, index) => index);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {petals.map((petal) => (
        <span
          className="absolute h-3 w-3 rounded-full bg-sakura"
          key={petal}
          style={{
            left: `${8 + petal * 6}%`,
            top: "18%",
            animation: `fall-${petal % 3} 1.1s ease-out forwards`,
            animationDelay: `${petal * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}
