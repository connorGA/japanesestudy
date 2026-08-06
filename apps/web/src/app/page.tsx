import {
  Brain,
  Gamepad2,
  MessageCircle,
  Volume2,
} from "lucide-react";

const features = [
  {
    title: "AI Tutor",
    href: "/tutor",
    icon: MessageCircle,
  },
  {
    title: "Listening",
    href: "/listening",
    icon: Volume2,
  },
  {
    title: "Flashcards",
    href: "/flashcards",
    icon: Brain,
  },
  {
    title: "Arcade",
    href: "/arcade",
    icon: Gamepad2,
  },
  {
    title: "Hiragana",
    href: "/hiragana",
    symbol: "あ",
  },
  {
    title: "Katakana",
    href: "/katakana",
    symbol: "ア",
  },
  {
    title: "Kanji",
    href: "/kanji",
    symbol: "漢",
  },
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
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-x-hidden bg-cover bg-center px-4 pb-8 pt-24 md:overflow-hidden md:px-8 md:pt-24"
      style={{ backgroundImage: "url('/home/sakura-fuji-bg.png')" }}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/25 to-ink/60" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,250,240,0.32),transparent_35rem)]" />

      <section className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <div
          className="max-w-2xl rounded-3xl bg-ink/25 px-5 py-3.5 backdrop-blur-[3px] md:px-6 md:py-4"
          style={{ textShadow: "0 2px 14px rgba(16, 24, 40, 0.65)" }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-sakura md:text-xs md:tracking-[0.36em]">
            Japanese Study
          </p>
          <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl md:text-3xl md:leading-tight">
            Personalized Japanese practice powered by AI, audio, and review.
          </h1>
          <p className="mt-2 text-[0.8rem] leading-5 text-white/95 sm:text-sm sm:leading-6 md:text-base">
            Choose a learning path from the wheel below and jump straight into focused practice.
          </p>
        </div>

        <nav
          aria-label="Learning sections"
          className="mt-5 w-full max-w-[min(32rem,max(15rem,calc(100svh_-_21rem)))] md:mt-6 md:max-w-[min(32rem,max(17rem,calc(100svh_-_20rem)))]"
        >
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
                    <div
                      className="flex h-full flex-col items-center justify-center gap-1 text-center text-white"
                      style={{ textShadow: "0 1px 6px rgba(16, 24, 40, 0.55)" }}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 shadow-sm backdrop-blur">
                        {Icon ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <span className="text-xl font-bold leading-none">
                            {"symbol" in feature ? feature.symbol : ""}
                          </span>
                        )}
                      </span>
                      <span className="text-[13px] font-bold leading-tight">
                        {feature.title}
                      </span>
                    </div>
                  </foreignObject>
                </a>
              );
            })}
            <circle
              className="fill-ink/90 stroke-white/80 stroke-[3]"
              cx={center}
              cy={center}
              r={innerRadius - 4}
            />
            <text
              className="fill-white text-[18px] font-bold"
              dominantBaseline="middle"
              textAnchor="middle"
              x={center}
              y={center - 8}
            >
              Start
            </text>
            <text
              className="fill-sakura text-[10px] font-semibold uppercase tracking-[0.24em]"
              dominantBaseline="middle"
              textAnchor="middle"
              x={center}
              y={center + 14}
            >
              Practice
            </text>
          </svg>
        </nav>
      </section>
    </main>
  );
}
