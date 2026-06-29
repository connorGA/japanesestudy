export type StrokePath = {
  d: string;
  durationMs: number;
};

export type StrokeCharacter = {
  character: string;
  reading: string;
  strokes: StrokePath[];
  viewBox?: string;
};

export const STROKE_CHARACTERS: StrokeCharacter[] = [
  {
    character: "あ",
    reading: "a",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 20 25 Q 50 5 80 25", durationMs: 600 },
      { d: "M 50 25 L 50 75", durationMs: 500 },
      { d: "M 30 55 Q 50 45 70 55", durationMs: 500 },
    ],
  },
  {
    character: "い",
    reading: "i",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 35 20 Q 30 50 35 80", durationMs: 600 },
      { d: "M 65 30 L 65 75", durationMs: 500 },
    ],
  },
  {
    character: "う",
    reading: "u",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 25 30 Q 50 15 75 30", durationMs: 600 },
      { d: "M 50 30 L 50 70", durationMs: 500 },
      { d: "M 35 70 Q 50 85 65 70", durationMs: 500 },
    ],
  },
  {
    character: "え",
    reading: "e",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 20 35 L 80 35", durationMs: 500 },
      { d: "M 50 35 Q 35 55 50 75", durationMs: 600 },
      { d: "M 40 60 L 70 60", durationMs: 400 },
    ],
  },
  {
    character: "お",
    reading: "o",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 25 30 Q 50 15 75 30", durationMs: 600 },
      { d: "M 50 30 L 50 55", durationMs: 400 },
      { d: "M 35 65 Q 50 80 65 65", durationMs: 500 },
      { d: "M 60 45 L 75 70", durationMs: 400 },
    ],
  },
  {
    character: "か",
    reading: "ka",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 25 30 Q 50 15 75 30", durationMs: 600 },
      { d: "M 50 30 L 50 75", durationMs: 500 },
      { d: "M 30 55 L 70 55", durationMs: 400 },
    ],
  },
  {
    character: "き",
    reading: "ki",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 30 25 L 70 25", durationMs: 400 },
      { d: "M 50 25 L 50 70", durationMs: 500 },
      { d: "M 35 50 Q 50 65 65 50", durationMs: 500 },
      { d: "M 55 65 L 70 80", durationMs: 400 },
    ],
  },
  {
    character: "さ",
    reading: "sa",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 30 30 Q 50 20 70 30", durationMs: 500 },
      { d: "M 50 30 L 50 75", durationMs: 500 },
      { d: "M 35 55 L 65 55", durationMs: 400 },
    ],
  },
  {
    character: "に",
    reading: "ni",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 30 30 L 70 30", durationMs: 400 },
      { d: "M 50 30 L 50 75", durationMs: 500 },
      { d: "M 35 60 L 65 60", durationMs: 400 },
    ],
  },
  {
    character: "ん",
    reading: "n",
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M 30 25 Q 50 40 70 25", durationMs: 600 },
      { d: "M 50 25 Q 35 55 55 75", durationMs: 700 },
    ],
  },
];
