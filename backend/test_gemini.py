import requests
import os
from app.core.config import settings

def test_models():
    api_key = settings.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    print(f"Listing models from: {url.split('?')[0]}...")
    
    try:
        response = requests.get(url, timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Available Gemini Models:")
            for m in data.get('models', []):
                if "gemini" in m['name']:
                    print(f"- {m['name']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_models()
