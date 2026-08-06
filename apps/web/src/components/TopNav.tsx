"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tutor", label: "Tutor" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/listening", label: "Listening" },
  { href: "/arcade", label: "Arcade" },
  { href: "/hiragana", label: "Hiragana" },
  { href: "/katakana", label: "Katakana" },
  { href: "/kanji", label: "Kanji" },
];

export function TopNav() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isTransparentHome = pathname === "/" && !hasScrolled && !menuOpen;

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
  }, [pathname]);

  function isActiveHref(href: string) {
    if (pathname === href) return true;
    return href === "/arcade" && (pathname.startsWith("/arcade") || pathname.startsWith("/roleplay"));
  }

  return (
    <header
      className={twMerge(
        "top-0 z-30 bg-transparent",
        pathname === "/" ? "fixed inset-x-0" : "sticky",
      )}
    >
      <nav className="flex w-full items-center justify-between gap-3 px-4 py-3 lg:gap-4 lg:px-6 lg:py-4">
        <Link
          className={twMerge(
            "flex min-w-0 shrink items-center gap-3 rounded-full border py-1 pl-1 pr-4 font-bold backdrop-blur-md transition-colors lg:shrink-0 lg:gap-3.5 lg:py-1.5 lg:pl-1.5 lg:pr-5",
            isTransparentHome
              ? "border-white/25 bg-white/10 text-white drop-shadow"
              : "border-white/60 bg-white/55 text-ink shadow-sm",
          )}
          href="/"
        >
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
          <span className="min-w-0">
            <span className="block truncate text-sm leading-none lg:text-base">Japanese Study</span>
            <span
              className={twMerge(
                "hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] lg:block",
                isTransparentHome ? "text-sakura" : "text-matcha",
              )}
            >
              AI practice lab
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
              : "border-white/60 bg-white/55 text-ink shadow-sm",
          )}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden gap-2 overflow-x-auto p-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className={twMerge(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md transition",
                isTransparentHome
                  ? "border-white/25 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
                  : "border-white/60 bg-white/50 text-slate-700 shadow-sm hover:bg-white/80 hover:text-ink",
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
          <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/60 bg-white/85 p-2 shadow-lg backdrop-blur-md sm:grid-cols-4">
            {navItems.map((item) => (
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
