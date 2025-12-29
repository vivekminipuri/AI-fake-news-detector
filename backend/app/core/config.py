from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Fake News Detector"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "fake_news_db"

    # Security
    GOOGLE_APPLICATION_CREDENTIALS: str = "app/core/firebase_credentials.json"
    GOOGLE_FACT_CHECK_KEY: str = "" # API Key loaded from .env
    NEWS_API_KEY: str = "" # API Key loaded from .env
    GEMINI_API_KEY: str = "" # API Key loaded from .env

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# For direct access to settings