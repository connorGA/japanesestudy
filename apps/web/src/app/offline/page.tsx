import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline" };

const OFFLINE_LINKS = [
  { href: "/japanese/flashcards", label: "Flashcards" },
  { href: "/japanese/collection", label: "Collection" },
  { href: "/japanese/garden", label: "Garden" },
  { href: "/japanese/listening", label: "Listening" },
  { href: "/japanese/arcade", label: "Arcade" },
  { href: "/japanese/hiragana", label: "Hiragana" },
  { href: "/japanese/katakana", label: "Katakana" },
  { href: "/japanese/kanji", label: "Kanji" },
];

export default function OfflinePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12 text-center sm:py-20">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/80 text-slate-500 shadow-sm">
        <WifiOff className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink">This page needs a connection</h1>
      <p className="mt-2 text-slate-600">
        You&apos;re offline and this page wasn&apos;t downloaded. Everything below works offline, and your progress
        syncs when you reconnect.
      </p>
      <div className="mt-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {OFFLINE_LINKS.map((link) => (
          <Link
            className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-ink"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
