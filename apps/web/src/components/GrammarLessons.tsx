"use client";

import { GRAMMAR_LESSONS, type GrammarLesson } from "@/lib/grammar";

export function GrammarLessons() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {GRAMMAR_LESSONS.map((lesson) => (
        <GrammarCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}

function GrammarCard({ lesson }: { lesson: GrammarLesson }) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-matcha">Grammar</p>
      <h2 className="mt-2 text-2xl font-bold text-ink">{lesson.title}</h2>
      <p className="mt-2 text-slate-600">{lesson.summary}</p>
      <div className="mt-4 rounded-2xl bg-washi px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pattern</p>
        <p className="mt-1 text-lg font-semibold text-ink">{lesson.pattern}</p>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-700">{lesson.explanation}</p>
      <div className="mt-5 space-y-3">
        {lesson.examples.map((example) => (
          <div className="rounded-2xl bg-sakura/25 p-4" key={example.japanese}>
            <p className="text-xl font-semibold text-ink">{example.japanese}</p>
            <p className="mt-1 text-sm text-slate-600">{example.romaji}</p>
            <p className="mt-1 text-sm text-slate-700">{example.english}</p>
          </div>
        ))}
      </div>
      {lesson.tip ? (
        <p className="mt-4 rounded-2xl border border-matcha/20 bg-matcha/10 p-3 text-sm text-slate-700">
          Tip: {lesson.tip}
        </p>
      ) : null}
    </article>
  );
}
