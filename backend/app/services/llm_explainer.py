import requests
import json
from app.core.config import settings

class LLMExplainer:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

    def generate_explanation(self, text: str, verdict: str, fact_check: dict, news_coverage: dict, red_flags: list) -> str:
        """
        Generates a 2-3 sentence summary explaining WHY the content is Fake/Real/Suspicious.
        """
        if not self.api_key:
            return None # Fallback to standard messages

        # Construct the context for Gemini
        context = f"""
        Act as a professional Fact-Checking Assistant. Summarize why this news is {verdict}.
        
        Claim: "{text[:300]}..."
        
        Evidence:
        1. Google Fact Check: {f"Verified by {fact_check['publisher']} as {fact_check['rating']}" if fact_check else "No direct fact-check found."}
        2. Mainstream News Coverage: {f"Found {news_coverage['total_articles']} matches via NewsAPI" if news_coverage else "No mainstream media coverage found."}
        3. Red Flags Detected: {", ".join(red_flags) if red_flags else "None."}
        
        Task:
        Return a valid JSON object with two keys:
        1. "explanation": A concise, neutral (2-3 sentences) summary of WHY it is {verdict}. Start directly.
        2. "category": EXACTLY ONE of: ["Politics", "Entertainment", "Technology", "Health", "Business"]. 
           If it fits none, use "Others". Do NOT invent new categories.
        
        Example JSON:
        {{
            "explanation": "This claim is likely fake because...",
            "category": "Politics"
        }}
        """
        
        payload = {
            "contents": [{"parts": [{"text": context}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json"
            }
        }
        
        try:
            response = requests.post(self.url, json=payload, timeout=8)
            if response.status_code != 200:
                print(f"Gemini API Error: {response.text}")
                return None
                
            data = response.json()
            print(f"\n[Gemini API] Full Response: {data}") # LOGGING
            
            # Extract text
            text_resp = data['candidates'][0]['content']['parts'][0]['text']
            
            # Clean and parse JSON
            clean_json = text_resp.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_json)
            
            print(f"[Gemini API] Generated: {parsed}") # LOGGING
            return parsed
            
        except Exception as e:
            print(f"LLM Explainer Failed: {e}")
            return None

    
    def generate_dashboard_insights(self, history: list) -> dict:
        """
        Analyzes user history to generate a 'Truth Profile'.
        Returns JSON with persona, interests, and skepticism score.
        """
        if not self.api_key or not history:
            return None

        # Prepare summary of last 20 items
        items_summary = []
        for item in history[:20]:
            content = item.get("content", "")[:50]
            verdict = item.get("verdict", "Unknown")
            items_summary.append(f"- '{content}...' ({verdict})")
            
        history_text = "\n".join(items_summary)
        
        context = f"""
        Act as a Data Analyst. Analyze this user's checking history to build a 'Truth Profile'.
        
        User History:
        {history_text}
        
        Task:
        Return a valid JSON object (NO markdown formatting) with:
        1. "persona": A fun title (e.g., "The Skeptic", "The Political Junkie", "Gullible Goose").
        2. "insight": One sentence commentary on their habits.
        3. "interests": List of top 3 topics they check (e.g., Politics, Tech, health) with approximate percentage.
        4. "fake_news_hit_rate": Percentage of their checks that turned out to be FAKE (0-100).
        
        Example JSON:
        {{
            "persona": "The Mythbuster",
            "insight": "You mainly check political rumors and have a high success rate in spotting fakes.",
            "interests": [{{"topic": "Politics", "percent": 60}}, {{"topic": "Health", "percent": 40}}],
            "fake_news_hit_rate": 75
        }}
        """
        
        payload = {
            "contents": [{"parts": [{"text": context}]}],
            "generationConfig": {
                "temperature": 0.5,
                "responseMimeType": "application/json" # Ask for JSON mode if supported, else reliance on prompt
            }
        }
        
        try:
            response = requests.post(self.url, json=payload, timeout=10)
            if response.status_code != 200:
                 print(f"Gemini Insights Error: {response.text}")
                 return None
            
            data = response.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            
            # Remove Markdown code blocks if present
            clean_json = text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
            
        except Exception as e:
            print(f"Gemini Insights Failed: {e}")
            return None

llm_explainer = LLMExplainer()
