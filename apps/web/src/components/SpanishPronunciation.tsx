"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Snail, Volume2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { pronunciationGroups as soundGroups } from "@/data/spanishLessons";
import { recordStudyActivity } from "@/lib/progress";
import { prefetchSpanishAudio, useSpanishSpeech } from "@/lib/spanishAudio";


export function SpanishPronunciation() {
  const [slow, setSlow] = useState(false);
  const speech = useSpanishSpeech();

  useEffect(() => {
    prefetchSpanishAudio(soundGroups.flatMap((group) => group.examples));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button aria-pressed={slow} className={twMerge("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition", slow ? "border-ink bg-ink text-white" : "border-black/10 bg-white/75 text-slate-600 hover:bg-white")} onClick={() => setSlow((value) => !value)} type="button"><Snail className="h-4 w-4" />Slow audio</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {soundGroups.map((group, index) => (
          <article className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6" key={group.title}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold tabular-nums text-matcha">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{group.title}</h2>
              </div>
              <span className="rounded-full bg-matcha/10 px-3 py-1.5 text-right text-sm font-bold text-matcha">{group.pattern}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{group.explanation}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {group.examples.map((example) => (
                <button
                  className={twMerge("inline-flex items-center gap-2 rounded-full border border-black/10 bg-washi px-3 py-2 text-sm font-semibold text-ink transition hover:border-matcha hover:text-matcha", speech.playingText === example && "border-matcha text-matcha")}
                  key={example}
                  onClick={() => {
                    void speech.speak(example, { slow });
                    recordStudyActivity("spanish", "pronunciation_play", "pronunciation", { example });
                  }}
                  type="button"
                >
                  {speech.loadingText === example ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
                  {example}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
