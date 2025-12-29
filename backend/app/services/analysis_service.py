import sys
import os
import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException

# Add AI Engine to path so we can import it
# Assuming strict directory structure: backend/app/services -> ../../../ai-engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai-engine')))

# try:
#     from pipelines.detector import detect_fake_news
# except ImportError as e:
#     print(f"Error importing AI Engine: {e}")
#     detect_fake_news = None
detect_fake_news = None

try:
    from heuristics.clickbait import detect_clickbait
    from heuristics.sensationalism import analyze_sensationalism
    from heuristics.source_check import check_source_reliability
except ImportError:
    # If heuristics fail to import, define dummy functions
    def detect_clickbait(text): return {"score": 0.0, "reasoning": "N/A"}
    def analyze_sensationalism(text): return {"score": 0.0, "sentiment": {}, "reasoning": "N/A"}
    def check_source_reliability(url): return {"status": "Unknown", "reasoning": "N/A"}

def extract_text_from_url(url: str) -> str:
    """
    Simple scraper to fetch text from a URL.
    In production, use a robust library like Newspaper3k.
    """
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text[:5000] # Limit to 5000 chars for now
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not scrape URL: {str(e)}")

from app.services.fact_checker import fact_checker

async def perform_analysis(text: str, url: str):
    # If URL provided but no text, scrape it
    if url and not text:
        text = extract_text_from_url(url)
        
    if not text:
         raise HTTPException(status_code=400, detail="No content to analyze.")

    # 1. Check Google Fact Check Tools first
    # Use the first 500 chars or the headline for the query to keep it focused
    query_text = text[:500] if text else ""
    
    # Run in threadpool if it blocks too long, but requests is fast enough for now or use fastAPI default threadpool
    fact_check_result = fact_checker.verify_claim(query_text)
    
    if fact_check_result:
        # Trusted Fact Checker Found!
        rating = fact_check_result["rating"].lower()
        # Heuristic for mapping rating to Fake/Real
        is_fake = any(bad in rating for bad in ["false", "fake", "pantsonfire", "incorrect", "misleading"])
        
        return {
            "verdict": "Real" if not is_fake else "Fake",
            "credibility_score": 95 if not is_fake else 5,
            "explanation": f"VERIFIED by {fact_check_result['publisher']}: {fact_check_result['rating']}. Source: {fact_check_result['url']}",
            "red_flags": [] if not is_fake else [f"Flagged by {fact_check_result['publisher']}"],
            "sentiment_analysis": {"polarity": 0.0, "subjectivity": 0.0}, # Neutral placeholder
            "ml_breakdown": {"fake_prob": 0.0, "real_prob": 1.0, "opinion_prob": 0.0},
            "source_verification": fact_check_result,
            "news_coverage": None
        }

    from app.services.news_verifier import news_verifier
    
    # 1.5 Check Mainstream News Coverage (Cross-Reference)
    # If a major event is claimed, it SHOULD be in the news.
    news_result = news_verifier.verify_news_presence(query_text)
    news_score_modifier = 0
    news_explanation = ""
    
    if news_result and news_result["has_trusted_coverage"]:
        # CONFIRMED by mainstream media
        return {
            "verdict": "Real",
            "credibility_score": 90,
            "explanation": f"Confirmed by mainstream media sources ({len(news_result['trusted_articles'])} matches found).",
            "red_flags": [],
            "source_verification": {"publisher": "Multiple News Sources", "url": news_result["trusted_articles"][0]["url"]},
            "news_coverage": news_result,
            "ml_breakdown": {"fake_prob": 0.0, "real_prob": 1.0, "opinion_prob": 0.0},
            "sentiment_analysis": {"polarity": 0.0, "subjectivity": 0.0}
        }
    elif news_result and news_result["total_articles"] == 0:
        # SILENCE Detection: High profile claim but 0 news? Suspicious.
        # Only apply this penalty if the text looks like a "Breaking News" event (heuristic)
        if "sworn in" in text.lower() or "prime minister" in text.lower() or "announced" in text.lower() or "sources" in text.lower():
            news_score_modifier = -30
            news_explanation = "No mainstream media coverage found for this major claim."
         
    # 2. Call AI Engine (Fallback)
    # 2. Call AI Engine (Fallback)
    if detect_fake_news is not None:
         # Note: AI Engine is synchronous, maybe run in threadpool if blocking
         return detect_fake_news(text, url)

    # 3. Fallback: Run Lightweight Heuristics ... (logic continues below)

    # Note: AI Engine is synchronous, maybe run in threadpool if blocking
    # result = detect_fake_news(text, url)
    
    # Fallback: Run Lightweight Heuristics (Clickbait, Sentiment, Source)
    # This runs if AI Model is disabled and Google Fact check found nothing.
    
    # 1. Run Heuristics
    clickbait = detect_clickbait(text[:200]) # Headline analysis
    sensationalism = analyze_sensationalism(text)
    source_check = check_source_reliability(url) if url else {"status": "Unknown", "reasoning": "No URL"}
    
    # 2. Calculate Lightweight Score (Basic Rule-based)
    # Start at 50 (Neutral/Unverified) + News Penalty if any
    score = 50 + news_score_modifier
    red_flags = []
    
    if news_explanation:
        red_flags.append(news_explanation)
    
    # Penalize short, context-less claims
    if len(text) < 150 and not url:
        score -= 10
        red_flags.append("Content is too short to verify accurately.")

    if clickbait["score"] > 0.6:
        score -= 20
        red_flags.append(f"Clickbait detected: {clickbait['reasoning']}")
        
    if sensationalism["score"] > 0.6:
        score -= 15
        red_flags.append(f"High Sensationalism: {sensationalism['reasoning']}")
        
    if source_check["status"] == "Suspicious":
        score -= 40
        red_flags.append(f"Suspicious Source: {source_check['reasoning']}")
    elif source_check["status"] == "Reliable":
        score += 30 # Bonus for reputable source
    
    # Cap score if no sources found and short text
    if not url and score > 60:
        score = 60 # Cap at "Mixed" if we have no external proof
    
    # 3. Final Score
    final_score = max(0, min(100, score))
    
    verdict = "Reliable"
    if final_score < 65: verdict = "Mixed/Suspicious" # Increased threshold
    if final_score < 30: verdict = "Likely Fake"
    
    explanation = f"Analysis based on heuristics: {len(red_flags)} red flags detected."
    if not red_flags:
        if final_score <= 60:
             explanation = "Content is neutral but lacks verifiable sources/context."
        else:
             explanation = "Content appears neutral and follows standard writing patterns."

    # 4. Generate Professional Explanation using Gemini (LLM)
    from app.services.llm_explainer import llm_explainer
    ai_result = llm_explainer.generate_explanation(text, verdict, fact_check_result, news_result, red_flags)
    
    category = "Others"
    if ai_result:
        if isinstance(ai_result, dict):
            explanation = ai_result.get("explanation", explanation)
            category = ai_result.get("category", "Others")
        else:
            explanation = ai_result # Fallback if string returned

    # 4.2 Enforce Fixed Categories & Heuristic Fallback
    valid_categories = ["Politics", "Entertainment", "Technology", "Health", "Business", "Others"]
    
    if category not in valid_categories:
        category = "Others"
        
    # If LLM failed or returned Others, try simple keyword matching to improve UX
    if category == "Others":
        lower_text = (text or "").lower()
        if any(w in lower_text for w in ["election", "vote", "senate", "congress", "president", "policy", "law"]):
            category = "Politics"
        elif any(w in lower_text for w in ["movie", "film", "actor", "celebrity", "song", "album", "star"]):
            category = "Entertainment"
        elif any(w in lower_text for w in ["iphone", "google", "microsoft", "ai", "software", "app", "cyber"]):
            category = "Technology"
        elif any(w in lower_text for w in ["virus", "doctor", "hospital", "cancer", "study", "vaccine"]):
            category = "Health"
        elif any(w in lower_text for w in ["stock", "market", "economy", "bank", "trade", "ceo"]):
            category = "Business"

    return {
             "verdict": verdict,
             "credibility_score": final_score,
             "explanation": explanation,
             "category": category, # NEW FIELD
             "red_flags": red_flags,
             "ml_breakdown": {"fake_prob": 0.0, "real_prob": 0.0, "opinion_prob": 0.0},
             "source_verification": None,
             "sentiment_analysis": sensationalism.get("sentiment", {}),
             "news_coverage": news_result
        }
