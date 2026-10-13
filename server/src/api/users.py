"""Endpoints for the authenticated user's own account."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from src.db.session import SessionDependency
from src.schemas import PasswordUpdate, UserResponse
import src.services.auth_service as auth_service
from src.role import UserStatus


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
    session: SessionDependency,
) -> UserResponse:
    current_user = await auth_service.get_current_user(jwt_token, session)
    organisation_name = await auth_service.get_org_name(
        current_user.organisation_id,
        session,
    )
    if organisation_name is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation not found",
        )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        organisation_name=organisation_name,
        role=current_user.role,
        created_at=current_user.created_at,
    )


@router.patch("/me/password")
async def change_password(
    form_data: PasswordUpdate,
    jwt_token: Annotated[str, Depends(auth_service.oauth2_scheme)],
    session: SessionDependency,
) -> bool:
    return await auth_service.update_password(
        jwt_token=jwt_token,
        new_password=form_data.new_password,
        curr_password=form_data.current_password,
        session=session,
    )
