import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KanaCubeGame } from "@/components/KanaCubeGame";

export default function JapaneseKanaCubePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-5 sm:px-5 sm:py-6 md:px-6">
      <header className="mb-4 sm:mb-5">
        <Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-ink" href="/japanese/arcade"><ArrowLeft className="h-4 w-4" />Arcade</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Kana Cube</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">A romaji reading appears, you rotate the cube to the matching hiragana and lock it in. Keep your streak alive to multiply your score.</p>
      </header>
      <KanaCubeGame />
    </main>
  );
}
