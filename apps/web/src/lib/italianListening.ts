import {
  italianListeningCategories,
  italianListeningScenarios,
  type ItalianListeningCategoryId,
} from "@/data/italianListening";
import { getItalianListeningAudio } from "@/lib/api";
import type {
  ItalianListeningAudioItem,
  ListeningScenario,
  PassiveListeningCategory,
} from "@/types/study";

export async function getItalianPassiveListeningCategories(): Promise<
  PassiveListeningCategory[]
> {
  const requests = italianListeningCategories.flatMap((category) =>
    category.items.flatMap((item) => [
      {
        id: passiveAudioId(category.id, item.id, "en"),
        text: item.english,
        language: "en" as const,
      },
      {
        id: passiveAudioId(category.id, item.id, "it"),
        text: item.italian,
        language: "it" as const,
      },
    ]),
  );
  const audioById = await getAudioById(requests);

  return italianListeningCategories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    items: category.items.map((item) => ({
      id: item.id,
      english: item.english,
      japanese: item.italian,
      romaji: "",
      english_audio: audioById[passiveAudioId(category.id, item.id, "en")],
      japanese_audio: audioById[passiveAudioId(category.id, item.id, "it")],
    })),
  }));
}

export async function getItalianListeningScenarios(): Promise<ListeningScenario[]> {
  const requests = italianListeningScenarios.flatMap((scenario) =>
    scenario.lines.map((line, index) => ({
      id: scenarioAudioId(scenario.id, index),
      text: line.italian,
      language: "it" as const,
    })),
  );
  const audioById = await getAudioById(requests);

  return italianListeningScenarios.map((scenario) => ({
    ...scenario,
    lines: scenario.lines.map((line, index) => ({
      speaker: line.speaker,
      japanese: line.italian,
      romaji: "",
      english: line.english,
      audio: audioById[scenarioAudioId(scenario.id, index)],
    })),
  }));
}

async function getAudioById(
  requests: Parameters<typeof getItalianListeningAudio>[0],
) {
  const batchSize = 200;
  const batches = Array.from(
    { length: Math.ceil(requests.length / batchSize) },
    (_, index) => requests.slice(index * batchSize, (index + 1) * batchSize),
  );
  const manifests = await Promise.all(
    batches.map((batch) => getItalianListeningAudio(batch)),
  );
  const manifest = manifests.flat();
  const failed = manifest.find((item) => item.audio.status === "failed");
  if (failed) {
    throw new Error(
      failed.audio.error_message ?? "Some Italian listening audio could not be loaded.",
    );
  }
  return Object.fromEntries(
    manifest.map((item: ItalianListeningAudioItem) => [item.id, item.audio]),
  );
}

function passiveAudioId(
  categoryId: ItalianListeningCategoryId,
  itemId: string,
  language: "en" | "it",
) {
  return `listening:${categoryId}:${itemId}:${language}`;
}

function scenarioAudioId(scenarioId: string, lineIndex: number) {
  return `scenario:${scenarioId}:${lineIndex}:it`;
}
