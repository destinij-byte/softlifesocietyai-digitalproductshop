from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

RoutineType = Literal["morning", "night"]

DEFAULT_STEPS: dict[RoutineType, list[str]] = {
    "morning": ["Wake up", "Water", "Hygiene", "Skincare", "Make bed", "Movement", "Breakfast", "Review goals"],
    "night": [],
}


class RoutineStep(BaseModel):
    id: str
    label: str
    order: int


class RoutineTemplate(BaseModel):
    """One per (user_id, type) - the checklist itself. What's checked off on
    a given day lives separately in RoutineCompletion, since the checklist
    resets daily but its steps don't."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    type: RoutineType
    steps: list[RoutineStep] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RoutineCompletion(BaseModel):
    """One per (user_id, type, date)."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    type: RoutineType
    date: str  # "YYYY-MM-DD"
    completed_step_ids: list[str] = Field(default_factory=list)
