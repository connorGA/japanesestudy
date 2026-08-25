export type Correction = {
  original: string;
  corrected: string;
  explanation: string;
};

export type GrammarPoint = {
  pattern: string;
  explanation: string;
  examples: string[];
};

export type VocabularyItem = {
  japanese: string;
  reading?: string | null;
  meaning: string;
  part_of_speech?: string | null;
};

export type ReviewCandidate = {
  item_type: "vocabulary" | "grammar" | "sentence" | "listening";
  prompt: string;
  answer: string;
  context?: string | null;
};

export type TutorResponse = {
  session_id: string;
  message_id: string;
  reply_japanese: string;
  reply_english: string;
  corrections: Correction[];
  grammar_points: GrammarPoint[];
  vocabulary: VocabularyItem[];
  review_candidates: ReviewCandidate[];
  audio_asset?: AudioAsset | null;
};

export type AudioAsset = {
  id: string;
  text: string;
  status: "pending" | "ready" | "failed";
  public_url?: string | null;
  error_message?: string | null;
};

export type Flashcard = {
  id: string;
  section: FlashcardSection;
  english: string;
  kana: string;
  romaji: string;
  kind: "vocabulary" | "phrase" | string;
  onyomi?: string | null;
  kunyomi?: string | null;
  example_reading?: string | null;
  example_kana?: string | null;
  example_romaji?: string | null;
  example_english?: string | null;
  word_audio?: AudioAsset | null;
  example_audio?: AudioAsset | null;
};

export type FlashcardSection = "vocabulary" | "hiragana" | "katakana" | "kanji";

export type ListeningLine = {
  speaker: string;
  japanese: string;
  romaji: string;
  english: string;
  audio?: AudioAsset | null;
};

export type ListeningScenario = {
  id: string;
  title: string;
  description: string;
  level: string;
  setting: string;
  lines: ListeningLine[];
};

export type PassiveListeningItem = {
  id: string;
  english: string;
  japanese: string;
  romaji: string;
  english_audio?: AudioAsset | null;
  japanese_audio?: AudioAsset | null;
};

export type PassiveListeningCategory = {
  id: string;
  title: string;
  description: string;
  items: PassiveListeningItem[];
};

export type ItalianListeningAudioItem = {
  id: string;
  audio: AudioAsset;
};

export type ReviewItem = {
  id: string;
  item_type: "vocabulary" | "grammar" | "sentence" | "listening";
  prompt: string;
  answer: string;
  context?: string | null;
  due_at: string;
  review_count: number;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  level: string;
};

export type RoleplayTurn = {
  scenario_id: string;
  ai_japanese: string;
  ai_english_hint: string;
  feedback: string;
  suggested_reply: string;
  audio_asset?: AudioAsset | null;
};
