"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Flame,
  Globe2,
  Sparkles,
} from "lucide-react";
import {
  emptyProgress,
  localDateKey,
  PROGRESS_EVENT,
  readProgress,
  STUDY_ACTIVITY_POINTS,
  type ProgressStore,
  type StudyLanguage,
} from "@/lib/progress";
import { SpinningGlobe } from "@/components/SpinningGlobe";
import { twMerge } from "tailwind-merge";

const languageCards = [
  {
    id: "japanese" as const,
    href: "/japanese",
    name: "Japanese",
    nativeName: "日本語",
    country: "Japan",
    description: "Kana, kanji, listening, realtime tutoring, flashcards, and arcade drills.",
    accent: "#be5363",
    tint: "bg-[#fff5f5]",
    hover: "group-hover:border-[#be5363]/35",
    badge: "Continue learning",
  },
  {
    id: "italian" as const,
    href: "/italian",
    name: "Italian",
    nativeName: "Italiano",
    country: "Italy",
    description: "Pronunciation, grammar, verbs, conversation, listening, and vocabulary practice.",
    accent: "#26734f",
    tint: "bg-[#f2f9f4]",
    hover: "group-hover:border-[#26734f]/35",
    badge: "New language",
  },
];

export function LanguageDashboard() {
  const [progress, setProgress] = useState<ProgressStore>(emptyProgress);

  useEffect(() => {
    const update = () => setProgress(readProgress());
    update();
    window.addEventListener(PROGRESS_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const totals = useMemo(
    () => ({
      japanese: sum(Object.values(progress.japanese)),
      italian: sum(Object.values(progress.italian)),
    }),
    [progress],
  );
  const combined = useMemo(() => combineProgress(progress), [progress]);
  const streak = calculateStreak(combined);
  const activeDays = Object.values(combined).filter((value) => value > 0).length;
  const totalPoints = totals.japanese + totals.italian;

  return (
    <main className="theme-dashboard relative min-h-[calc(100svh-5rem)] px-4 pb-14 sm:px-6 lg:px-10 lg:pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(circle_at_76%_30%,rgba(133,151,204,0.16),transparent_32rem)]" />

      <div className="relative mx-auto max-w-7xl">
        <section className="relative grid min-h-[31rem] items-center py-10 sm:min-h-[34rem] sm:py-14 lg:min-h-[38rem] lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="pointer-events-none absolute right-0 top-8 aspect-square w-full max-w-[31rem] opacity-30 sm:top-4 sm:max-w-[35rem] sm:opacity-55 lg:top-0 lg:max-w-[38rem] lg:opacity-95">
            <SpinningGlobe />
          </div>

          <div className="dashboard-rise relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-matcha">
              <Globe2 className="h-4 w-4" />
              Your language world
            </span>
            <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
              Keep your world in motion.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Practice a little every day, move between languages freely, and watch consistency become fluency.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-3">
              <HeroStat icon={<Flame className="h-4 w-4" />} label="Streak" value={`${streak}d`} />
              <HeroStat icon={<CalendarDays className="h-4 w-4" />} label="Active days" value={String(activeDays)} />
              <HeroStat icon={<Sparkles className="h-4 w-4" />} label="Study points" value={String(totalPoints)} />
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-matcha">Your languages</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Where do you want to go today?</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">Choose a country and continue from your latest practice.</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {languageCards.map((language, index) => (
              <Link
                className={twMerge(
                  "dashboard-rise group relative isolate overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white/80 p-5 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6",
                  language.hover,
                )}
                href={language.href}
                key={language.id}
                style={{ animationDelay: `${100 + index * 90}ms` }}
              >
                <div className={twMerge("absolute -right-10 -top-16 -z-10 h-56 w-56 rounded-full opacity-70 blur-2xl", language.tint)} />
                <div className="flex items-start gap-4 sm:gap-5">
                  <CountryFlag country={language.id} className="h-16 w-24 shrink-0 rounded-xl shadow-md sm:h-20 sm:w-28" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.19em] text-slate-400">{language.country}</p>
                        <h3 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{language.name}</h3>
                        <p className="mt-0.5 text-sm font-semibold" style={{ color: language.accent }}>{language.nativeName}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {language.badge}<ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">{language.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="text-sm font-bold tabular-nums text-ink">{totals[language.id]} study {totals[language.id] === 1 ? "point" : "points"}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: language.accent }}>Open course <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <FlagHeatmaps progress={progress} />
      </div>
    </main>
  );
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur-md sm:p-4">
      <div className="flex items-center gap-2 text-matcha">{icon}<span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">{label}</span></div>
      <p className="mt-2 text-xl font-bold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}

function FlagHeatmaps({ progress }: { progress: ProgressStore }) {
  return (
    <section className="dashboard-rise relative z-10 mt-12" style={{ animationDelay: "260ms" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-matcha">Contribution map</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">A year of small wins starts here.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">Each flag marks a day you showed up. A stronger flag means more practice.</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="mr-1 uppercase tracking-[0.16em] text-slate-400">Earn points</span>
        <PointGuide label="Sound practice" points={STUDY_ACTIVITY_POINTS.pronunciation_play} />
        <PointGuide label="Listening or game answer" points={STUDY_ACTIVITY_POINTS.listening_line_complete} />
        <PointGuide label="Mastered card or review" points={STUDY_ACTIVITY_POINTS.flashcard_mastered} />
        <PointGuide label="Tutor or roleplay turn" points={STUDY_ACTIVITY_POINTS.tutor_turn} />
        <span className="ml-1 text-[11px] font-normal text-slate-400">Daily limits keep repetition fair.</span>
      </div>

      <div className="mt-6 grid gap-4">
        <LanguageHeatmap language="japanese" records={progress.japanese} />
        <LanguageHeatmap language="italian" records={progress.italian} />
      </div>
    </section>
  );
}

function PointGuide({ label, points }: { label: string; points: number }) {
  return (
    <span className="rounded-full border border-black/[0.06] bg-white/70 px-3 py-1.5 shadow-sm">
      {label} <strong className="text-ink">+{points}</strong>
    </span>
  );
}

function LanguageHeatmap({ language, records }: { language: StudyLanguage; records: Record<string, number> }) {
  const days = useMemo(() => buildHeatmapDays(records), [records]);
  const activeCount = days.filter((day) => day.count > 0).length;
  const isJapanese = language === "japanese";

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white/85 p-5 shadow-sm backdrop-blur-md sm:p-6">
      <div
        className={twMerge(
          "pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full blur-3xl",
          isJapanese ? "bg-[#f8dfe4]/55" : "bg-[#dcefe4]/65",
        )}
      />

      <div className="relative xl:grid xl:grid-cols-[minmax(0,55rem)_minmax(15rem,1fr)] xl:items-stretch xl:gap-7">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CountryFlag country={language} className="h-8 w-12 rounded-md shadow-sm" />
              <div><h3 className="font-bold text-ink">{isJapanese ? "Japanese" : "Italian"}</h3><p className="text-xs text-slate-500">{activeCount} active {activeCount === 1 ? "day" : "days"} in the last year</p></div>
            </div>
            <span className="text-xs font-semibold tabular-nums text-slate-400">{sum(Object.values(records))} pts</span>
          </div>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-[20rem] gap-2">
              <div className="grid grid-rows-7 gap-[3px] pt-[1px] text-[9px] leading-[13px] text-slate-400" aria-hidden="true">
                <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
              </div>
              <div className="grid min-w-[52rem] flex-1 auto-cols-[13px] grid-flow-col grid-rows-7 gap-[3px]" aria-label={`${isJapanese ? "Japanese" : "Italian"} study contribution heatmap`}>
                {days.map((day) => (
                  <FlagSquare count={day.count} date={day.date} key={day.key} language={language} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="h-[13px] w-[13px] rounded-[3px] border border-black/[0.04] bg-[#ebedf0]" />
            {[0.35, 0.58, 0.78, 1].map((opacity) => <FlagPixel className="h-[13px] w-[13px]" key={opacity} language={language} opacity={opacity} />)}
            <span>More</span>
          </div>
        </div>

        <div className="relative hidden min-h-[15.5rem] xl:block">
          <div className={twMerge("absolute inset-4 rounded-full blur-2xl", isJapanese ? "bg-[#fff4f4]/80" : "bg-[#f1f7ee]/90")} />
          <Image
            alt=""
            className="object-contain object-center drop-shadow-[0_18px_18px_rgba(35,41,58,0.14)]"
            fill
            sizes="(min-width: 1280px) 330px, 0px"
            src={isJapanese ? "/dashboard/japanese-heatmap-art.png" : "/dashboard/italian-heatmap-art.png"}
          />
          <div className="absolute inset-x-10 bottom-2 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
        </div>
      </div>
    </article>
  );
}

function FlagSquare({ count, date, language }: { count: number; date: Date; language: StudyLanguage }) {
  const label = `${date.toLocaleDateString()}: ${count} practice points`;
  if (!count) return <span aria-label={label} className="h-[13px] w-[13px] rounded-[3px] border border-black/[0.035] bg-[#ebedf0]" title={label} />;
  return <FlagPixel className="h-[13px] w-[13px]" language={language} opacity={Math.min(1, 0.3 + count * 0.12)} title={label} />;
}

function FlagPixel({ language, opacity, className, title }: { language: StudyLanguage; opacity: number; className?: string; title?: string }) {
  return (
    <span aria-label={title} className={twMerge("relative overflow-hidden rounded-[3px] border border-black/10 bg-white shadow-[inset_0_0_0_0.5px_rgba(255,255,255,.45)]", className)} style={{ opacity }} title={title}>
      {language === "japanese" ? <span className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bc3d4d]" /> : <span className="absolute inset-0 bg-[linear-gradient(90deg,#258153_0_33.33%,#fff_33.33%_66.66%,#c84848_66.66%)]" />}
    </span>
  );
}

function CountryFlag({ country, className }: { country: StudyLanguage; className?: string }) {
  return (
    <span aria-label={country === "japanese" ? "Flag of Japan" : "Flag of Italy"} className={twMerge("relative block overflow-hidden border border-black/10 bg-white", className)} role="img">
      {country === "japanese" ? <span className="absolute left-1/2 top-1/2 aspect-square h-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bc3d4d]" /> : <span className="absolute inset-0 bg-[linear-gradient(90deg,#258153_0_33.33%,#fff_33.33%_66.66%,#c84848_66.66%)]" />}
    </span>
  );
}

function buildHeatmapDays(records: Record<string, number>) {
  const end = new Date();
  return Array.from({ length: 364 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (363 - index));
    const key = localDateKey(date);
    return { key, date, count: records[key] ?? 0 };
  });
}

function combineProgress(progress: ProgressStore) {
  const combined: Record<string, number> = {};
  for (const language of ["japanese", "italian"] as const) {
    for (const [date, count] of Object.entries(progress[language])) combined[date] = (combined[date] ?? 0) + count;
  }
  return combined;
}

function calculateStreak(progress: Record<string, number>) {
  let streak = 0;
  const date = new Date();
  if (!progress[localDateKey(date)]) date.setDate(date.getDate() - 1);
  while (progress[localDateKey(date)] > 0) { streak += 1; date.setDate(date.getDate() - 1); }
  return streak;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
