from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId


class ResourceLinkOut(BaseModel):
    label: str
    url: str


class LessonSummaryOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    order: int
    title: str
    duration_seconds: int


class LessonDetailOut(LessonSummaryOut):
    video_url: str
    transcript: str | None = None
    resources: list[ResourceLinkOut] = Field(default_factory=list)


class ModuleOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    order: int
    title: str
    lessons: list[LessonSummaryOut]


class CourseListItemOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    slug: str
    title: str
    description: str
    price: float
    tier: str
    thumbnail_url: str


class CourseDetailOut(CourseListItemOut):
    workbook_url: str = ""
    modules: list[ModuleOut]
    recommended_next: CourseListItemOut | None = None


class ProgressOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    lessons_completed: list[PyObjectId]
    percent_complete: float
    current_lesson_id: PyObjectId | None
    completed_at: datetime | None


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    course: CourseListItemOut
    purchased_at: datetime
    status: str
    progress: ProgressOut


class CheckoutRequest(BaseModel):
    course_id: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class LessonCompleteResponse(BaseModel):
    percent_complete: float
    current_lesson_id: PyObjectId | None
    completed_course: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class WorkbookResponse(BaseModel):
    download_url: str
    expires_in_seconds: int
