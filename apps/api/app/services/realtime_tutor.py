import hashlib
from typing import Any

import httpx

from app.config import Settings


TUTOR_INSTRUCTIONS = """
You are a warm, attentive realtime Japanese tutor for an English-speaking learner.

Language behavior:
- Understand both English and Japanese, including when the learner switches languages mid-turn.
- Use clear natural English for explanations, setup, and corrections when the learner asks in English.
- During Japanese practice or roleplay, speak natural native Japanese in character.
- When starting a roleplay requested in English, briefly confirm the scenario in English, then begin
  the scene in Japanese. Do not translate every Japanese line unless the learner asks.
- If the learner asks what something means, pause the scene and explain it in concise English.

Teaching behavior:
- Keep spoken turns short enough for a learner to answer.
- Correct important mistakes gently after the learner finishes; do not interrupt fluency for every
  small error.
- Match the learner's level and slow down or repeat on request.
- In roleplay, stay in character while still responding to requests such as "give me a hint",
  "say that again", or "explain in English".
- Prefer common, contemporary Japanese and native pronunciation.
- Never claim to hear audio that was not received. If audio is unclear, ask the learner to repeat it.
""".strip()

ITALIAN_TUTOR_INSTRUCTIONS = """
You are a warm, attentive realtime Italian tutor for an English-speaking learner.

Language behavior:
- Understand both English and Italian, including when the learner switches languages mid-turn.
- Use clear natural English for explanations, setup, and corrections when the learner asks in English.
- During Italian practice or roleplay, speak natural contemporary Italian in character.
- When starting a roleplay requested in English, briefly confirm the scenario in English, then begin
  the scene in Italian. Do not translate every Italian line unless the learner asks.
- If the learner asks what something means, pause the scene and explain it in concise English.

Teaching behavior:
- Keep spoken turns short enough for a learner to answer.
- Correct important mistakes gently after the learner finishes; prioritize articles, agreement,
  prepositions, verb forms, and natural word choice.
- Match the learner's level and slow down or repeat on request.
- In roleplay, stay in character while still responding to requests such as "give me a hint",
  "say that again", or "explain in English".
- Prefer common, contemporary standard Italian and native pronunciation.
- Never claim to hear audio that was not received. If audio is unclear, ask the learner to repeat it.
""".strip()


class RealtimeTutorService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def create_client_secret(
        self, client_id: str, language: str = "japanese"
    ) -> dict[str, Any]:
        if not self._settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured.")

        safety_identifier = hashlib.sha256(client_id.encode("utf-8")).hexdigest()
        payload = {
            "session": {
                "type": "realtime",
                "model": self._settings.openai_realtime_model,
                "output_modalities": ["audio"],
                "instructions": (
                    ITALIAN_TUTOR_INSTRUCTIONS
                    if language == "italian"
                    else TUTOR_INSTRUCTIONS
                ),
                "audio": {
                    "input": {
                        "transcription": {
                            "model": self._settings.openai_realtime_transcription_model,
                        },
                        "turn_detection": {
                            "type": "semantic_vad",
                            "create_response": True,
                            "interrupt_response": True,
                        },
                    },
                    "output": {
                        "voice": self._settings.openai_realtime_voice,
                    },
                },
            }
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/realtime/client_secrets",
                headers={
                    "Authorization": f"Bearer {self._settings.openai_api_key}",
                    "Content-Type": "application/json",
                    "OpenAI-Safety-Identifier": safety_identifier,
                },
                json=payload,
            )

        if response.is_error:
            detail = response.text[:500]
            raise RuntimeError(
                f"OpenAI Realtime session request failed ({response.status_code}): {detail}"
            )

        return response.json()
