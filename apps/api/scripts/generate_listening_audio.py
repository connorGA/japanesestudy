import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.listening import LISTENING_SCENARIOS


async def main() -> None:
    settings = get_settings()
    service = AudioService(settings)

    if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID before generating audio."
        )

    seen: set[str] = set()
    for scenario in LISTENING_SCENARIOS:
        speakers = list(dict.fromkeys(line.speaker for line in scenario.lines))
        voice_by_speaker = {
            speaker: (
                settings.elevenlabs_voice_id_2
                if index % 2 == 1 and settings.elevenlabs_voice_id_2
                else settings.elevenlabs_voice_id
            )
            for index, speaker in enumerate(speakers)
        }

        for line in scenario.lines:
            voice_id = voice_by_speaker.get(line.speaker)
            audio_key = f"{line.japanese}|{voice_id}"
            if audio_key in seen:
                continue

            seen.add(audio_key)
            asset = await service.get_or_generate(line.japanese, voice_id=voice_id)
            detail = asset.public_url or asset.error_message or ""
            print(f"{scenario.id}\t{line.speaker}\t{line.japanese}\t{asset.status}\t{detail}")


if __name__ == "__main__":
    asyncio.run(main())
