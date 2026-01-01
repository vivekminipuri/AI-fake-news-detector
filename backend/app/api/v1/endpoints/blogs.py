from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.db.mongodb import get_database
from app.core import security

router = APIRouter()

# --- Schemas ---
class AuthorInfo(BaseModel):
    uid: str
    name: Optional[str] = "Anonymous"
    photo_url: Optional[str] = ""

class Comment(BaseModel):
    user_id: str
    username: Optional[str] = "Anonymous"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BlogPostCreate(BaseModel):
    title: str
    content: str
    category: str = "General"
    tags: List[str] = []

class BlogPostDB(BlogPostCreate):
    id: str = Field(alias="_id")
    author: AuthorInfo
    created_at: datetime
    likes: int = 0
    liked_by: List[str] = []
    comments: List[Comment] = []
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CreateCommentRequest(BaseModel):
    content: str

# --- Endpoints ---

@router.get("", response_model=List[BlogPostDB])
async def get_posts(db: AsyncIOMotorClient = Depends(get_database)):
    """Get all community posts."""
    try:
        posts = await db["posts"].find().sort("created_at", -1).to_list(100)
        results = []
        for p in posts:
            p["_id"] = str(p["_id"])
            p["id"] = p["_id"]
            
            if "author_id" in p and "author" not in p:
                p["author"] = {
                    "uid": p["author_id"],
                    "name": p.get("author_name") or "Anonymous",
                    "photo_url": p.get("photo_url") or ""
                }
            
            if "comments" not in p or p["comments"] is None:
                p["comments"] = []
            
            if "liked_by" not in p:
                p["liked_by"] = []
                
            # Handle username null in comments
            for c in p["comments"]:
                if not c.get("username"):
                    c["username"] = "Anonymous"
            
            results.append(p)
        return results
    except Exception as e:
        print(f"Error fetching posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=BlogPostDB)
async def create_post(
    post: BlogPostCreate,
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Create a new community post."""
    try:
        new_post = {
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "tags": post.tags,
            "author": {
                "uid": current_user["uid"],
                "name": current_user.get("name") or "Anonymous",
                "photo_url": current_user.get("photo_url") or ""
            },
            "created_at": datetime.utcnow(),
            "likes": 0,
            "liked_by": [],
            "comments": []
        }
        
        result = await db["posts"].insert_one(new_post)
        new_post["_id"] = str(result.inserted_id)
        new_post["id"] = new_post["_id"]
        return new_post
    except Exception as e:
        print(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{post_id}/comments", response_model=BlogPostDB)
async def add_comment(
    post_id: str,
    comment: CreateCommentRequest,
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Add a comment to a post."""
    try:
        query = {"_id": ObjectId(post_id)} if ObjectId.is_valid(post_id) else {"_id": post_id}
            
        new_comment = {
            "user_id": current_user["uid"],
            "username": current_user.get("name") or "Anonymous",
            "content": comment.content,
            "created_at": datetime.utcnow()
        }
        
        result = await db["posts"].update_one(
            query,
            {"$push": {"comments": new_comment}}
        )
        
        if result.modified_count == 0:
             raise HTTPException(status_code=404, detail="Post not found")
             
        updated_post = await db["posts"].find_one(query)
        updated_post["_id"] = str(updated_post["_id"])
        updated_post["id"] = updated_post["_id"]
        
        if "author_id" in updated_post and "author" not in updated_post:
             updated_post["author"] = {
                "uid": updated_post["author_id"],
                "name": updated_post.get("author_name") or "Anonymous",
                "photo_url": ""
            }
        
        if "liked_by" not in updated_post:
            updated_post["liked_by"] = []

        for c in updated_post.get("comments", []):
            if not c.get("username"):
                c["username"] = "Anonymous"
                
        return updated_post
    except Exception as e:
        print(f"Error adding comment: {e}")
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{post_id}/like", response_model=BlogPostDB)
async def like_post(
    post_id: str,
    current_user: dict = Depends(security.get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Toggle like for a post (unique per user)."""
    uid = current_user["uid"]
    query = {"_id": ObjectId(post_id)} if ObjectId.is_valid(post_id) else {"_id": post_id}
    
    try:
        # Check if user already liked
        post = await db["posts"].find_one(query)
        if not post:
             raise HTTPException(status_code=404, detail="Post not found")
             
        liked_by = post.get("liked_by", [])
        
        if uid in liked_by:
            # Unlike
            await db["posts"].update_one(
                query,
                {
                    "$pull": {"liked_by": uid},
                    "$inc": {"likes": -1}
                }
            )
        else:
            # Like
            await db["posts"].update_one(
                query,
                {
                    "$addToSet": {"liked_by": uid},
                    "$inc": {"likes": 1}
                }
            )
            
        updated_post = await db["posts"].find_one(query)
        updated_post["_id"] = str(updated_post["_id"])
        updated_post["id"] = updated_post["_id"]
        
        # Mapping for result
        if "author_id" in updated_post and "author" not in updated_post:
             updated_post["author"] = {
                "uid": updated_post["author_id"],
                "name": updated_post.get("author_name") or "Anonymous",
                "photo_url": ""
            }
        if "liked_by" not in updated_post:
            updated_post["liked_by"] = []
            
        return updated_post
    except Exception as e:
        print(f"Error liking post: {e}")
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
