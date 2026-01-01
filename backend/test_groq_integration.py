import asyncio
from app.services.llm_explainer import llm_explainer

async def test_groq():
    print("Testing Groq Integration...")
    text = "Narendra Modi is the Prime Minister of India in 2025."
    # Simulate evidence
    fact_check = {"publisher": "Google Fact Check", "rating": "No result found"} # Simulating no direct hit
    news_coverage = {"total_articles": 0, "trusted_articles": []} # Simulating silence
    red_flags = ["No mainstream media coverage found."]

    result = llm_explainer.generate_explanation(text, "Suspicious", fact_check, news_coverage, red_flags)
    
    if result:
        print("\nSUCCESS! Groq Response Received:")
        print(f"Explanation: {result.get('explanation')}")
        print(f"Category: {result.get('category')}")
        print(f"Credibility Score: {result.get('credibility_score')}")
        print(f"Verdict: {result.get('verdict')}")
    else:
        print("\nFAILURE: No response from Groq.")

if __name__ == "__main__":
    asyncio.run(test_groq())
