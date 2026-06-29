import type {
  AudioAsset,
  Flashcard,
  ListeningScenario,
  PassiveListeningCategory,
  ReviewCandidate,
  ReviewItem,
  RoleplayTurn,
  Scenario,
  TutorResponse,
} from "@/types/study";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function sendTutorMessage(input: {
  text: string;
  sessionId?: string;
  level?: string;
}): Promise<TutorResponse> {
  return request<TutorResponse>("/api/tutor/chat", {
    method: "POST",
    body: JSON.stringify({
      text: input.text,
      session_id: input.sessionId,
      level: input.level ?? "N5-N4",
    }),
  });
}

export function createReviewItems(
  candidates: ReviewCandidate[],
): Promise<ReviewItem[]> {
  return request<ReviewItem[]>("/api/reviews/from-candidates", {
    method: "POST",
    body: JSON.stringify({ candidates }),
  });
}

export function getDueReviews(): Promise<ReviewItem[]> {
  return request<ReviewItem[]>("/api/reviews/due");
}

export function getFlashcards(): Promise<Flashcard[]> {
  return request<Flashcard[]>("/api/flashcards");
}

export function getListeningScenarios(): Promise<ListeningScenario[]> {
  return request<ListeningScenario[]>("/api/listening/scenarios");
}

export function getPassiveListeningCategories(): Promise<PassiveListeningCategory[]> {
  return request<PassiveListeningCategory[]>("/api/passive-listening/categories");
}

export function gradeReview(input: {
  reviewItemId: string;
  rating: "again" | "hard" | "good" | "easy";
}): Promise<ReviewItem> {
  return request<ReviewItem>(`/api/reviews/${input.reviewItemId}/grade`, {
    method: "POST",
    body: JSON.stringify({ rating: input.rating }),
  });
}

export function getAudioAsset(text: string): Promise<AudioAsset> {
  return request<AudioAsset>("/api/audio", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getHiraganaAudioAssets(): Promise<AudioAsset[]> {
  return request<AudioAsset[]>("/api/audio/hiragana");
}

export function getKatakanaAudioAssets(): Promise<AudioAsset[]> {
  return request<AudioAsset[]>("/api/audio/katakana");
}

export function getScenarios(): Promise<Scenario[]> {
  return request<Scenario[]>("/api/roleplay/scenarios");
}

export function sendRoleplayTurn(input: {
  scenarioId: string;
  userText: string;
  level?: string;
}): Promise<RoleplayTurn> {
  return request<RoleplayTurn>("/api/roleplay/turn", {
    method: "POST",
    body: JSON.stringify({
      scenario_id: input.scenarioId,
      user_text: input.userText,
      level: input.level ?? "N5-N4",
    }),
  });
}
