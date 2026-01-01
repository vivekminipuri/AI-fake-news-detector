
from groq import Groq
from app.core.config import settings
import os

print("Checking Groq Models...")
key = settings.GROQ_API_KEY
if not key:
    print("No key found!")
else:
    try:
        client = Groq(api_key=key)
        models = client.models.list()
        print("\nAvailable Models:")
        for m in models.data:
            print(f"- {m.id}")
    except Exception as e:
        print(f"Error listing models: {e}")
