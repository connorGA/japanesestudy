"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText } from "lucide-react";
import { twMerge } from "tailwind-merge";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tutor", label: "Tutor" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/listening", label: "Listening" },
  { href: "/roleplay", label: "Roleplay" },
  { href: "/hiragana", label: "Hiragana" },
  { href: "/katakana", label: "Katakana" },
  { href: "/kanji", label: "Kanji" },
];

export function TopNav() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const isTransparentHome = pathname === "/" && !hasScrolled;

  useEffect(() => {
    function updateScrolled() {
      setHasScrolled(window.scrollY > 32);
    }

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header
      className={twMerge(
        "top-0 z-20 border-b transition-colors duration-300",
        pathname === "/" ? "fixed inset-x-0" : "sticky",
        isTransparentHome
          ? "border-transparent bg-transparent"
          : "border-black/10 bg-washi/85 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <Link
          className={twMerge(
            "flex items-center gap-3 font-bold transition-colors",
            isTransparentHome ? "text-white drop-shadow" : "text-ink",
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
                isTransparentHome ? "text-sakura" : "text-matcha",
              )}
            >
              AI practice lab
            </span>
          </span>
        </Link>

        <div
          className={twMerge(
            "flex gap-2 overflow-x-auto rounded-full border p-1 transition-colors duration-300",
            isTransparentHome
              ? "border-transparent bg-transparent shadow-none"
              : "border-black/10 bg-white/70 shadow-sm",
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                className={twMerge(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
                  isTransparentHome
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-slate-600 hover:bg-washi hover:text-ink",
                  isActive &&
                    (isTransparentHome
                      ? "bg-transparent text-white drop-shadow hover:bg-white/10"
                      : "bg-ink text-white shadow-sm hover:bg-ink hover:text-white"),
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
