from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")
    openai_realtime_model: str = Field(
        default="gpt-realtime-2.1",
        alias="OPENAI_REALTIME_MODEL",
    )
    openai_realtime_voice: str = Field(default="marin", alias="OPENAI_REALTIME_VOICE")
    openai_realtime_transcription_model: str = Field(
        default="gpt-4o-mini-transcribe",
        alias="OPENAI_REALTIME_TRANSCRIPTION_MODEL",
    )

    elevenlabs_api_key: Optional[str] = Field(default=None, alias="ELEVENLABS_API_KEY")
    elevenlabs_voice_id: Optional[str] = Field(default=None, alias="ELEVENLABS_VOICE_ID")
    elevenlabs_voice_id_2: Optional[str] = Field(default=None, alias="ELEVENLABS_VOICE_ID_2")
    elevenlabs_english_voice_id: Optional[str] = Field(
        default=None,
        alias="ELEVENLABS_ENGLISH_VOICE_ID",
    )
    elevenlabs_italian_voice_id: Optional[str] = Field(
        default=None,
        alias="ELEVENLABS_ITALIAN_VOICE_ID",
    )
    elevenlabs_model_id: str = Field(default="eleven_multilingual_v2", alias="ELEVENLABS_MODEL_ID")
    elevenlabs_language_code: str = Field(default="ja", alias="ELEVENLABS_LANGUAGE_CODE")

    @property
    def passive_listening_english_voice_id(self) -> Optional[str]:
        return self.elevenlabs_english_voice_id or self.elevenlabs_voice_id_2

    @property
    def passive_listening_japanese_voice_id(self) -> Optional[str]:
        return self.elevenlabs_voice_id

    @property
    def passive_listening_italian_voice_id(self) -> Optional[str]:
        return self.elevenlabs_italian_voice_id

    supabase_url: Optional[str] = Field(default=None, alias="SUPABASE_URL")
    supabase_anon_key: Optional[str] = Field(default=None, alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: Optional[str] = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_audio_bucket: str = Field(default="audio-assets", alias="SUPABASE_AUDIO_BUCKET")

    cors_origins: str = Field(default="http://localhost:3005", alias="CORS_ORIGINS")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
