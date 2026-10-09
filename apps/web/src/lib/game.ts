import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CARD_THEMES,
  GARDEN_STAGES,
  RANKS,
  TIERS,
  type CardTheme,
  type CardThemeId,
  type GardenStage,
  type MasteryStage,
  type Rank,
} from "@/lib/gameRewards";
import type { StudyActivity } from "@/lib/api";

export type CardMastery = {
  stage: MasteryStage;
  promotedAt: number;
  seenAt: number;
  lapses: number;
  correct: number;
};

export type GameState = {
  xp: number;
  mastery: Record<string, CardMastery>;
  theme: CardThemeId;
};

export type GameFeedback =
  | { kind: "xp"; amount: number; multiplier: number; correct: boolean }
  | { kind: "combo"; combo: number; multiplier: number }
  | { kind: "tier"; label: string; stage: MasteryStage }
  | { kind: "level"; level: number; rank: Rank | null; themes: CardTheme[] }
  | { kind: "garden"; stage: GardenStage };

export const GAME_STATE_EVENT = "japanese-game-state";
export const GAME_FEEDBACK_EVENT = "japanese-game-feedback";

const STORAGE_KEY = "japanese-study.game.v1";
const LEGACY_SCORE_KEY = "japanese-study.flashcard-scores";
const LEGACY_SECTIONS = ["vocabulary", "hiragana", "katakana", "kanji"];

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
// Indexed by the card's current stage: the wait before it can climb to the next one.
const PROMOTION_GAPS = [0, 20 * MINUTE, DAY, 3 * DAY, 7 * DAY];
const OVERDUE_GRACE = DAY;
const MAX_STAGE: MasteryStage = 5;

const COMBO_STEPS = [
  { combo: 20, multiplier: 3 },
  { combo: 10, multiplier: 2 },
  { combo: 5, multiplier: 1.5 },
];
const TIER_UP_BONUS = [0, 25, 50, 100, 200, 500];
const FLASHCARD_XP = { fresh: 30, repeat: 10, miss: 5, dueBonus: 20, firstCorrectBonus: 20 };
const FLASHCARD_ACTIVITIES: readonly StudyActivity[] = ["flashcard_mastered", "flashcard_retry"];

const DEFAULT_STATE: GameState = { xp: 0, mastery: {}, theme: "sakura" };

let cachedState: GameState | null = null;

export function readGame(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  if (cachedState) return cachedState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      cachedState = {
        xp: parsed.xp ?? 0,
        mastery: parsed.mastery ?? {},
        theme: parsed.theme ?? "sakura",
      };
      return cachedState;
    } catch {
      // Fall through and rebuild from legacy flashcard scores.
    }
  }

  cachedState = migrateLegacyScores();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState));
  return cachedState;
}

function migrateLegacyScores(): GameState {
  const now = Date.now();
  const mastery: Record<string, CardMastery> = {};
  for (const section of LEGACY_SECTIONS) {
    try {
      const scores = JSON.parse(
        window.localStorage.getItem(`${LEGACY_SCORE_KEY}.${section}`) ?? "{}",
      ) as Record<string, number>;
      for (const [cardId, score] of Object.entries(scores)) {
        if (score <= 0) continue;
        mastery[cardId] = {
          stage: score >= 3 ? 2 : 1,
          promotedAt: now,
          seenAt: now,
          lapses: 0,
          correct: score,
        };
      }
    } catch {
      // Ignore unreadable legacy data.
    }
  }
  return { ...DEFAULT_STATE, mastery };
}

function commit(next: GameState, feedback: GameFeedback[] = []) {
  const previous = readGame();
  cachedState = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  // Garden goes first so a level-up dispatched right after can fold it into its modal.
  const stageBefore = gardenStageIndex(previous);
  const stageAfter = gardenStageIndex(next);
  if (stageAfter > stageBefore) {
    feedback.push({ kind: "garden", stage: GARDEN_STAGES[stageAfter] });
  }

  const before = levelInfo(previous.xp).level;
  const after = levelInfo(next.xp).level;
  if (after > before) {
    const rank = RANKS.find((item) => item.minLevel > before && item.minLevel <= after) ?? null;
    const themes = CARD_THEMES.filter(
      (theme) => theme.minLevel > before && theme.minLevel <= after,
    );
    feedback.push({ kind: "level", level: after, rank, themes });
  }

  window.dispatchEvent(new CustomEvent(GAME_STATE_EVENT));
  for (const item of feedback) {
    window.dispatchEvent(new CustomEvent<GameFeedback>(GAME_FEEDBACK_EVENT, { detail: item }));
  }
}

export function comboMultiplier(combo: number) {
  return COMBO_STEPS.find((step) => combo >= step.combo)?.multiplier ?? 1;
}

export function nextComboStep(combo: number) {
  return [...COMBO_STEPS].reverse().find((step) => combo < step.combo) ?? null;
}

