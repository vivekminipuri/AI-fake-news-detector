
content = """BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
MONGODB_URL="mongodb://localhost:27017"
DB_NAME="fake_news_db"
GOOGLE_APPLICATION_CREDENTIALS="app/core/firebase_credentials.json"
GOOGLE_FACT_CHECK_KEY="YOUR_GOOGLE_FACT_CHECK_KEY"
NEWS_API_KEY="YOUR_NEWS_API_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GROQ_API_KEY="YOUR_GROQ_API_KEY"
"""
with open('.env', 'w') as f:
    f.write(content)
print("Environment setup script prepared. Please update .env manually.")
