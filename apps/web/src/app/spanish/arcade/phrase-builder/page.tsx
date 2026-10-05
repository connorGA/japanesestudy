import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpanishPhraseBuilderGame } from "@/components/SpanishArcadeGames";

export const metadata = { title: "Arma la Frase" };

export default function SpanishPhraseBuilderPage() { return <main className="theme-spanish mx-auto flex w-full max-w-4xl flex-col px-4 py-5 sm:px-5 sm:py-6 md:px-6"><header className="mb-5"><Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink" href="/spanish/arcade"><ArrowLeft className="h-4 w-4" />Arcade</Link><h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">Arma la Frase</h1><p className="mt-2 text-sm text-slate-600">Arrange the words into a natural Spanish sentence.</p></header><SpanishPhraseBuilderGame /></main>; }
