export type KatakanaCharacter = {
  character: string;
  reading: string;
  group?: string;
};

export const KATAKANA_CHARACTERS: KatakanaCharacter[] = [
  { character: "ア", reading: "a", group: "vowels" },
  { character: "イ", reading: "i", group: "vowels" },
  { character: "ウ", reading: "u", group: "vowels" },
  { character: "エ", reading: "e", group: "vowels" },
  { character: "オ", reading: "o", group: "vowels" },
  { character: "カ", reading: "ka", group: "k-row" },
  { character: "キ", reading: "ki", group: "k-row" },
  { character: "ク", reading: "ku", group: "k-row" },
  { character: "ケ", reading: "ke", group: "k-row" },
  { character: "コ", reading: "ko", group: "k-row" },
  { character: "サ", reading: "sa", group: "s-row" },
  { character: "シ", reading: "shi", group: "s-row" },
  { character: "ス", reading: "su", group: "s-row" },
  { character: "セ", reading: "se", group: "s-row" },
  { character: "ソ", reading: "so", group: "s-row" },
  { character: "タ", reading: "ta", group: "t-row" },
  { character: "チ", reading: "chi", group: "t-row" },
  { character: "ツ", reading: "tsu", group: "t-row" },
  { character: "テ", reading: "te", group: "t-row" },
  { character: "ト", reading: "to", group: "t-row" },
  { character: "ナ", reading: "na", group: "n-row" },
  { character: "ニ", reading: "ni", group: "n-row" },
  { character: "ヌ", reading: "nu", group: "n-row" },
  { character: "ネ", reading: "ne", group: "n-row" },
  { character: "ノ", reading: "no", group: "n-row" },
  { character: "ハ", reading: "ha", group: "h-row" },
  { character: "ヒ", reading: "hi", group: "h-row" },
  { character: "フ", reading: "fu", group: "h-row" },
  { character: "ヘ", reading: "he", group: "h-row" },
  { character: "ホ", reading: "ho", group: "h-row" },
  { character: "マ", reading: "ma", group: "m-row" },
  { character: "ミ", reading: "mi", group: "m-row" },
  { character: "ム", reading: "mu", group: "m-row" },
  { character: "メ", reading: "me", group: "m-row" },
  { character: "モ", reading: "mo", group: "m-row" },
  { character: "ヤ", reading: "ya", group: "y-row" },
  { character: "ユ", reading: "yu", group: "y-row" },
  { character: "ヨ", reading: "yo", group: "y-row" },
  { character: "ラ", reading: "ra", group: "r-row" },
  { character: "リ", reading: "ri", group: "r-row" },
  { character: "ル", reading: "ru", group: "r-row" },
  { character: "レ", reading: "re", group: "r-row" },
  { character: "ロ", reading: "ro", group: "r-row" },
  { character: "ワ", reading: "wa", group: "w-row" },
  { character: "ヲ", reading: "o", group: "w-row" },
  { character: "ン", reading: "n", group: "special" },
];

export const KATAKANA_GROUPS = [
  { id: "vowels", label: "Vowels", description: "ア イ ウ エ オ" },
  { id: "k-row", label: "K-row", description: "カ キ ク ケ コ" },
  { id: "s-row", label: "S-row", description: "サ シ ス セ ソ" },
  { id: "t-row", label: "T-row", description: "タ チ ツ テ ト" },
  { id: "n-row", label: "N-row", description: "ナ ニ ヌ ネ ノ" },
  { id: "h-row", label: "H-row", description: "ハ ヒ フ ヘ ホ" },
  { id: "m-row", label: "M-row", description: "マ ミ ム メ モ" },
  { id: "y-row", label: "Y-row", description: "ヤ ユ ヨ" },
  { id: "r-row", label: "R-row", description: "ラ リ ル レ ロ" },
  { id: "w-row", label: "W-row", description: "ワ ヲ" },
  { id: "special", label: "Special", description: "ン" },
] as const;

export function filterKatakana(groupIds: string[], includeAll = false): KatakanaCharacter[] {
  if (includeAll || groupIds.length === 0) return KATAKANA_CHARACTERS;
  const allowed = new Set(groupIds);
  return KATAKANA_CHARACTERS.filter((item) => item.group && allowed.has(item.group));
}

export function pickWeightedKatakana(
  pool: KatakanaCharacter[],
  mastery: Record<string, number>,
  excludeCharacter?: string,
) {
  const candidates =
    pool.length > 1 ? pool.filter((item) => item.character !== excludeCharacter) : pool;
  const weighted = candidates.flatMap((item) => {
    const score = mastery[item.character] ?? 0;
    const weight = Math.max(1, 6 - score);
    return Array.from({ length: weight }, () => item);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] ?? candidates[0];
}

export function buildKatakanaQuizOptions(
  correct: KatakanaCharacter,
  pool: KatakanaCharacter[],
  count = 4,
) {
  const distractors = pool
    .filter((item) => item.reading !== correct.reading)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
