from pydantic import BaseModel

from app.models.course import CourseStatus, CourseTier, ResourceLink


class CourseCreate(BaseModel):
    slug: str
    title: str
    description: str
    price: float
    tier: CourseTier = "single"
    status: CourseStatus = "draft"
    thumbnail_url: str = ""
    workbook_url: str = ""
    recommended_next_course_id: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    tier: CourseTier | None = None
    status: CourseStatus | None = None
    thumbnail_url: str | None = None
    workbook_url: str | None = None
    recommended_next_course_id: str | None = None


class ModuleCreate(BaseModel):
    course_id: str
    order: int
    title: str


class LessonCreate(BaseModel):
    module_id: str
    order: int
    title: str
    video_url: str
    duration_seconds: int
    transcript: str | None = None
    resources: list[ResourceLink] = []
