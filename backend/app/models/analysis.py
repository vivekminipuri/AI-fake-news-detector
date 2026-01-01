from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalysisDBModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None # Firebase UID
    content: str
    source_url: Optional[str] = None
    input_type: str # "text" or "url"
    
    verdict: str
    credibility_score: int
    category: Optional[str] = "Others" # New field for dashboard
    
    # Store full AI result for future reference
    ai_raw_data: Dict[str, Any]
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
