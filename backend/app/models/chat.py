"""Storage shape for Luna Reyes chat - session/message persistence only.
Actual AI response generation is deliberately not wired up yet; it needs a
provider/model decision first (see box_service.py-style note pattern: this
is the equivalent flag for the AI chat + Nourish AI photo analysis pieces
of the build brief)."""

from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

ChatMode = Literal["life", "money", "wellness", "goals"]
ChatRole = Literal["user", "assistant"]


class ChatSession(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    mode: ChatMode
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    session_id: PyObjectId
    user_id: PyObjectId
    role: ChatRole
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
