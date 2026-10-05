from types import SimpleNamespace

from fastapi import BackgroundTasks

from app.services.audio import AudioService, audio_cache_key, normalize_audio_text


def test_normalize_audio_text_collapses_whitespace() -> None:
    assert normalize_audio_text(" 昨日は\n店に  行った ") == "昨日は 店に 行った"


def test_audio_cache_key_changes_by_voice_and_model() -> None:
    first = audio_cache_key("こんにちは", "voice-a", "model-a")
    second = audio_cache_key("こんにちは", "voice-b", "model-a")

    assert first != second


def test_audio_cache_key_changes_by_language() -> None:
    english = audio_cache_key("casa", "voice-a", "model-a", "en")
    italian = audio_cache_key("casa", "voice-a", "model-a", "it")

    assert english != italian


class FlakyQuery:
    def __init__(self, client: "FlakyClient", operation: str) -> None:
        self._client = client
        self._operation = operation

    def select(self, *_args):
        return FlakyQuery(self._client, "select")

    def insert(self, row):
        self._client.inserted.append(row)
        return FlakyQuery(self._client, "insert")

    def update(self, _values):
        return FlakyQuery(self._client, "update")

    def in_(self, *_args):
        return self

    def eq(self, *_args):
        return self

    def execute(self):
        if self._operation in self._client.failing:
            self._client.failing.discard(self._operation)
            raise OSError(35, "Resource temporarily unavailable")
        return SimpleNamespace(data=[])


class FlakyClient:
    def __init__(self, failing: set[str]) -> None:
        self.failing = failing
        self.inserted: list[dict] = []

    def table(self, _name):
        return FlakyQuery(self, "table")


def audio_service(client: FlakyClient) -> AudioService:
    settings = SimpleNamespace(
        elevenlabs_api_key="configured",
        elevenlabs_voice_id="voice",
        elevenlabs_model_id="model",
        supabase_url=None,
        supabase_service_role_key=None,
    )
    service = AudioService(settings)
    service._client = client
    return service


def test_failed_pending_insert_is_retried_on_next_request() -> None:
    client = FlakyClient(failing={"insert"})
    service = audio_service(client)
    item = ("hola", "voice", "es")

    first = service.get_many_or_queue_for_configs([item], BackgroundTasks())[item]
    tasks = BackgroundTasks()
    second = service.get_many_or_queue_for_configs([item], tasks)[item]

    assert first.status == "failed"
    assert second.status == "pending"
    assert len(client.inserted) == 2
    assert len(tasks.tasks) == 1


def test_generation_failure_bookkeeping_error_does_not_raise() -> None:
    import asyncio

    client = FlakyClient(failing={"update"})
    service = audio_service(client)

    async def broken_generation(*_args):
        raise RuntimeError("elevenlabs down")

    service._generate_audio_bytes = broken_generation
    asset = service.get_many_or_queue_for_configs([("hola", "voice", "es")])[("hola", "voice", "es")]
    cache_key = audio_cache_key("hola", "voice", "model", "es")

    asyncio.run(service._generate_and_store(asset, cache_key, "voice", "es"))

    assert service._assets[cache_key].status == "failed"