export function answerCard({
  cardId,
  label,
  correct,
  combo,
}: {
  cardId: string;
  label: string;
  correct: boolean;
  combo: number;
}) {
  const state = readGame();
  const now = Date.now();
  const current = state.mastery[cardId];
  const wasDue = current ? isDue(current, now) : true;
  const feedback: GameFeedback[] = [];
  let next: CardMastery;
  let xp: number;
  let multiplier = 1;

  if (correct) {
    const stage = current?.stage ?? 0;
    const canPromote =
      !current || (stage < MAX_STAGE && now - current.promotedAt >= PROMOTION_GAPS[stage]);
    const nextStage = (canPromote ? Math.min(MAX_STAGE, stage + 1) : stage) as MasteryStage;
    next = {
      stage: nextStage,
      promotedAt: canPromote ? now : (current?.promotedAt ?? now),
      seenAt: now,
      lapses: current?.lapses ?? 0,
      correct: (current?.correct ?? 0) + 1,
    };

    multiplier = comboMultiplier(combo);
    const base = canPromote || wasDue ? FLASHCARD_XP.fresh : FLASHCARD_XP.repeat;
    xp = Math.round(base * multiplier);
    if (wasDue && current && current.stage > 0) xp += FLASHCARD_XP.dueBonus;
    if (!current?.correct) xp += FLASHCARD_XP.firstCorrectBonus;
    if (nextStage > stage) {
      xp += TIER_UP_BONUS[nextStage];
      feedback.push({ kind: "tier", label, stage: nextStage });
    }
    if (COMBO_STEPS.some((step) => step.combo === combo)) {
      feedback.unshift({ kind: "combo", combo, multiplier });
    }
  } else {
    next = {
      stage: Math.max(0, (current?.stage ?? 0) - 1) as MasteryStage,
      promotedAt: now,
      seenAt: now,
      lapses: (current?.lapses ?? 0) + 1,
      correct: current?.correct ?? 0,
    };
    xp = FLASHCARD_XP.miss;
  }

  feedback.unshift({ kind: "xp", amount: xp, multiplier, correct });
  commit(
    { ...state, xp: state.xp + xp, mastery: { ...state.mastery, [cardId]: next } },
    feedback,
  );
  return { xp, multiplier, stage: next.stage, previousStage: current?.stage ?? null };
}

export function awardActivityXp(activity: StudyActivity, points: number) {
  if (typeof window === "undefined" || FLASHCARD_ACTIVITIES.includes(activity)) return;
  const state = readGame();
  const amount = points * 10;
  commit({ ...state, xp: state.xp + amount }, [
    { kind: "xp", amount, multiplier: 1, correct: false },
  ]);
}

export function setCardTheme(theme: CardThemeId) {
  const state = readGame();
  const definition = CARD_THEMES.find((item) => item.id === theme);
  if (!definition || levelInfo(state.xp).level < definition.minLevel) return;
  commit({ ...state, theme });
}

export function xpToNextLevel(level: number) {
  return Math.round(100 * level ** 1.5);
}

export function levelInfo(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, into: remaining, needed: xpToNextLevel(level) };
}

export function rankForLevel(level: number) {
  return [...RANKS].reverse().find((rank) => level >= rank.minLevel) ?? RANKS[0];
}

export function tierFor(stage: MasteryStage | undefined) {
  return stage === undefined ? null : TIERS[stage];
}

export function isDue(mastery: CardMastery, now: number) {
  if (mastery.stage === 0) return true;
  if (mastery.stage >= MAX_STAGE) return false;
  return now - mastery.promotedAt >= PROMOTION_GAPS[mastery.stage];
}

export function isOverdue(mastery: CardMastery, now: number) {
  if (mastery.stage === 0 || mastery.stage >= MAX_STAGE) return false;
  return now - mastery.promotedAt >= PROMOTION_GAPS[mastery.stage] + OVERDUE_GRACE;
}

export function masteryCounts(state: GameState) {
  const values = Object.values(state.mastery);
  return {
    seen: values.length,
    gold: values.filter((item) => item.stage >= 3).length,
    mastered: values.filter((item) => item.stage >= MAX_STAGE).length,
  };
}

export function gardenStageIndex(state: GameState) {
  const { gold, mastered } = masteryCounts(state);
  const { level } = levelInfo(state.xp);
  let index = 0;
  for (const stage of GARDEN_STAGES) {
    if (gold >= stage.minGold && level >= stage.minLevel && mastered >= stage.minMastered) {
      index = stage.stage;
    } else {
      break;
    }
  }
  return index;
}

export function unlockedThemes(level: number) {
  return CARD_THEMES.filter((theme) => level >= theme.minLevel);
}

export function activeTheme(state: GameState) {
  const { level } = levelInfo(state.xp);
  const theme = CARD_THEMES.find((item) => item.id === state.theme);
  return theme && level >= theme.minLevel ? theme : CARD_THEMES[0];
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    cachedState = null;
    callback();
  }
  window.addEventListener(GAME_STATE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(GAME_STATE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useGameState() {
  return useSyncExternalStore(subscribe, readGame, () => DEFAULT_STATE);
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
