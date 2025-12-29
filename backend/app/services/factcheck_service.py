import requests
from app.core.config import settings

class FactChecker:
    def __init__(self):
        print("Initializing FactChecker Service (Sync)...")
        self.api_key = settings.GOOGLE_FACT_CHECK_KEY
        self.base_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

    def verify_claim(self, query: str):
        """
        Check if a claim has been verified by fact-checkers.
        Uses synchronous requests.
        """
        if not self.api_key:
            return None

        try:
            response = requests.get(
                self.base_url,
                params={
                    "key": self.api_key,
                    "query": query,
                    "languageCode": "en"
                },
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"FactCheck API Error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            print(f"\n[FactCheck API] Response: {data}") # LOGGING
            if not data or "claims" not in data:
                return None
            
            # Process the first/best match
            claim = data["claims"][0]
            review = claim.get("claimReview", [{}])[0]
            
            return {
                "found": True,
                "publisher": review.get("publisher", {}).get("name", "Unknown"),
                "rating": review.get("textualRating", "Unknown"),
                "url": review.get("url", ""),
                "title": claim.get("text", "")
            }

        except Exception as e:
            print(f"Fact Check API Error: {e}")
            return None

fact_checker = FactChecker()
print("FactChecker Service Ready.")
