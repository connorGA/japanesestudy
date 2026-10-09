"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Mic,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { getListeningScenarios } from "@/lib/api";
import { detachAudio, pauseAudio, playAudioElement, replaceAudio } from "@/lib/audioPlayback";
import { getItalianListeningScenarios } from "@/lib/italianListening";
import { recordStudyActivity } from "@/lib/progress";
import { getSpanishListeningScenarios } from "@/lib/spanishListening";
import type { ListeningScenario } from "@/types/study";

const scenarioLoaders = {
  japanese: getListeningScenarios,
  italian: getItalianListeningScenarios,
  spanish: getSpanishListeningScenarios,
};

type FlowMode = "flow" | "shadow" | "line";

type PlayerSettings = {
  speed: number;
  flow: FlowMode;
  showRomaji: boolean;
  showEnglish: boolean;
};

type HeardLines = Record<string, number[]>;

const SETTINGS_KEY = "listening-scenario-settings";
const SPEEDS = [0.75, 0.9, 1];
const FLOW_MODES: { id: FlowMode; label: string; hint: string }[] = [
  { id: "flow", label: "Flow", hint: "Plays the whole conversation" },
  { id: "shadow", label: "Shadow", hint: "Pauses so you can repeat each line aloud" },
  { id: "line", label: "Line by line", hint: "Stops after every line" },
];
const DEFAULT_SETTINGS: PlayerSettings = {
  speed: 1,
  flow: "flow",
  showRomaji: true,
  showEnglish: true,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or disabled; progress is a nice-to-have.
  }
}

