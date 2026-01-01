import sys
import os
import asyncio

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test():
    print("Importing analysis_service...")
    try:
        from app.services import analysis_service
        print("Success.")
    except Exception as e:
        print(f"Import Error: {e}")
        return

    print("Testing News API with 'Rahul Gandhi...' Story...")
    text = "Rahul Gandhi Becomes Prime Minister of India in 2023. In a surprising and unprecedented political development... According to unverified sources, the decision was taken unanimously... Political experts claim this historic transition marks..."
    try:
        from app.core.config import settings
        print(f"News API Key Present: {bool(settings.NEWS_API_KEY)}")
        print(f"Gemini API Key Present: {bool(settings.GEMINI_API_KEY)}")
        result = await analysis_service.perform_analysis(text, "")
        print(f"\nVERDICT: {result['verdict']}")
        print(f"EXPLANATION: {result['explanation']}")
    except Exception as e:
        print(f"RUNTIME ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
