from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class DataBase:
    client: AsyncIOMotorClient = None

db = DataBase()

async def get_database() -> AsyncIOMotorClient:
    return db.client[settings.DB_NAME]

async def connect_to_mongo():
    print("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("MongoDB Connected.")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    if db.client:
        db.client.close()
