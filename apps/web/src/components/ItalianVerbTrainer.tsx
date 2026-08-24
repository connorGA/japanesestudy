"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { recordStudyActivity } from "@/lib/progress";

const verbs = [
  { infinitive: "parlare", english: "to speak", group: "-are", forms: ["parlo", "parli", "parla", "parliamo", "parlate", "parlano"], example: "Parliamo italiano ogni giorno." },
  { infinitive: "prendere", english: "to take", group: "-ere", forms: ["prendo", "prendi", "prende", "prendiamo", "prendete", "prendono"], example: "Prendo il treno alle nove." },
  { infinitive: "dormire", english: "to sleep", group: "-ire", forms: ["dormo", "dormi", "dorme", "dormiamo", "dormite", "dormono"], example: "Dormono fino a tardi." },
  { infinitive: "capire", english: "to understand", group: "-isc", forms: ["capisco", "capisci", "capisce", "capiamo", "capite", "capiscono"], example: "Adesso capisco la regola." },
  { infinitive: "essere", english: "to be", group: "irregular", forms: ["sono", "sei", "è", "siamo", "siete", "sono"], example: "Siamo molto felici." },
  { infinitive: "avere", english: "to have", group: "irregular", forms: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"], example: "Avete tempo domani?" },
  { infinitive: "andare", english: "to go", group: "irregular", forms: ["vado", "vai", "va", "andiamo", "andate", "vanno"], example: "Vado in Italia a giugno." },
  { infinitive: "fare", english: "to do / make", group: "irregular", forms: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"], example: "Faccio una passeggiata." },
] as const;
const pronouns = ["io", "tu", "lui / lei", "noi", "voi", "loro"];

export function ItalianVerbTrainer() {
  const [selected, setSelected] = useState(0);
  const verb = verbs[selected];
  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
      <aside className="rounded-[2rem] border border-black/10 bg-white/80 p-3 shadow-sm backdrop-blur">
        {verbs.map((item, index) => (
          <button className={index === selected ? "flex w-full items-center justify-between rounded-2xl bg-ink px-4 py-3 text-left text-white" : "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-washi hover:text-ink"} key={item.infinitive} onClick={() => setSelected(index)} type="button">
            <span><span className="block font-bold">{item.infinitive}</span><span className="text-xs opacity-65">{item.english}</span></span>
            <span className="text-xs font-semibold opacity-60">{item.group}</span>
          </button>
        ))}
      </aside>
      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-matcha">Present tense</p><h2 className="mt-2 text-4xl font-bold text-ink sm:text-5xl">{verb.infinitive}</h2><p className="mt-2 text-slate-500">{verb.english}</p></div>
          <button className="inline-flex items-center gap-2 rounded-full bg-matcha px-4 py-2 text-sm font-semibold text-white" onClick={() => speak(verb.infinitive)} type="button"><Volume2 className="h-4 w-4" />Hear it</button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {verb.forms.map((form, index) => (
            <button className="rounded-2xl bg-washi p-4 text-left transition hover:ring-2 hover:ring-matcha/30" key={`${pronouns[index]}-${form}`} onClick={() => { speak(`${pronouns[index].split(" ")[0]} ${form}`); recordStudyActivity("italian", "verb_form_practice", "verb_lab", { verb: verb.infinitive, form }); }} type="button">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-matcha">{pronouns[index]}</span><span className="mt-2 block text-xl font-bold text-ink">{form}</span>
            </button>
          ))}
        </div>
        <div className="mt-7 rounded-2xl border border-matcha/15 bg-matcha/5 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha">Example</p><p className="mt-2 text-lg font-semibold text-ink">{verb.example}</p><button className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-matcha" onClick={() => speak(verb.example)} type="button"><Volume2 className="h-4 w-4" />Play sentence</button></div>
      </section>
    </div>
  );
}

function speak(text: string) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "it-IT"; utterance.rate = 0.82; window.speechSynthesis.speak(utterance); }
