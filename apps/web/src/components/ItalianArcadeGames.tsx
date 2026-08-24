"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Play, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import { italianCards } from "@/data/italian";
import { recordStudyActivity } from "@/lib/progress";
import { twMerge } from "tailwind-merge";

const wordCards = italianCards.filter((card) => card.deck === "vocabulary" || card.deck === "travel");

export function ItalianWordMatchGame() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(45);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const answer = wordCards[round % wordCards.length];
  const choices = useMemo(() => {
    const candidates = [answer, wordCards[(round + 5) % wordCards.length], wordCards[(round + 11) % wordCards.length], wordCards[(round + 17) % wordCards.length]];
    const shift = round % candidates.length;
    return [...candidates.slice(shift), ...candidates.slice(0, shift)];
  }, [answer, round]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTime((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function start() { setTime(45); setRound(0); setScore(0); setStreak(0); setFeedback(null); setRunning(true); }
  function choose(id: string) {
    if (!running || feedback) return;
    const correct = id === answer.id;
    setFeedback(correct ? "right" : "wrong");
    if (correct) { setScore((value) => value + 100 + streak * 20); setStreak((value) => value + 1); recordStudyActivity("italian", "arcade_correct", "word_match", { card_id: answer.id }); }
    else setStreak(0);
    window.setTimeout(() => { setFeedback(null); setRound((value) => value + 1); }, 430);
  }

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#bd463f]/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-bold text-white"><Trophy className="h-4 w-4 text-[#e5b74b]" />{score}</span><span className="inline-flex items-center gap-2 rounded-full bg-matcha/10 px-3 py-2 text-xs font-bold text-matcha"><Sparkles className="h-4 w-4" />×{Math.max(1, streak)}</span></div>
        <span className={twMerge("inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold tabular-nums", time <= 10 ? "bg-red-100 text-red-700" : "bg-washi text-ink")}><Clock3 className="h-4 w-4" />0:{String(time).padStart(2, "0")}</span>
      </div>
      <div className="relative mx-auto mt-12 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Choose the Italian</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-6xl">{answer.english}</h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">{choices.map((choice) => <button className={twMerge("rounded-2xl border border-black/10 bg-washi px-5 py-5 text-lg font-bold text-ink transition hover:-translate-y-0.5 hover:border-matcha hover:bg-white disabled:cursor-default", feedback === "right" && choice.id === answer.id && "border-green-500 bg-green-50 text-green-800", feedback === "wrong" && choice.id !== answer.id && "opacity-50")} disabled={!running || Boolean(feedback)} key={choice.id} onClick={() => choose(choice.id)} type="button">{choice.italian}</button>)}</div>
      </div>
      {!running ? <div className="absolute inset-0 grid place-items-center bg-ink/15 p-5 backdrop-blur-[3px]"><div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-matcha/10 text-matcha">{time === 0 ? <Trophy className="h-6 w-6" /> : <Play className="h-6 w-6" />}</span><h3 className="mt-4 text-2xl font-bold text-ink">{time === 0 ? "Tempo!" : "Parola Sprint"}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{time === 0 ? `Final score: ${score}. Ready to beat it?` : "Match as many English prompts to Italian words as you can in 45 seconds."}</p><button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" onClick={start} type="button">{time === 0 ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}{time === 0 ? "Play again" : "Start game"}</button></div></div> : null}
    </section>
  );
}

const phraseRounds = [
  { english: "I would like a coffee, please.", tokens: ["caffè", "Vorrei", "per", "un", "favore"], answer: "Vorrei un caffè per favore" },
  { english: "Where is the train station?", tokens: ["la", "Dov'è", "stazione", "ferroviaria"], answer: "Dov'è la stazione ferroviaria" },
  { english: "We speak a little Italian.", tokens: ["po'", "Parliamo", "un", "italiano", "di"], answer: "Parliamo un po' di italiano" },
  { english: "Today the weather is beautiful.", tokens: ["tempo", "Oggi", "bello", "è", "il"], answer: "Oggi il tempo è bello" },
  { english: "The bill, please.", tokens: ["favore", "Il", "per", "conto"], answer: "Il conto per favore" },
];

export function ItalianPhraseBuilderGame() {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const item = phraseRounds[round % phraseRounds.length];
  const sentence = selected.map((index) => item.tokens[index]).join(" ");

  function check() { const correct = sentence === item.answer; setResult(correct ? "right" : "wrong"); if (correct) { setScore((value) => value + 1); recordStudyActivity("italian", "arcade_correct", "phrase_builder", { round: round % phraseRounds.length }); } }
  function next() { setRound((value) => (value + 1) % phraseRounds.length); setSelected([]); setResult(null); }

  return (
    <section className="rounded-[2.25rem] border border-black/10 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Frase Builder</span><span className="rounded-full bg-matcha/10 px-3 py-1.5 text-xs font-bold text-matcha">{score} solved</span></div>
      <div className="mx-auto mt-10 max-w-2xl text-center"><p className="text-2xl font-bold text-ink sm:text-4xl">{item.english}</p><p className="mt-3 text-sm text-slate-500">Tap the words in the correct Italian order.</p></div>
      <div className={twMerge("mx-auto mt-10 min-h-24 max-w-2xl rounded-2xl border-2 border-dashed p-4", result === "right" ? "border-green-400 bg-green-50" : result === "wrong" ? "border-red-300 bg-red-50" : "border-black/10 bg-washi")}>
        <div className="flex flex-wrap justify-center gap-2">{selected.map((tokenIndex) => <button className="rounded-xl bg-ink px-3 py-2 font-semibold text-white" key={tokenIndex} onClick={() => { setSelected((items) => items.filter((index) => index !== tokenIndex)); setResult(null); }} type="button">{item.tokens[tokenIndex]}</button>)}</div>
        {!selected.length ? <p className="py-4 text-center text-sm text-slate-400">Your sentence will appear here</p> : null}
      </div>
      <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">{item.tokens.map((token, index) => <button className="rounded-xl border border-black/10 bg-white px-4 py-2 font-semibold text-ink shadow-sm transition hover:border-matcha disabled:opacity-25" disabled={selected.includes(index) || result === "right"} key={`${token}-${index}`} onClick={() => { setSelected((items) => [...items, index]); setResult(null); }} type="button">{token}</button>)}</div>
      <div className="mt-8 flex justify-center gap-3">{result === "right" ? <button className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-bold text-white" onClick={next} type="button"><Check className="h-5 w-5" />Next phrase</button> : <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white disabled:opacity-35" disabled={!selected.length} onClick={check} type="button">{result === "wrong" ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}{result === "wrong" ? "Try again" : "Check sentence"}</button>}</div>
    </section>
  );
}
