import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.kana import KATAKANA_PRONUNCIATIONS


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    for character, reading in KATAKANA_PRONUNCIATIONS:
        asset = await service.get_or_generate(character)
        detail = asset.public_url or asset.error_message or ""
        print(f"{character}\t{reading}\t{asset.status}\t{detail}")


if __name__ == "__main__":
    asyncio.run(main())
