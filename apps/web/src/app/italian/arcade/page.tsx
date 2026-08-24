import Link from "next/link";
import { ArrowRight, Gamepad2, Languages, TextCursorInput } from "lucide-react";

const games = [
  { title: "Parola Sprint", description: "Race the clock to match everyday English prompts with the right Italian word.", href: "/italian/arcade/word-match", level: "Vocabulary · 45 sec", icon: Languages },
  { title: "Frase Builder", description: "Put shuffled Italian words into a natural sentence and sharpen your word order.", href: "/italian/arcade/phrase-builder", level: "Grammar puzzle", icon: TextCursorInput },
];

export const metadata = { title: "Italian Arcade" };

export default function ItalianArcadePage() {
  return <main className="theme-italian mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-5 md:min-h-[calc(100svh-5.5rem)] md:px-8 md:py-8"><header><span className="grid h-12 w-12 place-items-center rounded-2xl bg-matcha/10 text-matcha"><Gamepad2 className="h-6 w-6" /></span><p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-matcha sm:mt-5">Sala giochi</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Learn Italian through play.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Build quick recall and sentence intuition with short, replayable challenges.</p></header><section className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{games.map((game) => { const Icon = game.icon; return <Link className="group flex min-h-64 flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-br from-[#2e7d5b]/15 via-white/85 to-[#bd463f]/15 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-72 sm:p-6" href={game.href} key={game.href}><div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-sm"><Icon className="h-7 w-7" /></span><span className="rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-semibold text-matcha">{game.level}</span></div><div className="mt-auto pt-8"><h2 className="text-xl font-bold text-ink sm:text-2xl">{game.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{game.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">Play now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>; })}</section></main>;
}