export function ListeningPractice({
  language = "japanese",
}: {
  language?: keyof typeof scenarioLoaders;
}) {
  const progressKey = `listening-scenario-progress:${language}`;
  const [scenarios, setScenarios] = useState<ListeningScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShadowGap, setIsShadowGap] = useState(false);
  const [finishedScenarioId, setFinishedScenarioId] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading listening scenarios...");
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const [heardLines, setHeardLines] = useState<HeardLines>({});
  const [levelFilter, setLevelFilter] = useState("all");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const gapTimerRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linesScrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const completeRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    setSettings(readJson(SETTINGS_KEY, DEFAULT_SETTINGS));
    setHeardLines(readJson<HeardLines>(progressKey, {}));
  }, [progressKey]);

  useEffect(() => {
    scenarioLoaders[language]()
      .then((items) => {
        setScenarios(items);
        setActiveScenarioId(items[0]?.id ?? null);
        setStatus("");
      })
      .catch((err) =>
        setStatus(err instanceof Error ? err.message : "Could not load listening scenarios"),
      );

    return () => {
      if (gapTimerRef.current !== null) window.clearTimeout(gapTimerRef.current);
      detachAudio(audioRef.current);
    };
  }, [language]);

  const activeScenario =
    scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
  const activeIndexInList = activeScenario ? scenarios.indexOf(activeScenario) : -1;
  const nextScenario = activeIndexInList >= 0 ? scenarios[activeIndexInList + 1] : undefined;
  const hasRomaji = scenarios.some((scenario) => scenario.lines.some((line) => line.romaji));
  const totalLines = scenarios.reduce((sum, scenario) => sum + scenario.lines.length, 0);

  const levels = useMemo(
    () => Array.from(new Set(scenarios.map((scenario) => scenario.level))),
    [scenarios],
  );

  const groups = useMemo(() => {
    const visible =
      levelFilter === "all"
        ? scenarios
        : scenarios.filter((scenario) => scenario.level === levelFilter);
    const byCategory = new Map<string, ListeningScenario[]>();
    for (const scenario of visible) {
      const category = scenario.category ?? "";
      byCategory.set(category, [...(byCategory.get(category) ?? []), scenario]);
    }
    return Array.from(byCategory, ([category, items]) => ({ category, items }));
  }, [levelFilter, scenarios]);

  const speakerSides = useMemo(() => {
    if (!activeScenario) return new Map<string, "left" | "right">();
    const speakers = Array.from(new Set(activeScenario.lines.map((line) => line.speaker)));
    const hasYou = speakers.includes("You");
    return new Map(
      speakers.map((speaker, index) => [
        speaker,
        (hasYou ? speaker === "You" : index % 2 === 1) ? "right" : "left",
      ]),
    );
  }, [activeScenario]);

  useEffect(() => {
    if (activeLineIndex === null) return;
    lineRefs.current[activeLineIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLineIndex]);

  useEffect(() => {
    if (finishedScenarioId) {
      completeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [finishedScenarioId]);

  function heardCount(scenario: ListeningScenario) {
    return heardLines[scenario.id]?.length ?? 0;
  }

  function markHeard(scenarioId: string, index: number) {
    setHeardLines((current) => {
      const lines = current[scenarioId] ?? [];
      if (lines.includes(index)) return current;
      const next = { ...current, [scenarioId]: [...lines, index] };
      writeJson(progressKey, next);
      return next;
    });
  }

  function updateSettings(patch: Partial<PlayerSettings>) {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeJson(SETTINGS_KEY, next);
      return next;
    });
    if (patch.speed !== undefined && audioRef.current) {
      audioRef.current.playbackRate = patch.speed;
    }
  }

  function clearGap() {
    if (gapTimerRef.current !== null) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    setIsShadowGap(false);
  }

  function pausePlayback() {
    clearGap();
    pauseAudio(audioRef.current);
    setIsPlaying(false);
  }

  function stopPlayback(reset = false) {
    clearGap();
    detachAudio(audioRef.current);
    audioRef.current = null;
    setIsPlaying(false);
    if (reset) {
      setActiveLineIndex(null);
      setFinishedScenarioId(null);
    }
  }

  function playLine(index: number) {
    if (!activeScenario) return;
    clearGap();

    const line = activeScenario.lines[index];
    if (!line) {
      stopPlayback(true);
      setFinishedScenarioId(activeScenario.id);
      return;
    }

    setFinishedScenarioId(null);
    setActiveLineIndex(index);

    if (!line.audio?.public_url || line.audio.status !== "ready") {
      setStatus(`Audio for line ${index + 1} is still being prepared. Try again in a minute.`);
      stopPlayback();
      return;
    }

    const audio = replaceAudio(audioRef.current, line.audio.public_url, {
      playbackRate: settingsRef.current.speed,
    });
    audioRef.current = audio;
    setIsPlaying(true);
    setStatus("");

    const nextUrl = activeScenario.lines[index + 1]?.audio?.public_url;
    if (nextUrl && preloadRef.current?.src !== nextUrl) {
      const preload = new Audio();
      preload.preload = "auto";
      preload.src = nextUrl;
      preloadRef.current = preload;
    }

    audio.onended = () => {
      recordStudyActivity(language, "listening_line_complete", "listening", {
        scenario_id: activeScenario.id,
        line_index: index,
      });
      markHeard(activeScenario.id, index);

      const { flow } = settingsRef.current;
      if (flow === "line") {
        setIsPlaying(false);
        return;
      }
      if (flow === "shadow") {
        const clipMs = ((audio.duration || 2) / audio.playbackRate) * 1000;
        setIsShadowGap(true);
        gapTimerRef.current = window.setTimeout(() => playLine(index + 1), clipMs + 900);
        return;
      }
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

  function resumeIndex(scenario: ListeningScenario) {
    const heard = new Set(heardLines[scenario.id] ?? []);
    if (heard.size === 0 || heard.size >= scenario.lines.length) return 0;
    const firstUnheard = scenario.lines.findIndex((_, index) => !heard.has(index));
    return Math.max(firstUnheard, 0);
  }

  function togglePlayback() {
    if (!activeScenario) return;
    if (isPlaying) {
      pausePlayback();
      return;
    }

    const audio = audioRef.current;
    if (audio && audio.src && activeLineIndex !== null) {
      if (audio.ended) {
        playLine(activeLineIndex + 1);
        return;
      }
      setIsPlaying(true);
      void playAudioElement(audio).then((started) => {
        if (!started) {
          setIsPlaying(false);
        }
      });
      return;
    }

    playLine(activeLineIndex ?? resumeIndex(activeScenario));
  }

  function stepLine(delta: number) {
    if (!activeScenario) return;
    const current = activeLineIndex ?? (delta > 0 ? -1 : 0);
    const target = Math.min(Math.max(current + delta, 0), activeScenario.lines.length - 1);
    playLine(target);
  }

  function selectScenario(id: string) {
    stopPlayback(true);
    setStatus("");
    setActiveScenarioId(id);
    setLibraryOpen(false);
    lineRefs.current = [];
    pendingScrollRef.current = true;
  }

  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    linesScrollRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [activeScenarioId]);

  const activeHeard = activeScenario ? heardCount(activeScenario) : 0;
  const canResume =
    activeScenario !== undefined &&
    activeLineIndex === null &&
    activeHeard > 0 &&
    activeHeard < activeScenario.lines.length;
  const playLabel = isPlaying ? "Pause" : canResume ? "Resume" : "Play";
  const lineCount = activeScenario?.lines.length ?? 0;
  const positionPercent =
    activeLineIndex === null || lineCount === 0 ? 0 : ((activeLineIndex + 1) / lineCount) * 100;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-6">
      <aside className="min-w-0 rounded-[2rem] border border-black/10 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4 lg:flex lg:min-h-0 lg:flex-col">
        <button
          aria-expanded={libraryOpen}
          className="flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-1 text-left lg:pointer-events-none"
          onClick={() => setLibraryOpen((open) => !open)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
              Scenario Library
            </span>
            <span className="mt-1 block truncate text-sm text-slate-600 lg:hidden">
              {activeScenario ? activeScenario.title : "Loading..."}
            </span>
            {scenarios.length > 0 ? (
              <span className="mt-1 hidden text-sm text-slate-600 lg:block">
                {scenarios.length} conversations · {totalLines} lines
              </span>
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-washi px-3 py-1.5 text-xs font-semibold text-ink lg:hidden">
            {scenarios.length} scenarios
            <ChevronDown
              className={twMerge("h-4 w-4 transition", libraryOpen && "rotate-180")}
            />
          </span>
        </button>

        <div
          className={twMerge(
            "mt-3 lg:mt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
            libraryOpen ? "block" : "hidden",
          )}
        >
          {levels.length > 1 ? (
            <div className="flex flex-wrap gap-1.5 px-1" role="group" aria-label="Filter by level">
              {["all", ...levels].map((level) => (
                <button
                  className={twMerge(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    levelFilter === level
                      ? "bg-ink text-white"
                      : "bg-washi text-slate-600 hover:bg-sakura/40 hover:text-ink",
                  )}
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  type="button"
                >
                  {level === "all" ? "All" : level}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 max-h-[60svh] space-y-4 overflow-y-auto overscroll-contain pr-1 lg:max-h-none lg:min-h-0 lg:flex-1">
            {groups.map((group) => (
              <div key={group.category || "all"}>
                {group.category ? (
                  <p className="px-2 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {group.category}
                  </p>
                ) : null}
                <div className="space-y-2">
                  {group.items.map((scenario) => {
                    const active = scenario.id === activeScenario?.id;
                    const heard = heardCount(scenario);
                    const done = heard >= scenario.lines.length;
                    return (
                      <button
                        className={twMerge(
                          "w-full rounded-2xl p-3 text-left transition",
                          active
                            ? "bg-matcha text-white shadow-sm"
                            : "bg-washi text-ink hover:bg-sakura/40",
                        )}
                        key={scenario.id}
                        onClick={() => selectScenario(scenario.id)}
                        type="button"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-semibold leading-snug">{scenario.title}</span>
                          {done ? (
                            <span
                              className={twMerge(
                                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                                active ? "bg-white/25" : "bg-matcha text-white",
                              )}
                              title="Every line heard"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={twMerge(
                            "mt-1 block text-sm",
                            active ? "text-white/75" : "text-slate-600",
                          )}
                        >
                          {scenario.setting}
                        </span>
                        <span
                          className={twMerge(
                            "mt-2 flex items-center gap-2 text-xs",
                            active ? "text-white/75" : "text-slate-500",
                          )}
                        >
                          <span>{scenario.level}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {heard > 0 && !done
                              ? `${heard}/${scenario.lines.length} heard`
                              : `${scenario.lines.length} lines`}
                          </span>
                        </span>
                        {heard > 0 && !done ? (
                          <span
                            className={twMerge(
                              "mt-2 block h-1 overflow-hidden rounded-full",
                              active ? "bg-white/25" : "bg-black/10",
                            )}
                          >
                            <span
                              className={twMerge(
                                "block h-full rounded-full",
                                active ? "bg-white" : "bg-matcha",
                              )}
                              style={{ width: `${(heard / scenario.lines.length) * 100}%` }}
                            />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section
        className="min-w-0 scroll-mt-24 rounded-[2rem] border border-black/10 bg-white/80 shadow-sm backdrop-blur lg:flex lg:min-h-0 lg:flex-col"
        ref={sectionRef}
      >
        {activeScenario ? (
          <>
            <div className="border-b border-black/5 p-4 sm:px-6 sm:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
                {[activeScenario.level, activeScenario.category].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-1.5 text-2xl font-bold text-ink">{activeScenario.title}</h2>
              <p className="mt-1.5 max-w-3xl text-sm text-slate-600">
                {activeScenario.description}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {activeScenario.setting} · {lineCount} lines
                {activeHeard > 0 ? ` · ${activeHeard} heard` : ""}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div
                  aria-label="Playback mode"
                  className="inline-flex rounded-full border border-black/10 bg-washi p-1"
                  role="radiogroup"
                >
                  {FLOW_MODES.map((mode) => (
                    <button
                      aria-checked={settings.flow === mode.id}
                      className={twMerge(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        settings.flow === mode.id
                          ? "bg-ink text-white"
                          : "text-slate-600 hover:text-ink",
                      )}
                      key={mode.id}
                      onClick={() => updateSettings({ flow: mode.id })}
                      role="radio"
                      title={mode.hint}
                      type="button"
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div
                  aria-label="Playback speed"
                  className="inline-flex rounded-full border border-black/10 bg-washi p-1"
                  role="radiogroup"
                >
                  {SPEEDS.map((speed) => (
                    <button
                      aria-checked={settings.speed === speed}
                      className={twMerge(
                        "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition",
                        settings.speed === speed
                          ? "bg-ink text-white"
                          : "text-slate-600 hover:text-ink",
                      )}
                      key={speed}
                      onClick={() => updateSettings({ speed })}
                      role="radio"
                      type="button"
                    >
                      {speed}×
                    </button>
                  ))}
                </div>
                {hasRomaji ? (
                  <ToggleChip
                    active={settings.showRomaji}
                    label="Romaji"
                    onClick={() => updateSettings({ showRomaji: !settings.showRomaji })}
                  />
                ) : null}
                <ToggleChip
                  active={settings.showEnglish}
                  label="English"
                  onClick={() => updateSettings({ showEnglish: !settings.showEnglish })}
                />
              </div>
            </div>

            <div
              className="space-y-3 p-4 sm:space-y-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain"
              ref={linesScrollRef}
            >
              {activeScenario.lines.map((line, index) => {
                const isActive = activeLineIndex === index;
                const alignRight = speakerSides.get(line.speaker) === "right";
                const ready = line.audio?.status === "ready" && Boolean(line.audio.public_url);

                return (
                  <div
                    className={twMerge(
                      "flex scroll-mb-36 scroll-mt-28 lg:scroll-mb-6 lg:scroll-mt-6",
                      alignRight ? "justify-end" : "justify-start",
                    )}
                    key={`${activeScenario.id}-${index}`}
                    ref={(node) => {
                      lineRefs.current[index] = node;
                    }}
                  >
                    <button
                      className={twMerge(
                        "relative max-w-full rounded-[1.75rem] border p-4 text-left shadow-sm transition sm:max-w-[92%] sm:p-5 md:max-w-[80%]",
                        alignRight ? "rounded-br-md" : "rounded-bl-md",
                        isActive
                          ? "border-matcha bg-matcha/20 shadow-lg ring-2 ring-matcha/30"
                          : alignRight
                            ? "border-sakura/40 bg-sakura/25 hover:bg-sakura/35"
                            : "border-black/10 bg-washi hover:bg-white",
                      )}
                      onClick={() => playLine(index)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-matcha">
                          {line.speaker}
                        </p>
                        <span className="flex items-center gap-2 text-xs tabular-nums text-slate-400">
                          {isActive && isShadowGap ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-semibold text-white">
                              <Mic className="h-3 w-3" />
                              Your turn
                            </span>
                          ) : null}
                          {ready ? null : <span title="Audio is still being prepared">…</span>}
                          {index + 1}
                        </span>
                      </div>
                      <p
                        className={twMerge(
                          "mt-2 text-xl font-semibold leading-relaxed sm:text-2xl",
                          isActive ? "text-ink" : "text-slate-800",
                        )}
                      >
                        {line.japanese}
                      </p>
                      {settings.showRomaji && line.romaji ? (
                        <p
                          className={twMerge(
                            "mt-1.5 text-sm sm:text-base",
                            isActive ? "font-semibold text-ink" : "text-slate-600",
                          )}
                        >
                          {line.romaji}
                        </p>
                      ) : null}
                      {settings.showEnglish ? (
                        <p
                          className={twMerge(
                            "mt-1 text-sm sm:text-base",
                            isActive ? "font-semibold text-ink" : "text-slate-600",
                          )}
                        >
                          {line.english}
                        </p>
                      ) : null}
                    </button>
                  </div>
                );
              })}

              {finishedScenarioId === activeScenario.id ? (
                <div
                  className="scroll-mb-36 rounded-[1.75rem] border border-matcha/30 bg-matcha/10 p-5 text-center lg:scroll-mb-6"
                  ref={completeRef}
                >
                  <p className="text-lg font-bold text-ink">End of conversation</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {activeHeard >= lineCount
                      ? "Every line heard. Try it again with English hidden, or move on."
                      : `${activeHeard} of ${lineCount} lines heard so far.`}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                      onClick={() => playLine(0)}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Play again
                    </button>
                    {nextScenario ? (
                      <button
                        className="inline-flex max-w-full items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => selectScenario(nextScenario.id)}
                        type="button"
                      >
                        <span className="truncate">Next: {nextScenario.title}</span>
                        <SkipForward className="h-4 w-4 shrink-0" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-20 mx-3 mb-3 rounded-[1.5rem] border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur sm:mx-4 sm:mb-4 lg:static lg:mx-0 lg:mb-0 lg:rounded-none lg:rounded-b-[2rem] lg:border-x-0 lg:border-b-0 lg:shadow-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  aria-label="Previous line"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-ink transition hover:bg-washi"
                  onClick={() => stepLine(-1)}
                  type="button"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white"
                  onClick={togglePlayback}
                  type="button"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playLabel}
                </button>
                <button
                  aria-label="Next line"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-ink transition hover:bg-washi"
                  onClick={() => stepLine(1)}
                  type="button"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate tabular-nums">
                      {activeLineIndex === null
                        ? canResume
                          ? `${resumeIndex(activeScenario) + 1} / ${lineCount}`
                          : `${lineCount} lines`
                        : `${activeLineIndex + 1} / ${lineCount}`}
                    </span>
                    <button
                      className="hidden items-center gap-1 font-semibold text-slate-600 hover:text-ink sm:inline-flex"
                      onClick={() => playLine(0)}
                      type="button"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restart
                    </button>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-matcha transition-[width] duration-300"
                      style={{ width: `${positionPercent}%` }}
                    />
                  </div>
                </div>
                <button
                  aria-label="Restart conversation"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-ink sm:hidden"
                  onClick={() => playLine(0)}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              {status ? (
                <p className="mt-2 rounded-xl bg-washi px-3 py-2 text-xs text-slate-700">{status}</p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="p-6 text-slate-600">{status || "No listening scenarios yet."}</p>
        )}
      </section>
    </div>
  );
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={twMerge(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-matcha/40 bg-matcha/15 text-ink"
          : "border-black/10 bg-white text-slate-500 line-through decoration-slate-400",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
