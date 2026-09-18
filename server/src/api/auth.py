from datetime import datetime, timedelta, timezone

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from src.schemas import AdminUserCreate, PublicUserCreate, UserResponse, UserStatusUpdates, PasswordUpdate
import src.services.auth_service as auth_service
from src.services.auth_service import Token, TokenData
from src.db.session import SessionDependency

from src.role import UserRole, UserStatus

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

    # If user status is not Approved donot allow login.
    if user.status != UserStatus.APPROVED:
        logger.info(f"User status not approved. It's => {user.status}")
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"User status is {user.status} for approval by org admin."
        )



    logger.info(f"Login successful.")
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
    



@router.post("/signup/user", status_code=status.HTTP_201_CREATED)
async def sign_up_user(
    sign_up_data: PublicUserCreate,
    session: SessionDependency,
) -> bool:
    """Create a pending standard user through the public signup flow."""
    return await auth_service.validateSignUp(
        org_name=sign_up_data.organisation_name,
        email=sign_up_data.email,
        password=sign_up_data.password,
        role=UserRole.USER,
        user_status=UserStatus.PENDING,
        session=session,
    )





@router.patch("/user/status")
async def update_users_status(
    updates: UserStatusUpdates,
    session: SessionDependency,
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
) -> bool:    
    isUpdated = await auth_service.update_status(updates=updates, jwt_token=jwt_token, session=session)
    return isUpdated


@router.post("/signup/admin", status_code=status.HTTP_201_CREATED)
async def sign_up_admin(
    sign_up_data: AdminUserCreate,
    session: SessionDependency,
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
) -> bool:
    """Create an approved admin in the authenticated admin's organisation."""
    current_admin = await auth_service.get_current_user(
        token=jwt_token,
        session=session,
    )
    if current_admin.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    organisation_name = await auth_service.get_org_name(
        organisation_id=current_admin.organisation_id,
        session=session,
    )
    if organisation_name is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation not found",
        )

    return await auth_service.validateSignUp(
        org_name=organisation_name,
        email=sign_up_data.email,
        password=sign_up_data.password,
        role=UserRole.ADMIN,
        user_status=UserStatus.APPROVED,
        session=session,
    )



@router.patch("/change_password")
async def change_password(
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
    session: SessionDependency,
    formData: PasswordUpdate,
) -> bool:
    # Not allowed to touch db from endpoint only services handles those.
    temp = await auth_service.update_password(
        jwt_token=jwt_token,
        new_password=formData.new_password,
        curr_password=formData.current_password,
        session=session
    )
    
    return True


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
