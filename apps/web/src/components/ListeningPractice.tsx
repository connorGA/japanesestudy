"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { getListeningScenarios } from "@/lib/api";
import { detachAudio, pauseAudio, playAudioElement, replaceAudio } from "@/lib/audioPlayback";
import { recordStudyActivity } from "@/lib/progress";
import type { ListeningScenario } from "@/types/study";

export function ListeningPractice() {
  const [scenarios, setScenarios] = useState<ListeningScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Loading listening scenarios...");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getListeningScenarios()
      .then((items) => {
        setScenarios(items);
        setActiveScenarioId(items[0]?.id ?? null);
        setStatus("");
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load listening scenarios"),
      );

    return () => {
      detachAudio(audioRef.current);
    };
  }, []);

  const activeScenario =
    scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];

  function pausePlayback() {
    pauseAudio(audioRef.current);
    setIsPlaying(false);
  }

  function stopPlayback(reset = false) {
    detachAudio(audioRef.current);
    audioRef.current = null;
    setIsPlaying(false);
    if (reset) {
      setActiveLineIndex(null);
    }
  }

  function playLine(index: number) {
    if (!activeScenario) return;

    const line = activeScenario.lines[index];
    if (!line) {
      stopPlayback(true);
      return;
    }

    if (!line.audio?.public_url || line.audio.status !== "ready") {
      setStatus(`${line.japanese} audio is still being prepared.`);
      stopPlayback();
      return;
    }

    const audio = replaceAudio(audioRef.current, line.audio.public_url);
    audioRef.current = audio;
    setActiveLineIndex(index);
    setIsPlaying(true);
    setStatus("");
    audio.onended = () => {
      recordStudyActivity("japanese", "listening_line_complete", "listening", {
        scenario_id: activeScenario.id,
        line_index: index,
      });
      playLine(index + 1);
    };
    audio.onerror = () => {
      setStatus("Could not play this line's audio.");
      stopPlayback();
    };
    void playAudioElement(audio).then((started) => {
      if (!started) {
        setIsPlaying(false);
      }
    });
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
      return;
    }

    const audio = audioRef.current;
    if (audio && !audio.ended && audio.src && activeLineIndex !== null) {
      setIsPlaying(true);
      void playAudioElement(audio).then((started) => {
        if (!started) {
          setIsPlaying(false);
        }
      });
      return;
    }

    playLine(activeLineIndex ?? 0);
  }

  function selectScenario(id: string) {
    stopPlayback(true);
    setActiveScenarioId(id);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[20rem_1fr] lg:gap-6">
      <aside className="rounded-[2rem] border border-black/10 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
          Scenario Library
        </p>
        <div className="mt-4 space-y-2">
          {scenarios.map((scenario) => (
            <button
              className={`w-full rounded-2xl p-3 text-left transition sm:p-4 ${
                scenario.id === activeScenario?.id
                  ? "bg-matcha text-white shadow-sm"
                  : "bg-washi text-ink hover:bg-sakura/40"
              }`}
              key={scenario.id}
              onClick={() => selectScenario(scenario.id)}
              type="button"
            >
              <span className="block font-semibold">{scenario.title}</span>
              <span
                className={`mt-1 block text-sm ${
                  scenario.id === activeScenario?.id ? "text-white/70" : "text-slate-600"
                }`}
              >
                {scenario.setting}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
        {activeScenario ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
                  {activeScenario.level} Listening
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
                  {activeScenario.title}
                </h2>
                <p className="mt-2 max-w-2xl text-slate-600">
                  {activeScenario.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  onClick={togglePlayback}
                  type="button"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                  onClick={() => {
                    stopPlayback(true);
                    playLine(0);
                  }}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {activeScenario.lines.map((line, index) => {
                const isActive = activeLineIndex === index;
                const speakerOrder = Array.from(
                  new Set(activeScenario.lines.map((item) => item.speaker)),
                ).indexOf(line.speaker);
                const alignRight = speakerOrder % 2 === 1;

                return (
                  <div
                    className={`flex ${alignRight ? "justify-end" : "justify-start"}`}
                    key={`${line.speaker}-${line.japanese}`}
                  >
                    <button
                      className={`relative max-w-full rounded-[1.75rem] border p-4 text-left shadow-sm transition sm:max-w-[92%] sm:p-6 md:max-w-[76%] ${
                        alignRight ? "rounded-br-md" : "rounded-bl-md"
                      } ${
                        isActive
                          ? "border-matcha bg-matcha/20 shadow-lg ring-2 ring-matcha/30"
                          : alignRight
                            ? "border-sakura/40 bg-sakura/25 hover:bg-sakura/35"
                            : "border-black/10 bg-washi hover:bg-white"
                      }`}
                      onClick={() => playLine(index)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-matcha">
                          Speaker {line.speaker}
                        </p>
                      </div>
                      <p
                        className={`mt-3 text-xl font-semibold sm:text-2xl ${
                          isActive ? "text-ink" : "text-slate-800"
                        }`}
                      >
                        {line.japanese}
                      </p>
                      <p
                        className={`mt-2 text-sm sm:text-base ${
                          isActive ? "font-semibold text-ink" : "text-slate-600"
                        }`}
                      >
                        {line.romaji}
                      </p>
                      <p
                        className={`mt-1 text-sm sm:text-base ${
                          isActive ? "font-semibold text-ink" : "text-slate-600"
                        }`}
                      >
                        {line.english}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-slate-600">{status || "No listening scenarios yet."}</p>
        )}

        {status ? (
          <p className="mt-4 rounded-2xl bg-washi p-4 text-sm text-slate-700">{status}</p>
        ) : null}
      </section>
    </div>
  );
}
