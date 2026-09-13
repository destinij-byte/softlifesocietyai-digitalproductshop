from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

Intensity = Literal["hard", "medium", "easy"]

POINTS_PER_LOG = 10


class ChallengeTemplate(BaseModel):
    """Seeded, not user-created - 75/45/30 Day (intensity picker required)
    plus the fixed-intensity Water Intake and 10,000 Steps challenges."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    slug: str
    name: str
    duration_days: int
    requires_intensity: bool
    emoji: str = "🔥"
    is_active: bool = True


class ChallengeParticipant(BaseModel):
    """One per (user_id, template_id) - a user's enrollment in a challenge."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    template_id: PyObjectId
    intensity: Intensity | None = None
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_streak: int = 0
    longest_streak: int = 0
    points: int = 0
    last_logged_date: str | None = None  # "YYYY-MM-DD"


class ChallengeLog(BaseModel):
    """One per (participant_id, date) - a single day's check-in."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    participant_id: PyObjectId
    user_id: PyObjectId
    date: str  # "YYYY-MM-DD"
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FriendInvite(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    code: str
    inviter_id: PyObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Friendship(BaseModel):
    """One row per direction - redeeming an invite writes both directions,
    so 'who are my friends' is always a single-field lookup."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    friend_id: PyObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
