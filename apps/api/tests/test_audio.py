from app.services.audio import audio_cache_key, normalize_audio_text


def test_normalize_audio_text_collapses_whitespace() -> None:
    assert normalize_audio_text(" 昨日は\n店に  行った ") == "昨日は 店に 行った"


def test_audio_cache_key_changes_by_voice_and_model() -> None:
    first = audio_cache_key("こんにちは", "voice-a", "model-a")
    second = audio_cache_key("こんにちは", "voice-b", "model-a")

    assert first != second
