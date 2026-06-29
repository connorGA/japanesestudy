import json

from openai import AsyncOpenAI

from app.config import Settings
from app.models import RoleplayTurn, Scenario


SCENARIOS = [
    Scenario(
        id="ramen-shop",
        title="Ordering ramen",
        description="Order food, ask about toppings, and respond to staff.",
        level="N5-N4",
    ),
    Scenario(
        id="convenience-store",
        title="Convenience store",
        description="Buy items, answer checkout questions, and ask for a bag.",
        level="N5-N4",
    ),
    Scenario(
        id="train-station",
        title="Train station",
        description="Ask about platforms, tickets, transfers, and delays.",
        level="N4-N3",
    ),
    Scenario(
        id="izakaya",
        title="Izakaya",
        description="Order drinks and food in a casual group setting.",
        level="N4-N3",
    ),
    Scenario(
        id="business-meeting",
        title="Business meeting",
        description="Practice polite introductions and meeting follow-up.",
        level="N3-N2",
    ),
]


class RoleplayService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def next_turn(self, scenario_id: str, user_text: str, level: str) -> RoleplayTurn:
        scenario = next((item for item in SCENARIOS if item.id == scenario_id), SCENARIOS[0])
        if not self._client:
            return fallback_roleplay_turn(scenario, user_text)

        response = await self._client.chat.completions.create(
            model=self._settings.openai_model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You run realistic Japanese conversation practice. Return JSON with "
                        "ai_japanese, ai_english_hint, feedback, suggested_reply. Keep the "
                        f"language appropriate for {level}. Scenario: {scenario.title}."
                    ),
                },
                {"role": "user", "content": user_text},
            ],
        )
        data = json.loads(response.choices[0].message.content or "{}")
        return RoleplayTurn(scenario_id=scenario.id, **data)


def fallback_roleplay_turn(scenario: Scenario, user_text: str) -> RoleplayTurn:
    return RoleplayTurn(
        scenario_id=scenario.id,
        ai_japanese="かしこまりました。ほかにご注文はございますか。",
        ai_english_hint="Certainly. Would you like to order anything else?",
        feedback=f"Your reply was understandable: {user_text}",
        suggested_reply="はい、餃子も一つお願いします。",
    )
