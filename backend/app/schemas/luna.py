from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.goal import GoalCategory, Milestone
from app.models.routine import RoutineType
from app.models.food_log import FoodLogSource, MealType
from app.utils.objectid import PyObjectId

# --- Goals ------------------------------------------------------------


class GoalCreate(BaseModel):
    category: GoalCategory
    title: str
    target: str = ""
    deadline: date | None = None
    milestones: list[Milestone] = []


class GoalUpdate(BaseModel):
    title: str | None = None
    target: str | None = None
    deadline: date | None = None
    progress: float | None = None
    milestones: list[Milestone] | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    category: GoalCategory
    title: str
    target: str
    deadline: date | None
    progress: float
    milestones: list[Milestone]


# --- Routines -----------------------------------------------------------


class RoutineStepCreate(BaseModel):
    label: str


class RoutineOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    type: RoutineType
    steps: list[dict]
    completed_step_ids: list[str]


class RoutineToggleRequest(BaseModel):
    step_id: str
    done: bool


# --- Challenges -----------------------------------------------------------


class ChallengeTemplateOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    slug: str
    name: str
    duration_days: int
    requires_intensity: bool
    emoji: str


class ChallengeJoinRequest(BaseModel):
    template_id: str
    intensity: str | None = None


class ChallengeParticipantOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    template: ChallengeTemplateOut
    intensity: str | None
    joined_at: datetime
    current_streak: int
    longest_streak: int
    points: int
    days_completed: int
    logged_today: bool


class LeaderboardEntryOut(BaseModel):
    user_id: str
    full_name: str
    is_self: bool
    points: int
    current_streak: int


class InviteOut(BaseModel):
    code: str
    invite_url: str


class RedeemInviteRequest(BaseModel):
    code: str


# --- Nourish AI (food logging - manual entry only; photo/AI parts pending) --


class FoodLogCreate(BaseModel):
    date: date
    meal_type: MealType
    name: str
    calories: int
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    source: FoodLogSource = "manual"


class FoodLogOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    date: str
    meal_type: MealType
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    source: FoodLogSource
