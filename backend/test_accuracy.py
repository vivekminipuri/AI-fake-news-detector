import sys
import os
import asyncio

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def run_tests():
    try:
        from app.services import analysis_service
        from app.core.config import settings
        print(f"News API Key Present: {bool(settings.NEWS_API_KEY)}")
        print(f"Fact Check Key Present: {bool(settings.GOOGLE_FACT_CHECK_KEY)}")
    except ImportError as e:
        print(f"Import Error: {e}")
        return

    test_cases = [
        {
            "type": "OBVIOUS FAKE",
            "text": "Breaking News: Aliens have landed in New York City today. The President has declared a galactic emergency. Sources say they come in peace."
        },
        {
            "type": "REAL EVENT",
            "text": "India wins T20 World Cup 2024 after beating South Africa in the final."
        },
        {
            "type": "USER EXAMPLE (Fake)",
            "text": "Rahul Gandhi Becomes Prime Minister of India in 2023. In a surprising and unprecedented political development... According to unverified sources, the decision was taken unanimously."
        }
    ]

    print("\nStarting Accuracy Tests...\n" + "="*50)

    for case in test_cases:
        print(f"\nTesting: {case['type']}")
        print(f"Query: {case['text'][:60]}...")
        try:
            result = await analysis_service.perform_analysis(case['text'], "")
            print(f"Verdict: {result['verdict']}")
            print(f"Score: {result['credibility_score']}")
            print(f"Red Flags: {len(result['red_flags'])}")
            if result.get('news_coverage'):
                print(f"News Coverage: {result['news_coverage']['total_articles']} articles")
            else:
                print("News Coverage: None")
            print(f"Source Check: {result.get('source_verification') is not None}")
        except Exception as e:
            print(f"ERROR: {e}")
        print("-" * 30)

if __name__ == "__main__":
    asyncio.run(run_tests())
