from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.core import security
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.history_service import history_service
from app.services.llm_explainer import llm_explainer

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_history(
    limit: int = 50,
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Get current user's analysis history.
    """
    try:
        history = await history_service.get_user_history(db, current_user["uid"], limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_history_insights(
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Generate Insights (Truth Profile) from 'users_interests' collection.
    Optimized: No real-time LLM calls.
    """
    try:
        # Fetch pre-calculated stats
        interest_doc = await db["users_interests"].find_one({"user_id": current_user["uid"]})
        
        if not interest_doc:
             # First time? Fallback to calculating from history list (Migration helper)
             # But for now return empty
             return {
                "persona": "The Newcomer", 
                "insight": "Start verifying news to see your profile!",
                "interests": [],
                "fake_news_hit_rate": 0
            }

        interests_map = interest_doc.get("interests", {})
        if not interests_map:
             return {"persona": "The Newcomer", "insight": "No data yet.", "interests": [], "fake_news_hit_rate": 0}

        # Calculate Total dynamically to ensure mathematical consistency (Fixes >100% bug)
        # Using sum(values) guarantees that parts sum to exactly 100% (or ~99-101% with rounding).
        calculated_total = sum(interests_map.values())
        
        if calculated_total == 0:
             return {"persona": "The Newcomer", "insight": "No data yet.", "interests": [], "fake_news_hit_rate": 0}

        # Calculate Percentages
        sorted_interests = sorted(interests_map.items(), key=lambda x: x[1], reverse=True)[:5] # Top 5
        chart_data = [{"topic": k, "percent": round((v/calculated_total)*100)} for k, v in sorted_interests]
        
        # Simple Persona Logic (No LLM needed)
        top_topic = chart_data[0]["topic"] if chart_data else "General"
        persona = f"The {top_topic} Buff"
        if top_topic == "Politics": persona = "The Policy Watcher"
        elif top_topic == "Tech": persona = "The Tech Insider"
        
        # Fake News Hit Rate (Need to count "Fake" verdicts... wait, 'users_interests' needs to track verdict counts too!)
        # For now, let's approximate or fetch history count quickly. 
        # Actually, let's assume 50% for now or add "fake_count" to users_interests in next iteration.
        # Let's just calculate hit rate from last 20 history items logic or keep it 0 if complex.
        # Simpler: Just count "Fake" in history for now (it is fast enough for 50 items).
        
        fake_count = await db["analysis_history"].count_documents({"user_id": current_user["uid"], "verdict": {"$regex": "Fake|Likely Fake", "$options": "i"}})
        hit_rate = round((fake_count / calculated_total) * 100) if calculated_total > 0 else 0

        return {
            "persona": persona,
            "insight": f"You focus mostly on {top_topic} news ({chart_data[0]['percent']}%) with a {hit_rate}% fake detection rate.",
            "interests": chart_data,
            "fake_news_hit_rate": hit_rate
        }
        
    except Exception as e:
        print(f"Insights Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")
