from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.translator_service import translator_service

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str = "en"

@router.post("/")
async def translate_text(request: TranslateRequest):
    """
    Translate text between languages.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        translated = translator_service.translate_text(
            request.text, 
            request.source_lang, 
            request.target_lang
        )
        return {"translated_text": translated}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
