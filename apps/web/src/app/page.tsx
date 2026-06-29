import Link from "next/link";
import {
  Brain,
  Drama,
  Map,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { LEARNING_PATH_STEPS } from "@/lib/learning-path";

const features = [
  { title: "Learning path", href: "/path", icon: Map },
  { title: "Phrases", href: "/phrases", icon: MessageSquare },
  { title: "Listening", href: "/listening", icon: Volume2 },
  { title: "Flashcards", href: "/flashcards", icon: Brain },
  { title: "Roleplay", href: "/roleplay", icon: Drama },
  { title: "Hiragana", href: "/hiragana", symbol: "あ" },
  { title: "Katakana", href: "/katakana", symbol: "ア" },
];

const quickLinks = [
  { title: "Grammar", href: "/grammar" },
  { title: "Numbers", href: "/numbers" },
  { title: "Sentences", href: "/sentences" },
  { title: "Reviews", href: "/reviews" },
  { title: "Progress", href: "/progress" },
  { title: "Drills", href: "/tutor" },
];

const wheelColors = ["#f7d7e1", "#efb8ca", "#dc8fac", "#c96e92", "#a8577e", "#7f4569", "#59344f"];
const center = 200;
const outerRadius = 180;
const innerRadius = 58;
const segmentAngle = 360 / features.length;

function polarToCartesian(radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
}

function wheelSegmentPath(index: number) {
  const startAngle = index * segmentAngle;
  const endAngle = startAngle + segmentAngle;
  const largeArcFlag = segmentAngle > 180 ? 1 : 0;
  const outerStart = polarToCartesian(outerRadius, startAngle);
  const outerEnd = polarToCartesian(outerRadius, endAngle);
  const innerEnd = polarToCartesian(innerRadius, endAngle);
  const innerStart = polarToCartesian(innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function Home() {
  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-cover bg-center px-5 pb-12 pt-28 md:px-8"
      style={{ backgroundImage: "url('/home/sakura-fuji-bg.png')" }}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/35 via-ink/15 to-ink/55" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,250,240,0.42),transparent_35rem)]" />

      <section className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.36em] text-sakura drop-shadow">
          Japanese Study
        </p>
        <h1 className="mt-4 max-w-5xl text-5xl font-bold tracking-tight text-white drop-shadow-2xl md:text-7xl">
          Learn Japanese from zero — kana, phrases, grammar, and conversation.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 drop-shadow">
          New here? Start the 10-day learning path. Or pick any mode from the wheel.
        </p>

        <Link
          className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink shadow-lg transition hover:bg-sakura"
          href="/path"
        >
          Start Day 1 learning path →
        </Link>

        <nav aria-label="Learning sections" className="mt-10 w-full max-w-[35rem]">
          <svg
            className="h-auto w-full overflow-visible drop-shadow-2xl"
            role="img"
            viewBox="0 0 400 400"
          >
            <title>Japanese Study navigation wheel</title>
            <defs>
              <filter id="wheelGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" floodColor="#101828" floodOpacity="0.28" stdDeviation="10" />
              </filter>
            </defs>
            <circle className="fill-white/20" cx={center} cy={center} r={outerRadius + 13} />
            <circle className="fill-ink/20" cx={center} cy={center} r={outerRadius + 4} />
            {features.map((feature, index) => {
              const labelPoint = polarToCartesian(125, index * segmentAngle + segmentAngle / 2);
              const Icon = "icon" in feature ? feature.icon : null;

              return (
                <a aria-label={feature.title} href={feature.href} key={feature.href}>
                  <path
                    className="stroke-white/70 stroke-[3] transition duration-200 hover:brightness-110"
                    d={wheelSegmentPath(index)}
                    fill={wheelColors[index]}
                    filter="url(#wheelGlow)"
                  />
                  <foreignObject
                    className="pointer-events-none"
                    height="74"
                    width="96"
                    x={labelPoint.x - 48}
                    y={labelPoint.y - 37}
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-white">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 shadow-sm backdrop-blur">
                        {Icon ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <span className="text-xl font-bold leading-none">
                            {"symbol" in feature ? feature.symbol : ""}
                          </span>
                        )}
                      </span>
                      <span className="text-[13px] font-bold leading-tight drop-shadow">
                        {feature.title}
                      </span>
                    </div>
                  </foreignObject>
                </a>
              );
            })}
            <a href="/path">
              <circle
                className="fill-ink/90 stroke-white/80 stroke-[3] transition hover:fill-ink"
                cx={center}
                cy={center}
                r={innerRadius - 4}
              />
              <text
                className="pointer-events-none fill-white text-[18px] font-bold"
                dominantBaseline="middle"
                textAnchor="middle"
                x={center}
                y={center - 8}
              >
                Start
              </text>
              <text
                className="pointer-events-none fill-sakura text-[10px] font-semibold uppercase tracking-[0.24em]"
                dominantBaseline="middle"
                textAnchor="middle"
                x={center}
                y={center + 14}
              >
                Path
              </text>
            </a>
          </svg>
        </nav>

        <div className="mt-10 flex w-full max-w-3xl flex-wrap justify-center gap-2">
          {quickLinks.map((link) => (
            <Link
              className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              href={link.href}
              key={link.href}
            >
              {link.title}
            </Link>
          ))}
        </div>

        <section className="mt-12 w-full max-w-3xl rounded-[2rem] border border-white/25 bg-black/25 p-6 text-left backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sakura">
            Your first week
          </p>
          <ol className="mt-4 space-y-3">
            {LEARNING_PATH_STEPS.slice(0, 4).map((step) => (
              <li className="flex items-start gap-3 text-white/90" key={step.id}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {step.day}
                </span>
                <div>
                  <Link className="font-semibold text-white hover:text-sakura" href={step.href}>
                    {step.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-white/75">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            className="mt-5 inline-block text-sm font-semibold text-sakura hover:text-white"
            href="/path"
          >
            See all 10 steps →
          </Link>
        </section>
      </section>
    </main>
  );
}
