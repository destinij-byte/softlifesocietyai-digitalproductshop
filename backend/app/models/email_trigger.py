from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

EmailTriggerType = Literal["welcome", "mid_course_nudge", "completion", "upsell"]


class EmailTrigger(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    course_id: PyObjectId
    trigger_type: EmailTriggerType
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
