from fastapi import APIRouter, Depends
from app.core import security

router = APIRouter()

@router.get("/me")
def read_users_me(current_user: dict = Depends(security.get_current_user)):
    """
    Fetch the current logged-in user details.
    """
    return current_user
