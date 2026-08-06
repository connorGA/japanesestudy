import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.kanji import COMMON_KANJI


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    for card in COMMON_KANJI:
        asset = await service.get_or_generate(card.example_reading)
        detail = asset.public_url or asset.error_message or ""
        print(
            f"{card.id}\texample\t{card.example}\t{card.example_reading}\t"
            f"{asset.status}\t{detail}"
        )


if __name__ == "__main__":
    asyncio.run(main())
