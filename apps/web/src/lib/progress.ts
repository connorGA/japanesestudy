import { HIRAGANA_CHARACTERS } from "./hiragana";
import { KATAKANA_CHARACTERS } from "./katakana";
import { LEARNING_PATH_STEPS } from "./learning-path";
import { PHRASE_PACKS } from "./phrases";

export const STORAGE_KEYS = {
  hiraganaMastery: "japanese-study.hiragana-mastery",
  katakanaMastery: "japanese-study.katakana-mastery",
  flashcardScores: "japanese-study.flashcard-scores",
  phrasePackProgress: "japanese-study.phrase-pack-progress",
  learningPath: "japanese-study.learning-path-progress",
  numbersMastery: "japanese-study.numbers-mastery",
  sentenceBuilder: "japanese-study.sentence-builder-progress",
  strokeOrder: "japanese-study.stroke-order-progress",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getHiraganaMastery() {
  return readJson<Record<string, number>>(STORAGE_KEYS.hiraganaMastery, {});
}

export function getKatakanaMastery() {
  return readJson<Record<string, number>>(STORAGE_KEYS.katakanaMastery, {});
}

export function getFlashcardScores() {
  return readJson<Record<string, number>>(STORAGE_KEYS.flashcardScores, {});
}

export function getPhrasePackProgress() {
  return readJson<Record<string, number>>(STORAGE_KEYS.phrasePackProgress, {});
}

export function getLearningPathProgress() {
  return readJson<Record<string, boolean>>(STORAGE_KEYS.learningPath, {});
}

export function getNumbersMastery() {
  return readJson<Record<string, number>>(STORAGE_KEYS.numbersMastery, {});
}

export function getSentenceBuilderProgress() {
  return readJson<Record<string, boolean>>(STORAGE_KEYS.sentenceBuilder, {});
}

export function getStrokeOrderProgress() {
  return readJson<Record<string, boolean>>(STORAGE_KEYS.strokeOrder, {});
}

export function countMastered(mastery: Record<string, number>, threshold = 3) {
  return Object.values(mastery).filter((score) => score >= threshold).length;
}

export function getUnifiedProgress() {
  const hiraganaMastery = getHiraganaMastery();
  const katakanaMastery = getKatakanaMastery();
  const flashcardScores = getFlashcardScores();
  const phrasePackProgress = getPhrasePackProgress();
  const learningPathProgress = getLearningPathProgress();
  const numbersMastery = getNumbersMastery();
  const sentenceProgress = getSentenceBuilderProgress();
  const strokeProgress = getStrokeOrderProgress();

  const phraseItemsTotal = PHRASE_PACKS.reduce((sum, pack) => sum + pack.phrases.length, 0);
  const phraseItemsDone = Object.values(phrasePackProgress).reduce((sum, n) => sum + n, 0);

  return {
    hiragana: {
      mastered: countMastered(hiraganaMastery),
      total: HIRAGANA_CHARACTERS.length,
    },
    katakana: {
      mastered: countMastered(katakanaMastery),
      total: KATAKANA_CHARACTERS.length,
    },
    flashcards: {
      studied: Object.keys(flashcardScores).length,
      positive: Object.values(flashcardScores).filter((s) => s > 0).length,
    },
    phrases: {
      practiced: phraseItemsDone,
      total: phraseItemsTotal,
      packsCompleted: PHRASE_PACKS.filter(
        (pack) => (phrasePackProgress[pack.id] ?? 0) >= pack.phrases.length,
      ).length,
      packsTotal: PHRASE_PACKS.length,
    },
    numbers: {
      mastered: countMastered(numbersMastery, 2),
      total: 28,
    },
    sentences: {
      completed: Object.values(sentenceProgress).filter(Boolean).length,
      total: 8,
    },
    strokeOrder: {
      completed: Object.values(strokeProgress).filter(Boolean).length,
      total: 10,
    },
    learningPath: {
      completed: Object.values(learningPathProgress).filter(Boolean).length,
      total: LEARNING_PATH_STEPS.length,
    },
  };
}

export function markLearningPathStep(stepId: string) {
  const progress = getLearningPathProgress();
  progress[stepId] = !progress[stepId];
  window.localStorage.setItem(STORAGE_KEYS.learningPath, JSON.stringify(progress));
}
