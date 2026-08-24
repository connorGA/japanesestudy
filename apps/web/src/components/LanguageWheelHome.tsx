import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  BookOpenText,
  Brain,
  Gamepad2,
  Languages,
  MessageCircle,
  TableProperties,
  Volume2,
} from "lucide-react";

type WheelFeature = {
  title: string;
  href: string;
  icon?: LucideIcon;
  symbol?: string;
};

const languageFeatures: Record<"japanese" | "italian", WheelFeature[]> = {
  japanese: [
    { title: "AI Tutor", href: "/japanese/tutor", icon: MessageCircle },
    { title: "Listening", href: "/japanese/listening", icon: Volume2 },
    { title: "Flashcards", href: "/japanese/flashcards", icon: Brain },
    { title: "Arcade", href: "/japanese/arcade", icon: Gamepad2 },
    { title: "Hiragana", href: "/japanese/hiragana", symbol: "あ" },
    { title: "Katakana", href: "/japanese/katakana", symbol: "ア" },
    { title: "Kanji", href: "/japanese/kanji", symbol: "漢" },
  ],
  italian: [
    { title: "AI Tutor", href: "/italian/tutor", icon: MessageCircle },
    { title: "Listening", href: "/italian/listening", icon: AudioLines },
    { title: "Flashcards", href: "/italian/flashcards", icon: Brain },
    { title: "Arcade", href: "/italian/arcade", icon: Gamepad2 },
    { title: "Pronunciation", href: "/italian/pronunciation", icon: Languages },
    { title: "Grammar", href: "/italian/grammar", icon: BookOpenText },
    { title: "Verbs", href: "/italian/verbs", icon: TableProperties },
  ],
};

const wheelColors = {
  japanese: ["#f7d7e1", "#efb8ca", "#dc8fac", "#c96e92", "#a8577e", "#7f4569", "#59344f"],
  italian: ["#dce9df", "#acd0b8", "#6fa584", "#367b5a", "#bfa98b", "#d88a6e", "#b94e47"],
};
const center = 200;
const outerRadius = 180;
const innerRadius = 58;

