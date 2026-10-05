import pytest
from fastapi.testclient import TestClient
from types import SimpleNamespace

from app import main


class FakeAudioService:
    def get_many_or_queue(self, texts, _background_tasks):
        return {}

    def get_many_or_queue_for_configs(self, items, _background_tasks):
        return {
            item: main.AudioAsset(
                id=f"00000000-0000-0000-0000-{index:012d}",
                text=item[0],
                status="ready",
                public_url=f"https://audio.test/{index}.mp3",
            )
            for index, item in enumerate(items, start=1)
        }


@pytest.mark.parametrize(
    ("section", "expected_count"),
    [
        ("vocabulary", 128),
        ("hiragana", 105),
        ("katakana", 106),
        ("kanji", 100),
    ],
)
def test_flashcard_endpoint_filters_each_deck(
    monkeypatch,
    section: str,
    expected_count: int,
) -> None:
    monkeypatch.setattr(main, "audio", FakeAudioService())
    response = TestClient(main.app).get(f"/api/flashcards?section={section}")

    assert response.status_code == 200
    cards = response.json()
    assert len(cards) == expected_count
    assert {card["section"] for card in cards} == {section}
    assert len({card["id"] for card in cards}) == expected_count


def test_flashcard_endpoint_rejects_unknown_section(monkeypatch) -> None:
    monkeypatch.setattr(main, "audio", FakeAudioService())
    response = TestClient(main.app).get("/api/flashcards?section=unknown")

    assert response.status_code == 422


def test_realtime_session_endpoint_returns_safe_error(monkeypatch) -> None:
    class FailingRealtimeTutor:
        async def create_client_secret(self, _client_id: str):
            raise RuntimeError("OPENAI_API_KEY is not configured.")

    monkeypatch.setattr(main, "realtime_tutor", FailingRealtimeTutor())
    response = TestClient(main.app).post(
        "/api/tutor/realtime/session",
        json={"client_id": "test-client-1234"},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "OPENAI_API_KEY is not configured."


def test_italian_listening_audio_uses_dedicated_voices(monkeypatch) -> None:
    monkeypatch.setattr(main, "audio", FakeAudioService())
    monkeypatch.setattr(
        main,
        "get_settings",
        lambda: SimpleNamespace(
            elevenlabs_api_key="configured",
            passive_listening_english_voice_id="english-voice",
            passive_listening_italian_voice_id="italian-voice",
        ),
    )

    response = TestClient(main.app).post(
        "/api/italian/listening/audio",
        json={
            "items": [
                {"id": "hello-en", "text": "hello", "language": "en"},
                {"id": "hello-it", "text": "buongiorno", "language": "it"},
            ]
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == ["hello-en", "hello-it"]
    assert [item["audio"]["text"] for item in response.json()] == ["hello", "buongiorno"]


def test_italian_listening_audio_requires_native_voice(monkeypatch) -> None:
    monkeypatch.setattr(
        main,
        "get_settings",
        lambda: SimpleNamespace(
            elevenlabs_api_key="configured",
            passive_listening_english_voice_id="english-voice",
            passive_listening_italian_voice_id=None,
        ),
    )

    response = TestClient(main.app).post(
        "/api/italian/listening/audio",
        json={"items": [{"id": "hello-it", "text": "buongiorno", "language": "it"}]},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "ELEVENLABS_ITALIAN_VOICE_ID is not configured."


class RecordingAudioService(FakeAudioService):
    def __init__(self) -> None:
        self.items = []

    def get_many_or_queue_for_configs(self, items, background_tasks):
        self.items = items
        return super().get_many_or_queue_for_configs(items, background_tasks)


def spanish_settings(**overrides):
    values = {
        "elevenlabs_api_key": "configured",
        "passive_listening_english_voice_id": "english-voice",
        "spanish_voice_id": "spanish-voice",
        "spanish_secondary_voice_id": "spanish-voice-2",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_spanish_audio_routes_each_voice(monkeypatch) -> None:
    fake_audio = RecordingAudioService()
    monkeypatch.setattr(main, "audio", fake_audio)
    monkeypatch.setattr(main, "get_settings", spanish_settings)

    response = TestClient(main.app).post(
        "/api/spanish/audio",
        json={
            "items": [
                {"id": "hello-en", "text": "hello", "language": "en"},
                {"id": "hello-es", "text": "hola", "language": "es"},
                {"id": "reply-es", "text": "¿Qué onda?", "language": "es", "voice": "secondary"},
            ]
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == ["hello-en", "hello-es", "reply-es"]
    assert fake_audio.items == [
        ("hello", "english-voice", "en"),
        ("hola", "spanish-voice", "es"),
        ("¿Qué onda?", "spanish-voice-2", "es"),
    ]


def test_spanish_audio_requires_native_voice(monkeypatch) -> None:
    monkeypatch.setattr(main, "get_settings", lambda: spanish_settings(spanish_voice_id=None))

    response = TestClient(main.app).post(
        "/api/spanish/audio",
        json={"items": [{"id": "hola", "text": "hola", "language": "es"}]},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "ELEVENLABS_SPANISH_VOICE_ID is not configured."


def test_spanish_audio_rejects_unsupported_language(monkeypatch) -> None:
    monkeypatch.setattr(main, "get_settings", spanish_settings)

    response = TestClient(main.app).post(
        "/api/spanish/audio",
        json={"items": [{"id": "ciao", "text": "ciao", "language": "it"}]},
    )

    assert response.status_code == 422


def test_realtime_session_passes_spanish_language(monkeypatch) -> None:
    class RecordingRealtimeTutor:
        language = None

        async def create_client_secret(self, _client_id: str, language: str = "japanese"):
            RecordingRealtimeTutor.language = language
            return {"value": "token"}

    monkeypatch.setattr(main, "realtime_tutor", RecordingRealtimeTutor())
    response = TestClient(main.app).post(
        "/api/tutor/realtime/session",
        json={"client_id": "test-client-1234", "language": "spanish"},
    )

    assert response.status_code == 200
    assert RecordingRealtimeTutor.language == "spanish"
