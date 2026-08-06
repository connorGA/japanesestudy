import pytest

from app.config import Settings
from app.services import realtime_tutor as realtime_module
from app.services.realtime_tutor import RealtimeTutorService


@pytest.mark.asyncio
async def test_realtime_tutor_requires_server_api_key() -> None:
    settings = Settings.model_construct(openai_api_key=None)
    service = RealtimeTutorService(settings)

    with pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
        await service.create_client_secret("anonymous-client")


@pytest.mark.asyncio
async def test_realtime_tutor_mints_scoped_client_secret(monkeypatch) -> None:
    captured: dict = {}

    class FakeResponse:
        is_error = False

        def json(self) -> dict[str, str]:
            return {"value": "ephemeral-token"}

    class FakeClient:
        def __init__(self, timeout: int) -> None:
            captured["timeout"] = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args) -> None:
            return None

        async def post(self, url: str, **kwargs):
            captured["url"] = url
            captured.update(kwargs)
            return FakeResponse()

    monkeypatch.setattr(realtime_module.httpx, "AsyncClient", FakeClient)
    settings = Settings.model_construct(
        openai_api_key="server-secret",
        openai_realtime_model="gpt-realtime-2.1",
        openai_realtime_voice="marin",
        openai_realtime_transcription_model="gpt-4o-mini-transcribe",
    )

    token = await RealtimeTutorService(settings).create_client_secret("anonymous-client")

    assert token == {"value": "ephemeral-token"}
    assert captured["url"].endswith("/v1/realtime/client_secrets")
    assert captured["headers"]["Authorization"] == "Bearer server-secret"
    assert captured["headers"]["OpenAI-Safety-Identifier"] != "anonymous-client"
    session = captured["json"]["session"]
    assert session["model"] == "gpt-realtime-2.1"
    assert session["audio"]["input"]["turn_detection"]["type"] == "semantic_vad"
    assert session["audio"]["output"]["voice"] == "marin"
