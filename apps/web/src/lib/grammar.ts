export type GrammarExample = {
  japanese: string;
  romaji: string;
  english: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  summary: string;
  particle?: string;
  pattern: string;
  explanation: string;
  examples: GrammarExample[];
  tip?: string;
};

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "desu",
    title: 'です — "X is Y"',
    summary: "The basic way to say what something is.",
    pattern: "A は B です",
    explanation:
      "Add です at the end of a sentence to make a polite statement. は (wa) marks the topic — what you're talking about.",
    examples: [
      { japanese: "わたしはがくせいです。", romaji: "Watashi wa gakusei desu.", english: "I am a student." },
      { japanese: "これはおちゃです。", romaji: "Kore wa ocha desu.", english: "This is tea." },
      { japanese: "田中さんはせんせいです。", romaji: "Tanaka-san wa sensei desu.", english: "Mr. Tanaka is a teacher." },
    ],
    tip: "です is polite. With close friends you can drop it: わたし、がくせい。",
  },
  {
    id: "wa",
    title: "は — Topic marker",
    summary: "Marks what the sentence is about.",
    particle: "は",
    pattern: "Topic は …",
    explanation:
      "は is written は but pronounced \"wa.\" It tells the listener: \"As for this topic…\" It is not the subject marker in every sentence, but it is the most common way beginners frame statements.",
    examples: [
      { japanese: "わたしはアメリカじんです。", romaji: "Watashi wa amerikajin desu.", english: "I am American." },
      { japanese: "きょうはあついです。", romaji: "Kyou wa atsui desu.", english: "Today is hot." },
      { japanese: "これはいくらですか。", romaji: "Kore wa ikura desu ka.", english: "How much is this?" },
    ],
  },
  {
    id: "wo",
    title: "を — Object marker",
    summary: "Marks the thing being acted on.",
    particle: "を",
    pattern: "… を verb",
    explanation:
      "を (o) comes before a verb and marks the direct object — the thing that receives the action.",
    examples: [
      { japanese: "みずをのみます。", romaji: "Mizu o nomimasu.", english: "I drink water." },
      { japanese: "ごはんをたべます。", romaji: "Gohan o tabemasu.", english: "I eat a meal." },
      { japanese: "にほんごをべんきょうします。", romaji: "Nihongo o benkyou shimasu.", english: "I study Japanese." },
    ],
  },
  {
    id: "ni",
    title: "に — Direction, time, location",
    summary: "Marks where you're going, when, or where something exists.",
    particle: "に",
    pattern: "Place/Time に …",
    explanation:
      "に can mark a destination (に いきます), a time (７じに), or a location where something exists (がっこうに います).",
    examples: [
      { japanese: "がっこうにいきます。", romaji: "Gakkou ni ikimasu.", english: "I go to school." },
      { japanese: "７じにおきます。", romaji: "Shichi-ji ni okimasu.", english: "I wake up at 7." },
      { japanese: "えきにいます。", romaji: "Eki ni imasu.", english: "I am at the station." },
    ],
  },
  {
    id: "de",
    title: "で — Means / location of action",
    summary: "How you do something, or where an action happens.",
    particle: "で",
    pattern: "Place/Tool で verb",
    explanation:
      "で marks the means (バスで — by bus) or the place where an action occurs (みせで かいます — buy at the store).",
    examples: [
      { japanese: "バスでいきます。", romaji: "Basu de ikimasu.", english: "I go by bus." },
      { japanese: "みせでかいます。", romaji: "Mise de kaimasu.", english: "I buy it at the store." },
      { japanese: "はしでたべます。", romaji: "Hashi de tabemasu.", english: "I eat with chopsticks." },
    ],
  },
  {
    id: "ka",
    title: "か — Questions",
    summary: "Turn a statement into a question.",
    particle: "か",
    pattern: "… ですか",
    explanation:
      "Add か at the end to ask a yes/no question. Your intonation stays fairly flat compared to English.",
    examples: [
      { japanese: "これはあなたのですか。", romaji: "Kore wa anata no desu ka.", english: "Is this yours?" },
      { japanese: "トイレはどこですか。", romaji: "Toire wa doko desu ka.", english: "Where is the restroom?" },
      { japanese: "いくらですか。", romaji: "Ikura desu ka.", english: "How much is it?" },
    ],
  },
  {
    id: "question-words",
    title: "Question words",
    summary: "何・どこ・いつ・だれ・なに",
    pattern: "Question word + ですか",
    explanation:
      "Combine question words with ですか to ask for specific information. なに/なん (what), どこ (where), いつ (when), だれ (who).",
    examples: [
      { japanese: "これはなんですか。", romaji: "Kore wa nan desu ka.", english: "What is this?" },
      { japanese: "えきはどこですか。", romaji: "Eki wa doko desu ka.", english: "Where is the station?" },
      { japanese: "あのひとはだれですか。", romaji: "Ano hito wa dare desu ka.", english: "Who is that person?" },
    ],
  },
  {
    id: "masu",
    title: "ます — Polite verb ending",
    summary: "The default polite verb form.",
    pattern: "verb stem + ます",
    explanation:
      "Most beginner verbs end in ます in polite speech: たべます (eat), のみます (drink), いきます (go). Drop ます and add ました for past tense.",
    examples: [
      { japanese: "あさごはんをたべます。", romaji: "Asagohan o tabemasu.", english: "I eat breakfast." },
      { japanese: "きのうべんきょうしました。", romaji: "Kinou benkyou shimashita.", english: "I studied yesterday." },
      { japanese: "まいにちべんきょうします。", romaji: "Mainichi benkyou shimasu.", english: "I study every day." },
    ],
  },
];
