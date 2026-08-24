from datetime import date
from uuid import uuid4

from app.models import ProgressEventCreate, ProgressImportItem
from app.services.repository import StudyRepository


class NoDatabaseSettings:
    supabase_url = None
    supabase_service_role_key = None


def test_progress_events_are_idempotent_and_respect_activity_caps() -> None:
    repo = StudyRepository(NoDatabaseSettings())  # type: ignore[arg-type]
    learner_id = uuid4()
    event = ProgressEventCreate(
        id=uuid4(),
        learner_id=learner_id,
        language="italian",
        feature="flashcards",
        activity_type="flashcard_mastered",
        activity_date=date.today(),
        metadata={"card_id": "ciao"},
    )

    first = repo.record_progress_event(
        event,
        points=3,
        activity_daily_limit=1,
        language_daily_limit=250,
    )
    duplicate = repo.record_progress_event(
        event,
        points=3,
        activity_daily_limit=1,
        language_daily_limit=250,
    )
    capped = repo.record_progress_event(
        event.model_copy(update={"id": uuid4()}),
        points=3,
        activity_daily_limit=1,
        language_daily_limit=250,
    )

    assert first.points_awarded == 3
    assert first.daily_points == 3
    assert duplicate.duplicate is True
    assert duplicate.points_awarded == 3
    assert capped.points_awarded == 0
    assert repo.progress_summary(learner_id).records[0].points == 3


def test_legacy_import_never_reduces_shared_daily_progress() -> None:
    repo = StudyRepository(NoDatabaseSettings())  # type: ignore[arg-type]
    learner_id = uuid4()
    progress_date = date.today()

    repo.import_progress(
        learner_id,
        [ProgressImportItem(language="japanese", date=progress_date, points=12)],
    )
    repo.import_progress(
        learner_id,
        [ProgressImportItem(language="japanese", date=progress_date, points=5)],
    )

    assert repo.progress_summary(learner_id).records[0].points == 12
