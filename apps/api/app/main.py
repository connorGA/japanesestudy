from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import (
    AudioAsset,
    AudioRequest,
    Flashcard,
    ListeningLine,
    ListeningScenario,
    PassiveListeningCategory,
    PassiveListeningItem,
    ReviewCreateRequest,
    ReviewGradeRequest,
    ReviewItem,
    RoleplayRequest,
    RoleplayTurn,
    Scenario,
    TutorRequest,
    TutorResponse,
)
from app.services.audio import AudioService
from app.services.flashcards import BASIC_FLASHCARDS
from app.services.kana import HIRAGANA_CHARACTERS, KATAKANA_CHARACTERS
from app.services.listening import LISTENING_SCENARIOS
from app.services.passive_listening import PASSIVE_LISTENING_CATEGORIES
from app.services.repository import StudyRepository
from app.services.roleplay import SCENARIOS, RoleplayService
from app.services.srs import schedule_review
from app.services.tutor import TutorService

settings = get_settings()
app = FastAPI(title="Japanese Study API", version="0.1.0")
repo = StudyRepository(settings)
audio = AudioService(settings)
tutor = TutorService(settings)
roleplay = RoleplayService(settings)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/tutor/chat")
async def tutor_chat(request: TutorRequest, background_tasks: BackgroundTasks) -> TutorResponse:
    session_id = repo.create_session_if_needed(request.session_id)
    payload = await tutor.explain(request.text, request.level)
    audio_asset = audio.get_or_queue(payload.reply_japanese, background_tasks)
    message_id = repo.save_tutor_exchange(
        session_id=session_id,
        user_text=request.text,
        payload=payload,
        audio_asset_id=audio_asset.id,
    )
    return TutorResponse(
        **payload.model_dump(),
        session_id=session_id,
        message_id=message_id,
        audio_asset=audio_asset,
    )


@app.post("/api/audio")
def create_audio(request: AudioRequest, background_tasks: BackgroundTasks) -> AudioAsset:
    return audio.get_or_queue(request.text, background_tasks)


@app.get("/api/audio/hiragana")
def hiragana_audio(background_tasks: BackgroundTasks) -> list[AudioAsset]:
    return [audio.get_or_queue(character, background_tasks) for character in HIRAGANA_CHARACTERS]


@app.get("/api/audio/katakana")
def katakana_audio(background_tasks: BackgroundTasks) -> list[AudioAsset]:
    return [audio.get_or_queue(character, background_tasks) for character in KATAKANA_CHARACTERS]


@app.get("/api/flashcards")
def flashcards(background_tasks: BackgroundTasks) -> list[Flashcard]:
    audio_texts = [
        text
        for seed in BASIC_FLASHCARDS
        for text in (seed.kana, seed.example_kana)
        if text
    ]
    audio_assets = audio.get_many_or_queue(audio_texts, background_tasks)

    cards: list[Flashcard] = []
    for seed in BASIC_FLASHCARDS:
        cards.append(
            Flashcard(
                **seed.model_dump(),
                word_audio=audio_assets.get(seed.kana),
                example_audio=audio_assets.get(seed.example_kana) if seed.example_kana else None,
            )
        )
    return cards


@app.get("/api/listening/scenarios")
def listening_scenarios(background_tasks: BackgroundTasks) -> list[ListeningScenario]:
    scenarios: list[ListeningScenario] = []
    for scenario in LISTENING_SCENARIOS:
        speakers = list(dict.fromkeys(line.speaker for line in scenario.lines))
        voice_by_speaker = {
            speaker: (
                settings.elevenlabs_voice_id_2
                if index % 2 == 1 and settings.elevenlabs_voice_id_2
                else settings.elevenlabs_voice_id
            )
            for index, speaker in enumerate(speakers)
        }
        audio_items = [
            (line.japanese, voice_by_speaker.get(line.speaker))
            for line in scenario.lines
        ]
        audio_assets = audio.get_many_or_queue_for_voices(audio_items, background_tasks)

        scenarios.append(ListeningScenario(
            id=scenario.id,
            title=scenario.title,
            description=scenario.description,
            level=scenario.level,
            setting=scenario.setting,
            lines=[
                ListeningLine(
                    speaker=line.speaker,
                    japanese=line.japanese,
                    romaji=line.romaji,
                    english=line.english,
                    audio=audio_assets.get((line.japanese, voice_by_speaker.get(line.speaker))),
                )
                for line in scenario.lines
            ],
        ))
    return scenarios


@app.get("/api/passive-listening/categories")
def passive_listening_categories(
    background_tasks: BackgroundTasks,
) -> list[PassiveListeningCategory]:
    audio_items = [
        (text, voice_id, language_code)
        for category in PASSIVE_LISTENING_CATEGORIES
        for item in category.items
        for text, voice_id, language_code in (
            (item.english, settings.elevenlabs_voice_id_2, "en"),
            (item.japanese, settings.elevenlabs_voice_id, "ja"),
        )
    ]
    audio_assets = audio.get_many_or_queue_for_configs(audio_items, background_tasks)

    return [
        PassiveListeningCategory(
            id=category.id,
            title=category.title,
            description=category.description,
            items=[
                PassiveListeningItem(
                    id=item.id,
                    english=item.english,
                    japanese=item.japanese,
                    romaji=item.romaji,
                    english_audio=audio_assets.get((item.english, settings.elevenlabs_voice_id_2, "en")),
                    japanese_audio=audio_assets.get((item.japanese, settings.elevenlabs_voice_id, "ja")),
                )
                for item in category.items
            ],
        )
        for category in PASSIVE_LISTENING_CATEGORIES
    ]


@app.post("/api/reviews/from-candidates")
def create_reviews(request: ReviewCreateRequest) -> list[ReviewItem]:
    return repo.create_review_items(request.candidates)


@app.get("/api/reviews/due")
def due_reviews() -> list[ReviewItem]:
    return repo.due_reviews()


@app.post("/api/reviews/{review_item_id}/grade")
def grade_review(review_item_id: str, request: ReviewGradeRequest) -> ReviewItem:
    item = repo.get_review_item(review_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    return repo.update_review_item(schedule_review(item, request.rating))


@app.get("/api/roleplay/scenarios")
def scenarios() -> list[Scenario]:
    return SCENARIOS


@app.post("/api/roleplay/turn")
async def roleplay_turn(request: RoleplayRequest, background_tasks: BackgroundTasks) -> RoleplayTurn:
    turn = await roleplay.next_turn(request.scenario_id, request.user_text, request.level)
    turn.audio_asset = audio.get_or_queue(turn.ai_japanese, background_tasks)
    return turn
