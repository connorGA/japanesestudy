from datetime import date, datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, NAMESPACE_URL, uuid4, uuid5

from supabase import Client, create_client

from app.config import Settings
from app.models import (
    DailyProgress,
    ProgressEventCreate,
    ProgressEventResult,
    ProgressImportItem,
    ProgressSummary,
    ReviewCandidate,
    ReviewItem,
    TutorPayload,
)


class StudyRepository:
    def __init__(self, settings: Settings) -> None:
        self._client: Optional[Client] = None
        if settings.supabase_url and settings.supabase_service_role_key:
            self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)

        self._sessions: set[str] = set()
        self._reviews: dict[str, ReviewItem] = {}
        self._progress_events: dict[str, dict] = {}

    def create_session_if_needed(self, session_id: Optional[str], mode: str = "chat") -> str:
        if session_id:
            return session_id

        new_id = str(uuid4())
        if self._client:
            self._client.table("study_sessions").insert({"id": new_id, "mode": mode}).execute()
        else:
            self._sessions.add(new_id)
        return new_id

    def save_tutor_exchange(
        self,
        *,
        session_id: str,
        user_text: str,
        payload: TutorPayload,
        audio_asset_id: Optional[str],
    ) -> str:
        message_id = str(uuid4())
        if self._client:
            self._client.table("messages").insert(
                {
                    "id": message_id,
                    "session_id": session_id,
                    "role": "assistant",
                    "user_input": user_text,
                    "content": payload.model_dump(mode="json"),
                    "audio_asset_id": audio_asset_id,
                }
            ).execute()
        return message_id

    def create_review_items(self, candidates: list[ReviewCandidate]) -> list[ReviewItem]:
        now = datetime.now(timezone.utc)
        items = [
            ReviewItem(
                id=str(uuid4()),
                item_type=candidate.item_type,
                prompt=candidate.prompt,
                answer=candidate.answer,
                context=candidate.context,
                due_at=now,
            )
            for candidate in candidates
        ]

        if self._client:
            rows = [
                {
                    "id": item.id,
                    "item_type": item.item_type,
                    "prompt": item.prompt,
                    "answer": item.answer,
                    "context": item.context,
                    "due_at": item.due_at.isoformat(),
                    "review_count": item.review_count,
                    "ease_factor": item.ease_factor,
                    "interval_days": item.interval_days,
                    "lapses": item.lapses,
                }
                for item in items
            ]
            self._client.table("review_items").insert(rows).execute()
        else:
            self._reviews.update({item.id: item for item in items})

        return items

    def due_reviews(self) -> list[ReviewItem]:
        if self._client:
            response = (
                self._client.table("review_items")
                .select("*")
                .lte("due_at", datetime.now(timezone.utc).isoformat())
                .order("due_at")
                .limit(20)
                .execute()
            )
            return [ReviewItem.model_validate(row) for row in response.data]

        return sorted(
            [item for item in self._reviews.values() if item.due_at <= datetime.now(timezone.utc)],
            key=lambda item: item.due_at,
        )[:20]

    def update_review_item(self, item: ReviewItem) -> ReviewItem:
        if self._client:
            self._client.table("review_items").update(item.model_dump(mode="json")).eq(
                "id", item.id
            ).execute()
        else:
            self._reviews[item.id] = item
        return item

    def get_review_item(self, review_item_id: str) -> Optional[ReviewItem]:
        if self._client:
            response = (
                self._client.table("review_items")
                .select("*")
                .eq("id", review_item_id)
                .single()
                .execute()
            )
            return ReviewItem.model_validate(response.data) if response.data else None

        return self._reviews.get(review_item_id)

    def record_progress_event(
        self,
        event: ProgressEventCreate,
        *,
        points: int,
        activity_daily_limit: int,
        language_daily_limit: int,
    ) -> ProgressEventResult:
        event_id = str(event.id)
        learner_id = str(event.learner_id)
        date_key = event.activity_date.isoformat()

        if self._client:
            response = (
                self._client.table("practice_attempts")
                .select("id, prompt, response, feedback")
                .eq("response", learner_id)
                .execute()
            )
            stored_rows = [_progress_row_from_attempt(row) for row in response.data]
            existing = next((row for row in stored_rows if row["id"] == event_id), None)
            daily_rows = [
                row
                for row in stored_rows
                if row["language"] == event.language and row["activity_date"] == date_key
            ]
        else:
            existing = self._progress_events.get(event_id)
            daily_rows = [
                row
                for row in self._progress_events.values()
                if row["learner_id"] == learner_id
                and row["language"] == event.language
                and row["activity_date"] == date_key
            ]

        current_daily_points = sum(int(row["points"]) for row in daily_rows)
        if existing:
            return ProgressEventResult(
                id=event.id,
                language=event.language,
                activity_type=event.activity_type,
                points_awarded=int(existing["points"]),
                daily_points=current_daily_points,
                duplicate=True,
            )

        activity_count = sum(
            1 for row in daily_rows if row["activity_type"] == event.activity_type
        )
        remaining_daily_points = max(0, language_daily_limit - current_daily_points)
        awarded = 0 if activity_count >= activity_daily_limit else min(points, remaining_daily_points)
        row = {
            "id": event_id,
            "learner_id": learner_id,
            "language": event.language,
            "feature": event.feature,
            "activity_type": event.activity_type,
            "points": awarded,
            "activity_date": date_key,
            "metadata": event.metadata,
        }
        if self._client:
            self._client.table("practice_attempts").insert(
                _progress_row_to_attempt(row)
            ).execute()
        else:
            self._progress_events[event_id] = row

        return ProgressEventResult(
            id=event.id,
            language=event.language,
            activity_type=event.activity_type,
            points_awarded=awarded,
            daily_points=current_daily_points + awarded,
        )

    def progress_summary(self, learner_id: UUID, days: int = 370) -> ProgressSummary:
        learner_key = str(learner_id)
        earliest = (date.today() - timedelta(days=days - 1)).isoformat()
        if self._client:
            response = (
                self._client.table("practice_attempts")
                .select("id, prompt, response, feedback")
                .eq("response", learner_key)
                .execute()
            )
            rows = [
                row
                for row in (_progress_row_from_attempt(item) for item in response.data)
                if row["activity_date"] >= earliest
            ]
        else:
            rows = [
                row
                for row in self._progress_events.values()
                if row["learner_id"] == learner_key and row["activity_date"] >= earliest
            ]

        totals: dict[tuple[str, str], int] = {}
        for row in rows:
            key = (str(row["language"]), str(row["activity_date"]))
            totals[key] = totals.get(key, 0) + int(row["points"])

        records = [
            DailyProgress(language=language, date=day, points=points)
            for (language, day), points in sorted(totals.items(), key=lambda item: item[0][1])
        ]
        return ProgressSummary(learner_id=learner_id, records=records)

    def import_progress(self, learner_id: UUID, records: list[ProgressImportItem]) -> int:
        learner_key = str(learner_id)
        if self._client:
            response = (
                self._client.table("practice_attempts")
                .select("id, prompt, response, feedback")
                .eq("response", learner_key)
                .execute()
            )
            existing_rows = {
                row["id"]: row
                for row in (_progress_row_from_attempt(item) for item in response.data)
                if row["feature"] == "dashboard_migration"
            }
        else:
            existing_rows = self._progress_events

        rows = []
        for item in records:
            if item.points <= 0:
                continue
            event_id = uuid5(
                NAMESPACE_URL,
                f"language-study:{learner_id}:{item.language}:{item.date.isoformat()}",
            )
            existing_points = int(existing_rows.get(str(event_id), {}).get("points", 0))
            rows.append(
                {
                    "id": str(event_id),
                    "learner_id": str(learner_id),
                    "language": item.language,
                    "feature": "dashboard_migration",
                    "activity_type": "legacy_import",
                    "points": max(item.points, existing_points),
                    "activity_date": item.date.isoformat(),
                    "metadata": {"source": "language-study.progress.v1"},
                }
            )

        if not rows:
            return 0
        if self._client:
            self._client.table("practice_attempts").upsert(
                [_progress_row_to_attempt(row) for row in rows], on_conflict="id"
            ).execute()
        else:
            for row in rows:
                self._progress_events.setdefault(row["id"], row)
        return len(rows)


def _progress_row_to_attempt(row: dict) -> dict:
    return {
        "id": row["id"],
        "mode": "shadowing",
        "prompt": row["activity_type"],
        "response": row["learner_id"],
        "feedback": {
            "language": row["language"],
            "feature": row["feature"],
            "activity_type": row["activity_type"],
            "points": row["points"],
            "activity_date": row["activity_date"],
            "metadata": row["metadata"],
            "kind": "study_progress",
        },
    }


def _progress_row_from_attempt(row: dict) -> dict:
    feedback = row.get("feedback") or {}
    return {
        "id": str(row["id"]),
        "learner_id": str(row.get("response") or ""),
        "language": str(feedback.get("language") or "japanese"),
        "feature": str(feedback.get("feature") or "unknown"),
        "activity_type": str(feedback.get("activity_type") or row.get("prompt") or "unknown"),
        "points": int(feedback.get("points") or 0),
        "activity_date": str(feedback.get("activity_date") or "0001-01-01"),
        "metadata": feedback.get("metadata") or {},
    }
