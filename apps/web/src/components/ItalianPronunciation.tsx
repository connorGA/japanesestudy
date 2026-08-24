"use client";

import { Volume2 } from "lucide-react";
import { recordStudyActivity } from "@/lib/progress";

const soundGroups = [
  { title: "Pure vowels", pattern: "a · e · i · o · u", explanation: "Italian vowels stay crisp—avoid turning them into English-style glides.", examples: ["casa", "sera", "vino", "sole", "luna"] },
  { title: "C and G", pattern: "ce/ci · che/chi · ge/gi · ghe/ghi", explanation: "C and G soften before e or i. Add h to keep the hard sound.", examples: ["cena", "cinema", "che", "gelato", "spaghetti"] },
  { title: "GN and GLI", pattern: "gn · gli", explanation: "GN resembles the ny in canyon; GLI is a smooth palatal sound without an exact English twin.", examples: ["gnocchi", "lasagna", "famiglia", "figlio"] },
  { title: "SC", pattern: "sce/sci · sche/schi", explanation: "SC before e or i sounds like sh. An h restores the hard sk sound.", examples: ["scena", "sciare", "bruschetta", "schiena"] },
  { title: "The Italian R", pattern: "r · rr", explanation: "Use a light tongue tap for a single r and a stronger trill for a double r.", examples: ["Roma", "caro", "carro", "arrivederci"] },
  { title: "Double consonants", pattern: "pala ≠ palla", explanation: "Hold double consonants longer—the distinction can change the word entirely.", examples: ["pala", "palla", "sete", "sette", "casa", "cassa"] },
  { title: "Word stress", pattern: "città · perché · telefono", explanation: "Stress is often on the next-to-last syllable. A written final accent always marks the stress.", examples: ["città", "perché", "telefono", "università"] },
];

export function ItalianPronunciation() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {soundGroups.map((group, index) => (
        <article className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6" key={group.title}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold tabular-nums text-matcha">0{index + 1}</span>
              <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{group.title}</h2>
            </div>
            <span className="rounded-full bg-matcha/10 px-3 py-1.5 text-sm font-bold text-matcha">{group.pattern}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{group.explanation}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {group.examples.map((example) => (
              <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-washi px-3 py-2 text-sm font-semibold text-ink transition hover:border-matcha hover:text-matcha" key={example} onClick={() => { speak(example); recordStudyActivity("italian", "pronunciation_play", "pronunciation", { example }); }} type="button">
                <Volume2 className="h-3.5 w-3.5" />{example}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function speak(text: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}
