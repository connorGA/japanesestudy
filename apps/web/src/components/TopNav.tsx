"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, Menu, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

const japaneseItems = [
  { href: "/japanese", label: "Home" },
  { href: "/japanese/tutor", label: "Tutor" },
  { href: "/japanese/flashcards", label: "Flashcards" },
  { href: "/japanese/listening", label: "Listening" },
  { href: "/japanese/arcade", label: "Arcade" },
  { href: "/japanese/hiragana", label: "Hiragana" },
  { href: "/japanese/katakana", label: "Katakana" },
  { href: "/japanese/kanji", label: "Kanji" },
];

const italianItems = [
  { href: "/italian", label: "Home" },
  { href: "/italian/tutor", label: "Tutor" },
  { href: "/italian/flashcards", label: "Flashcards" },
  { href: "/italian/listening", label: "Listening" },
  { href: "/italian/arcade", label: "Arcade" },
  { href: "/italian/pronunciation", label: "Pronunciation" },
  { href: "/italian/grammar", label: "Grammar" },
  { href: "/italian/verbs", label: "Verbs" },
];

export function TopNav() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isItalian = pathname.startsWith("/italian");
  const isJapanese = pathname.startsWith("/japanese");
  const theme = isItalian ? "italian" : isJapanese ? "japanese" : "dashboard";
  const items = isItalian
    ? italianItems
    : isJapanese
      ? japaneseItems
      : [
          { href: "/", label: "Dashboard" },
          { href: "/japanese", label: "Japanese" },
          { href: "/italian", label: "Italian" },
        ];
  const languageHome = isItalian ? "/italian" : isJapanese ? "/japanese" : "/";
  const isTransparentHome =
    pathname === languageHome && isJapanese && !hasScrolled && !menuOpen;

  useEffect(() => {
    function updateScrolled() {
      setHasScrolled(window.scrollY > 32);
    }

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.dataset.theme = theme;
  }, [pathname, theme]);

  function isActiveHref(href: string) {
    if (pathname === href) return true;
    return href.endsWith("/arcade") && pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={twMerge(
        "top-0 z-30 bg-transparent",
        theme === "italian" && "theme-italian",
        theme === "dashboard" && "theme-dashboard",
        isTransparentHome ? "fixed inset-x-0" : "sticky",
      )}
    >
      <nav className="flex w-full items-center justify-between gap-3 px-4 py-3 lg:gap-4 lg:px-6 lg:py-4">
        <Link
          className={twMerge(
            "flex min-w-0 shrink items-center gap-3 rounded-full border py-1 pl-1 pr-4 font-bold backdrop-blur-md transition-colors lg:shrink-0 lg:gap-3.5 lg:py-1.5 lg:pl-1.5 lg:pr-5",
            isTransparentHome
              ? "border-white/25 bg-white/10 text-white drop-shadow"
              : "border-white/60 bg-white/70 text-ink shadow-sm",
          )}
          href={languageHome}
        >
          {isJapanese ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full lg:h-16 lg:w-16">
              <Image
                alt=""
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 64px, 48px"
                src="/brand/logo-emblem-tight.png"
              />
            </span>
          ) : (
            <span
              className={twMerge(
                "grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-sm lg:h-16 lg:w-16",
                isItalian
                  ? "bg-[linear-gradient(90deg,#2e7d5b_0_33%,#fff9ee_33%_66%,#bd463f_66%)] text-ink"
                  : "bg-ink",
              )}
            >
              {isItalian ? (
                <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-black">IT</span>
              ) : (
                <Languages className="h-6 w-6" />
              )}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm leading-none lg:text-base">
              {isItalian ? "Italian Study" : isJapanese ? "Japanese Study" : "Language Study"}
            </span>
            <span
              className={twMerge(
                "hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] lg:block",
                isTransparentHome ? "text-sakura" : "text-matcha",
              )}
            >
              {isItalian
                ? "La dolce lingua"
                : isJapanese
                  ? "AI practice lab"
                  : "Your learning studio"}
            </span>
          </span>
        </Link>

        <button
          aria-controls="mobile-nav-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={twMerge(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full border backdrop-blur-md transition lg:hidden",
            isTransparentHome
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/60 bg-white/70 text-ink shadow-sm",
          )}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden gap-2 overflow-x-auto p-1 lg:flex">
          {items.map((item) => (
            <Link
              className={twMerge(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md transition",
                isTransparentHome
                  ? "border-white/25 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
                  : "border-white/60 bg-white/60 text-slate-700 shadow-sm hover:bg-white/90 hover:text-ink",
                isActiveHref(item.href) &&
                  (isTransparentHome
                    ? "border-white/50 bg-white/25 text-white drop-shadow"
                    : "border-ink/80 bg-ink/85 text-white hover:bg-ink hover:text-white"),
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-full px-4 pb-3 lg:hidden" id="mobile-nav-menu">
          <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/60 bg-white/90 p-2 shadow-lg backdrop-blur-md sm:grid-cols-4">
            {items.map((item) => (
              <Link
                className={twMerge(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActiveHref(item.href)
                    ? "bg-ink text-white"
                    : "bg-white/70 text-slate-700 active:bg-white",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
