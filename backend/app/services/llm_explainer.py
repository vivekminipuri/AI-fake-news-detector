from groq import Groq
import json
import re
from app.core.config import settings

class LLMExplainer:
    def __init__(self):
        print("Initializing LLMExplainer (Groq)...")
        self.api_key = settings.GROQ_API_KEY
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                print("Groq Client initialized successfully.")
            except Exception as e:
                print(f"Error initializing Groq Client: {e}")

    def generate_explanation(self, text: str, initial_verdict: str, fact_check: dict, news_coverage: dict, red_flags: list) -> dict:
        """
        Generates a detailed "Senior Journalist" analysis using Groq.
        Returns structured JSON with explanation, dynamic score, tone, and red flags.
        """
        if not self.client:
            print("Groq Client unavailable. Returning None.")
            return None

        # Construct the context
        context = f"""
        You are a Senior Political Journalist and Fact-Checking Expert (20+ years exp).
        Your task: Generate a final authoritative report based on the provided evidence.

        Claim: "{text[:1000]}"
        Calculated Confidence Score: {initial_verdict} (This is a weighted score from our pipeline: 0.45*FactCheck + 0.35*News + 0.2*Consistency)

        Evidence:
        1. Google Fact Check: {f"Verified by {fact_check['publisher']} as {fact_check['rating']}" if fact_check else "No direct fact-check found (Score: 0/100 or 50/100)."}
        2. Mainstream News Coverage: {f"Found {news_coverage['total_articles']} trusted articles. Top match: {news_coverage['trusted_articles'][0]['source'] if news_coverage['trusted_articles'] else 'None'}" if news_coverage else "No mainstream coverage found."}
        3. System Flags: {", ".join(red_flags) if red_flags else "None."}
        
        INSTRUCTIONS:
        1. Analyze the 'Calculated Confidence Score' and the evidence. 
        2. If the score is Low (<50) but you see strong evidence it's real, OVERRIDE it.
        3. If the score is High (>80) but you smell a rat, OVERRIDE it.
        4. Explain your reasoning clearly to a non-technical user.

        OUTPUT FORMAT (Strict JSON):
        {{
            "reasoning_summary": "A clear, neutral, evidence-based summary (3-4 sentences). Explain the verdict and cite specific sources if avail.",
            "verdict": "Real" | "Likely Fake" | "Partially True",
            "category": "Politics" | "Health" | "Technology" | "Entertainment" | "Business" | "General",
            "confidence_score": <int 0-100>,
            "warnings": ["List specific misinformation risks, missing context, or biases detected."],
            "tone_analysis": {{
                "subjectivity": <float 0.0-1.0>,
                "polarity": <float 0.0-1.0 (Emotional Intensity)>
            }}
        }}
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile", # Latest stable model
                messages=[
                    {"role": "system", "content": "You are a Senior Editor and Fact Checker. Output ONLY JSON."},
                    {"role": "user", "content": context}
                ],
                temperature=0.3,
                max_tokens=500,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            response_content = completion.choices[0].message.content
            print(f"\n[Groq API] Response: {response_content[:200]}...") # LOGGING
            
            # Parse JSON
            parsed_result = json.loads(response_content)
            return parsed_result
            
        except Exception as e:
            print(f"Groq Analysis Failed: {e}")
            return None

    def generate_dashboard_insights(self, history: list) -> dict:
        """
        Analyzes user history to generate a 'Truth Profile' using Groq.
        """
        if not self.client or not history:
             return None
             
        # Prepare summary
        items_summary = "\n".join([f"- '{item.get('content', '')[:50]}...' ({item.get('verdict', 'Unknown')})" for item in history[:20]])
        
        prompt = f"""
        Analyze this user's news consumption history to build a 'Truth Profile'.
        History:
        {items_summary}
        
        Return JSON Object:
        {{
            "persona": "Creative Title",
            "insight": "1 sentence insight.",
            "interests": [{{"topic": "Name", "percent": 0}}],
            "fake_news_hit_rate": 0
        }}
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{"role": "system", "content": "You are a Data Analyst. Output JSON."}, {"role": "user", "content": prompt}],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Groq Insights Failed: {e}")
            return None

    def chat_with_expert(self, message: str, history: list = []) -> str:
        """
        Chat with Veritas (AI Media Literacy Expert).
        """
        if not self.client:
             return "I am currently offline. Please check the server configuration."

        system_prompt = """
        You are Veritas, an AI Misinformation Expert and Media Literacy Assistant.
        Your goal is to help users understand news, spot logical fallacies, and verify information.
        
        Guidelines:
        - Be highly knowledgeable and engaging.
        - SHARE EXAMPLES: When asked about trends (e.g. "fake news about AI"), verify common narratives you know about (e.g., Deepfakes of politicians, Voice cloning scams, AI-generated chaos images).
        - DO NOT say "I don't have real-time information" as your primary response. Instead, discuss *known* recent trends and examples from your training data.
        - If asked about a specific URL or text to check, *then* kindly guide them to the 'Analyze' page.
        - Explain complex concepts simply.
        - Keep answers concise but substantive (under 200 words).
        """
        
        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history (last 10 messages for context)
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": message})
        
        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=300
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Chat Failed: {e}")
            return "I encountered an error processing your request."

llm_explainer = LLMExplainer()
