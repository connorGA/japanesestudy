export type LearningPathStep = {
  id: string;
  day: number;
  title: string;
  description: string;
  href: string;
  milestone: string;
};

export const LEARNING_PATH_STEPS: LearningPathStep[] = [
  {
    id: "hiragana-vowels",
    day: 1,
    title: "Hiragana vowels + K-row",
    description: "Learn あいうえお and かきくけこ in Flashcard Dojo.",
    href: "/hiragana",
    milestone: "10 characters",
  },
  {
    id: "top-phrases",
    day: 2,
    title: "Top 10 greetings & thanks",
    description: "Practice hello, thank you, and excuse me in phrase packs.",
    href: "/phrases",
    milestone: "2 phrase packs",
  },
  {
    id: "numbers-basics",
    day: 3,
    title: "Numbers 1–10",
    description: "Count, tell time, and use basic counters.",
    href: "/numbers",
    milestone: "12 number items",
  },
  {
    id: "grammar-desu",
    day: 4,
    title: "First grammar: X は Y です",
    description: "Make your first full sentences with the topic marker.",
    href: "/grammar",
    milestone: "2 lessons",
  },
  {
    id: "sentence-builder",
    day: 5,
    title: "Build your first sentences",
    description: "Drag particles into place and check your work.",
    href: "/sentences",
    milestone: "3 sentences",
  },
  {
    id: "roleplay-food",
    day: 6,
    title: "Order food in roleplay",
    description: "Use survival phrases in the ramen shop scenario.",
    href: "/roleplay?scenario=ramen-shop",
    milestone: "1 conversation",
  },
  {
    id: "katakana-basics",
    day: 7,
    title: "Katakana vowels + loanwords",
    description: "Read コーヒー, パン, and other katakana words.",
    href: "/katakana",
    milestone: "10 characters",
  },
  {
    id: "stroke-order",
    day: 8,
    title: "Stroke order practice",
    description: "Learn how to write the vowels correctly.",
    href: "/hiragana?tab=stroke",
    milestone: "5 characters",
  },
  {
    id: "listening",
    day: 9,
    title: "Listening drill",
    description: "Follow a short dialogue with audio.",
    href: "/listening",
    milestone: "1 scenario",
  },
  {
    id: "reviews",
    day: 10,
    title: "Review everything",
    description: "Run through your spaced repetition queue.",
    href: "/reviews",
    milestone: "5 reviews",
  },
];
