from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    
    # Validator to ensure at least one is provided
    def validate_input(self):
        if not self.text and not self.url:
            raise ValueError("Either 'text' or 'url' must be provided.")

class SentimentAnalysis(BaseModel):
    polarity: float
    subjectivity: float

class MLBreakdown(BaseModel):
    fake_prob: float
    real_prob: float
    opinion_prob: float

class AnalysisResponse(BaseModel):
    credibility_score: int
    verdict: str
    explanation: str
    red_flags: List[str]
    category: str = "Others"
    sentiment_analysis: Optional[Dict[str, Any]] = None
    ml_breakdown: Optional[Dict[str, Any]] = None
    source_verification: Optional[Dict[str, Any]] = None
    news_coverage: Optional[Dict[str, Any]] = None
    translated_content: Optional[str] = None # New field for non-English inputs
    timestamp: Optional[str] = None
