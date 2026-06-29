export type PhraseItem = {
  id: string;
  english: string;
  japanese: string;
  romaji: string;
  note?: string;
};

export type PhrasePack = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  roleplayScenarioId?: string;
  listeningCategoryId?: string;
  phrases: PhraseItem[];
};

export const PHRASE_PACKS: PhrasePack[] = [
  {
    id: "greetings",
    title: "Greetings",
    description: "Start every conversation the right way.",
    emoji: "👋",
    roleplayScenarioId: "convenience-store",
    phrases: [
      { id: "gm", english: "Good morning", japanese: "おはようございます", romaji: "ohayou gozaimasu" },
      { id: "hello", english: "Hello", japanese: "こんにちは", romaji: "konnichiwa" },
      { id: "evening", english: "Good evening", japanese: "こんばんは", romaji: "konbanwa" },
      { id: "bye", english: "Goodbye", japanese: "さようなら", romaji: "sayounara" },
      { id: "see-you", english: "See you later", japanese: "またね", romaji: "mata ne" },
      { id: "long-time", english: "Long time no see", japanese: "お久しぶりです", romaji: "ohisashiburi desu" },
      { id: "welcome-back", english: "Welcome back", japanese: "おかえりなさい", romaji: "okaeri nasai" },
      { id: "im-home", english: "I'm home", japanese: "ただいま", romaji: "tadaima" },
    ],
  },
  {
    id: "politeness",
    title: "Politeness",
    description: "Essential manners for daily life in Japan.",
    emoji: "🙏",
    phrases: [
      { id: "thanks", english: "Thank you", japanese: "ありがとうございます", romaji: "arigatou gozaimasu" },
      { id: "thanks-casual", english: "Thanks (casual)", japanese: "ありがとう", romaji: "arigatou" },
      { id: "sorry", english: "Excuse me / Sorry", japanese: "すみません", romaji: "sumimasen" },
      { id: "please", english: "Please", japanese: "おねがいします", romaji: "onegaishimasu" },
      { id: "sorry-formal", english: "I'm sorry", japanese: "ごめんなさい", romaji: "gomen nasai" },
      { id: "after-you", english: "After you", japanese: "どうぞ", romaji: "douzo" },
      { id: "not-at-all", english: "Not at all", japanese: "いいえ、けっこうです", romaji: "iie, kekkou desu" },
      { id: "welcome", english: "You're welcome", japanese: "どういたしまして", romaji: "dou itashimashite" },
    ],
  },
  {
    id: "introductions",
    title: "Introductions",
    description: "Say who you are and meet new people.",
    emoji: "🤝",
    roleplayScenarioId: "business-meeting",
    phrases: [
      { id: "nice-meet", english: "Nice to meet you", japanese: "はじめまして", romaji: "hajimemashite" },
      { id: "please-regard", english: "Please treat me well", japanese: "よろしくおねがいします", romaji: "yoroshiku onegaishimasu" },
      { id: "i-am", english: "I am …", japanese: "わたしは…です", romaji: "watashi wa … desu" },
      { id: "my-name", english: "My name is …", japanese: "わたしのなまえは…です", romaji: "watashi no namae wa … desu" },
      { id: "from-us", english: "I'm from America", japanese: "アメリカからきました", romaji: "amerika kara kimashita" },
      { id: "student", english: "I'm a student", japanese: "がくせいです", romaji: "gakusei desu" },
      { id: "learning", english: "I'm studying Japanese", japanese: "にほんごをべんきょうしています", romaji: "nihongo o benkyou shite imasu" },
      { id: "how-are-you", english: "How are you?", japanese: "おげんきですか", romaji: "ogenki desu ka" },
    ],
  },
  {
    id: "survival",
    title: "Survival",
    description: "When you need help or don't understand.",
    emoji: "🆘",
    roleplayScenarioId: "train-station",
    listeningCategoryId: "survival-phrases",
    phrases: [
      { id: "dont-understand", english: "I don't understand", japanese: "わかりません", romaji: "wakarimasen" },
      { id: "again-please", english: "Once more, please", japanese: "もういちどおねがいします", romaji: "mou ichido onegaishimasu" },
      { id: "slowly", english: "Slowly, please", japanese: "ゆっくりおねがいします", romaji: "yukkuri onegaishimasu" },
      { id: "english-ok", english: "Do you speak English?", japanese: "えいごははなせますか", romaji: "eigo wa hanasemasu ka" },
      { id: "where-toilet", english: "Where is the restroom?", japanese: "トイレはどこですか", romaji: "toire wa doko desu ka" },
      { id: "help", english: "Please help me", japanese: "たすけてください", romaji: "tasukete kudasai" },
      { id: "lost", english: "I'm lost", japanese: "みちにまよいました", romaji: "michi ni mayoi mashita" },
      { id: "how-much", english: "How much is it?", japanese: "いくらですか", romaji: "ikura desu ka" },
    ],
  },
  {
    id: "shopping-eating",
    title: "Shopping & Eating",
    description: "Order food and buy things with confidence.",
    emoji: "🍜",
    roleplayScenarioId: "ramen-shop",
    listeningCategoryId: "food",
    phrases: [
      { id: "this-please", english: "This one, please", japanese: "これをください", romaji: "kore o kudasai" },
      { id: "two-please", english: "Two of these, please", japanese: "これをふたつください", romaji: "kore o futatsu kudasai" },
      { id: "check-please", english: "The bill, please", japanese: "おかいけいおねがいします", romaji: "okaikei onegaishimasu" },
      { id: "delicious", english: "It's delicious!", japanese: "おいしいです", romaji: "oishii desu" },
      { id: "im-full", english: "I'm full", japanese: "おなかがいっぱいです", romaji: "onaka ga ippai desu" },
      { id: "water-please", english: "Water, please", japanese: "みずをください", romaji: "mizu o kudasai" },
      { id: "ramen-order", english: "One ramen, please", japanese: "ラーメンをひとつおねがいします", romaji: "raamen o hitotsu onegaishimasu" },
      { id: "takeaway", english: "To go, please", japanese: "もちかえりでおねがいします", romaji: "mochikaeri de onegaishimasu" },
    ],
  },
];

export function buildPhraseQuizOptions(correct: PhraseItem, pool: PhraseItem[], count = 4) {
  const distractors = pool
    .filter((item) => item.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
