from fastapi import APIRouter, Depends, HTTPException
from app.core import security
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services import analysis_service
from app.db.mongodb import get_database
from app.models.analysis import AnalysisDBModel
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

@router.post("/", response_model=AnalysisResponse)
async def analyze_content(
    request: AnalysisRequest,
    current_user: dict = Depends(security.get_current_user), # Require Auth to save history
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Analyze text or URL for fake news.
    """
    try:
        request.validate_input()
        result = await analysis_service.perform_analysis(request.text, request.url)
        
        # Save to Database
        analysis_doc = AnalysisDBModel(
            user_id=current_user["uid"],
            # Store truncated content (limit to 300 chars or first line) to save DB space
            content=request.text[:300] if request.text else request.url,
            source_url=request.url,
            input_type="url" if request.url else "text",
            verdict=result["verdict"],
            credibility_score=result["credibility_score"],
            ai_raw_data=result,
            category=result.get("category", "Others") # Save Category
        )
        
        doc = analysis_doc.dict(by_alias=True)
        if "_id" in doc and doc["_id"] is None:
            del doc["_id"]
        
        await db["analysis_history"].insert_one(doc)

        # Optimization: Update User Interests Collection (aggregated stats)
        # This allows O(1) fetch for the dashboard chart!
        category = result.get("category", "Others")
        await db["users_interests"].update_one(
            {"user_id": current_user["uid"]},
            {
                "$inc": {f"interests.{category}": 1, "total_checks": 1},
                "$set": {"last_updated": doc["created_at"]},
                "$setOnInsert": {"user_id": current_user["uid"]}
            },
            upsert=True
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
