"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText } from "lucide-react";
import { twMerge } from "tailwind-merge";

const navGroups = [
  {
    label: "Learn",
    items: [
      { href: "/path", label: "Path" },
      { href: "/hiragana", label: "Hiragana" },
      { href: "/katakana", label: "Katakana" },
      { href: "/phrases", label: "Phrases" },
      { href: "/grammar", label: "Grammar" },
      { href: "/numbers", label: "Numbers" },
      { href: "/sentences", label: "Sentences" },
      { href: "/kanji", label: "Kanji" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/flashcards", label: "Flashcards" },
      { href: "/listening", label: "Listening" },
      { href: "/tutor", label: "Drills" },
      { href: "/roleplay", label: "Roleplay" },
      { href: "/reviews", label: "Reviews" },
      { href: "/progress", label: "Progress" },
    ],
  },
];

export function TopNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={twMerge(
        "top-0 z-20 border-b transition-colors duration-300",
        isHome ? "fixed inset-x-0" : "sticky",
        isHome
          ? "border-transparent bg-transparent"
          : "border-black/10 bg-washi/85 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            className={twMerge(
              "flex items-center gap-3 font-bold transition-colors",
              isHome ? "text-white drop-shadow" : "text-ink",
            )}
            href="/"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-matcha text-white shadow-sm">
              <BookOpenText className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base leading-none">Japanese Study</span>
              <span
                className={twMerge(
                  "text-xs font-semibold uppercase tracking-[0.22em]",
                  isHome ? "text-sakura" : "text-matcha",
                )}
              >
                AI practice lab
              </span>
            </span>
          </Link>
          <Link
            className={twMerge(
              "self-start rounded-full px-4 py-2 text-sm font-semibold md:self-auto",
              isHome
                ? "bg-white/15 text-white backdrop-blur hover:bg-white/25"
                : "bg-ink text-white hover:bg-matcha",
            )}
            href="/path"
          >
            Start learning path
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {navGroups.map((group) => (
            <div
              className={twMerge(
                "flex gap-2 overflow-x-auto rounded-full border p-1",
                isHome
                  ? "border-white/20 bg-black/20 backdrop-blur"
                  : "border-black/10 bg-white/70 shadow-sm",
              )}
              key={group.label}
            >
              <span
                className={twMerge(
                  "hidden shrink-0 self-center px-2 text-[10px] font-bold uppercase tracking-[0.2em] sm:inline",
                  isHome ? "text-white/60" : "text-slate-400",
                )}
              >
                {group.label}
              </span>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    className={twMerge(
                      "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition",
                      isHome
                        ? "text-white/85 hover:bg-white/10 hover:text-white"
                        : "text-slate-600 hover:bg-washi hover:text-ink",
                      isActive &&
                        (isHome
                          ? "bg-white/20 text-white"
                          : "bg-ink text-white shadow-sm hover:bg-ink"),
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}
