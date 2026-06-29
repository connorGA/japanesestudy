"use client";

import { useEffect, useState } from "react";
import { getAudioAsset, getScenarios, sendRoleplayTurn } from "@/lib/api";
import type { AudioAsset, RoleplayTurn, Scenario } from "@/types/study";
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

export function PracticeModes() {
  const [shadowText, setShadowText] = useState("いらっしゃいませ。ご注文はお決まりですか。");
  const [listeningAsset, setListeningAsset] = useState<AudioAsset | null>(null);
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

  async function prepareListening() {
    setStatus("Preparing listening audio...");
    try {
      setListeningAsset(await getAudioAsset(shadowText));
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not prepare audio");
    }
  }

  async function submitRoleplay() {
    setStatus("Continuing roleplay...");
    try {
      setTurn(await sendRoleplayTurn({ scenarioId, userText: roleplayText }));
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
    <Panel eyebrow="Practice" title="Listening, Shadowing, and Roleplay" className="lg:col-span-2">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl bg-washi p-5">
          <h3 className="font-semibold">Shadowing prompt</h3>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-black/10 p-3"
            onChange={(event) => setShadowText(event.target.value)}
            value={shadowText}
          />
          <button
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={prepareListening}
            type="button"
          >
            Prepare listening audio
          </button>
          <AudioPlayer initialAsset={listeningAsset} text={shadowText} />
        </div>

        <div className="space-y-3 rounded-3xl bg-white p-5">
          <h3 className="font-semibold">Conversation simulator</h3>
          <select
            className="w-full rounded-2xl border border-black/10 p-3"
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
            className="min-h-24 w-full rounded-2xl border border-black/10 p-3"
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
          {turn ? (
            <div className="rounded-2xl bg-washi p-4">
              <p className="text-xl font-semibold">{turn.ai_japanese}</p>
              <p className="mt-2 text-sm text-slate-700">{turn.ai_english_hint}</p>
              <p className="mt-3 text-sm font-semibold">Feedback</p>
              <p className="text-sm text-slate-700">{turn.feedback}</p>
              <AudioPlayer initialAsset={turn.audio_asset} text={turn.ai_japanese} />
            </div>
          ) : null}
        </div>
      </div>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
    </Panel>
  );
}
