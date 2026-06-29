from datetime import datetime, timezone

from app.models import ReviewItem
from app.services.srs import schedule_review


def make_item() -> ReviewItem:
    return ReviewItem(
        id="review-1",
        item_type="sentence",
        prompt="昨日は店に行った",
        answer="Yesterday, I went to the store.",
        due_at=datetime.now(timezone.utc),
    )


def test_good_rating_schedules_first_review_for_tomorrow() -> None:
    updated = schedule_review(make_item(), "good")

    assert updated.review_count == 1
    assert updated.interval_days == 1
    assert updated.ease_factor == 2.5


def test_again_rating_records_lapse_and_keeps_due_soon() -> None:
    updated = schedule_review(make_item(), "again")

    assert updated.review_count == 1
    assert updated.interval_days == 0
    assert updated.lapses == 1
    assert updated.ease_factor < 2.5
