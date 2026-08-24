from dataclasses import dataclass


@dataclass(frozen=True)
class PointRule:
    points: int
    daily_limit: int


POINT_RULES: dict[str, PointRule] = {
    "flashcard_retry": PointRule(points=1, daily_limit=50),
    "flashcard_mastered": PointRule(points=3, daily_limit=50),
    "pronunciation_play": PointRule(points=1, daily_limit=20),
    "verb_form_practice": PointRule(points=1, daily_limit=30),
    "listening_line_complete": PointRule(points=2, daily_limit=30),
    "passive_listening_item": PointRule(points=3, daily_limit=20),
    "arcade_correct": PointRule(points=2, daily_limit=60),
    "srs_review": PointRule(points=3, daily_limit=40),
    "tutor_turn": PointRule(points=4, daily_limit=20),
    "roleplay_turn": PointRule(points=4, daily_limit=20),
}

DAILY_LANGUAGE_POINT_LIMIT = 250

