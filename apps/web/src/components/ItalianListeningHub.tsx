"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Headphones, MessagesSquare, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { recordStudyActivity } from "@/lib/progress";

type Line = { speaker: string; italian: string; english: string };
type Scenario = { id: string; title: string; setting: string; level: string; description: string; lines: Line[] };

const scenarios: Scenario[] = [
  { id: "cafe", title: "At the café", setting: "Neighborhood bar", level: "Beginner", description: "Order a coffee and pay at the counter.", lines: [
    { speaker: "Barista", italian: "Buongiorno, desidera?", english: "Good morning, what would you like?" },
    { speaker: "You", italian: "Un cappuccino e un cornetto, per favore.", english: "A cappuccino and a croissant, please." },
    { speaker: "Barista", italian: "Altro?", english: "Anything else?" },
    { speaker: "You", italian: "No, grazie. Quanto costa?", english: "No, thank you. How much is it?" },
  ] },
  { id: "introduction", title: "First introduction", setting: "Language class", level: "Beginner", description: "Share your name, origin, and interests.", lines: [
    { speaker: "A", italian: "Ciao! Come ti chiami?", english: "Hi! What's your name?" },
    { speaker: "B", italian: "Mi chiamo Alex. E tu?", english: "My name is Alex. And you?" },
    { speaker: "A", italian: "Sono Giulia. Di dove sei?", english: "I'm Giulia. Where are you from?" },
    { speaker: "B", italian: "Sono degli Stati Uniti.", english: "I'm from the United States." },
  ] },
  { id: "station", title: "Finding the train", setting: "Railway station", level: "Beginner", description: "Find the right platform and departure time.", lines: [
    { speaker: "You", italian: "Scusi, da quale binario parte il treno per Firenze?", english: "Excuse me, which platform does the train to Florence leave from?" },
    { speaker: "Staff", italian: "Parte dal binario sette.", english: "It leaves from platform seven." },
    { speaker: "You", italian: "A che ora parte?", english: "What time does it leave?" },
    { speaker: "Staff", italian: "Alle quattordici e venti.", english: "At two twenty p.m." },
  ] },
  { id: "directions", title: "Asking directions", setting: "City street", level: "Beginner", description: "Ask how to reach the town square.", lines: [
    { speaker: "You", italian: "Mi scusi, come si arriva in piazza?", english: "Excuse me, how do you get to the square?" },
    { speaker: "Local", italian: "Vada sempre dritto, poi giri a sinistra.", english: "Go straight ahead, then turn left." },
    { speaker: "You", italian: "È lontano?", english: "Is it far?" },
    { speaker: "Local", italian: "No, sono cinque minuti a piedi.", english: "No, it's a five-minute walk." },
  ] },
  { id: "restaurant", title: "Dinner out", setting: "Trattoria", level: "A1–A2", description: "Ask about a dish and order dinner.", lines: [
    { speaker: "Server", italian: "Siete pronti per ordinare?", english: "Are you ready to order?" },
    { speaker: "You", italian: "Che cosa consiglia?", english: "What do you recommend?" },
    { speaker: "Server", italian: "La pasta alla norma è la specialità della casa.", english: "Pasta alla Norma is the house specialty." },
    { speaker: "You", italian: "Perfetto, prendo quella.", english: "Perfect, I'll have that." },
  ] },
];

