import pytest
from fastapi.testclient import TestClient

from app import main


class FakeAudioService:
    def get_many_or_queue(self, texts, _background_tasks):
        return {}


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
