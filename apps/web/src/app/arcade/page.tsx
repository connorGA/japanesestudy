import Link from "next/link";
import { ArrowRight, Boxes, Gamepad2 } from "lucide-react";

const games = [
  {
    title: "Kana Cube",
    description:
      "Spin a 3D cube through a cherry blossom scene to match each romaji reading to its hiragana before the timer runs out.",
    href: "/arcade/kana-cube",
    level: "Hiragana drill",
    icon: Boxes,
  },
];

export default function ArcadePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-5 md:min-h-[calc(100svh-5.5rem)] md:px-8 md:py-8">
      <header>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-matcha/10 text-matcha">
          <Gamepad2 className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-matcha sm:mt-5">
          Arcade
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Learn Japanese through play.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Every learning game we build lives here. Pick one and turn your next practice session
          into a challenge.
        </p>
      </header>

      <section className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              className="group flex min-h-64 flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-br from-sakura/35 via-white/85 to-washi p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-72 sm:p-6"
              href={game.href}
              key={game.href}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-sm">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-semibold text-matcha">
                  {game.level}
                </span>
              </div>

              <div className="mt-auto pt-8 sm:pt-10">
                <h2 className="text-xl font-bold text-ink sm:text-2xl">{game.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{game.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
                  Play now
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