export function LanguageWheelHome({ language }: { language: "japanese" | "italian" }) {
  const features = languageFeatures[language];
  const segmentAngle = 360 / features.length;
  const isItalian = language === "italian";

  return (
    <main
      className={
        isItalian
          ? "theme-italian relative isolate flex min-h-[calc(100svh-5.5rem)] flex-col justify-center overflow-hidden px-4 pb-10 pt-6 md:px-8"
          : "relative isolate flex min-h-[100svh] flex-col justify-center overflow-x-hidden bg-cover bg-center px-4 pb-8 pt-24 md:overflow-hidden md:px-8 md:pt-24"
      }
      style={
        isItalian
          ? { background: "radial-gradient(circle at 50% 38%, rgba(255,255,255,.9), transparent 25rem), linear-gradient(145deg, #e7efe5 0%, #fff9ee 52%, #efd6cb 100%)" }
          : { backgroundImage: "url('/home/sakura-fuji-bg.png')" }
      }
    >
      {isItalian ? (
        <>
          <div className="absolute -left-24 top-1/4 -z-10 h-72 w-72 rounded-full border-[2.5rem] border-[#2e7d5b]/10" />
          <div className="absolute -right-16 bottom-10 -z-10 h-64 w-64 rounded-full border-[2.5rem] border-[#bd463f]/10" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-[linear-gradient(90deg,#2e7d5b_0_33%,#fff9ee_33%_66%,#bd463f_66%)] opacity-[0.08]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/25 to-ink/60" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,250,240,0.32),transparent_35rem)]" />
        </>
      )}

      <section className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <div
          className={
            isItalian
              ? "max-w-2xl rounded-3xl border border-white/70 bg-white/55 px-5 py-3.5 shadow-sm backdrop-blur-md md:px-6 md:py-4"
              : "max-w-2xl rounded-3xl bg-ink/25 px-5 py-3.5 backdrop-blur-[3px] md:px-6 md:py-4"
          }
          style={isItalian ? undefined : { textShadow: "0 2px 14px rgba(16, 24, 40, 0.65)" }}
        >
          <p className={isItalian ? "text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-matcha md:text-xs md:tracking-[0.36em]" : "text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-sakura md:text-xs md:tracking-[0.36em]"}>
            {isItalian ? "Italian Study · Benvenuto" : "Japanese Study"}
          </p>
          <h1 className={isItalian ? "mt-2 text-xl font-bold leading-tight tracking-tight text-ink sm:text-2xl md:text-3xl" : "mt-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl md:text-3xl"}>
            {isItalian
              ? "Build confident, natural Italian one small practice at a time."
              : "Personalized Japanese practice powered by AI, audio, and review."}
          </h1>
          <p className={isItalian ? "mt-2 text-[0.8rem] leading-5 text-slate-600 sm:text-sm sm:leading-6 md:text-base" : "mt-2 text-[0.8rem] leading-5 text-white/95 sm:text-sm sm:leading-6 md:text-base"}>
            Choose a learning path from the wheel below and jump straight into focused practice.
          </p>
        </div>

        <nav aria-label={`${language} learning sections`} className="mt-5 w-full max-w-[min(32rem,max(15rem,calc(100svh_-_21rem)))] md:mt-6 md:max-w-[min(32rem,max(17rem,calc(100svh_-_20rem)))]">
          <svg className="h-auto w-full overflow-visible drop-shadow-2xl" role="img" viewBox="0 0 400 400">
            <title>{`${isItalian ? "Italian" : "Japanese"} Study navigation wheel`}</title>
            <defs>
              <filter id={`${language}WheelGlow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" floodColor="#101828" floodOpacity="0.22" stdDeviation="10" />
              </filter>
            </defs>
            <circle className="fill-white/30" cx={center} cy={center} r={outerRadius + 13} />
            <circle className="fill-ink/20" cx={center} cy={center} r={outerRadius + 4} />
            {features.map((feature, index) => {
              const labelPoint = polarToCartesian(125, index * segmentAngle + segmentAngle / 2);
              const Icon = feature.icon;
              return (
                <a aria-label={feature.title} href={feature.href} key={feature.href}>
                  <path className="stroke-white/70 stroke-[3] transition duration-200 hover:brightness-110" d={wheelSegmentPath(index, segmentAngle)} fill={wheelColors[language][index]} filter={`url(#${language}WheelGlow)`} />
                  <foreignObject className="pointer-events-none" height="78" width="104" x={labelPoint.x - 52} y={labelPoint.y - 39}>
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-white" style={{ textShadow: "0 1px 6px rgba(16, 24, 40, 0.55)" }}>
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 shadow-sm backdrop-blur">
                        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xl font-bold leading-none">{feature.symbol}</span>}
                      </span>
                      <span className="text-[12px] font-bold leading-tight">{feature.title}</span>
                    </div>
                  </foreignObject>
                </a>
              );
            })}
            <circle className="fill-ink/90 stroke-white/80 stroke-[3]" cx={center} cy={center} r={innerRadius - 4} />
            <text className="fill-white text-[18px] font-bold" dominantBaseline="middle" textAnchor="middle" x={center} y={center - 8}>Start</text>
            <text className="fill-sakura text-[10px] font-semibold uppercase tracking-[0.24em]" dominantBaseline="middle" textAnchor="middle" x={center} y={center + 14}>Practice</text>
          </svg>
        </nav>
      </section>
    </main>
  );
}

function polarToCartesian(radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return { x: center + radius * Math.cos(angleInRadians), y: center + radius * Math.sin(angleInRadians) };
}

function wheelSegmentPath(index: number, segmentAngle: number) {
  const startAngle = index * segmentAngle;
  const endAngle = startAngle + segmentAngle;
  const outerStart = polarToCartesian(outerRadius, startAngle);
  const outerEnd = polarToCartesian(outerRadius, endAngle);
  const innerEnd = polarToCartesian(innerRadius, endAngle);
  const innerStart = polarToCartesian(innerRadius, startAngle);
  return [`M ${outerStart.x} ${outerStart.y}`, `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`, `L ${innerEnd.x} ${innerEnd.y}`, `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`, "Z"].join(" ");
}
