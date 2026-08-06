import argparse
import asyncio

from app.config import get_settings
from app.services.audio import AudioService
from app.services.passive_listening import PASSIVE_LISTENING_CATEGORIES


async def main(force: bool) -> None:
    settings = get_settings()
    service = AudioService(settings)

    english_voice_id = settings.passive_listening_english_voice_id
    japanese_voice_id = settings.passive_listening_japanese_voice_id

    if not settings.elevenlabs_api_key:
        raise SystemExit("Set ELEVENLABS_API_KEY before generating audio.")
    if not japanese_voice_id:
        raise SystemExit("Set ELEVENLABS_VOICE_ID to a native Japanese voice.")
    if not english_voice_id:
        raise SystemExit(
            "Set ELEVENLABS_ENGLISH_VOICE_ID (or ELEVENLABS_VOICE_ID_2) to a native English voice."
        )
    if english_voice_id == japanese_voice_id:
        raise SystemExit(
            "English and Japanese voices must be different. "
            "Set ELEVENLABS_ENGLISH_VOICE_ID to a native English voice."
        )

    mode = "force-regenerating" if force else "generating"
    print(
        f"{mode} passive listening audio "
        f"(english voice ending …{english_voice_id[-4:]}, "
        f"japanese voice ending …{japanese_voice_id[-4:]})"
    )

    for category in PASSIVE_LISTENING_CATEGORIES:
        for item in category.items:
            english_asset = await service.get_or_generate_config(
                item.english,
                voice_id=english_voice_id,
                language_code="en",
                force=force,
            )
            print(
                f"{category.id}\t{item.id}\tenglish\t{item.english}\t"
                f"{english_asset.status}\t{english_asset.public_url or english_asset.error_message or ''}"
            )

            japanese_asset = await service.get_or_generate_config(
                item.japanese,
                voice_id=japanese_voice_id,
                language_code="ja",
                force=force,
            )
            print(
                f"{category.id}\t{item.id}\tjapanese\t{item.japanese}\t"
                f"{japanese_asset.status}\t{japanese_asset.public_url or japanese_asset.error_message or ''}"
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate passive listening audio assets.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate audio even when cached assets already exist.",
    )
    args = parser.parse_args()
    asyncio.run(main(force=args.force))
