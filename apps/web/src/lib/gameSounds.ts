const MUTE_KEY = "japanese-study.game.muted";
export const MUTE_EVENT = "japanese-game-muted";

// Yo pentatonic (D E G A B) keeps every chime consonant with the others.
const SCALE = [587.33, 659.25, 783.99, 880, 987.77, 1174.66, 1318.51, 1567.98];

let context: AudioContext | null = null;

export function isMuted() {
  return typeof window !== "undefined" && window.localStorage.getItem(MUTE_KEY) === "true";
}

export function setMuted(muted: boolean) {
  window.localStorage.setItem(MUTE_KEY, String(muted));
  window.dispatchEvent(new CustomEvent(MUTE_EVENT));
}

function audio() {
  if (typeof window === "undefined" || isMuted()) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

function bell(ctx: AudioContext, frequency: number, start: number, duration: number, volume: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  gain.connect(ctx.destination);

  for (const [ratio, level] of [
    [1, 1],
    [2.01, 0.35],
    [3.02, 0.12],
  ] as const) {
    const osc = ctx.createOscillator();
    const partial = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency * ratio, start);
    partial.gain.value = level;
    osc.connect(partial).connect(gain);
    osc.start(start);
    osc.stop(start + duration);
  }
}

export function playCorrect(multiplier: number) {
  const ctx = audio();
  if (!ctx) return;
  const step = multiplier >= 3 ? 3 : multiplier >= 2 ? 2 : multiplier > 1 ? 1 : 0;
  const t = ctx.currentTime;
  bell(ctx, SCALE[step + 2], t, 0.35, 0.08);
  bell(ctx, SCALE[step + 4], t + 0.07, 0.45, 0.07);
}

export function playCombo() {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 2, 4, 7].forEach((index, i) => bell(ctx, SCALE[index], t + i * 0.06, 0.5, 0.07));
}

export function playTierUp() {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  bell(ctx, SCALE[4], t, 1.2, 0.1);
  bell(ctx, SCALE[7], t + 0.12, 1.4, 0.08);
}

export function playLevelUp() {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((index, i) => bell(ctx, SCALE[index], t + i * 0.09, 0.9, 0.07));
  bell(ctx, SCALE[0] / 2, t + 0.75, 2, 0.08);
  bell(ctx, SCALE[4], t + 0.75, 2, 0.06);
  bell(ctx, SCALE[7], t + 0.75, 2, 0.05);
}
