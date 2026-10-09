"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { MuteButton, XpBar } from "@/components/game/XpBar";
import { OfflineMenuRow } from "@/components/OfflineDownload";
import { useOnline } from "@/lib/useOnline";

type NavItem = { href: string; label: string; needsInternet?: boolean };

const japaneseItems: NavItem[] = [
  { href: "/japanese", label: "Home" },
  { href: "/japanese/tutor", label: "Tutor", needsInternet: true },
  { href: "/japanese/flashcards", label: "Flashcards" },
  { href: "/japanese/collection", label: "Collection" },
  { href: "/japanese/garden", label: "Garden" },
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

const spanishItems = [
  { href: "/spanish", label: "Home" },
  { href: "/spanish/tutor", label: "Tutor" },
  { href: "/spanish/flashcards", label: "Flashcards" },
  { href: "/spanish/listening", label: "Listening" },
  { href: "/spanish/arcade", label: "Arcade" },
  { href: "/spanish/pronunciation", label: "Pronunciation" },
  { href: "/spanish/grammar", label: "Grammar" },
  { href: "/spanish/verbs", label: "Verbs" },
  { href: "/spanish/expressions", label: "Expressions" },
];

const brand = {
  japanese: { title: "Japanese Study", tagline: "AI practice lab" },
  italian: { title: "Italian Study", tagline: "La dolce lingua" },
  spanish: { title: "Spanish Study", tagline: "Español de México" },
  dashboard: { title: "Language Study", tagline: "Your learning studio" },
};

export function TopNav() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isItalian = pathname.startsWith("/italian");
  const isJapanese = pathname.startsWith("/japanese");
  const isSpanish = pathname.startsWith("/spanish");
  const theme = isItalian ? "italian" : isJapanese ? "japanese" : isSpanish ? "spanish" : "dashboard";
  const online = useOnline();
  const items: NavItem[] = isItalian
    ? italianItems
    : isJapanese
      ? japaneseItems
      : isSpanish
        ? spanishItems
        : [
          { href: "/japanese", label: "Japanese" },
          { href: "/italian", label: "Italian" },
          { href: "/spanish", label: "Spanish" },
        ];
  const languageHome = theme === "dashboard" ? "/" : `/${theme}`;
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
        theme === "spanish" && "theme-spanish",
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
          href="/"
        >
          <span className="relative h-12 w-12 shrink-0 lg:h-16 lg:w-16">
            <Image
              alt=""
              className="object-contain drop-shadow-sm"
              fill
              priority
              sizes="(min-width: 1024px) 64px, 48px"
              src="/brand/language-studio-logo.png"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm leading-none lg:text-base">
              {brand[theme].title}
            </span>
            <span
              className={twMerge(
                "hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] lg:block",
                isTransparentHome ? "text-sakura" : "text-matcha",
              )}
            >
              {brand[theme].tagline}
            </span>
          </span>
        </Link>

        {isJapanese ? (
          <div className="flex shrink-0 flex-1 justify-end xl:flex-none xl:justify-start">
            <XpBar transparent={isTransparentHome} />
          </div>
        ) : null}

        <button
          aria-controls="mobile-nav-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={twMerge(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full border backdrop-blur-md transition",
            isJapanese ? "xl:hidden" : "lg:hidden",
            isTransparentHome
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/60 bg-white/70 text-ink shadow-sm",
          )}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div
          className={twMerge(
            "hidden min-w-0 gap-2 p-1",
            isJapanese ? "xl:flex" : "lg:flex",
            theme === "dashboard" ? "overflow-visible" : "overflow-x-auto",
          )}
        >
          {items.map((item) => (
            <Link
              className={twMerge(
                "relative isolate shrink-0 overflow-hidden whitespace-nowrap rounded-full border py-2 text-sm font-semibold backdrop-blur-md transition",
                isJapanese ? "px-3 2xl:px-4" : "px-4",
                isTransparentHome
                  ? "border-white/25 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
                  : "border-white/60 bg-white/60 text-slate-700 shadow-sm hover:bg-white/90 hover:text-ink",
                theme === "dashboard" &&
                  item.href === "/japanese" &&
                  "border-[#d45462]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,239,241,0.9))] text-[#71333d] shadow-none hover:border-[#d45462]/35 hover:bg-[#fff6f7] hover:text-[#58242d]",
                theme === "dashboard" &&
                  item.href === "/italian" &&
                  "border-[#2f8a62]/20 bg-[linear-gradient(135deg,rgba(237,249,241,0.94),rgba(255,255,255,0.92),rgba(255,240,239,0.9))] text-[#255f48] shadow-none hover:border-[#2f8a62]/35 hover:bg-[#f4fbf6] hover:text-[#194a37]",
                theme === "dashboard" &&
                  item.href === "/spanish" &&
                  "border-[#cf6332]/20 bg-[linear-gradient(135deg,rgba(255,243,226,0.94),rgba(255,255,255,0.92),rgba(234,241,252,0.9))] text-[#8a3a1f] shadow-none hover:border-[#cf6332]/35 hover:bg-[#fff7ee] hover:text-[#6e2c16]",
                isActiveHref(item.href) &&
                  (isTransparentHome
                    ? "border-white/50 bg-white/25 text-white drop-shadow"
                    : "border-ink/80 bg-ink/85 text-white hover:bg-ink hover:text-white"),
                item.needsInternet && !online && "opacity-50",
              )}
              href={item.href}
              key={item.href}
              title={item.needsInternet && !online ? "Needs internet" : undefined}
            >
              {theme === "dashboard" ? <CountryNavDecoration href={item.href} /> : null}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen ? (
        <div
          className={twMerge("absolute inset-x-0 top-full px-4 pb-3", isJapanese ? "xl:hidden" : "lg:hidden")}
          id="mobile-nav-menu"
        >
          <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/60 bg-white/90 p-2 shadow-lg backdrop-blur-md sm:grid-cols-4">
            {items.map((item) => (
              <Link
                className={twMerge(
                  "relative isolate overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActiveHref(item.href)
                    ? "bg-ink text-white"
                    : "bg-white/70 text-slate-700 active:bg-white",
                  theme === "dashboard" &&
                    item.href === "/japanese" &&
                    "bg-[#fff4f5] text-[#71333d]",
                  theme === "dashboard" &&
                    item.href === "/italian" &&
                    "bg-[linear-gradient(135deg,#eef9f1,#fff,#fff0ef)] text-[#255f48]",
                  theme === "dashboard" &&
                    item.href === "/spanish" &&
                    "bg-[linear-gradient(135deg,#fff3e2,#fff,#eaf1fc)] text-[#8a3a1f]",
                  item.needsInternet && !online && "opacity-60",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {theme === "dashboard" ? <CountryNavDecoration href={item.href} /> : null}
                <span className="relative z-10">{item.label}</span>
                {item.needsInternet && !online ? (
                  <span className="relative z-10 block text-[0.65rem] font-medium opacity-80">Needs internet</span>
                ) : null}
              </Link>
            ))}
            {isJapanese ? (
              <MuteButton
                className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition active:bg-white sm:hidden"
                iconClassName="h-4 w-4"
                showLabel
              />
            ) : null}
            {isJapanese ? <OfflineMenuRow className="col-span-2 sm:col-span-4" /> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function CountryNavDecoration({ href }: { href: string }) {
  if (href === "/japanese") {
    return (
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          alt=""
          className="object-cover object-right opacity-35 mix-blend-multiply"
          fill
          sizes="160px"
          src="/dashboard/japanese-nav-art.png"
        />
      </span>
    );
  }

  if (href === "/italian") {
    return (
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          alt=""
          className="object-cover object-right opacity-30 mix-blend-multiply"
          fill
          sizes="160px"
          src="/dashboard/italian-nav-art.png"
        />
      </span>
    );
  }

  if (href === "/spanish") {
    return (
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          alt=""
          className="object-cover object-right opacity-35 mix-blend-multiply"
          fill
          sizes="160px"
          src="/dashboard/spanish-nav-art.png"
        />
      </span>
    );
  }

  return null;
}
