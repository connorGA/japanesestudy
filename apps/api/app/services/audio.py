import hashlib
import re
from typing import Optional
from uuid import uuid4

import httpx
from fastapi import BackgroundTasks
from supabase import Client, create_client

from app.config import Settings
from app.models import AudioAsset


def normalize_audio_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def audio_cache_key(
    text: str,
    voice_id: Optional[str],
    model_id: str,
    language_code: str = "ja",
) -> str:
    normalized = normalize_audio_text(text)
    return hashlib.sha256(
        f"{normalized}|{voice_id or 'default'}|{model_id}|{language_code}".encode()
    ).hexdigest()


class AudioService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._assets: dict[str, AudioAsset] = {}
        self._client: Optional[Client] = None
        if settings.supabase_url and settings.supabase_service_role_key:
            self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    def get_or_queue(
        self,
        text: str,
        background_tasks: Optional[BackgroundTasks] = None,
        voice_id: Optional[str] = None,
    ) -> AudioAsset:
        normalized = normalize_audio_text(text)
        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        cache_key = audio_cache_key(
            normalized,
            selected_voice_id,
            self._settings.elevenlabs_model_id,
            self._settings.elevenlabs_language_code,
        )

        existing = self._find_asset(cache_key)
        if existing:
            return existing

        asset = AudioAsset(id=str(uuid4()), text=normalized, status="pending")
        self._assets[cache_key] = asset
        self._insert_pending(asset, cache_key, selected_voice_id)

        if (
            background_tasks
            and self._settings.elevenlabs_api_key
            and selected_voice_id
        ):
            background_tasks.add_task(self._generate_and_store, asset, cache_key, selected_voice_id)
        elif not self._settings.elevenlabs_api_key or not selected_voice_id:
            asset.status = "failed"
            self._assets[cache_key] = asset
            self._mark_failed(asset.id)

        return asset

    def get_many_or_queue(
        self,
        texts: list[str],
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> dict[str, AudioAsset]:
        normalized_texts = list(dict.fromkeys(normalize_audio_text(text) for text in texts if text))
        cache_keys = {
            text: audio_cache_key(
                text,
                self._settings.elevenlabs_voice_id,
                self._settings.elevenlabs_model_id,
                self._settings.elevenlabs_language_code,
            )
            for text in normalized_texts
        }

        assets_by_hash: dict[str, AudioAsset] = {}
        if self._client and cache_keys:
            try:
                response = (
                    self._client.table("audio_assets")
                    .select("content_hash,id,text,status,public_url,error_message")
                    .in_("content_hash", list(cache_keys.values()))
                    .execute()
                )
                if response and response.data:
                    assets_by_hash = {
                        row["content_hash"]: AudioAsset.model_validate(row)
                        for row in response.data
                    }
            except Exception as err:
                return {
                    text: AudioAsset(
                        id=str(uuid4()),
                        text=text,
                        status="failed",
                        error_message=f"Could not load cached audio: {err}",
                    )
                    for text in normalized_texts
                }

        assets: dict[str, AudioAsset] = {}
        for text, cache_key in cache_keys.items():
            existing = assets_by_hash.get(cache_key) or self._assets.get(cache_key)
            if existing:
                assets[text] = existing
                continue

            assets[text] = self.get_or_queue(text, background_tasks)

        return assets

    def get_many_or_queue_for_voices(
        self,
        items: list[tuple[str, Optional[str]]],
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> dict[tuple[str, Optional[str]], AudioAsset]:
        normalized_items = list(
            dict.fromkeys((normalize_audio_text(text), voice_id) for text, voice_id in items if text)
        )
        cache_keys = {
            (text, voice_id): audio_cache_key(
                text,
                voice_id or self._settings.elevenlabs_voice_id,
                self._settings.elevenlabs_model_id,
                self._settings.elevenlabs_language_code,
            )
            for text, voice_id in normalized_items
        }

        assets_by_hash: dict[str, AudioAsset] = {}
        if self._client and cache_keys:
            try:
                response = (
                    self._client.table("audio_assets")
                    .select("content_hash,id,text,status,public_url,error_message")
                    .in_("content_hash", list(cache_keys.values()))
                    .execute()
                )
                if response and response.data:
                    assets_by_hash = {
                        row["content_hash"]: AudioAsset.model_validate(row)
                        for row in response.data
                    }
            except Exception as err:
                return {
                    item: AudioAsset(
                        id=str(uuid4()),
                        text=item[0],
                        status="failed",
                        error_message=f"Could not load cached audio: {err}",
                    )
                    for item in normalized_items
                }

        assets: dict[tuple[str, Optional[str]], AudioAsset] = {}
        for item, cache_key in cache_keys.items():
            existing = assets_by_hash.get(cache_key) or self._assets.get(cache_key)
            if existing:
                assets[item] = existing
                continue

            text, voice_id = item
            assets[item] = self.get_or_queue(text, background_tasks, voice_id=voice_id)

        return assets

    def get_or_queue_config(
        self,
        text: str,
        background_tasks: Optional[BackgroundTasks] = None,
        voice_id: Optional[str] = None,
        language_code: Optional[str] = None,
    ) -> AudioAsset:
        normalized = normalize_audio_text(text)
        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        selected_language_code = language_code or self._settings.elevenlabs_language_code
        cache_key = audio_cache_key(
            normalized,
            selected_voice_id,
            self._settings.elevenlabs_model_id,
            selected_language_code,
        )

        existing = self._find_asset(cache_key)
        if existing:
            return existing

        asset = AudioAsset(id=str(uuid4()), text=normalized, status="pending")
        self._assets[cache_key] = asset
        self._insert_pending(asset, cache_key, selected_voice_id)

        if background_tasks and self._settings.elevenlabs_api_key and selected_voice_id:
            background_tasks.add_task(
                self._generate_and_store,
                asset,
                cache_key,
                selected_voice_id,
                selected_language_code,
            )
        elif not self._settings.elevenlabs_api_key or not selected_voice_id:
            asset.status = "failed"
            self._assets[cache_key] = asset
            self._mark_failed(asset.id)

        return asset

    def get_many_or_queue_for_configs(
        self,
        items: list[tuple[str, Optional[str], str]],
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> dict[tuple[str, Optional[str], str], AudioAsset]:
        normalized_items = list(
            dict.fromkeys(
                (normalize_audio_text(text), voice_id, language_code)
                for text, voice_id, language_code in items
                if text
            )
        )
        cache_keys = {
            item: audio_cache_key(
                item[0],
                item[1] or self._settings.elevenlabs_voice_id,
                self._settings.elevenlabs_model_id,
                item[2],
            )
            for item in normalized_items
        }

        assets_by_hash: dict[str, AudioAsset] = {}
        if self._client and cache_keys:
            try:
                response = (
                    self._client.table("audio_assets")
                    .select("content_hash,id,text,status,public_url,error_message")
                    .in_("content_hash", list(cache_keys.values()))
                    .execute()
                )
                if response and response.data:
                    assets_by_hash = {
                        row["content_hash"]: AudioAsset.model_validate(row)
                        for row in response.data
                    }
            except Exception as err:
                return {
                    item: AudioAsset(
                        id=str(uuid4()),
                        text=item[0],
                        status="failed",
                        error_message=f"Could not load cached audio: {err}",
                    )
                    for item in normalized_items
                }

        assets: dict[tuple[str, Optional[str], str], AudioAsset] = {}
        for item, cache_key in cache_keys.items():
            existing = assets_by_hash.get(cache_key) or self._assets.get(cache_key)
            if existing:
                assets[item] = existing
                continue

            text, voice_id, language_code = item
            assets[item] = self.get_or_queue_config(
                text,
                background_tasks,
                voice_id=voice_id,
                language_code=language_code,
            )

        return assets

    async def get_or_generate(self, text: str, voice_id: Optional[str] = None) -> AudioAsset:
        normalized = normalize_audio_text(text)
        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        cache_key = audio_cache_key(
            normalized,
            selected_voice_id,
            self._settings.elevenlabs_model_id,
            self._settings.elevenlabs_language_code,
        )

        existing = self._find_asset(cache_key)
        if existing and existing.status == "ready" and existing.public_url:
            return existing

        if not self._settings.elevenlabs_api_key or not selected_voice_id:
            failed = existing or AudioAsset(id=str(uuid4()), text=normalized, status="failed")
            self._assets[cache_key] = failed
            return failed

        asset = existing or AudioAsset(id=str(uuid4()), text=normalized, status="pending")
        self._assets[cache_key] = asset
        if not existing:
            self._insert_pending(asset, cache_key, selected_voice_id)

        await self._generate_and_store(asset, cache_key, selected_voice_id)
        return self._find_asset(cache_key) or self._assets[cache_key]

    async def get_or_generate_config(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language_code: Optional[str] = None,
    ) -> AudioAsset:
        normalized = normalize_audio_text(text)
        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        selected_language_code = language_code or self._settings.elevenlabs_language_code
        cache_key = audio_cache_key(
            normalized,
            selected_voice_id,
            self._settings.elevenlabs_model_id,
            selected_language_code,
        )

        existing = self._find_asset(cache_key)
        if existing and existing.status == "ready" and existing.public_url:
            return existing

        if not self._settings.elevenlabs_api_key or not selected_voice_id:
            failed = existing or AudioAsset(id=str(uuid4()), text=normalized, status="failed")
            self._assets[cache_key] = failed
            return failed

        asset = existing or AudioAsset(id=str(uuid4()), text=normalized, status="pending")
        self._assets[cache_key] = asset
        if not existing:
            self._insert_pending(asset, cache_key, selected_voice_id)

        await self._generate_and_store(
            asset,
            cache_key,
            selected_voice_id,
            selected_language_code,
        )
        return self._find_asset(cache_key) or self._assets[cache_key]

    def _find_asset(self, cache_key: str) -> Optional[AudioAsset]:
        if self._client:
            response = (
                self._client.table("audio_assets")
                .select("id,text,status,public_url,error_message")
                .eq("content_hash", cache_key)
                .maybe_single()
                .execute()
            )
            if response and response.data:
                return AudioAsset.model_validate(response.data)
        return self._assets.get(cache_key)

    def _insert_pending(
        self,
        asset: AudioAsset,
        cache_key: str,
        voice_id: Optional[str] = None,
    ) -> None:
        if not self._client:
            return

        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        self._client.table("audio_assets").insert(
            {
                "id": asset.id,
                "text": asset.text,
                "content_hash": cache_key,
                "voice_id": selected_voice_id,
                "model_id": self._settings.elevenlabs_model_id,
                "status": asset.status,
            }
        ).execute()

    async def _generate_and_store(
        self,
        asset: AudioAsset,
        cache_key: str,
        voice_id: Optional[str] = None,
        language_code: Optional[str] = None,
    ) -> None:
        try:
            audio_bytes = await self._generate_audio_bytes(asset.text, voice_id, language_code)
            public_url = self._store_audio(asset.id, audio_bytes)
            ready_asset = asset.model_copy(update={"status": "ready", "public_url": public_url})
            self._assets[cache_key] = ready_asset
            self._mark_ready(ready_asset)
        except Exception as err:
            failed_asset = asset.model_copy(update={"status": "failed", "error_message": str(err)})
            self._assets[cache_key] = failed_asset
            self._mark_failed(asset.id, str(err))

    async def _generate_audio_bytes(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language_code: Optional[str] = None,
    ) -> bytes:
        assert self._settings.elevenlabs_api_key
        selected_voice_id = voice_id or self._settings.elevenlabs_voice_id
        selected_language_code = language_code or self._settings.elevenlabs_language_code
        assert selected_voice_id

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice_id}"
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                headers={
                    "xi-api-key": self._settings.elevenlabs_api_key,
                    "Accept": "audio/mpeg",
                },
                json={
                    "text": text,
                    "model_id": self._settings.elevenlabs_model_id,
                    "language_code": selected_language_code,
                    "voice_settings": {"stability": 0.45, "similarity_boost": 0.8},
                },
            )
            response.raise_for_status()
            return response.content

    def _store_audio(self, asset_id: str, audio_bytes: bytes) -> Optional[str]:
        if not self._client or not self._settings.supabase_url:
            return None

        path = f"generated/{asset_id}.mp3"
        self._client.storage.from_(self._settings.supabase_audio_bucket).upload(
            path,
            audio_bytes,
            {"content-type": "audio/mpeg", "upsert": "true"},
        )
        return self._client.storage.from_(self._settings.supabase_audio_bucket).get_public_url(path)

    def _mark_ready(self, asset: AudioAsset) -> None:
        if not self._client:
            return
        self._client.table("audio_assets").update(
            {"status": "ready", "public_url": asset.public_url}
        ).eq("id", asset.id).execute()

    def _mark_failed(self, asset_id: str, error_message: Optional[str] = None) -> None:
        if not self._client:
            return
        self._client.table("audio_assets").update(
            {"status": "failed", "error_message": error_message}
        ).eq("id", asset_id).execute()
