import { twMerge } from "tailwind-merge";

const flagColors = ["#e4007c", "#f28c28", "#f6c343", "#3f9c5a", "#2f6db5", "#8e4ec6"];
const FLAG_WIDTH = 60;
const FLAG_GAP = 10;

function flagPath() {
  const teeth = 6;
  const tooth = FLAG_WIDTH / teeth;
  const bottom = Array.from({ length: teeth }, (_, index) => {
    const x = FLAG_WIDTH - index * tooth;
    return `L${x - tooth / 2} 72 L${x - tooth} 64`;
  }).join(" ");
  return `M0 4 L${FLAG_WIDTH} 4 L${FLAG_WIDTH} 64 ${bottom} Z`;
}

export function PapelPicado({ count = 12, className }: { count?: number; className?: string }) {
  const width = count * (FLAG_WIDTH + FLAG_GAP);
  return (
    <svg
      aria-hidden="true"
      className={twMerge("pointer-events-none h-auto w-full", className)}
      preserveAspectRatio="xMidYMin meet"
      viewBox={`0 0 ${width} 80`}
    >
      <defs>
        <mask id="papel-cut">
          <rect fill="white" height="80" width={FLAG_WIDTH} />
          <circle cx="30" cy="30" fill="black" r="9" />
          <circle cx="30" cy="30" fill="white" r="4" />
          <path d="M30 14 l4 6 h-8 Z M30 46 l4 -6 h-8 Z M14 30 l6 4 v-8 Z M46 30 l-6 4 v-8 Z" fill="black" />
          <circle cx="12" cy="14" fill="black" r="3" />
          <circle cx="48" cy="14" fill="black" r="3" />
          <circle cx="12" cy="50" fill="black" r="3" />
          <circle cx="48" cy="50" fill="black" r="3" />
          <path d="M22 56 h16 l-8 5 Z" fill="black" />
        </mask>
      </defs>
      <path d={`M0 4 Q${width / 2} 12 ${width} 4`} fill="none" stroke="#6b4a3a" strokeOpacity="0.45" strokeWidth="1.5" />
      {Array.from({ length: count }, (_, index) => (
        <g key={index} transform={`translate(${index * (FLAG_WIDTH + FLAG_GAP) + FLAG_GAP / 2} 0)`}>
          <g className="papel-sway" style={{ animationDelay: `${(index % 5) * -0.7}s` }}>
            <path d={flagPath()} fill={flagColors[index % flagColors.length]} fillOpacity="0.88" mask="url(#papel-cut)" />
          </g>
        </g>
      ))}
    </svg>
  );
}
