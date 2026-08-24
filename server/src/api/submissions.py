"""Persist confirmed cocoa inspections."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.models import Inspection, User
from src.schemas import InspectResponse
from src.services.storage_service import upload_blob_image


router = APIRouter(prefix="/submission", tags=["submission"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
SEED_USER_EMAIL = "dummy@gmail.com"


@router.post("", response_model=InspectResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    image: Annotated[UploadFile, File()],
    prediction: Annotated[str, Form()],
    confidence: Annotated[float, Form()],
    human_corrected: Annotated[bool, Form()],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    corrected_label: Annotated[str | None, Form()] = None,
) -> Inspection:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG or PNG image.",
        )

    result = await session.execute(
        select(User).where(User.email == SEED_USER_EMAIL)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The seeded submission user does not exist.",
        )

    if human_corrected and not corrected_label:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A corrected label is required for a manual prediction.",
        )

    image_bytes = await image.read()
    blob_url = upload_blob_image(image_bytes, image.filename)
    if not blob_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The image could not be uploaded.",
        )

    inspection = Inspection(
        user_id=user.id,
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


@router.get("/retrieve_inspections", response_model=list[InspectResponse])
async def get_all_inspections(
    session: Annotated[AsyncSession, Depends(get_db_session)]
    ):
    all_inspections = await session.execute(
        select(Inspection)
    )
    all_inspections = all_inspections.scalars().all()
    return all_inspections


"""
Endpoint that takes in user_id and organisation_id and returns
all the inspection results submitted by this user as a part of this org.
"""
@router.get("/retrieve_user_inspection", response_model=InspectResponse)
async def get_inspection(
    session: Annotated[AsyncSession, Depends(get_db_session)],
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
