"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/useOnline";

const offlinePractice = [
  { href: "/japanese/flashcards", label: "Flashcards" },
  { href: "/japanese/listening", label: "Listening" },
  { href: "/japanese/arcade", label: "Arcade" },
  { href: "/japanese/hiragana", label: "Hiragana" },
];

export function OnlineOnly({ feature, children }: { feature: string; children: React.ReactNode }) {
  const online = useOnline();
  if (online) return children;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink">
        <WifiOff className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">{feature} needs an internet connection</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        It talks to an AI in real time, so it&apos;ll be back as soon as you reconnect. Everything else still works
        offline:
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {offlinePractice.map((item) => (
          <Link
            className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-ink"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
