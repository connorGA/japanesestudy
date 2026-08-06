import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.kana import KATAKANA


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    for item in KATAKANA:
        audio_text = item.audio_text or item.character
        asset = await service.get_or_generate(audio_text)
        detail = asset.public_url or asset.error_message or ""
        print(
            f"{item.character}\t{item.reading}\t{audio_text}\t"
            f"{asset.status}\t{detail}"
        )


if __name__ == "__main__":
    asyncio.run(main())
