import re

def check_reliability_patterns(text: str):
    """
    Analyzes text for 'hedge words' and signs of unreliable attribution
    that suggest gossip or unverified content.
    """
    text_lower = text.lower()
    
    # Phrases often used in fake news to avoid liability
    suspicious_phrases = [
        "unverified sources",
        "according to rumors",
        "sources claim",
        "allegedly",
        "it is believed",
        "experts claim", # Vague appeal to authority
        "critics have questioned", # Vague
        "social media platforms were flooded", # Appeal to popularity
        "no official press release",
        "mainstream media is silent",
        "what they don't want you to know",
        "viral message",
        "forwarded many times"
    ]
    
    found_phrases = []
    for phrase in suspicious_phrases:
        if phrase in text_lower:
            found_phrases.append(phrase)
            
    score = 0.0
    reasoning = "Attribution seems standard."
    
    if found_phrases:
        # High score means BAD reliability (lots of hedge words)
        score = min(1.0, len(found_phrases) * 0.3)
        reasoning = f"Contains vague/unverifiable attribution: {', '.join(found_phrases)}"
        
    return {
        "score": score, # 0.0 = Reliable, 1.0 = Highly Suspicious
        "reasoning": reasoning,
        "flags": found_phrases
    }
