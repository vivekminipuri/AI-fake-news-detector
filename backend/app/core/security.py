import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

# Initialize Firebase Admin
cred = None
try:
    cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin Initialized Successfully")
except Exception as e:
    print(f"Warning: Could not initialize Firebase: {e}")

security = HTTPBearer()

def verify_firebase_token(res: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase ID Token passed in the Authorization header.
    Returns the decoded token (dict) if valid.
    """
    token = res.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    """
    Dependency to get the current user from the token.
    Can be extended to fetch full user profile from DB.
    """
    return {
        "uid": token_data["uid"],
        "email": token_data.get("email"),
        "name": token_data.get("name")
    }
