from app.services.listening_content.base import ListeningLineSeed, ListeningScenarioSeed
from app.services.listening_content.food import FOOD_SCENARIOS
from app.services.listening_content.shopping import SHOPPING_SCENARIOS
from app.services.listening_content.social import SOCIAL_SCENARIOS
from app.services.listening_content.travel import TRAVEL_SCENARIOS
from app.services.listening_content.work import WORK_SCENARIOS

LISTENING_SCENARIOS: list[ListeningScenarioSeed] = [
    *TRAVEL_SCENARIOS,
    *FOOD_SCENARIOS,
    *SHOPPING_SCENARIOS,
    *SOCIAL_SCENARIOS,
    *WORK_SCENARIOS,
]

_ids = [scenario.id for scenario in LISTENING_SCENARIOS]
if len(_ids) != len(set(_ids)):
    raise ValueError("Duplicate listening scenario id")

__all__ = ["LISTENING_SCENARIOS", "ListeningLineSeed", "ListeningScenarioSeed"]
