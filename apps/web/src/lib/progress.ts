import {
  getStudyProgress,
  importStudyProgress,
  recordProgressEvent,
  type ProgressEventInput,
  type StudyActivity,
  type StudyLanguage,
} from "@/lib/api";

export type { StudyActivity, StudyLanguage };
export type ProgressStore = Record<StudyLanguage, Record<string, number>>;

export const PROGRESS_STORAGE_KEY = "language-study.progress.v1";
export const PROGRESS_EVENT = "language-study-progress";

const SHARED_LEARNER_ID = "9f5e3c7a-b5f9-4d9f-aef2-81d8ce6a3047";
const PENDING_EVENTS_KEY = "language-study.pending-progress.v1";
const IMPORT_COMPLETE_KEY = "language-study.shared-progress-imported.v1";
const DAILY_LANGUAGE_LIMIT = 250;

export const STUDY_ACTIVITY_POINTS: Record<StudyActivity, number> = {
  flashcard_retry: 1,
  flashcard_mastered: 3,
  pronunciation_play: 1,
  verb_form_practice: 1,
  listening_line_complete: 2,
  passive_listening_item: 3,
  arcade_correct: 2,
  srs_review: 3,
  tutor_turn: 4,
  roleplay_turn: 4,
};

let flushPromise: Promise<void> | null = null;

export function emptyProgress(): ProgressStore {
  return { japanese: {}, italian: {} };
}

export function readProgress(): ProgressStore {
  if (typeof window === "undefined") return emptyProgress();

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}",
    ) as Partial<ProgressStore>;
    return {
      japanese: parsed.japanese ?? {},
      italian: parsed.italian ?? {},
    };
  } catch {
    return emptyProgress();
  }
}

export function recordStudyActivity(
  language: StudyLanguage,
  activityType: StudyActivity,
  feature: string,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const activityDate = localDateKey(new Date());
  const progress = readProgress();
  progress[language][activityDate] = Math.min(
    DAILY_LANGUAGE_LIMIT,
    (progress[language][activityDate] ?? 0) + STUDY_ACTIVITY_POINTS[activityType],
  );
  writeProgress(progress);

  const event: ProgressEventInput = {
    id: crypto.randomUUID(),
    learner_id: getLearnerId(),
    language,
    feature,
    activity_type: activityType,
    activity_date: activityDate,
    metadata,
  };
  writePendingEvents([...readPendingEvents(), event]);
  void flushPendingProgress();
}

export async function syncProgress() {
  if (typeof window === "undefined") return;
  const learnerId = getLearnerId();

  try {
    if (!window.localStorage.getItem(IMPORT_COMPLETE_KEY)) {
      const local = readProgress();
      const records = (["japanese", "italian"] as const).flatMap((language) =>
        Object.entries(local[language]).map(([date, points]) => ({
          language,
          date,
          points: Math.min(DAILY_LANGUAGE_LIMIT, points),
        })),
      );
      await importStudyProgress(learnerId, records);
      window.localStorage.setItem(IMPORT_COMPLETE_KEY, "true");
    }

    await flushPendingProgress();
    const summary = await getStudyProgress(learnerId);
    writeProgress(summaryToStore(summary.records));
  } catch {
    // The local cache and pending event queue keep practice usable offline.
  }
}

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLearnerId() {
  return SHARED_LEARNER_ID;
}

function readPendingEvents(): ProgressEventInput[] {
  try {
    const events = JSON.parse(
      window.localStorage.getItem(PENDING_EVENTS_KEY) ?? "[]",
    ) as ProgressEventInput[];
    return events.map((event) => ({
      ...event,
      learner_id: SHARED_LEARNER_ID,
    }));
  } catch {
    return [];
  }
}

function writePendingEvents(events: ProgressEventInput[]) {
  window.localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events));
}

function flushPendingProgress() {
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    while (true) {
      const [event] = readPendingEvents();
      if (!event) break;
      try {
        await recordProgressEvent(event);
      } catch {
        break;
      }
      writePendingEvents(readPendingEvents().filter((item) => item.id !== event.id));
    }

    if (!readPendingEvents().length) {
      try {
        const summary = await getStudyProgress(getLearnerId());
        writeProgress(summaryToStore(summary.records));
      } catch {
        // The next online or visibility event retries synchronization.
      }
    }
  })().finally(() => {
    flushPromise = null;
  });
  return flushPromise;
}

function summaryToStore(
  records: Array<{ language: StudyLanguage; date: string; points: number }>,
): ProgressStore {
  const progress = emptyProgress();
  for (const record of records) {
    progress[record.language][record.date] = record.points;
  }
  return progress;
}

function writeProgress(progress: ProgressStore) {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}
