from datetime import datetime
try:
    from transformers import pipeline
except ImportError:
    pipeline = None

from heuristics.sensationalism import analyze_sensationalism
from heuristics.clickbait import detect_clickbait
from heuristics.source_check import check_source_reliability
from config.config import Config

# Global Model Cache
_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        if pipeline is None:
             raise ImportError("Transformers library not installed.")
        print(f"Loading Model: {Config.FAKE_NEWS_MODEL_NAME}...")
        try:
            _classifier = pipeline("zero-shot-classification", model=Config.FAKE_NEWS_MODEL_NAME)
        except Exception as e:
            print(f"CRITICAL MODEL ERROR: Could not load AI Model. {e}")
            print("Using Fallback Mock Classifier.")
            
            # Mock CLassifier Function
            def mock_classifier(text, candidate_labels):
                return {
                    "labels": candidate_labels,
                    "scores": [1.0/len(candidate_labels)] * len(candidate_labels)
                }
            _classifier = mock_classifier
    return _classifier

def detect_fake_news(text: str, url: str = ""):
    """
    Main entry point for AI Engine.
    
    Args:
        text (str): The content of the news article.
        url (str): The source URL (optional, for domain checking).
        
    Returns:
        dict: valid response matching Backend contract.
    """
    if not text:
        return {
            "credibility_score": 0,
            "verdict": "Likely Fake",
            "explanation": "No text content provided for analysis.",
            "red_flags": ["Empty content"],
            "sentiment_analysis": {},
            "timestamp": datetime.utcnow().isoformat()
        }

    # 1. Run Heuristics
    clickbait_result = detect_clickbait(text.split('\n')[0]) # Assume first line is headline
    sensationalism_result = analyze_sensationalism(text)
    source_result = check_source_reliability(url)
    
    # 2. Run ML Classification
    # We use Zero-Shot to classify text into: "real news", "fake news", "opinion"
    classifier = get_classifier()
    labels = ["real news", "fake news", "subjective opinion"]
    
    # Truncate text for model if too long (BART limit is usually 1024 tokens)
    # We take the first 1000 chars roughly to be safe and fast
    truncated_text = text[:1500] 
    
    ml_result = classifier(truncated_text, candidate_labels=labels)
    scores = dict(zip(ml_result['labels'], ml_result['scores']))
    
    fake_confidence = scores.get("fake news", 0.0)
    real_confidence = scores.get("real news", 0.0)
    opinion_confidence = scores.get("subjective opinion", 0.0)
    
    # 3. Calculate Final Credibility Score (0-100)
    # Start with Real Confidence * 100
    base_score = real_confidence * 100
    
    # Penalties
    penalties = 0
    red_flags = []
    
    if clickbait_result['score'] > 0.5:
        penalties += 15
        red_flags.append(clickbait_result['reasoning'])
        
    if sensationalism_result['score'] > 0.5:
        penalties += 15
        red_flags.append(sensationalism_result['reasoning'])
        
    if opinion_confidence > 0.5:
        penalties += 10
        red_flags.append("Content detected as highly subjective/opinionated.")

    # Source Penalties / Bonuses
    if source_result['status'] == "Suspicious":
        penalties += 40 # Major penalty for known fake sites
        red_flags.append(source_result['reasoning'])
    elif source_result['status'] == "Reliable":
        # Boost confidence for known reliable sites
        base_score = max(base_score, 80) # Minimum 80 if reliable source

        
    final_score = max(0, min(100, base_score - penalties))
    
    # 4. Determine Verdict
    verdict = "Reliable"
    if final_score < Config.SCORE_THRESHOLDS["SUSPICIOUS"]:
        verdict = "Likely Fake"
    elif final_score < Config.SCORE_THRESHOLDS["MIXED"]:
        verdict = "Mixed/Suspicious"
    elif final_score < Config.SCORE_THRESHOLDS["RELIABLE"]:
        verdict = "Reliable but Biased"
        
    # 5. Generate Explanation
    explanation_parts = [
        f"The AI model is {real_confidence*100:.1f}% confident this is real news.",
        f"However, we detected {len(red_flags)} red flags." if red_flags else "No significant red flags detected."
    ]
    
    return {
        "credibility_score": round(final_score),
        "verdict": verdict,
        "explanation": " ".join(explanation_parts),
        "sentiment_analysis": sensationalism_result['sentiment'],
        "red_flags": red_flags,
        "ml_breakdown": {
            "fake_prob": round(fake_confidence, 2),
            "real_prob": round(real_confidence, 2),
            "opinion_prob": round(opinion_confidence, 2)
        }
    }
