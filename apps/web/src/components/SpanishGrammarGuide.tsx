"use client";

import { LoaderCircle, Volume2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { grammarTopics as topics } from "@/data/spanishLessons";
import { recordStudyActivity } from "@/lib/progress";
import { useSpanishSpeech } from "@/lib/spanishAudio";


export function SpanishGrammarGuide() {
  const speech = useSpanishSpeech();

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {topics.map((topic, index) => (
        <article className="group flex min-h-72 flex-col rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6" key={topic.title}>
          <span className="text-xs font-bold tabular-nums text-matcha">LECCIÓN {String(index + 1).padStart(2, "0")}</span>
          <h2 className="mt-5 text-xl font-bold text-ink">{topic.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{topic.idea}</p>
          <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-washi p-3">
            {topic.examples.map((example) => (
              <button
                className={twMerge("inline-flex items-center gap-2 rounded-xl px-2 py-1 text-left text-sm font-semibold leading-6 text-ink transition hover:bg-white hover:text-matcha", speech.playingText === example && "text-matcha")}
                key={example}
                onClick={() => {
                  void speech.speak(example);
                  recordStudyActivity("spanish", "pronunciation_play", "grammar", { example });
                }}
                type="button"
              >
                {speech.loadingText === example ? <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 shrink-0 text-matcha" />}
                {example}
              </button>
            ))}
          </div>
          <p className="mt-auto pt-5 text-xs leading-5 text-slate-500"><span className="font-bold text-matcha">Remember:</span> {topic.tip}</p>
        </article>
      ))}
    </section>
  );
}
