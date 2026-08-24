from datetime import date, datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


ReviewType = Literal["vocabulary", "grammar", "sentence", "listening"]
ReviewRating = Literal["again", "hard", "good", "easy"]
AudioStatus = Literal["pending", "ready", "failed"]
FlashcardSection = Literal["vocabulary", "hiragana", "katakana", "kanji"]
TutorLanguage = Literal["japanese", "italian"]
StudyLanguage = Literal["japanese", "italian"]
StudyActivityType = Literal[
    "flashcard_retry",
    "flashcard_mastered",
    "pronunciation_play",
    "verb_form_practice",
    "listening_line_complete",
    "passive_listening_item",
    "arcade_correct",
    "srs_review",
    "tutor_turn",
    "roleplay_turn",
]


class Correction(BaseModel):
    original: str
    corrected: str
    explanation: str


class GrammarPoint(BaseModel):
    pattern: str
    explanation: str
    examples: list[str] = Field(default_factory=list)


class VocabularyItem(BaseModel):
    japanese: str
    reading: Optional[str] = None
    meaning: str
    part_of_speech: Optional[str] = None


class ReviewCandidate(BaseModel):
    item_type: ReviewType
    prompt: str
    answer: str
    context: Optional[str] = None


class TutorRequest(BaseModel):
    text: str
    session_id: Optional[str] = None
    level: str = "N5-N4"


class RealtimeTutorSessionRequest(BaseModel):
    client_id: str = Field(min_length=8, max_length=128)
    language: TutorLanguage = "japanese"


class TutorPayload(BaseModel):
    reply_japanese: str
    reply_english: str
    corrections: list[Correction] = Field(default_factory=list)
    grammar_points: list[GrammarPoint] = Field(default_factory=list)
    vocabulary: list[VocabularyItem] = Field(default_factory=list)
    review_candidates: list[ReviewCandidate] = Field(default_factory=list)


class AudioAsset(BaseModel):
    id: str
    text: str
    status: AudioStatus
    public_url: Optional[str] = None
    error_message: Optional[str] = None


class Flashcard(BaseModel):
    id: str
    section: FlashcardSection = "vocabulary"
    english: str
    kana: str
    romaji: str
    kind: str
    onyomi: Optional[str] = None
    kunyomi: Optional[str] = None
    example_reading: Optional[str] = None
    example_kana: Optional[str] = None
    example_romaji: Optional[str] = None
    example_english: Optional[str] = None
    word_audio: Optional[AudioAsset] = None
    example_audio: Optional[AudioAsset] = None


class ListeningLine(BaseModel):
    speaker: str
    japanese: str
    romaji: str
    english: str
    audio: Optional[AudioAsset] = None


class ListeningScenario(BaseModel):
    id: str
    title: str
    description: str
    level: str
    setting: str
    lines: list[ListeningLine]


class PassiveListeningItem(BaseModel):
    id: str
    english: str
    japanese: str
    romaji: str
    english_audio: Optional[AudioAsset] = None
    japanese_audio: Optional[AudioAsset] = None


class PassiveListeningCategory(BaseModel):
    id: str
    title: str
    description: str
    items: list[PassiveListeningItem]


class TutorResponse(TutorPayload):
    session_id: str
    message_id: str
    audio_asset: Optional[AudioAsset] = None


class ReviewCreateRequest(BaseModel):
    candidates: list[ReviewCandidate]


class ReviewItem(BaseModel):
    id: str
    item_type: ReviewType
    prompt: str
    answer: str
    context: Optional[str] = None
    due_at: datetime
    review_count: int = 0
    ease_factor: float = 2.5
    interval_days: int = 0
    lapses: int = 0


class ReviewGradeRequest(BaseModel):
    rating: ReviewRating


class AudioRequest(BaseModel):
    text: str


class Scenario(BaseModel):
    id: str
    title: str
    description: str
    level: str


class RoleplayRequest(BaseModel):
    scenario_id: str
    user_text: str
    level: str = "N5-N4"


class RoleplayTurn(BaseModel):
    scenario_id: str
    ai_japanese: str
    ai_english_hint: str
    feedback: str
    suggested_reply: str
    audio_asset: Optional[AudioAsset] = None


class ProgressEventCreate(BaseModel):
    id: UUID
    learner_id: UUID
    language: StudyLanguage
    feature: str = Field(min_length=1, max_length=80)
    activity_type: StudyActivityType
    activity_date: date
    metadata: dict = Field(default_factory=dict)


class ProgressEventResult(BaseModel):
    id: UUID
    language: StudyLanguage
    activity_type: StudyActivityType
    points_awarded: int
    daily_points: int
    duplicate: bool = False


class DailyProgress(BaseModel):
    language: StudyLanguage
    date: date
    points: int


class ProgressSummary(BaseModel):
    learner_id: UUID
    records: list[DailyProgress] = Field(default_factory=list)


class ProgressImportItem(BaseModel):
    language: StudyLanguage
    date: date
    points: int = Field(ge=0, le=250)


class ProgressImportRequest(BaseModel):
    learner_id: UUID
    records: list[ProgressImportItem] = Field(default_factory=list, max_length=800)
