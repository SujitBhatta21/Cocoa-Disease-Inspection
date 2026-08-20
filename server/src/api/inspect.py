"""HTTP endpoints for cocoa disease inspection."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from src.services.inference_service import (
    InspectionResult,
    predict_image_inserted,
)
from src.services.storage_service import upload_blob_image, get_storage_account_url


router = APIRouter(prefix="/inspect", tags=["inspection"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}



@router.get("/testing")
def get_storage():
    return get_storage_account_url()

@router.post("", response_model=InspectionResult)
async def inspect_image(image: UploadFile = File(...)) -> InspectionResult:
    """Inspect an uploaded JPEG or PNG for cocoa disease."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG or PNG image.",
        )

    try:
        image_bytes = await image.read()
        # upload_blob_image(image_bytes, image.filename)

        inspection_result = predict_image_inserted(image_bytes)
        return inspection_result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


