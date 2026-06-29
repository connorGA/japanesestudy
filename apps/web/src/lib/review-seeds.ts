import type { ReviewCandidate } from "@/types/study";

export const BEGINNER_REVIEW_SEEDS: ReviewCandidate[] = [
  { item_type: "vocabulary", prompt: "hello", answer: "こんにちは" },
  { item_type: "vocabulary", prompt: "thank you", answer: "ありがとうございます" },
  { item_type: "vocabulary", prompt: "excuse me", answer: "すみません" },
  { item_type: "vocabulary", prompt: "water", answer: "みず" },
  { item_type: "vocabulary", prompt: "student", answer: "がくせい" },
  { item_type: "grammar", prompt: "I am a student.", answer: "わたしはがくせいです。" },
  { item_type: "grammar", prompt: "Where is the station?", answer: "えきはどこですか。" },
  { item_type: "sentence", prompt: "I drink water.", answer: "みずをのみます。" },
  { item_type: "sentence", prompt: "This is tea.", answer: "これはおちゃです。" },
  { item_type: "listening", prompt: "One ramen, please.", answer: "ラーメンをひとつおねがいします。" },
];
