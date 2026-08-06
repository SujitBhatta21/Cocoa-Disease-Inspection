from fastapi import APIRouter, File, HTTPException, UploadFile, status


router = APIRouter(prefix="/inspect", tags=["inspection"])
ALLOWED_IMAGE_TYPES = {"jpeg", "png"}


@router.post("")
async def inspect_image(image: UploadFile = File(...)) -> None:
    """Accept an image; ONNX inference is the next implementation task."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG or PNG image.",
        )

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Image validation works; ONNX inference is not implemented yet.",
    )
