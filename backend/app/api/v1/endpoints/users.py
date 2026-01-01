from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core import security
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None

@router.post("/profile")
async def update_profile(
    profile: UserProfileUpdate,
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Create or update the user's profile in MongoDB.
    """
    user_id = current_user["uid"]
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    update_data["email"] = current_user.get("email")
    from datetime import datetime
    update_data["updated_at"] = datetime.utcnow()
    
    await db["users"].update_one(
        {"uid": user_id},
        {"$set": update_data},
        upsert=True
    )
    return {"message": "Profile updated successfully"}

@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Fetch the user's profile from MongoDB.
    """
    user_id = current_user["uid"]
    user = await db["users"].find_one({"uid": user_id})
    if not user:
        return current_user # Fallback to Firebase data
    
    # Remove MongoDB internal ID
    user.pop("_id", None)
    return user

@router.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Fetch dynamic user statistics for the profile page.
    """
    user_id = current_user["uid"]
    
    # 1. Topics Shared (Posts Created)
    topics_shared = await db["posts"].count_documents({"author.uid": user_id})
    
    # 2. Total Reactions (Sum of likes on all user's posts)
    pipeline = [
        {"$match": {"author.uid": user_id}},
        {"$group": {"_id": None, "total_likes": {"$sum": "$likes"}}}
    ]
    reactions_result = await db["posts"].aggregate(pipeline).to_list(1)
    total_reactions = reactions_result[0]["total_likes"] if reactions_result else 0
    
    # 3. User Interests & Accuracy Data
    interest_doc = await db["users_interests"].find_one({"user_id": user_id})
    
    avg_accuracy = 0
    total_checks = 0
    streak = 0
    rank = "N/A"
    
    if interest_doc:
        total_checks = interest_doc.get("total_checks", 0)
        total_score = interest_doc.get("total_credibility_score", 0)
        avg_accuracy = round(total_score / total_checks) if total_checks > 0 else 0
        streak = interest_doc.get("streak", 0)
        
        # 4. Rank Calculation (Based on total_checks)
        higher_rank_count = await db["users_interests"].count_documents({"total_checks": {"$gt": total_checks}})
        rank = higher_rank_count + 1

    return {
        "topics_shared": topics_shared,
        "total_reactions": total_reactions,
        "avg_accuracy": f"{avg_accuracy}%",
        "streak": f"{streak} Days",
        "rank": f"#{rank}"
    }
