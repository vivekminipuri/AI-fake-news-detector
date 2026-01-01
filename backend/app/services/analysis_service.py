import sys
import os
import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException
from deep_translator import GoogleTranslator
import re

# Add AI Engine to path so we can import it
# Assuming strict directory structure: backend/app/services -> ../../../ai-engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai-engine')))

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

def translate_and_clean(text: str) -> dict:
    cleaned = text.strip()
    original = text
    is_translated = False
    
    try:
        # Translate to English (auto detect source)
        translator = GoogleTranslator(source='auto', target='en')
        translated = translator.translate(cleaned)
        
        if translated and translated.lower() != cleaned.lower():
            cleaned = translated
            is_translated = True
            
    except Exception as e:
        print(f"Translation failed: {e}")
        
    # Clean Text
    cleaned = re.sub(r'[^\x00-\x7F]+', '', cleaned)
    cleaned = re.sub(r'#\w+', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return {
        "text": cleaned,
        "original": original if is_translated else None,
        "is_translated": is_translated
    }

def extract_text_from_url(url: str) -> str:
    """
    Simple scraper to fetch text from a URL.
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
    # 1. Input Processing
    if url and not text:
        text = extract_text_from_url(url)
    
    if not text:
         raise HTTPException(status_code=400, detail="No content to analyze.")

    dataset = translate_and_clean(text)
    processed_text = dataset["text"]
    
    # --- SCORING VARIABLES ---
    fact_check_score = 50 # Default neutral
    news_presence_score = 20 # Default low (not found)
    consistency_score = 50 # Neutral
    
    verdict_sources = []
    
    # 2. Google Fact Check API
    query_text = processed_text[:500]
    fact_check_result = fact_checker.verify_claim(query_text)
    
    if fact_check_result:
        rating = fact_check_result["rating"].lower()
        if any(x in rating for x in ["false", "fake", "incorrect", "pants on fire"]):
            fact_check_score = 0
        elif any(x in rating for x in ["misleading", "missing context", "partly"]):
            fact_check_score = 40
        elif any(x in rating for x in ["true", "correct", "verified"]):
            fact_check_score = 100
        else:
            fact_check_score = 50 # Unknown rating type
            
        verdict_sources.append(fact_check_result["publisher"])
        
    # 3. News API verification
    from app.services.news_verifier import news_verifier
    news_result = news_verifier.verify_news_presence(query_text)
    
    if news_result:
        total = news_result["total_articles"]
        trusted_count = len(news_result["trusted_articles"])
        
        if trusted_count >= 3:
            news_presence_score = 100
        elif trusted_count >= 1:
            news_presence_score = 70
        elif total > 0:
            news_presence_score = 40 # Found but not in highly trusted list
        else:
            news_presence_score = 0 # Not found
            
        if news_result["has_trusted_coverage"]:
            verdict_sources.append("Mainstream Media")

    # 4. Consistency Score Logic
    if fact_check_result:
        consistency_score = 100 # High consistency if fact checked
    elif news_result and news_result["has_trusted_coverage"]:
        consistency_score = 80 # Consistent with news
    else:
        # Logic for "Silence" or "Inconsistency"
        # If text makes a big claim (e.g. "breaking", "announced") but News Score is 0 -> Consistency score drops
        if "breaking" in processed_text.lower() and news_presence_score == 0:
            consistency_score = 20
        else:
            consistency_score = 50 # Unknown
            
    # 5. Final Weighted Calculation
    # Formula: (0.45 * FC) + (0.35 * News) + (0.20 * Consistency)
    weighted_score = (0.45 * fact_check_score) + (0.35 * news_presence_score) + (0.20 * consistency_score)
    final_score = int(weighted_score)
    
    # 6. Groq Report Generation
    from app.services.llm_explainer import llm_explainer
    
    # Initial verdict for LLM context
    initial_verdict_str = f"{final_score}/100"
    
    ai_result = llm_explainer.generate_explanation(processed_text, initial_verdict_str, fact_check_result, news_result, [])
    
    # Default values
    verdict = "Partially True"
    explanation = "Analysis complete. See detailed breakdown."
    warnings = []
    category = "General"
    
    if ai_result:
        explanation = ai_result.get("reasoning_summary", explanation)
        verdict = ai_result.get("verdict", "Partially True")
        warnings = ai_result.get("warnings", [])
        category = ai_result.get("category", "General")
        
        # We respect the LLM's classification if provided, but the user spec focused on the report
        
    return {
        "verdict": verdict,
        "credibility_score": final_score,
        "explanation": explanation, # Maps to "Reasoning Summary"
        "red_flags": warnings, # Maps to "Warnings"
        "verified_sources": verdict_sources,
        "translated_content": dataset["original"],
        "category": category, # Legacy field
        "ml_breakdown": {"fake_prob": 0.0, "real_prob": 0.0, "opinion_prob": 0.0},
        "source_verification": fact_check_result,
        "news_coverage": news_result,
        "sentiment_analysis": ai_result.get("tone_analysis", {}) # Pass the extracted tone data
    }
