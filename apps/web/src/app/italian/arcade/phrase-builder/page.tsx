import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ItalianPhraseBuilderGame } from "@/components/ItalianArcadeGames";

export default function ItalianPhraseBuilderPage() { return <main className="theme-italian mx-auto flex w-full max-w-4xl flex-col px-4 py-5 sm:px-5 sm:py-6 md:px-6"><header className="mb-5"><Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink" href="/italian/arcade"><ArrowLeft className="h-4 w-4" />Arcade</Link><h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">Frase Builder</h1><p className="mt-2 text-sm text-slate-600">Arrange the words into a natural Italian sentence.</p></header><ItalianPhraseBuilderGame /></main>; }
