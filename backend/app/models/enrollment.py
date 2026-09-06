from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

EnrollmentStatus = Literal["active", "refunded"]


class Progress(BaseModel):
    lessons_completed: list[PyObjectId] = Field(default_factory=list)
    percent_complete: float = 0
    current_lesson_id: PyObjectId | None = None
    completed_at: datetime | None = None


class Enrollment(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    course_id: PyObjectId
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    price_paid: float
    status: EnrollmentStatus = "active"
    progress: Progress = Field(default_factory=Progress)
    last_activity_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
