import logging
from fastapi import APIRouter, HTTPException, status

from src.schemas import UserLogin
import src.services.auth_service as auth_service
from src.db.session import SessionDependency


router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("uvicorn.error")


@router.post("/login")
async def login(
        loginData: UserLogin,
        session: SessionDependency,
    ):
    """Just login page that check """
    logger.info(f"Login email check: {loginData.email}")

    user = await auth_service.getUser(loginData.email, session)

    if user:
        logger.info(f"Login user found: {user.password_hash}")
        return True
    else:
        return False   
