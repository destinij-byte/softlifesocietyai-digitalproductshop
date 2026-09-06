from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

CourseTier = Literal["single", "bundle", "full_access"]
CourseStatus = Literal["draft", "published", "archived"]


class ResourceLink(BaseModel):
    label: str
    url: str


class Lesson(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    module_id: PyObjectId
    order: int
    title: str
    video_url: str
    duration_seconds: int
    transcript: str | None = None
    resources: list[ResourceLink] = Field(default_factory=list)


class Module(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    course_id: PyObjectId
    order: int
    title: str
    lessons: list[PyObjectId] = Field(default_factory=list)


class Course(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    slug: str
    title: str
    description: str
    price: float
    tier: CourseTier = "single"
    status: CourseStatus = "draft"
    thumbnail_url: str = ""
    modules: list[PyObjectId] = Field(default_factory=list)
    workbook_url: str = ""
    recommended_next_course_id: PyObjectId | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
