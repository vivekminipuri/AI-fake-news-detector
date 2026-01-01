from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings

from app.db.mongodb import connect_to_mongo, close_mongo_connection

# DB connection logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

from app.api.v1.endpoints import auth, analyze, history
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["analyze"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["history"])
from app.api.v1.endpoints import translate, chat, blogs, users
app.include_router(translate.router, prefix=f"{settings.API_V1_STR}/translate", tags=["translate"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(blogs.router, prefix=f"{settings.API_V1_STR}/blogs", tags=["blogs"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
print(f"Loaded Router: /translate, /chat, /blogs, /users")

# Set all CORS enabled origins
# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    # Allow any localhost origin (http/https, localhost/127.0.0.1, any port)
    allow_origin_regex=r"https?://(?:localhost|127\.0\.0\.1)(?::\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to AI Fake News Detector API"}
