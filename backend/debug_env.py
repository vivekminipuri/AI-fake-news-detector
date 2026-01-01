import os
from dotenv import load_dotenv, find_dotenv

# Try to find .env
env_path = find_dotenv()
print(f"Found .env at: {env_path}")

# Load it
load_dotenv(env_path)

# Check raw env var
key = os.getenv("GROQ_API_KEY")
print(f"Raw GROQ_API_KEY present: {bool(key)}")
if key:
    print(f"Key length: {len(key)}")
    print(f"First 4 chars: {key[:4]}")

# Check Settings
from app.core.config import settings
print(f"Settings GROQ_API_KEY present: {bool(settings.GROQ_API_KEY)}")
