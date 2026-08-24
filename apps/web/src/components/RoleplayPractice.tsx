"use client";

import { useEffect, useState } from "react";
import { getScenarios, sendRoleplayTurn } from "@/lib/api";
import { recordStudyActivity } from "@/lib/progress";
import type { RoleplayTurn, Scenario } from "@/types/study";
import { AudioPlayer } from "./AudioPlayer";
import { Panel } from "./Panel";

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

export function RoleplayPractice() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioId, setScenarioId] = useState("ramen-shop");
  const [roleplayText, setRoleplayText] = useState("味噌ラーメンを一つお願いします。");
  const [turn, setTurn] = useState<RoleplayTurn | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getScenarios()
      .then((items) => {
        setScenarios(items);
        setScenarioId(items[0]?.id ?? "ramen-shop");
      })
      .catch(() => setScenarios([]));
  }, []);

  async function submitRoleplay() {
    setStatus("Continuing roleplay...");
    try {
      setTurn(await sendRoleplayTurn({ scenarioId, userText: roleplayText }));
      recordStudyActivity("japanese", "roleplay_turn", "roleplay", {
        scenario_id: scenarioId,
      });
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Roleplay failed");
    }
  }

  function startVoiceInput() {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("This browser does not support speech recognition yet.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      setRoleplayText(event.results[0][0].transcript);
      setStatus("Voice captured. Send it when ready.");
    };
    recognition.onerror = () => setStatus("Voice capture failed. Try typing instead.");
    recognition.start();
  }

  return (
    <Panel eyebrow="Roleplay" title="Conversation Simulator">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-3xl bg-white p-5">
          <h3 className="font-semibold">Scenario</h3>
          <select
            className="w-full rounded-2xl border border-black/10 p-3 outline-none focus:border-matcha"
            onChange={(event) => setScenarioId(event.target.value)}
            value={scenarioId}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title} ({scenario.level})
              </option>
            ))}
          </select>
          <textarea
            className="min-h-36 w-full rounded-2xl border border-black/10 p-3 shadow-inner outline-none focus:border-matcha"
            onChange={(event) => setRoleplayText(event.target.value)}
            value={roleplayText}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold"
              onClick={startVoiceInput}
              type="button"
            >
              Speak Japanese
            </button>
            <button
              className="rounded-full bg-matcha px-4 py-2 text-sm font-semibold text-white"
              onClick={submitRoleplay}
              type="button"
            >
              Reply in scenario
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-washi p-5">
          {turn ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-matcha">
                Partner reply
              </p>
              <p className="mt-3 text-2xl font-semibold">{turn.ai_japanese}</p>
              <p className="mt-2 text-sm text-slate-700">{turn.ai_english_hint}</p>
              <p className="mt-4 text-sm font-semibold">Feedback</p>
              <p className="text-sm leading-6 text-slate-700">{turn.feedback}</p>
              <AudioPlayer initialAsset={turn.audio_asset} text={turn.ai_japanese} />
            </>
          ) : (
            <div className="flex h-full min-h-56 flex-col justify-center rounded-2xl border border-dashed border-ink/20 p-5 text-slate-600">
              <p className="font-semibold text-ink">Start a scenario</p>
              <p className="mt-2 text-sm leading-6">
                Choose a setting, type or speak your line, and the simulator will continue
                the conversation with feedback.
              </p>
            </div>
          )}
        </div>
      </div>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
    </Panel>
  );
}
