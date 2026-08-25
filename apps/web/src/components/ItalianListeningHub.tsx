"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Headphones,
  MessagesSquare,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  italianCards,
  type ItalianCard,
  type ItalianDeck,
} from "@/data/italian";
import { recordStudyActivity } from "@/lib/progress";

type Line = { speaker: string; italian: string; english: string };
type Scenario = {
  id: string;
  title: string;
  setting: string;
  level: string;
  description: string;
  lines: Line[];
};
type ListeningMode = "hands-free" | "scenarios";
type ListeningCategory = {
  id: ItalianDeck;
  title: string;
  description: string;
  items: ItalianCard[];
};

const categoryDetails: Array<Omit<ListeningCategory, "items">> = [
  {
    id: "vocabulary",
    title: "Everyday Words",
    description: "High-frequency words for daily conversations.",
  },
  {
    id: "phrases",
    title: "Essential Phrases",
    description: "Useful expressions for natural interactions.",
  },
  {
    id: "verbs",
    title: "Core Verbs",
    description: "The actions that power everyday Italian.",
  },
  {
    id: "travel",
    title: "Travel & Dining",
    description: "Words for trains, restaurants, and getting around.",
  },
];

const listeningCategories: ListeningCategory[] = categoryDetails.map((category) => ({
  ...category,
  items: italianCards.filter((card) => card.deck === category.id),
}));

const scenarios: Scenario[] = [
  {
    id: "cafe",
    title: "At the café",
    setting: "Neighborhood bar",
    level: "Beginner",
    description: "Order a coffee and pay at the counter.",
    lines: [
      { speaker: "Barista", italian: "Buongiorno, desidera?", english: "Good morning, what would you like?" },
      { speaker: "You", italian: "Un cappuccino e un cornetto, per favore.", english: "A cappuccino and a croissant, please." },
      { speaker: "Barista", italian: "Altro?", english: "Anything else?" },
      { speaker: "You", italian: "No, grazie. Quanto costa?", english: "No, thank you. How much is it?" },
    ],
  },
  {
    id: "introduction",
    title: "First introduction",
    setting: "Language class",
    level: "Beginner",
    description: "Share your name, origin, and interests.",
    lines: [
      { speaker: "A", italian: "Ciao! Come ti chiami?", english: "Hi! What's your name?" },
      { speaker: "B", italian: "Mi chiamo Alex. E tu?", english: "My name is Alex. And you?" },
      { speaker: "A", italian: "Sono Giulia. Di dove sei?", english: "I'm Giulia. Where are you from?" },
      { speaker: "B", italian: "Sono degli Stati Uniti.", english: "I'm from the United States." },
    ],
  },
  {
    id: "station",
    title: "Finding the train",
    setting: "Railway station",
    level: "Beginner",
    description: "Find the right platform and departure time.",
    lines: [
      { speaker: "You", italian: "Scusi, da quale binario parte il treno per Firenze?", english: "Excuse me, which platform does the train to Florence leave from?" },
      { speaker: "Staff", italian: "Parte dal binario sette.", english: "It leaves from platform seven." },
      { speaker: "You", italian: "A che ora parte?", english: "What time does it leave?" },
      { speaker: "Staff", italian: "Alle quattordici e venti.", english: "At two twenty p.m." },
    ],
  },
  {
    id: "directions",
    title: "Asking directions",
    setting: "City street",
    level: "Beginner",
    description: "Ask how to reach the town square.",
    lines: [
      { speaker: "You", italian: "Mi scusi, come si arriva in piazza?", english: "Excuse me, how do you get to the square?" },
      { speaker: "Local", italian: "Vada sempre dritto, poi giri a sinistra.", english: "Go straight ahead, then turn left." },
      { speaker: "You", italian: "È lontano?", english: "Is it far?" },
      { speaker: "Local", italian: "No, sono cinque minuti a piedi.", english: "No, it's a five-minute walk." },
    ],
  },
  {
    id: "restaurant",
    title: "Dinner out",
    setting: "Trattoria",
    level: "A1–A2",
    description: "Ask about a dish and order dinner.",
    lines: [
      { speaker: "Server", italian: "Siete pronti per ordinare?", english: "Are you ready to order?" },
      { speaker: "You", italian: "Che cosa consiglia?", english: "What do you recommend?" },
      { speaker: "Server", italian: "La pasta alla norma è la specialità della casa.", english: "Pasta alla Norma is the house specialty." },
      { speaker: "You", italian: "Perfetto, prendo quella.", english: "Perfect, I'll have that." },
    ],
  },
];

