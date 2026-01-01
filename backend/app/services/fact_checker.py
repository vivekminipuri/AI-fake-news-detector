import requests
from app.core.config import settings

class FactChecker:
    def __init__(self):
        print("Initializing FactChecker Service (Sync)...")
        self.api_key = settings.GOOGLE_FACT_CHECK_KEY
        self.base_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculates Jaccard similarity between two texts, ignoring common stopwords.
        """
        stopwords = {'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'is', 'are', 'was', 'were', 'be', 'has', 'have', 'had', 'it', 'this', 'that'}
        
        def tokenize(text):
            # Simple tokenizer: lowercase, remove non-alphanumeric (simplified), split
            words = text.lower().replace('.', '').replace(',', '').replace('?', '').split()
            return set(w for w in words if w not in stopwords)

        set1 = tokenize(text1)
        set2 = tokenize(text2)
        
        if not set1 or not set2:
            return 0.0
            
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        return len(intersection) / len(union)

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
            
            best_match = None
            highest_similarity = 0.0
            SIMILARITY_THRESHOLD = 0.2 # Conservative threshold: at least 20% word overlap
            
            # Iterate through claims to find the best semantic match
            for claim in data["claims"]:
                claim_text = claim.get("text", "")
                similarity = self.calculate_similarity(query, claim_text)
                
                print(f"Checking claim: '{claim_text}' | Similarity: {similarity:.2f}")
                
                if similarity > highest_similarity:
                    highest_similarity = similarity
                    best_match = claim

            if not best_match or highest_similarity < SIMILARITY_THRESHOLD:
                print(f"No sufficient match found. Max similarity: {highest_similarity:.2f}")
                return None

            # Process the best match
            review = best_match.get("claimReview", [{}])[0]
            
            return {
                "found": True,
                "publisher": review.get("publisher", {}).get("name", "Unknown"),
                "rating": review.get("textualRating", "Unknown"),
                "url": review.get("url", ""),
                "title": best_match.get("text", "")
            }

        except Exception as e:
            print(f"Fact Check API Error: {e}")
            return None

fact_checker = FactChecker()
print("FactChecker Service Ready.")
