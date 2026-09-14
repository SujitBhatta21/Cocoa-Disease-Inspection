"""Persist confirmed cocoa inspections."""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import SessionDependency
from src.models import Inspection, User
from src.schemas import InspectResponse
from src.services.storage_service import upload_blob_image

from src.services.auth_service import get_current_user, oauth2_scheme, get_org_name, get_all_inspections_by_org


router = APIRouter(prefix="/submission", tags=["submission"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
logger = logging.getLogger("uvicorn.error")
SEED_USER_EMAIL = "dummy@gmail.com" # I need to get current user cookie token.


@router.post("", response_model=InspectResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    image: Annotated[UploadFile, File()],
    prediction: Annotated[str, Form()],
    confidence: Annotated[float, Form()],
    human_corrected: Annotated[bool, Form()],
    session: SessionDependency,
    jwt_token: Annotated[str, Depends(oauth2_scheme)],
    corrected_label: Annotated[str | None, Form()] = None,
) -> Inspection:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG or PNG image.",
        )

    # 1. Getting current user details.
    current_user = await get_current_user(
        token=jwt_token,
        session=session,
    )

    logger.info(f"TESTING Backend Submission server: {current_user.email}")

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The seeded submission user does not exist.",
        )

    # 2. Get organisation detail for CONTAINER_NAME.
    organisation_name = await get_org_name(
        organisation_id=current_user.organisation_id, 
        session=session,
    )
    safe_organisation_name = str(organisation_name).lower().replace("_", "-").replace(" ", "-")

    # 3. Setting the container name. If N/A create one else append.
    CONTAINER_NAME = f"{safe_organisation_name}-{str(current_user.organisation_id)[:5]}"

    logger.info(f"TESTING container_name inside submission: {CONTAINER_NAME}")
    
    if human_corrected and not corrected_label:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A corrected label is required for a manual prediction.",
        )

    image_bytes = await image.read()
    blob_url = upload_blob_image(image_bytes, image.filename, container_name=CONTAINER_NAME)
    if not blob_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The image could not be uploaded.",
        )

    inspection = Inspection(
        user_id=current_user.id,
        image_url=blob_url,
        prediction=prediction,
        confidence=confidence,
        human_corrected=human_corrected,
        corrected_label=corrected_label if human_corrected else None,
    )
    session.add(inspection)
    await session.commit()
    await session.refresh(inspection)

    return inspection


@router.get("/retrieve_org_inspections", response_model=list[InspectResponse])
async def get_all_inspections_for_org(
    jwt_token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDependency
    ):
    # Get organisation id for this admin user using the jwt_token.
    all_inspections_org = await get_all_inspections_by_org(jwt_token, session)

    return all_inspections_org



"""
Endpoint that takes in user_id and organisation_id and returns
all the inspection results submitted by this user as a part of this org.
"""
@router.get("/retrieve_user_inspection", response_model=InspectResponse)
async def get_inspection(
    session: SessionDependency,
    organisation_id,
    user_id,
):
    if not organisation_id or not user_id:
        raise HTTPException(
            status_code=500,
            detail="Enter either org_id or user_id or both but not None",
        )

    result = await session.execute(
        select(Inspection)
        .join(User, User.id == Inspection.user_id)
        .where(
            Inspection.user_id==user_id, 
            User.organisation_id==organisation_id
        )
    )

    data = result.scalars().all()
    return data
