from datetime import date, datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

GoalCategory = Literal["money", "wellness", "career", "personal"]


class Milestone(BaseModel):
    title: str
    done: bool = False


class Goal(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    category: GoalCategory
    title: str
    target: str = ""
    deadline: date | None = None
    progress: float = 0  # 0-100
    milestones: list[Milestone] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
