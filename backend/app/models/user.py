from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.objectid import PyObjectId


class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id")
    email: EmailStr
    hashed_password: str
    full_name: str = ""
    is_admin: bool = False