export function ItalianListeningHub() {
  const [mode, setMode] = useState<"drills" | "scenarios">("drills");
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [lineIndex, setLineIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(true);
  const [playing, setPlaying] = useState(false);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const drillLines = useMemo(() => scenarios.flatMap((item) => item.lines), []);
  const activeLine = mode === "drills" ? drillLines[lineIndex % drillLines.length] : scenario.lines[lineIndex % scenario.lines.length];

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  function playLine(line: Line, onEnd?: () => void) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line.italian);
    utterance.lang = "it-IT";
    utterance.rate = 0.82;
    utterance.onend = () => {
      setPlaying(false);
      recordStudyActivity("italian", "listening_line_complete", "listening", {
        scenario_id: scenario.id,
        line: line.italian,
      });
      onEnd?.();
    };
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  function playContinuous() {
    playLine(activeLine, () => setLineIndex((index) => (index + 1) % drillLines.length));
  }

  return (
    <div className="theme-italian flex min-h-0 flex-1 flex-col gap-5 md:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">Listening</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Train your ear at your pace.</h1><p className="mt-2 text-sm text-slate-600">Shadow short Italian phrases or follow natural conversations line by line.</p></div>
        <div className="flex w-full rounded-2xl border border-black/10 bg-white/65 p-1.5 shadow-sm sm:w-auto" role="tablist">
          <ModeButton active={mode === "drills"} icon={Headphones} label="Quick drills" onClick={() => { setMode("drills"); setLineIndex(0); }} />
          <ModeButton active={mode === "scenarios"} icon={MessagesSquare} label="Scenarios" onClick={() => { setMode("scenarios"); setLineIndex(0); }} />
        </div>
      </header>

      {mode === "drills" ? (
        <section className="grid flex-1 place-items-center rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-8">
          <div className="w-full max-w-2xl text-center">
            <span className="rounded-full bg-matcha/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Phrase {lineIndex + 1} of {drillLines.length}</span>
            <p className="mt-8 text-3xl font-bold leading-tight text-ink sm:text-5xl">{activeLine.italian}</p>
            {showEnglish ? <p className="mt-4 text-base text-slate-500 sm:text-lg">{activeLine.english}</p> : <p className="mt-4 text-base italic text-slate-400">Translation hidden</p>}
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white text-ink" onClick={() => setShowEnglish((value) => !value)} type="button">{showEnglish ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              <button className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-white" onClick={() => playing ? (window.speechSynthesis.cancel(), setPlaying(false)) : playContinuous()} type="button">{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}{playing ? "Pause" : "Listen"}</button>
              <button className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white text-ink" onClick={() => setLineIndex((index) => (index + 1) % drillLines.length)} type="button"><RotateCcw className="h-5 w-5" /></button>
            </div>
            <p className="mt-7 text-sm text-slate-500">Listen once, then repeat aloud before moving on.</p>
          </div>
        </section>
      ) : (
        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[18rem_1fr]">
          <aside className="space-y-2 rounded-[2rem] border border-black/10 bg-white/75 p-3 shadow-sm backdrop-blur">
            {scenarios.map((item) => <button className={item.id === scenario.id ? "w-full rounded-2xl bg-ink p-4 text-left text-white" : "w-full rounded-2xl p-4 text-left text-slate-600 transition hover:bg-washi hover:text-ink"} key={item.id} onClick={() => { setScenarioId(item.id); setLineIndex(0); }} type="button"><span className="block font-bold">{item.title}</span><span className="mt-1 block text-xs opacity-65">{item.setting} · {item.level}</span></button>)}
          </aside>
          <section className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">{scenario.setting}</p><h2 className="mt-2 text-2xl font-bold text-ink">{scenario.title}</h2><p className="mt-1 text-sm text-slate-500">{scenario.description}</p></div><button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold" onClick={() => setShowEnglish((value) => !value)} type="button">{showEnglish ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showEnglish ? "Hide" : "Show"} English</button></div>
            <div className="mt-6 space-y-3">{scenario.lines.map((line, index) => <button className={twMerge("flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition", lineIndex === index ? "border-matcha bg-matcha/5" : "border-black/5 bg-washi/70 hover:border-matcha/30")} key={`${line.speaker}-${line.italian}`} onClick={() => { setLineIndex(index); playLine(line); }} type="button"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-matcha shadow-sm">{line.speaker.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{line.speaker}</span><span className="mt-1 block font-semibold text-ink">{line.italian}</span>{showEnglish ? <span className="mt-1 block text-sm text-slate-500">{line.english}</span> : null}</span><Volume2 className="mt-2 h-4 w-4 shrink-0 text-matcha" /></button>)}</div>
          </section>
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Headphones; label: string; onClick: () => void }) { return <button aria-selected={active} className={twMerge("inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4", active ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-ink")} onClick={onClick} role="tab" type="button"><Icon className="h-4 w-4" />{label}</button>; }
