"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Volume2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  spanishVerbs as verbs,
  spokenVerbForm as spokenForm,
  tenses,
  verbFormsFor as formsFor,
  verbPronouns as pronouns,
  type Tense,
} from "@/data/spanishLessons";
import { recordStudyActivity } from "@/lib/progress";
import { prefetchSpanishAudio, useSpanishSpeech } from "@/lib/spanishAudio";

export function SpanishVerbTrainer() {
  const [selected, setSelected] = useState(0);
  const [tense, setTense] = useState<Tense>("present");
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const speech = useSpanishSpeech();
  const verb = verbs[selected];
  const forms = formsFor(verb, tense);
  const activeTense = tenses.find((item) => item.id === tense) ?? tenses[0];

  useEffect(() => {
    setRevealed([]);
  }, [selected, tense, quiz]);

  useEffect(() => {
    const current = verbs[selected];
    prefetchSpanishAudio([
      current.infinitive,
      current.examples[tense],
      ...formsFor(current, tense).map((form, index) => spokenForm(index, form)),
    ]);
  }, [selected, tense]);

  function playForm(index: number, form: string) {
    if (quiz && !revealed.includes(index)) setRevealed((items) => [...items, index]);
    void speech.speak(spokenForm(index, form));
    recordStudyActivity("spanish", "verb_form_practice", "verb_lab", { verb: verb.infinitive, tense, form });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
      <aside className="grid max-h-[34rem] grid-cols-2 gap-1 overflow-y-auto rounded-[2rem] border border-black/10 bg-white/80 p-3 shadow-sm backdrop-blur lg:block lg:max-h-none">
        {verbs.map((item, index) => (
          <button className={index === selected ? "flex w-full items-center justify-between rounded-2xl bg-ink px-4 py-3 text-left text-white" : "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-washi hover:text-ink"} key={item.infinitive} onClick={() => setSelected(index)} type="button">
            <span><span className="block font-bold">{item.infinitive}</span><span className="text-xs opacity-65">{item.english}</span></span>
            <span className="hidden text-xs font-semibold opacity-60 sm:inline">{item.group}</span>
          </button>
        ))}
      </aside>
      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tense">
          {tenses.map((item) => (
            <button aria-selected={item.id === tense} className={twMerge("rounded-full border px-4 py-2 text-sm font-semibold transition", item.id === tense ? "border-matcha bg-matcha text-white" : "border-black/10 bg-washi text-slate-600 hover:text-ink")} key={item.id} onClick={() => setTense(item.id)} role="tab" type="button">{item.label}</button>
          ))}
          <button aria-pressed={quiz} className={twMerge("ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition", quiz ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-slate-600 hover:text-ink")} onClick={() => setQuiz((value) => !value)} type="button">{quiz ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}Quiz mode</button>
        </div>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-matcha">{activeTense.spanish}</p><h2 className="mt-2 text-4xl font-bold text-ink sm:text-5xl">{verb.infinitive}</h2><p className="mt-2 text-slate-500">{verb.english} · {activeTense.hint}</p></div>
          <button className="inline-flex items-center gap-2 rounded-full bg-matcha px-4 py-2 text-sm font-semibold text-white" onClick={() => void speech.speak(verb.infinitive)} type="button">{speech.loadingText === verb.infinitive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}Hear it</button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {forms.map((form, index) => {
            const hidden = quiz && !revealed.includes(index);
            const text = spokenForm(index, form);
            return (
              <button className={twMerge("rounded-2xl bg-washi p-4 text-left transition hover:ring-2 hover:ring-matcha/30", speech.playingText === text && "ring-2 ring-matcha/50")} key={`${pronouns[index]}-${form}`} onClick={() => playForm(index, form)} type="button">
                <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-matcha">{pronouns[index]}{speech.loadingText === text ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}</span>
                <span className={twMerge("mt-2 block text-xl font-bold text-ink", hidden && "select-none blur-sm")}>{hidden ? "••••••" : form}</span>
              </button>
            );
          })}
        </div>
        {quiz ? <p className="mt-4 text-xs text-slate-500">Say each form out loud first, then tap to reveal and hear the native pronunciation.</p> : null}
        <div className="mt-7 rounded-2xl border border-matcha/15 bg-matcha/5 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Example</p><p className="mt-2 text-lg font-semibold text-ink">{verb.examples[tense]}</p><button className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-matcha" onClick={() => void speech.speak(verb.examples[tense])} type="button">{speech.loadingText === verb.examples[tense] ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}Play sentence</button></div>
        <p className="mt-5 text-xs leading-5 text-slate-500"><span className="font-bold text-matcha">Latin America tip:</span> ustedes is the only plural you—formal or casual—so you never need the vosotros forms used in Spain.</p>
      </section>
    </div>
  );
}
