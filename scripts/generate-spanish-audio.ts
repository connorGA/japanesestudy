// Pre-generates every native-voice Spanish clip used by the /spanish section so learners
// never wait on ElevenLabs. Requires the API to be running (npm run dev:api).
// Usage: npm run generate:spanish-audio [-- --api http://localhost:8005]
import { regionalWords, spanishCards } from "../apps/web/src/data/spanish.ts";
import {
  scenarioSpeakerVoice,
  spanishListeningCategories,
  spanishListeningScenarios,
} from "../apps/web/src/data/spanishListening.ts";
import {
  filledSerEstar,
  grammarTopics,
  phraseRounds,
  pronunciationGroups,
  serEstarRounds,
  spanishVerbs,
  spokenVerbForm,
  tenses,
  verbFormsFor,
} from "../apps/web/src/data/spanishLessons.ts";
import { speakableSpanish } from "../apps/web/src/lib/spanishText.ts";

type Item = { id: string; text: string; language: "en" | "es"; voice: "primary" | "secondary" };
type ManifestEntry = { id: string; audio: { status: "pending" | "ready" | "failed"; error_message?: string | null } };

const apiFlag = process.argv.indexOf("--api");
const API_URL = apiFlag > -1 ? process.argv[apiFlag + 1] : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8005";
const BATCH_SIZE = 200;

function collectItems(): Item[] {
  const items = new Map<string, Item>();
  const add = (text: string, language: Item["language"] = "es", voice: Item["voice"] = "primary") => {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return;
    const key = `${language}|${voice}|${normalized}`;
    if (!items.has(key)) items.set(key, { id: String(items.size), text: normalized, language, voice });
  };
  const speak = (text: string) => add(speakableSpanish(text));

  for (const card of spanishCards) {
    speak(card.spanish);
    speak(card.example);
  }
  for (const word of regionalWords) speak(word.mexico);
  for (const group of pronunciationGroups) group.examples.forEach(speak);
  for (const verb of spanishVerbs) {
    speak(verb.infinitive);
    for (const tense of tenses) {
      speak(verb.examples[tense.id]);
      verbFormsFor(verb, tense.id).forEach((form, index) => speak(spokenVerbForm(index, form)));
    }
  }
  for (const topic of grammarTopics) topic.examples.forEach(speak);
  for (const round of phraseRounds) speak(round.display);
  for (const round of serEstarRounds) speak(filledSerEstar(round));

  for (const category of spanishListeningCategories) {
    for (const item of category.items) {
      add(item.english, "en");
      add(item.spanish, "es");
    }
  }
  for (const scenario of spanishListeningScenarios) {
    for (const line of scenario.lines) add(line.spanish, "es", scenarioSpeakerVoice(scenario, line.speaker));
  }
  return [...items.values()];
}

async function requestBatch(batch: Item[], attempts = 4): Promise<ManifestEntry[]> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/api/spanish/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batch }),
      });
      if (response.status < 500) {
        if (!response.ok) throw Object.assign(new Error(`API ${response.status}: ${await response.text()}`), { fatal: true });
        return (await response.json()) as ManifestEntry[];
      }
      throw new Error(`API ${response.status}`);
    } catch (error) {
      if ((error as { fatal?: boolean }).fatal || attempt >= attempts) throw error;
      console.warn(`  request failed (${(error as Error).message}), retrying…`);
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
    }
  }
}

async function main() {
  let outstanding = collectItems();
  const characters = outstanding.reduce((total, item) => total + item.text.length, 0);
  console.log(`Spanish audio: ${outstanding.length} clips (${characters} characters) via ${API_URL}`);
  const errors = new Map<string, string>();
  const generationFailures = new Map<string, number>();
  const abandoned: Item[] = [];
  const deadline = Date.now() + 30 * 60 * 1000;

  for (let round = 0; outstanding.length && Date.now() < deadline; round += 1) {
    if (round > 0) await new Promise((resolve) => setTimeout(resolve, 5000));
    const next: Item[] = [];
    for (let start = 0; start < outstanding.length; start += BATCH_SIZE) {
      const batch = outstanding.slice(start, start + BATCH_SIZE);
      const manifest = new Map((await requestBatch(batch)).map((entry) => [entry.id, entry.audio]));
      for (const item of batch) {
        const audio = manifest.get(item.id);
        if (audio?.status === "ready") continue;
        if (audio?.status === "failed") {
          const message = audio.error_message ?? "unknown error";
          errors.set(item.id, message);
          // Lookup errors are transient; the API re-queues real generation failures on the next request.
          if (!message.startsWith("Could not load cached audio")) {
            const count = (generationFailures.get(item.id) ?? 0) + 1;
            generationFailures.set(item.id, count);
            if (count >= 4) {
              abandoned.push(item);
              continue;
            }
          }
        }
        next.push(item);
      }
    }
    outstanding = next;
    console.log(`  round ${round + 1}: ${outstanding.length} still generating`);
  }

  const notReady = [...outstanding, ...abandoned];
  if (notReady.length) {
    console.error(`Finished with ${notReady.length} clips not ready.`);
    for (const item of notReady.slice(0, 10)) console.error(`  - ${item.text}: ${errors.get(item.id) ?? "pending"}`);
    process.exit(1);
  }
  console.log("All Spanish audio is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
