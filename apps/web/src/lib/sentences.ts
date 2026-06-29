export type SentenceSlot = {
  id: string;
  options: string[];
  correct: string;
  hint?: string;
};

export type SentenceExercise = {
  id: string;
  title: string;
  english: string;
  slots: SentenceSlot[];
  reading: string;
};

export const SENTENCE_EXERCISES: SentenceExercise[] = [
  {
    id: "student",
    title: "I am a student",
    english: "I am a student.",
    reading: "Watashi wa gakusei desu.",
    slots: [
      { id: "s1", options: ["わたし", "がっこう", "せんせい"], correct: "わたし" },
      { id: "s2", options: ["は", "を", "に"], correct: "は", hint: "Topic marker" },
      { id: "s3", options: ["がくせい", "がっこう", "ともだち"], correct: "がくせい" },
      { id: "s4", options: ["です", "ます", "でした"], correct: "です" },
    ],
  },
  {
    id: "drink-water",
    title: "I drink water",
    english: "I drink water.",
    reading: "Mizu o nomimasu.",
    slots: [
      { id: "s1", options: ["みず", "おちゃ", "ごはん"], correct: "みず" },
      { id: "s2", options: ["を", "は", "で"], correct: "を", hint: "Object marker" },
      { id: "s3", options: ["のみます", "たべます", "いきます"], correct: "のみます" },
    ],
  },
  {
    id: "go-school",
    title: "I go to school",
    english: "I go to school.",
    reading: "Gakkou ni ikimasu.",
    slots: [
      { id: "s1", options: ["がっこう", "いえ", "えき"], correct: "がっこう" },
      { id: "s2", options: ["に", "を", "は"], correct: "に", hint: "Destination" },
      { id: "s3", options: ["いきます", "きます", "かえります"], correct: "いきます" },
    ],
  },
  {
    id: "buy-store",
    title: "I buy at the store",
    english: "I buy it at the store.",
    reading: "Mise de kaimasu.",
    slots: [
      { id: "s1", options: ["みせ", "がっこう", "えき"], correct: "みせ" },
      { id: "s2", options: ["で", "に", "を"], correct: "で", hint: "Place of action" },
      { id: "s3", options: ["かいます", "たべます", "のみます"], correct: "かいます" },
    ],
  },
  {
    id: "where-station",
    title: "Where is the station?",
    english: "Where is the station?",
    reading: "Eki wa doko desu ka.",
    slots: [
      { id: "s1", options: ["えき", "みせ", "トイレ"], correct: "えき" },
      { id: "s2", options: ["は", "を", "に"], correct: "は" },
      { id: "s3", options: ["どこ", "だれ", "なに"], correct: "どこ" },
      { id: "s4", options: ["ですか", "ますか", "でしたか"], correct: "ですか" },
    ],
  },
  {
    id: "this-tea",
    title: "This is tea",
    english: "This is tea.",
    reading: "Kore wa ocha desu.",
    slots: [
      { id: "s1", options: ["これ", "それ", "あれ"], correct: "これ" },
      { id: "s2", options: ["は", "を", "に"], correct: "は" },
      { id: "s3", options: ["おちゃ", "みず", "ごはん"], correct: "おちゃ" },
      { id: "s4", options: ["です", "ます", "でした"], correct: "です" },
    ],
  },
  {
    id: "study-japanese",
    title: "I study Japanese",
    english: "I study Japanese.",
    reading: "Nihongo o benkyou shimasu.",
    slots: [
      { id: "s1", options: ["にほんご", "えいご", "がっこう"], correct: "にほんご" },
      { id: "s2", options: ["を", "は", "で"], correct: "を" },
      { id: "s3", options: ["べんきょうします", "たべます", "いきます"], correct: "べんきょうします" },
    ],
  },
  {
    id: "ramen-please",
    title: "One ramen, please",
    english: "One ramen, please.",
    reading: "Raamen o hitotsu onegaishimasu.",
    slots: [
      { id: "s1", options: ["ラーメン", "みず", "おちゃ"], correct: "ラーメン" },
      { id: "s2", options: ["を", "は", "に"], correct: "を" },
      { id: "s3", options: ["ひとつ", "ふたつ", "みっつ"], correct: "ひとつ" },
      { id: "s4", options: ["おねがいします", "ください", "です"], correct: "おねがいします" },
    ],
  },
];
