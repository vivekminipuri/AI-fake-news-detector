from fastapi import APIRouter, Depends, HTTPException, Body
from app.services.llm_explainer import llm_explainer
from app.core import security
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = [] # [{"role": "user", "content": "..."}, ...]

class ChatResponse(BaseModel):
    reply: str

@router.post("", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Chat with the AI Assistant.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    reply = llm_explainer.chat_with_expert(request.message, request.history)
    
    return {"reply": reply}
