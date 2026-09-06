from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

_client = AsyncIOMotorClient(settings.mongodb_uri)
db = _client[settings.mongodb_db_name]


def get_database():
    return db
