import {
  scenarioSpeakerVoice,
  spanishListeningCategories,
  spanishListeningScenarios,
  type SpanishListeningCategoryId,
} from "@/data/spanishListening";
import type { SpanishAudioRequestItem } from "@/lib/api";
import { loadSpanishAudio } from "@/lib/spanishAudio";
import type { AudioAsset, ListeningScenario, PassiveListeningCategory } from "@/types/study";

export async function getSpanishPassiveListeningCategories(): Promise<PassiveListeningCategory[]> {
  const requests: SpanishAudioRequestItem[] = spanishListeningCategories.flatMap((category) =>
    category.items.flatMap((item) => [
      { id: passiveAudioId(category.id, item.id, "en"), text: item.english, language: "en" as const },
      { id: passiveAudioId(category.id, item.id, "es"), text: item.spanish, language: "es" as const },
    ]),
  );
  const audioById = await getAudioById(requests);

  return spanishListeningCategories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    items: category.items.map((item) => ({
      id: item.id,
      english: item.english,
      japanese: item.spanish,
      romaji: "",
      english_audio: audioById[passiveAudioId(category.id, item.id, "en")],
      japanese_audio: audioById[passiveAudioId(category.id, item.id, "es")],
    })),
  }));
}

export async function getSpanishListeningScenarios(): Promise<ListeningScenario[]> {
  const requests: SpanishAudioRequestItem[] = spanishListeningScenarios.flatMap((scenario) =>
    scenario.lines.map((line, index) => ({
      id: scenarioAudioId(scenario.id, index),
      text: line.spanish,
      language: "es" as const,
      voice: scenarioSpeakerVoice(scenario, line.speaker),
    })),
  );
  const audioById = await getAudioById(requests);

  return spanishListeningScenarios.map((scenario) => ({
    ...scenario,
    lines: scenario.lines.map((line, index) => ({
      speaker: line.speaker,
      japanese: line.spanish,
      romaji: "",
      english: line.english,
      audio: audioById[scenarioAudioId(scenario.id, index)],
    })),
  }));
}

async function getAudioById(requests: SpanishAudioRequestItem[]): Promise<Record<string, AudioAsset>> {
  const audioById = await loadSpanishAudio(requests, { maxPolls: 3 });
  const failed = Object.values(audioById).find((asset) => asset.status === "failed");
  if (failed) {
    throw new Error(failed.error_message ?? "Some Spanish listening audio could not be loaded.");
  }
  return audioById;
}

function passiveAudioId(categoryId: SpanishListeningCategoryId, itemId: string, language: "en" | "es") {
  return `listening:${categoryId}:${itemId}:${language}`;
}

function scenarioAudioId(scenarioId: string, lineIndex: number) {
  return `scenario:${scenarioId}:${lineIndex}:es`;
}
