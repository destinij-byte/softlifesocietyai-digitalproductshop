from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

MealType = Literal["breakfast", "lunch", "snack", "dinner"]
FoodLogSource = Literal["photo", "search", "manual", "ai_suggested"]


class FoodLog(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    date: str  # "YYYY-MM-DD"
    meal_type: MealType
    name: str
    calories: int
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    source: FoodLogSource = "manual"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
