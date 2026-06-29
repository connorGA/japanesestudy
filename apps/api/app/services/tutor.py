import json

from openai import AsyncOpenAI

from app.config import Settings
from app.models import (
    Correction,
    GrammarPoint,
    ReviewCandidate,
    TutorPayload,
    VocabularyItem,
)


class TutorService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def explain(self, text: str, level: str) -> TutorPayload:
        if not self._client:
            return fallback_tutor_payload(text)

        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a Japanese tutor. Return compact JSON with keys: "
                        "reply_japanese, reply_english, corrections, grammar_points, "
                        "vocabulary, review_candidates. Keep explanations clear for "
                        f"a {level} learner."
                    ),
                },
                {"role": "user", "content": text},
            ],
        )

        content = response.choices[0].message.content or "{}"
        return TutorPayload.model_validate(json.loads(content))


def fallback_tutor_payload(text: str) -> TutorPayload:
    return TutorPayload(
        reply_japanese="いいですね。この文は自然ですが、文脈によって少し詳しくできます。",
        reply_english=(
            "Nice. This sentence is understandable, and we can use it to review tense, "
            "particles, and natural context."
        ),
        corrections=[
            Correction(
                original=text,
                corrected=text,
                explanation="The sentence is grammatical. Add context if you want to clarify which shop.",
            )
        ],
        grammar_points=[
            GrammarPoint(
                pattern="に行く",
                explanation="Use に before a destination with 行く to mean going to that place.",
                examples=["店に行きます。", "学校に行きました。"],
            ),
            GrammarPoint(
                pattern="た-form",
                explanation="行った is the casual past form of 行く.",
                examples=["昨日、店に行った。", "昨日、映画を見た。"],
            ),
        ],
        vocabulary=[
            VocabularyItem(japanese="昨日", reading="きのう", meaning="yesterday"),
            VocabularyItem(japanese="店", reading="みせ", meaning="shop; store"),
            VocabularyItem(japanese="行った", reading="いった", meaning="went"),
        ],
        review_candidates=[
            ReviewCandidate(
                item_type="sentence",
                prompt="昨日は店に行った",
                answer="Yesterday, I went to the store.",
                context="Casual past-tense sentence using に as destination marker.",
            ),
            ReviewCandidate(
                item_type="grammar",
                prompt="What does に mark in 店に行った?",
                answer="It marks 店 as the destination of 行った.",
                context="Destination particle with movement verbs.",
            ),
        ],
    )
