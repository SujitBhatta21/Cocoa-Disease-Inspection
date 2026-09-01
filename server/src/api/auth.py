from datetime import datetime, timedelta, timezone

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from src.schemas import UserLogin, UserCreate, UserResponse
import src.services.auth_service as auth_service
from src.services.auth_service import Token, TokenData
from src.db.session import SessionDependency

from src.role import UserRole
from src.models import User

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("uvicorn.error")


import os
import logging
from dotenv import load_dotenv

import jwt
from jwt.exceptions import InvalidTokenError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# to get a string like this run:
# openssl rand -hex 32
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


@router.post("/token")
async def login(
        loginData: Annotated[OAuth2PasswordRequestForm, Depends()],
        session: SessionDependency,
    ) -> Token:
    """Just login page that check """
    logger.info(f"Login email check: {loginData.username}")

    user = await auth_service.validateUserLogin(loginData.username, loginData.password, session)

    if not user: 
        logger.info(f"Login not successful.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"Login successful.")
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
    



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




"""
TOKEN OPERATIONS
"""
# Method reused from fastapi documentation.
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore
    return encoded_jwt



@router.get("/current_user")
async def get_user_data(
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
    session: SessionDependency,
) -> UserResponse:
    current_user = await auth_service.get_current_user(
        token=jwt_token, 
        session=session,
    )

    organisation_name = await auth_service.get_org_name(
        organisation_id=current_user.organisation_id,
        session=session,
    )

    if not organisation_name: 
        logger.info(f"ORGANISATION Name is None.")
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No organisation name",
    )

    logger.info(f"Organisation_name: {organisation_name}")

    userResponse = UserResponse(
        id=current_user.id,
        email=current_user.email,
        organisation_name=organisation_name,
        role=current_user.role,
        created_at=current_user.created_at,
    )

    return userResponse

