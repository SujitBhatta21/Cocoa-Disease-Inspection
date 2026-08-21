"""ONNX model loading, image preprocessing, and cocoa disease inference."""

import io
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
from PIL import Image
from pydantic import BaseModel


MODEL_PATH = Path(__file__).with_name("yolo26n.onnx")
CONFIDENCE_THRESHOLD = 0.25 # But anything 0.5 or less needs manual prediction.
CLASS_NAMES = {
    0: "anthracnose",
    1: "cssvd",
    2: "healthy",
}


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


onnx_model = onnx.load(MODEL_PATH)
onnx.checker.check_model(onnx_model)
onnx_session = ort.InferenceSession(MODEL_PATH)
model_input_name = onnx_session.get_inputs()[0].name


def predict_image_inserted(image_bytes: bytes) -> InspectionResult:
    """Return cocoa disease detections above the confidence threshold."""
    input_tensor = preprocess_user_image(image_bytes)
    outputs = onnx_session.run(None, {model_input_name: input_tensor})
    raw_predictions = np.asarray(outputs[0])[0]

    confident_predictions = raw_predictions[
        raw_predictions[:, 4] >= CONFIDENCE_THRESHOLD
    ]
    confident_predictions = confident_predictions[
        np.argsort(confident_predictions[:, 4])[::-1]
    ]

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


def preprocess_user_image(image_bytes: bytes) -> np.ndarray:
    """Validate image bytes and create a (1, 3, 640, 640) float tensor."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError("Upload a valid JPEG or PNG image.") from exc

    image_rgb = image.convert("RGB")
    image_resized = image_rgb.resize((640, 640))
    image_array = np.array(image_resized, dtype=np.float32)
    image_chw = image_array.transpose(2, 0, 1)
    image_normalized = image_chw / 255.0
    return np.expand_dims(image_normalized, axis=0)


def get_model_info() -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    """Return the ONNX model input and output descriptions."""
    inputs = [
        {"name": item.name, "shape": item.shape, "type": item.type}
        for item in onnx_session.get_inputs()
    ]
    outputs = [
        {"name": item.name, "shape": item.shape, "type": item.type}
        for item in onnx_session.get_outputs()
    ]
    return inputs, outputs
