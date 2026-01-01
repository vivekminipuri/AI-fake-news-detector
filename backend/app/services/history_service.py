from motor.motor_asyncio import AsyncIOMotorClient
from app.db.mongodb import get_database

class HistoryService:
    async def get_user_history(self, db: AsyncIOMotorClient, user_id: str, limit: int = 50):
        """
        Fetch analysis history for a specific user.
        """
        cursor = db["analysis_history"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        history = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for item in history:
            item["id"] = str(item["_id"])
            del item["_id"]
            
        return history

history_service = HistoryService()
