from urllib.parse import urlparse
from config.config import Config

# Simple static lists for demonstration
# In a real app, this would be a database or larger file
SUSPICIOUS_DOMAINS = {
    "fake-news.com", "shady-site.net", "conspiracy-theories.org",
    "real-raw-news.com", "infowars.com", "beforeitsnews.com"
}

RELIABLE_DOMAINS = {
    "bbc.com", "cnn.com", "reuters.com", "apnews.com", 
    "npr.org", "pbs.org", "nytimes.com", "nasa.gov"
}

def check_source_reliability(url: str):
    """
    Checks if the source domain is in a known reliable or suspicious list.
    
    Returns:
        dict: {
            "score": int (0=Suspicious, 100=Reliable, 50=Unknown),
            "status": str ("Reliable", "Suspicious", "Unknown"),
            "domain": str,
            "reasoning": str
        }
    """
    if not url:
        return {
            "score": 50,
            "status": "Unknown",
            "domain": "",
            "reasoning": "No source URL provided."
        }
        
    try:
        domain = urlparse(url).netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
            
        if domain in SUSPICIOUS_DOMAINS:
            return {
                "score": 0,
                "status": "Suspicious",
                "domain": domain,
                "reasoning": f"Source '{domain}' is in our list of known suspicious sites."
            }
            
        if domain in RELIABLE_DOMAINS:
            return {
                "score": 100,
                "status": "Reliable",
                "domain": domain,
                "reasoning": f"Source '{domain}' is a known reliable news outlet."
            }
            
        return {
            "score": 50,
            "status": "Unknown",
            "domain": domain,
            "reasoning": f"Source '{domain}' is not in our verified database."
        }
        
    except Exception:
        return {
            "score": 50,
            "status": "Unknown",
            "domain": "Invalid URL",
            "reasoning": "Could not parse source URL."
        }
