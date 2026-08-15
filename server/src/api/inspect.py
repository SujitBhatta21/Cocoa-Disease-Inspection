from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pathlib import Path
import onnx 
import onnxruntime as ort
import numpy as np
from pydantic import BaseModel
from PIL import Image
import io


router = APIRouter(prefix="/inspect", tags=["inspection"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}

path = Path("src/core/yolo26n.onnx")
abs_path = path.absolute()
PATH_TO_ONNX_FILE = abs_path


onnx_model = onnx.load(PATH_TO_ONNX_FILE)
onnx.checker.check_model(onnx_model)
onnx_session = ort.InferenceSession(PATH_TO_ONNX_FILE)

# GOT input_info and output_info for this model using /model_info.
input_info =     {
      "name": "images",
      "shape": [
        1,
        3,
        640,
        640
      ],
      "type": "tensor(float)"
    }
output_info = {
      "name": "output0",
      "shape": [
        1,
        300,
        6
      ],
      "type": "tensor(float)"
    }

CLASS_NAMES = {
      0: "anthracnose",
      1: "cssvd",
      2: "healthy",
  }
CONFIDENCE_THRESHOLD = 0.25


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionResult(BaseModel):
    prediction: str
    confidence: float
    bounding_box: BoundingBox


class InspectionResult(BaseModel):
    detections: list[DetectionResult]
    detection_count: int



@router.post("", response_model=InspectionResult)
async def inspect_image(image: UploadFile = File(...)) -> InspectionResult:
    """Return the highest-confidence disease prediction for an image."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG or PNG image.",
        )

    try:
        return await predict_image_inserted(image)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


async def predict_image_inserted(image: UploadFile) -> InspectionResult:
    """Apply the ONNX file parameters to get prediction on the requested image."""
    img_byte = await image.read()
    input_tensor = preprocess_user_image(img_byte)

    outputs = onnx_session.run(None, {input_info["name"]: input_tensor}) 
    raw_prediction = np.asarray(outputs[0])[0]

    confident_predictions = raw_prediction[
        raw_prediction[:, 4] >= CONFIDENCE_THRESHOLD
    ]
    confident_predictions = confident_predictions[
        np.argsort(confident_predictions[:, 4])[::-1]
    ]

    # TODO: To get best prediction.
    # best_prediction = confident_predictions[
    #   np.argmax(confident_predictions[:, 4])
    # ]

    detections = []
    for x1, y1, x2, y2, confidence, class_value in confident_predictions:
        class_id = int(class_value)
        detections.append(
            DetectionResult(
                prediction=CLASS_NAMES.get(class_id, "unknown"),
                confidence=float(confidence),
                bounding_box=BoundingBox(
                    x1=float(x1),
                    y1=float(y1),
                    x2=float(x2),
                    y2=float(y2),
                ),
            )
        )

    return InspectionResult(
        detections=detections,
        detection_count=len(detections),
    )



def preprocess_user_image(uploaded_file_bytes):
    """
    Validates user input image bytes and processes to input tensor that model accepts.
    Returns numpy array of astype-32  of shape (1, 3, 640, 640) [Got this from /model_info input_info]. 
    """
    try:
        img = Image.open(io.BytesIO(uploaded_file_bytes))
        img.verify()
        img = Image.open(io.BytesIO(uploaded_file_bytes))

    except Exception as e:
        raise ValueError("Invalid image file. Please upload valid /image/png or /image/jpg files.")


    target_width, target_height = 640, 640

    img_rgb = img.convert("RGB")
    img_resized = img_rgb.resize((target_width, target_height))

    img_arr = np.array(img_resized, dtype=np.float32)

    # Changing channel from HWC to CHW layout: (3, 640, 640)
    img_chw = img_arr.transpose(2, 0, 1)

    # Normalise pixel values and add batch dimension
    img_normalized = img_chw / 255.0  # Range 0.0 to 1.0
    input_as_tensor = np.expand_dims(img_normalized, axis=0)  # Shape becomes (1, 3, 640, 640)

    return input_as_tensor



@router.get("/model_info")
def get_model_info():
    inputs = []
    session = onnx_session

    for input_info in session.get_inputs():
        inputs.append({
            "name": input_info.name,
            "shape": input_info.shape,
            "type": input_info.type,
        })

    outputs = []
    for output_info in session.get_outputs():
        outputs.append({
            "name": output_info.name,
            "shape": output_info.shape,
            "type": output_info.type,
        })
    return inputs, outputs
