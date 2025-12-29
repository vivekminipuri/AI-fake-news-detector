import os

class Config:
    # Thresholds for Credibility Score (0-100)
    SCORE_THRESHOLDS = {
        "RELIABLE": 80,
        "MIXED": 50,
        "SUSPICIOUS": 30,
        # Below 30 is LIKELY FAKE
    }

    # Model Configurations
    # Using a distilled model for faster inference on CPU
    FAKE_NEWS_MODEL_NAME = "typeform/distilbert-base-uncased-mnli" # Lightweight Zero-shot (<300MB)
    SENTIMENT_MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"

    # Heuristics
    MAX_SENTIMENT_POLARITY = 0.8 # Absolute value > 0.8 considered extreme/sensational
    CLICKBAIT_KEYWORDS = [
        "shocking", "you won't believe", "mind blowing", "miracle", 
        "secret", "exposed", "banned", "can't miss"
    ]

    # API Keys (Passed from environment or backend)
    GOOGLE_FACT_CHECK_KEY = os.getenv("GOOGLE_FACT_CHECK_KEY", "")