export function ItalianListeningHub() {
  const [mode, setMode] = useState<ListeningMode>("hands-free");
  const [categoryId, setCategoryId] = useState<ItalianDeck>(listeningCategories[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [itemIndex, setItemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [status, setStatus] = useState("");
  const playbackTokenRef = useRef(0);

  const category =
    listeningCategories.find((item) => item.id === categoryId) ?? listeningCategories[0];
  const activeItem = category.items[itemIndex] ?? category.items[0];
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const progress = category.items.length
    ? ((itemIndex + 1) / category.items.length) * 100
    : 0;

  useEffect(() => {
    return () => {
      playbackTokenRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, []);

  function stopPlayback(resetStep = false) {
    playbackTokenRef.current += 1;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    if (resetStep) setStepIndex(0);
  }

  function playStep(nextItemIndex: number, nextStepIndex: number, token: number) {
    const item = category.items[nextItemIndex];
    if (!item) {
      setIsPlaying(false);
      setItemIndex(Math.max(0, category.items.length - 1));
      setStepIndex(0);
      setStatus("Category complete. Restart it or choose another category.");
      return;
    }

    const sequence = buildSequence(item);
    const step = sequence[nextStepIndex];
    if (!step) {
      recordStudyActivity("italian", "passive_listening_item", "passive_listening", {
        category_id: category.id,
        card_id: item.id,
      });
      playStep(nextItemIndex + 1, 0, token);
      return;
    }

    setItemIndex(nextItemIndex);
    setStepIndex(nextStepIndex);
    setStatus(step.label);
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.lang = step.language;
    utterance.rate = playbackRate * (step.language === "it-IT" ? 0.9 : 1);
    utterance.onend = () => {
      if (playbackTokenRef.current !== token) return;
      window.setTimeout(() => playStep(nextItemIndex, nextStepIndex + 1, token), 450);
    };
    utterance.onerror = () => {
      if (playbackTokenRef.current !== token) return;
      setIsPlaying(false);
      setStatus("Speech playback failed. Try pressing play again.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function toggleHandsFreePlayback() {
    if (isPlaying) {
      stopPlayback();
      setStatus("Paused");
      return;
    }
    const token = playbackTokenRef.current + 1;
    playbackTokenRef.current = token;
    playStep(itemIndex, stepIndex, token);
  }

  function goToItem(nextIndex: number) {
    stopPlayback(true);
    const count = category.items.length;
    setItemIndex((nextIndex + count) % count);
    setStatus("");
  }

  function selectCategory(nextCategoryId: ItalianDeck) {
    stopPlayback(true);
    setCategoryId(nextCategoryId);
    setItemIndex(0);
    setStatus("");
  }

  function selectMode(nextMode: ListeningMode) {
    stopPlayback(true);
    setMode(nextMode);
    setStatus("");
  }

  function playScenarioLine(line: Line, index: number) {
    stopPlayback(true);
    setLineIndex(index);
    const utterance = new SpeechSynthesisUtterance(line.italian);
    utterance.lang = "it-IT";
    utterance.rate = 0.82;
    utterance.onend = () => {
      setIsPlaying(false);
      recordStudyActivity("italian", "listening_line_complete", "listening", {
        scenario_id: scenario.id,
        line: line.italian,
      });
    };
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="theme-italian flex min-h-0 flex-1 flex-col gap-5 md:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">Listening</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Train your ear at your pace.</h1>
          <p className="mt-2 text-sm text-slate-600">Hear the English once, then the Italian three times while the lesson advances for you.</p>
        </div>
        <div className="flex w-full rounded-2xl border border-black/10 bg-white/65 p-1.5 shadow-sm sm:w-auto" role="tablist">
          <ModeButton active={mode === "hands-free"} icon={Headphones} label="Hands-free" onClick={() => selectMode("hands-free")} />
          <ModeButton active={mode === "scenarios"} icon={MessagesSquare} label="Scenarios" onClick={() => selectMode("scenarios")} />
        </div>
      </header>

      {mode === "hands-free" ? (
        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[18rem_1fr]">
          <aside className="min-h-0 rounded-[2rem] border border-black/10 bg-white/75 p-3 shadow-sm backdrop-blur">
            <p className="px-2 pt-1 text-xs font-bold uppercase tracking-[0.2em] text-matcha">Categories</p>
            <div className="mt-3 space-y-2">
              {listeningCategories.map((item) => (
                <button
                  className={twMerge(
                    "w-full rounded-2xl p-4 text-left transition",
                    item.id === category.id
                      ? "bg-ink text-white shadow-sm"
                      : "bg-washi/70 text-slate-600 hover:bg-washi hover:text-ink",
                  )}
                  key={item.id}
                  onClick={() => selectCategory(item.id)}
                  type="button"
                >
                  <span className="block font-bold">{item.title}</span>
                  <span className="mt-1 block text-xs opacity-65">{item.items.length} words & phrases</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">{category.title}</p>
                <p className="mt-1 text-sm text-slate-500">{category.description}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-washi p-1">
                {[0.8, 1, 1.15].map((rate) => (
                  <button
                    className={twMerge(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition",
                      playbackRate === rate ? "bg-ink text-white" : "text-slate-500 hover:text-ink",
                    )}
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    type="button"
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>

            <div className="grid flex-1 place-items-center px-5 py-8 text-center sm:px-8">
              <div className="w-full max-w-2xl">
                <span className="rounded-full bg-matcha/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.17em] text-matcha">
                  {itemIndex + 1} of {category.items.length}
                </span>
                <p className="mt-7 text-xl font-semibold text-slate-500 sm:text-2xl">{activeItem.english}</p>
                <p className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-6xl">{activeItem.italian}</p>
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {["English", "Italian 1", "Italian 2", "Italian 3"].map((label, index) => (
                    <span
                      className={twMerge(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        stepIndex === index && isPlaying
                          ? "border-matcha bg-matcha text-white"
                          : "border-black/10 bg-white text-slate-400",
                      )}
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-5 min-h-5 text-sm font-medium text-slate-400">{status || "Ready for hands-free practice"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 px-4 pb-5 sm:px-6">
              <ControlButton label="Previous phrase" onClick={() => goToItem(itemIndex - 1)}><SkipBack className="h-5 w-5" /></ControlButton>
              <button className="inline-flex h-14 items-center gap-2 rounded-full bg-ink px-6 font-bold text-white transition hover:bg-ink/90" onClick={toggleHandsFreePlayback} type="button">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                {isPlaying ? "Pause" : "Play category"}
              </button>
              <ControlButton label="Next phrase" onClick={() => goToItem(itemIndex + 1)}><SkipForward className="h-5 w-5" /></ControlButton>
              <ControlButton label="Restart category" onClick={() => { goToItem(0); setItemIndex(0); }}><RotateCcw className="h-5 w-5" /></ControlButton>
            </div>

            <div className="flex items-center gap-4 border-t border-black/5 px-5 py-4 sm:px-7">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-matcha transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-semibold tabular-nums text-slate-500">{Math.round(progress)}%</span>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[18rem_1fr]">
          <aside className="space-y-2 rounded-[2rem] border border-black/10 bg-white/75 p-3 shadow-sm backdrop-blur">
            {scenarios.map((item) => (
              <button
                className={item.id === scenario.id ? "w-full rounded-2xl bg-ink p-4 text-left text-white" : "w-full rounded-2xl p-4 text-left text-slate-600 transition hover:bg-washi hover:text-ink"}
                key={item.id}
                onClick={() => { stopPlayback(true); setScenarioId(item.id); setLineIndex(0); }}
                type="button"
              >
                <span className="block font-bold">{item.title}</span>
                <span className="mt-1 block text-xs opacity-65">{item.setting} · {item.level}</span>
              </button>
            ))}
          </aside>
          <section className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">{scenario.setting}</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{scenario.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{scenario.description}</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold" onClick={() => setShowEnglish((value) => !value)} type="button">
                {showEnglish ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showEnglish ? "Hide" : "Show"} English
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {scenario.lines.map((line, index) => (
                <button
                  className={twMerge(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
                    lineIndex === index ? "border-matcha bg-matcha/5" : "border-black/5 bg-washi/70 hover:border-matcha/30",
                  )}
                  key={`${line.speaker}-${line.italian}`}
                  onClick={() => playScenarioLine(line, index)}
                  type="button"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-matcha shadow-sm">{line.speaker.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{line.speaker}</span>
                    <span className="mt-1 block font-semibold text-ink">{line.italian}</span>
                    {showEnglish ? <span className="mt-1 block text-sm text-slate-500">{line.english}</span> : null}
                  </span>
                  <Volume2 className="mt-1 h-4 w-4 shrink-0 text-matcha" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function buildSequence(item: ItalianCard) {
  return [
    { label: "English", text: item.english, language: "en-US" },
    { label: "Italian 1 of 3", text: item.italian, language: "it-IT" },
    { label: "Italian 2 of 3", text: item.italian, language: "it-IT" },
    { label: "Italian 3 of 3", text: item.italian, language: "it-IT" },
  ];
}

function ModeButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Headphones; label: string; onClick: () => void }) {
  return (
    <button
      aria-selected={active}
      className={twMerge(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none",
        active ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-ink",
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

function ControlButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className="grid h-11 w-11 place-items-center rounded-full text-slate-500 transition hover:bg-washi hover:text-ink" onClick={onClick} type="button">
      {children}
    </button>
  );
}
