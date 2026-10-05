"use client";

import { LoaderCircle, Volume2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { regionalWords, spanishCards } from "@/data/spanish";
import { recordStudyActivity } from "@/lib/progress";
import { useSpanishSpeech } from "@/lib/spanishAudio";

const slang = spanishCards.filter((card) => card.deck === "slang");
const regions = [
  { key: "mexico", label: "México" },
  { key: "colombia", label: "Colombia" },
  { key: "argentina", label: "Argentina" },
  { key: "spain", label: "España" },
] as const;

export function SpanishExpressions() {
  const speech = useSpanishSpeech();

  function play(text: string, feature: string) {
    void speech.speak(text);
    recordStudyActivity("spanish", "pronunciation_play", feature, { text });
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Mexicanismos</p>
            <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Sound like a local in Mexico.</h2>
          </div>
          <p className="max-w-md text-sm text-slate-500">Tap any expression to hear it the way friends say it in Mexico City. Save the casual ones for people you know well.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {slang.map((card) => (
            <article className="flex flex-col rounded-[1.75rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur" key={card.id}>
              <button className="flex items-start justify-between gap-3 text-left" onClick={() => play(card.spanish, "expressions")} type="button">
                <span>
                  <span className={twMerge("block text-xl font-bold text-ink", speech.playingText === card.spanish && "text-matcha")}>{card.spanish}</span>
                  <span className="mt-1 block text-sm text-slate-500">{card.english}</span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-matcha text-white">{speech.loadingText === card.spanish ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}</span>
              </button>
              {card.note ? <p className="mt-3 text-xs leading-5 text-slate-600">{card.note}</p> : null}
              <button className="mt-auto pt-4 text-left" onClick={() => play(card.example, "expressions")} type="button">
                <span className="block rounded-2xl bg-washi p-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-ink">{speech.loadingText === card.example ? <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 shrink-0 text-matcha" />}{card.example}</span>
                  <span className="mt-1 block text-xs text-slate-500">{card.exampleEnglish}</span>
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Same word, different country</p>
            <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">One language, many accents.</h2>
          </div>
          <p className="max-w-md text-sm text-slate-500">This course teaches Mexican Spanish, which is understood everywhere. Here&apos;s what you&apos;ll hear as you travel.</p>
        </div>
        <div className="mt-5 overflow-x-auto rounded-[1.75rem] border border-black/10 bg-white/80 shadow-sm backdrop-blur">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-5 py-4 font-semibold">English</th>
                {regions.map((region) => (
                  <th className={twMerge("px-5 py-4 font-semibold", region.key === "mexico" && "text-matcha")} key={region.key}>{region.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regionalWords.map((word) => (
                <tr className="border-b border-black/5 last:border-0 odd:bg-washi/60" key={word.english}>
                  <td className="px-5 py-3 font-medium text-slate-600">{word.english}</td>
                  {regions.map((region) => (
                    <td className="px-5 py-3" key={region.key}>
                      {region.key === "mexico" ? (
                        <button className="inline-flex items-center gap-1.5 font-bold text-matcha hover:underline" onClick={() => play(word.mexico, "regional_words")} type="button">
                          {speech.loadingText === word.mexico ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}{word.mexico}
                        </button>
                      ) : (
                        <span className="font-semibold text-ink">{word[region.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
