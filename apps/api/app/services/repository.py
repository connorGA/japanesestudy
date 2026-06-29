from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from supabase import Client, create_client

from app.config import Settings
from app.models import ReviewCandidate, ReviewItem, TutorPayload


class StudyRepository:
    def __init__(self, settings: Settings) -> None:
        self._client: Optional[Client] = None
        if settings.supabase_url and settings.supabase_service_role_key:
            self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)

        self._sessions: set[str] = set()
        self._reviews: dict[str, ReviewItem] = {}

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
