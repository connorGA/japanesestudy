import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.passive_listening import PASSIVE_LISTENING_CATEGORIES


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    for category in PASSIVE_LISTENING_CATEGORIES:
        for item in category.items:
            english_asset = await service.get_or_generate_config(
                item.english,
                voice_id=settings.elevenlabs_voice_id_2,
                language_code="en",
            )
            print(
                f"{category.id}\t{item.id}\tenglish\t{item.english}\t"
                f"{english_asset.status}\t{english_asset.public_url or english_asset.error_message or ''}"
            )

            japanese_asset = await service.get_or_generate_config(
                item.japanese,
                voice_id=settings.elevenlabs_voice_id,
                language_code="ja",
            )
            print(
                f"{category.id}\t{item.id}\tjapanese\t{item.japanese}\t"
                f"{japanese_asset.status}\t{japanese_asset.public_url or japanese_asset.error_message or ''}"
            )


if __name__ == "__main__":
    asyncio.run(main())
