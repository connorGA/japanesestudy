export type NumberItem = {
  id: string;
  japanese: string;
  romaji: string;
  english: string;
  category: "basic" | "time" | "counter";
};

export const NUMBER_ITEMS: NumberItem[] = [
  { id: "1", japanese: "いち", romaji: "ichi", english: "1", category: "basic" },
  { id: "2", japanese: "に", romaji: "ni", english: "2", category: "basic" },
  { id: "3", japanese: "さん", romaji: "san", english: "3", category: "basic" },
  { id: "4", japanese: "よん", romaji: "yon", english: "4", category: "basic" },
  { id: "5", japanese: "ご", romaji: "go", english: "5", category: "basic" },
  { id: "6", japanese: "ろく", romaji: "roku", english: "6", category: "basic" },
  { id: "7", japanese: "なな", romaji: "nana", english: "7", category: "basic" },
  { id: "8", japanese: "はち", romaji: "hachi", english: "8", category: "basic" },
  { id: "9", japanese: "きゅう", romaji: "kyuu", english: "9", category: "basic" },
  { id: "10", japanese: "じゅう", romaji: "juu", english: "10", category: "basic" },
  { id: "100", japanese: "ひゃく", romaji: "hyaku", english: "100", category: "basic" },
  { id: "1000", japanese: "せん", romaji: "sen", english: "1000", category: "basic" },
  { id: "what-time", japanese: "いまなんじですか", romaji: "ima nan-ji desu ka", english: "What time is it now?", category: "time" },
  { id: "7oclock", japanese: "しちじです", romaji: "shichi-ji desu", english: "It's 7 o'clock.", category: "time" },
  { id: "half-past", japanese: "はん", romaji: "han", english: "half (past the hour)", category: "time" },
  { id: "am", japanese: "ごぜん", romaji: "gozen", english: "a.m.", category: "time" },
  { id: "pm", japanese: "ごご", romaji: "gogo", english: "p.m.", category: "time" },
  { id: "monday", japanese: "げつようび", romaji: "getsuyoubi", english: "Monday", category: "time" },
  { id: "today", japanese: "きょう", romaji: "kyou", english: "today", category: "time" },
  { id: "tomorrow", japanese: "あした", romaji: "ashita", english: "tomorrow", category: "time" },
  { id: "counter-general", japanese: "ひとつ", romaji: "hitotsu", english: "one (general counter)", category: "counter" },
  { id: "counter-two", japanese: "ふたつ", romaji: "futatsu", english: "two (general counter)", category: "counter" },
  { id: "counter-people", japanese: "ひとり", romaji: "hitori", english: "one person", category: "counter" },
  { id: "counter-people-2", japanese: "ふたり", romaji: "futari", english: "two people", category: "counter" },
  { id: "counter-long", japanese: "いっぽん", romaji: "ippon", english: "one (long thin object)", category: "counter" },
  { id: "counter-machines", japanese: "いちだい", romaji: "ichidai", english: "one machine/vehicle", category: "counter" },
  { id: "counter-flat", japanese: "いちまい", romaji: "ichimai", english: "one flat object", category: "counter" },
  { id: "counter-age", japanese: "いっさい", romaji: "issai", english: "one year old", category: "counter" },
];

export const NUMBER_CATEGORIES = [
  { id: "basic", label: "Numbers 1–10+" },
  { id: "time", label: "Time & days" },
  { id: "counter", label: "Counters" },
] as const;

export function filterNumbers(categories: string[]) {
  if (!categories.length) return NUMBER_ITEMS;
  const allowed = new Set(categories);
  return NUMBER_ITEMS.filter((item) => allowed.has(item.category));
}

export function buildNumberQuizOptions(correct: NumberItem, pool: NumberItem[], count = 4) {
  const distractors = pool
    .filter((item) => item.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
