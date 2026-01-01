import requests
import urllib.parse
from app.core.config import settings
from datetime import datetime, timedelta

class NewsVerifier:
    def __init__(self):
        print("Initializing NewsVerifier Service...")
        self.api_key = settings.NEWS_API_KEY
        self.base_url = "https://newsapi.org/v2/everything"
        
        # Trusted mainstream domains (Allowlist)
        self.trusted_domains = [
            "bbc.co.uk", "cnn.com", "reuters.com", "apnews.com", 
            "nytimes.com", "washingtonpost.com", "theguardian.com",
            "bloomberg.com", "ndtv.com", "indiatoday.in", "thehindu.com",
            "timesofindia.indiatimes.com", "indianexpress.com"
        ]

    def verify_news_presence(self, query: str):
        """
        Check if the topic is being reported by trusted news sources.
        Returns detailed stats on coverage.
        """
        if not self.api_key:
            print("WARNING: News API Key not found.")
            return None

        # Clean query: Remove huge blobs of text, keep first 100 chars or standard keywords
        # For better results, we might want to extract keywords, but for now use the headline/first sentence
        search_query = query[:100]
        
        # Calculate date range (last 30 days is standard for newsapi free tier)
        # But for 'breaking news' checking, last 7 days is better.
        # Let's verify 'everything' endpoint logic.
        
        try:
            params = {
                "q": search_query,
                "apiKey": self.api_key,
                "language": "en",
                "sortBy": "relevance",
                "pageSize": 10,
                # Restrict to trusted domains if possible, or filter results later.
                # Adding 'domains' param might start filtering too aggressively if list is incomplete.
                # Let's search broadly first, then filter.
            }
            
            response = requests.get(self.base_url, params=params, timeout=5)
            
            if response.status_code != 200:
                print(f"NewsAPI Error: {response.status_code} - {response.text}")
                return None
                
            data = response.json()
            articles = data.get("articles", [])
            
            # Analyze results
            print(f"\n[News API] Raw Response Articles Count: {len(articles)}") # LOGGING
            # print(f"[News API] First Article: {articles[0] if articles else 'None'}") 
            
            total_matches = len(articles)
            trusted_sources_found = []
            
            for article in articles:
                source_name = article.get("source", {}).get("name", "").lower()
                url = article.get("url", "")
                
                # Check if this article comes from our trusted list logic (basic check)
                is_trusted = any(domain in url for domain in self.trusted_domains)
                
                if is_trusted:
                    trusted_sources_found.append({
                        "source": source_name,
                        "title": article.get("title"),
                        "url": url,
                        "publishedAt": article.get("publishedAt")
                    })
            
            return {
                "total_articles": total_matches,
                "trusted_articles": trusted_sources_found,
                "has_trusted_coverage": len(trusted_sources_found) > 0,
                "top_match": articles[0] if articles else None
            }

        except Exception as e:
            print(f"NewsAPI Exception: {e}")
            return None

news_verifier = NewsVerifier()
print("NewsVerifier Service Ready.")
