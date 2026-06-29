import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.flashcards import BASIC_FLASHCARDS


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    for card in BASIC_FLASHCARDS:
        word_asset = await service.get_or_generate(card.kana)
        word_detail = word_asset.public_url or word_asset.error_message or ""
        print(f"{card.id}\tword\t{card.kana}\t{word_asset.status}\t{word_detail}")

        if card.example_kana:
            example_asset = await service.get_or_generate(card.example_kana)
            print(
                f"{card.id}\texample\t{card.example_kana}\t{example_asset.status}\t"
                f"{example_asset.public_url or example_asset.error_message or ''}"
            )


if __name__ == "__main__":
    asyncio.run(main())
