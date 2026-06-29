export type HiraganaCharacter = {
  character: string;
  reading: string;
  group?: string;
};

export const HIRAGANA_CHARACTERS: HiraganaCharacter[] = [
  { character: "あ", reading: "a", group: "vowels" },
  { character: "い", reading: "i", group: "vowels" },
  { character: "う", reading: "u", group: "vowels" },
  { character: "え", reading: "e", group: "vowels" },
  { character: "お", reading: "o", group: "vowels" },
  { character: "か", reading: "ka", group: "k-row" },
  { character: "き", reading: "ki", group: "k-row" },
  { character: "く", reading: "ku", group: "k-row" },
  { character: "け", reading: "ke", group: "k-row" },
  { character: "こ", reading: "ko", group: "k-row" },
  { character: "さ", reading: "sa", group: "s-row" },
  { character: "し", reading: "shi", group: "s-row" },
  { character: "す", reading: "su", group: "s-row" },
  { character: "せ", reading: "se", group: "s-row" },
  { character: "そ", reading: "so", group: "s-row" },
  { character: "た", reading: "ta", group: "t-row" },
  { character: "ち", reading: "chi", group: "t-row" },
  { character: "つ", reading: "tsu", group: "t-row" },
  { character: "て", reading: "te", group: "t-row" },
  { character: "と", reading: "to", group: "t-row" },
  { character: "な", reading: "na", group: "n-row" },
  { character: "に", reading: "ni", group: "n-row" },
  { character: "ぬ", reading: "nu", group: "n-row" },
  { character: "ね", reading: "ne", group: "n-row" },
  { character: "の", reading: "no", group: "n-row" },
  { character: "は", reading: "ha", group: "h-row" },
  { character: "ひ", reading: "hi", group: "h-row" },
  { character: "ふ", reading: "fu", group: "h-row" },
  { character: "へ", reading: "he", group: "h-row" },
  { character: "ほ", reading: "ho", group: "h-row" },
  { character: "ま", reading: "ma", group: "m-row" },
  { character: "み", reading: "mi", group: "m-row" },
  { character: "む", reading: "mu", group: "m-row" },
  { character: "め", reading: "me", group: "m-row" },
  { character: "も", reading: "mo", group: "m-row" },
  { character: "や", reading: "ya", group: "y-row" },
  { character: "ゆ", reading: "yu", group: "y-row" },
  { character: "よ", reading: "yo", group: "y-row" },
  { character: "ら", reading: "ra", group: "r-row" },
  { character: "り", reading: "ri", group: "r-row" },
  { character: "る", reading: "ru", group: "r-row" },
  { character: "れ", reading: "re", group: "r-row" },
  { character: "ろ", reading: "ro", group: "r-row" },
  { character: "わ", reading: "wa", group: "w-row" },
  { character: "を", reading: "o", group: "w-row" },
  { character: "ん", reading: "n", group: "special" },
];

export const HIRAGANA_GROUPS = [
  { id: "vowels", label: "Vowels", description: "あ い う え お" },
  { id: "k-row", label: "K-row", description: "か き く け こ" },
  { id: "s-row", label: "S-row", description: "さ し す せ そ" },
  { id: "t-row", label: "T-row", description: "た ち つ て と" },
  { id: "n-row", label: "N-row", description: "な に ぬ ね の" },
  { id: "h-row", label: "H-row", description: "は ひ ふ へ ほ" },
  { id: "m-row", label: "M-row", description: "ま み む め も" },
  { id: "y-row", label: "Y-row", description: "や ゆ よ" },
  { id: "r-row", label: "R-row", description: "ら り る れ ろ" },
  { id: "w-row", label: "W-row", description: "わ を" },
  { id: "special", label: "Special", description: "ん" },
] as const;

export function filterHiragana(
  groupIds: string[],
  includeAll = false,
): HiraganaCharacter[] {
  if (includeAll || groupIds.length === 0) {
    return HIRAGANA_CHARACTERS;
  }

  const allowed = new Set(groupIds);
  return HIRAGANA_CHARACTERS.filter((item) => item.group && allowed.has(item.group));
}

export function pickWeightedCharacter(
  pool: HiraganaCharacter[],
  mastery: Record<string, number>,
  excludeCharacter?: string,
) {
  const candidates =
    pool.length > 1
      ? pool.filter((item) => item.character !== excludeCharacter)
      : pool;

  const weighted = candidates.flatMap((item) => {
    const score = mastery[item.character] ?? 0;
    const weight = Math.max(1, 6 - score);
    return Array.from({ length: weight }, () => item);
  });

  return weighted[Math.floor(Math.random() * weighted.length)] ?? candidates[0];
}

export function buildQuizOptions(
  correct: HiraganaCharacter,
  pool: HiraganaCharacter[],
  count = 4,
) {
  const distractors = pool
    .filter((item) => item.reading !== correct.reading)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);

  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
