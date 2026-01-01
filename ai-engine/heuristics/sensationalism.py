from textblob import TextBlob
from config.config import Config

def analyze_sensationalism(text: str):
    """
    Analyzes text for sensationalism using Sentiment Analysis.
    High subjectivity and extreme polarity suggest sensationalism.
    
    Returns:
        dict: {
            "score": float (0.0 to 1.0, where 1.0 is highly sensational),
            "reasoning": str,
            "sentiment": dict
        }
    """
    blob = TextBlob(text)
    sentiment = blob.sentiment
    
    # 1. Subjectivity check (Opinions vs Facts)
    # High subjectivity (near 1.0) is a red flag for news.
    subjectivity_score = sentiment.subjectivity 
    
    # 2. Polarity intensity check (Extreme positive/negative)
    # Neutral news should be near 0. Extreme is near -1 or +1.
    polarity_intensity = abs(sentiment.polarity)
    
    # Calculate weighted sensationalism score
    # We give more weight to subjectivity for fake news detection
    sensationalism_score = (subjectivity_score * 0.7) + (polarity_intensity * 0.3)
    
    reasoning = []
    if subjectivity_score > 0.5:
        reasoning.append(f"High subjectivity ({subjectivity_score:.2f}) detects opinionated language.")
    if polarity_intensity > 0.6:
        reasoning.append(f"Extreme sentiment ({sentiment.polarity:.2f}) indicates potential bias.")
        
    return {
        "score": round(sensationalism_score, 2),
        "reasoning": " ".join(reasoning) if reasoning else "Language appears neutral and objective.",
        "sentiment": {
            "polarity": round(sentiment.polarity, 2),
            "subjectivity": round(sentiment.subjectivity, 2)
        }
    }
