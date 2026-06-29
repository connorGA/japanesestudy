from datetime import datetime, timedelta, timezone

from app.models import ReviewItem, ReviewRating


def schedule_review(item: ReviewItem, rating: ReviewRating) -> ReviewItem:
    now = datetime.now(timezone.utc)
    ease = item.ease_factor
    interval = item.interval_days
    lapses = item.lapses

    if rating == "again":
        interval = 0
        ease = max(1.3, ease - 0.2)
        lapses += 1
    elif rating == "hard":
        interval = max(1, round(interval * 1.2))
        ease = max(1.3, ease - 0.15)
    elif rating == "good":
        interval = 1 if item.review_count == 0 else max(1, round(interval * ease))
    else:
        interval = 4 if item.review_count == 0 else max(2, round(interval * (ease + 0.3)))
        ease += 0.15

    return item.model_copy(
        update={
            "due_at": now + timedelta(days=interval),
            "review_count": item.review_count + 1,
            "ease_factor": round(ease, 2),
            "interval_days": interval,
            "lapses": lapses,
        }
    )
