import re
from config.config import Config

def detect_clickbait(headline: str):
    """
    Analyzes headline for clickbait patterns.
    
    Returns:
        dict: {
            "score": float (0.0 to 1.0, 1.0 = Clickbait),
            "reasoning": str
        }
    """
    if not headline:
        return {"score": 0.0, "reasoning": "No headline provided."}
        
    headline_lower = headline.lower()
    score = 0.0
    reasons = []
    
    # 1. Check for specific keywords
    detected_keywords = []
    for keyword in Config.CLICKBAIT_KEYWORDS:
        if keyword in headline_lower:
            score += 0.3
            detected_keywords.append(keyword)
            
    if detected_keywords:
        reasons.append(f"Contains clickbait keywords: {', '.join(detected_keywords)}.")
        
    # 2. Check for "You won't believe" / Question patterns
    if headline_lower.startswith("you won't believe") or headline_lower.startswith("this is why"):
        score += 0.4
        reasons.append("Uses common clickbait phrasing.")

    # 3. Check for All Caps (Sign of urgency/shouting)
    # We count words with length > 2 to avoid 'A', 'I', 'US', 'UK' triggering it falsely too often, 
    # but simple heuristics: if > 50% capital letters
    uppercase_chars = sum(1 for c in headline if c.isupper())
    total_chars = len(headline)
    if total_chars > 0 and (uppercase_chars / total_chars) > 0.5:
        score += 0.3
        reasons.append("Excessive use of Capital letters.")
        
    # 4. Excessive Punctuation (!!, ???)
    if "!!" in headline or "??" in headline:
        score += 0.2
        reasons.append("Excessive punctuation detected.")
        
    # Cap score at 1.0
    score = min(score, 1.0)
    
    return {
        "score": round(score, 2),
        "reasoning": " ".join(reasons) if reasons else "No clickbait patterns detected."
    }
