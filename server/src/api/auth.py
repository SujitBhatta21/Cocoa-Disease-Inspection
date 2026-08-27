import logging
from fastapi import APIRouter, HTTPException, status

from src.schemas import UserLogin, UserCreate
import src.services.auth_service as auth_service
from src.db.session import SessionDependency

from src.role import UserRole


router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("uvicorn.error")


@router.post("/login")
async def login(
        loginData: UserLogin,
        session: SessionDependency,
    ):
    """Just login page that check """
    logger.info(f"Login email check: {loginData.email}")

    isValid = await auth_service.validateLogin(loginData.email, loginData.password, session)

    if isValid:
        logger.info(f"Login successful.")
        return True
    else:
        logger.info(f"Login not successful.")
        return False   


@router.post("/signup")
async def signUp(
    signUpData: UserCreate, 
    session: SessionDependency
):
    """
    FOR THE time being. Each signup cretates new org.
    I'll later setup the cross-organisation security problem.
    Where email verification from user, organisation invitation
    and admin user approving user required.
    """
    # Check if the organisation exists.
    isValid = await auth_service.validateSignUp(
        org_name=signUpData.organisation_name,
        email=signUpData.email,
        password=signUpData.password,
        role=signUpData.role,
        session=session
    )

    if isValid:
        logger.info(f"Sign Up successful.")
        return True
    else:
        logger.info(f"Sign Up not successful.")
        return False   


