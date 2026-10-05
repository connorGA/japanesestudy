"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, Play, RotateCcw, Sparkles, Trophy, Volume2, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { spanishCards } from "@/data/spanish";
import { filledSerEstar, phraseRounds, serEstarRounds } from "@/data/spanishLessons";
import { recordStudyActivity } from "@/lib/progress";
import { prefetchSpanishAudio, useSpanishSpeech } from "@/lib/spanishAudio";
import { speakableSpanish } from "@/lib/spanishText";

const wordCards = spanishCards.filter((card) => card.deck === "vocabulary" || card.deck === "travel");

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function SpanishWordMatchGame() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(45);
  const [order, setOrder] = useState(wordCards);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const speech = useSpanishSpeech();
  const answer = order[round % order.length];
  const choices = useMemo(() => {
    const candidates = [answer, order[(round + 5) % order.length], order[(round + 11) % order.length], order[(round + 17) % order.length]];
    const shift = round % candidates.length;
    return [...candidates.slice(shift), ...candidates.slice(0, shift)];
  }, [answer, order, round]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTime((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    prefetchSpanishAudio(wordCards.map((card) => card.spanish));
  }, []);

  function start() { setOrder(shuffled(wordCards)); setTime(45); setRound(0); setScore(0); setStreak(0); setFeedback(null); setRunning(true); }
  function choose(id: string) {
    if (!running || feedback) return;
    const correct = id === answer.id;
    setFeedback(correct ? "right" : "wrong");
    if (correct) {
      setScore((value) => value + 100 + streak * 20);
      setStreak((value) => value + 1);
      void speech.speak(answer.spanish);
      recordStudyActivity("spanish", "arcade_correct", "word_match", { card_id: answer.id });
    } else setStreak(0);
    window.setTimeout(() => { setFeedback(null); setRound((value) => value + 1); }, correct ? 650 : 430);
  }

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e8893a]/15 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-bold text-white"><Trophy className="h-4 w-4 text-[#f6c343]" />{score}</span><span className="inline-flex items-center gap-2 rounded-full bg-matcha/10 px-3 py-2 text-xs font-bold text-matcha"><Sparkles className="h-4 w-4" />×{Math.max(1, streak)}</span></div>
        <span className={twMerge("inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold tabular-nums", time <= 10 ? "bg-red-100 text-red-700" : "bg-washi text-ink")}><Clock3 className="h-4 w-4" />0:{String(time).padStart(2, "0")}</span>
      </div>
      <div className="relative mx-auto mt-12 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Choose the Spanish</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-6xl">{answer.english}</h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">{choices.map((choice) => <button className={twMerge("rounded-2xl border border-black/10 bg-washi px-5 py-5 text-lg font-bold text-ink transition hover:-translate-y-0.5 hover:border-matcha hover:bg-white disabled:cursor-default", feedback === "right" && choice.id === answer.id && "border-green-500 bg-green-50 text-green-800", feedback === "wrong" && choice.id !== answer.id && "opacity-50")} disabled={!running || Boolean(feedback)} key={choice.id} onClick={() => choose(choice.id)} type="button">{choice.spanish}</button>)}</div>
      </div>
      {!running ? <div className="absolute inset-0 grid place-items-center bg-ink/15 p-5 backdrop-blur-[3px]"><div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-matcha/10 text-matcha">{time === 0 ? <Trophy className="h-6 w-6" /> : <Play className="h-6 w-6" />}</span><h3 className="mt-4 text-2xl font-bold text-ink">{time === 0 ? "¡Se acabó el tiempo!" : "Palabra Sprint"}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{time === 0 ? `Final score: ${score}. ¿Otra vez?` : "Match as many English prompts to Spanish words as you can in 45 seconds. Each correct answer is spoken by a native Mexican voice."}</p><button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" onClick={start} type="button">{time === 0 ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}{time === 0 ? "Play again" : "Start game"}</button></div></div> : null}
    </section>
  );
}


export function SpanishPhraseBuilderGame() {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const speech = useSpanishSpeech();
  const item = phraseRounds[round % phraseRounds.length];
  const sentence = selected.map((index) => item.tokens[index]).join(" ");

  useEffect(() => {
    prefetchSpanishAudio([item.display]);
  }, [item.display]);

  function check() {
    const correct = sentence === item.answer;
    setResult(correct ? "right" : "wrong");
    if (correct) {
      setScore((value) => value + 1);
      void speech.speak(item.display);
      recordStudyActivity("spanish", "arcade_correct", "phrase_builder", { round: round % phraseRounds.length });
    }
  }
  function next() { speech.stop(); setRound((value) => (value + 1) % phraseRounds.length); setSelected([]); setResult(null); }

  return (
    <section className="rounded-[2.25rem] border border-black/10 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Arma la Frase · {round % phraseRounds.length + 1}/{phraseRounds.length}</span><span className="rounded-full bg-matcha/10 px-3 py-1.5 text-xs font-bold text-matcha">{score} solved</span></div>
      <div className="mx-auto mt-10 max-w-2xl text-center"><p className="text-2xl font-bold text-ink sm:text-4xl">{item.english}</p><p className="mt-3 text-sm text-slate-500">Tap the words in the correct Spanish order.</p></div>
      <div className={twMerge("mx-auto mt-10 min-h-24 max-w-2xl rounded-2xl border-2 border-dashed p-4", result === "right" ? "border-green-400 bg-green-50" : result === "wrong" ? "border-red-300 bg-red-50" : "border-black/10 bg-washi")}>
        {result === "right" ? (
          <button className="mx-auto flex items-center gap-2 py-3 text-center text-xl font-bold text-green-800" onClick={() => void speech.speak(item.display)} type="button"><Volume2 className="h-5 w-5" />{item.display}</button>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">{selected.map((tokenIndex) => <button className="rounded-xl bg-ink px-3 py-2 font-semibold text-white" key={tokenIndex} onClick={() => { setSelected((items) => items.filter((index) => index !== tokenIndex)); setResult(null); }} type="button">{item.tokens[tokenIndex]}</button>)}</div>
        )}
        {!selected.length ? <p className="py-4 text-center text-sm text-slate-400">Your sentence will appear here</p> : null}
      </div>
      <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">{item.tokens.map((token, index) => <button className="rounded-xl border border-black/10 bg-white px-4 py-2 font-semibold text-ink shadow-sm transition hover:border-matcha disabled:opacity-25" disabled={selected.includes(index) || result === "right"} key={`${token}-${index}`} onClick={() => { setSelected((items) => [...items, index]); setResult(null); }} type="button">{token}</button>)}</div>
      <div className="mt-8 flex justify-center gap-3">{result === "right" ? <button className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-bold text-white" onClick={next} type="button"><Check className="h-5 w-5" />Next phrase</button> : <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white disabled:opacity-35" disabled={!selected.length} onClick={check} type="button">{result === "wrong" ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}{result === "wrong" ? "Try again" : "Check sentence"}</button>}</div>
    </section>
  );
}


export function SerEstarGame() {
  const [order, setOrder] = useState(serEstarRounds);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const speech = useSpanishSpeech();
  const item = order[round % order.length];
  const filled = filledSerEstar(item);
  const finished = round >= order.length;

  useEffect(() => {
    setOrder(shuffled(serEstarRounds));
  }, []);

  useEffect(() => {
    prefetchSpanishAudio([speakableSpanish(filled)]);
  }, [filled]);

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === item.answer) {
      setScore((value) => value + 1);
      setStreak((value) => value + 1);
      recordStudyActivity("spanish", "arcade_correct", "ser_estar", { sentence: item.sentence });
    } else setStreak(0);
    void speech.speak(filled);
  }

  function next() { speech.stop(); setPicked(null); setRound((value) => value + 1); }
  function restart() { setOrder(shuffled(serEstarRounds)); setRound(0); setPicked(null); setScore(0); setStreak(0); }

  if (finished) {
    return (
      <section className="rounded-[2.25rem] border border-black/10 bg-white/85 p-8 text-center shadow-xl backdrop-blur">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-matcha/10 text-matcha"><Trophy className="h-6 w-6" /></span>
        <h2 className="mt-4 text-3xl font-bold text-ink">¡Muy bien!</h2>
        <p className="mt-2 text-slate-600">You got {score} of {order.length} right.</p>
        <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white" onClick={restart} type="button"><RotateCcw className="h-4 w-4" />Play again</button>
      </section>
    );
  }

  const correct = picked === item.answer;
  return (
    <section className="rounded-[2.25rem] border border-black/10 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Ronda {round + 1}/{order.length}</span>
        <div className="flex gap-2"><span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white">{score} correct</span><span className="inline-flex items-center gap-1 rounded-full bg-matcha/10 px-3 py-1.5 text-xs font-bold text-matcha"><Sparkles className="h-3.5 w-3.5" />{streak}</span></div>
      </div>
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-3xl font-bold leading-tight text-ink sm:text-5xl">{picked ? filled : item.sentence.replace("___", "＿＿＿")}</p>
        <p className="mt-3 text-sm text-slate-500">{item.english}</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3">
        {item.options.map((option) => (
          <button className={twMerge("rounded-2xl border border-black/10 bg-washi px-5 py-5 text-2xl font-bold text-ink transition hover:-translate-y-0.5 hover:border-matcha hover:bg-white disabled:cursor-default disabled:hover:translate-y-0", picked && option === item.answer && "border-green-500 bg-green-50 text-green-800", picked === option && option !== item.answer && "border-red-300 bg-red-50 text-red-700")} disabled={Boolean(picked)} key={option} onClick={() => choose(option)} type="button">{option}</button>
        ))}
      </div>
      {picked ? (
        <div className={twMerge("mx-auto mt-8 max-w-2xl rounded-2xl p-4 text-sm leading-6", correct ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900")}>
          <p className="font-bold">{correct ? "¡Correcto!" : `Not quite — it's "${item.answer}".`}</p>
          <p className="mt-1">{item.why}</p>
        </div>
      ) : null}
      <div className="mt-8 flex justify-center">
        <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white disabled:opacity-35" disabled={!picked} onClick={next} type="button">Next<ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
}
