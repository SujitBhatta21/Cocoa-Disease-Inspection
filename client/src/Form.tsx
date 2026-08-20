import { useState } from "react";

import type {
  InspectionResult,
  DetectionResult,
  BoundingBox,
} from "./page/upload";

interface FormProps {
  imageURL: string | null;
  metadata: InspectionResult | null;
  onSubmit: (data: InspectionResult) => void;
  onClose: () => void;
}

function Form({ imageURL, metadata, onSubmit, onClose }: FormProps) {
  console.log(metadata && metadata);

  // DECONSTRUCTING Layers of metadata.
  const detections = metadata?.detections;
  const all_confidence =
    metadata?.detections.map((detections) => detections.confidence) ?? [];
  const highest_confidence = Math.max(...all_confidence);
  const detection_with_highest_confidence = detections?.find(
    (detection) => detection.confidence == highest_confidence,
  );

  // Scaling Bounding BOX variables.
  let best_bounding_box: BoundingBox | null = null;

  // Getting size for the image.
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });
  let scaleX = imageSize.width / 640; // 640 original height
  let scaleY = imageSize.height / 640; // 640 original height (during inference)

  if (detection_with_highest_confidence) {
    best_bounding_box = detection_with_highest_confidence.bounding_box;
  }
  console.log("Detections: ", detections);
  console.log("All Confidence: ", all_confidence);
  console.log(detection_with_highest_confidence);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl bg-white p-6">
        <form className="flex flex-col gap-4">
          <div className="flex flex-row">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="self-end cursor-pointer border-0 bg-transparent px-2 text-3xl font-bold leading-none text-red-600 hover:text-red-800"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold text-black border-2">
              Confirm Submission
            </h1>
          </div>

          {/* BOUNDING BOX IMAGE OF HIGHEST CONFIDENCE */}
          {imageURL && best_bounding_box && (
            <div className="relative inline-block self-start border-2">
              <img
                src={imageURL}
                alt="analysed cocoa leaf"
                className="block w-p[500px] h-auto max-h-[50vh] object-contain"
                onLoad={(e) => {
                  setImageSize({
                    width: e.currentTarget.clientWidth,
                    height: e.currentTarget.clientHeight,
                  });
                }}
              />

              <div
                className="pointer-events-none absolute border-2 border-red-500"
                style={{
                  left: best_bounding_box.x1 * scaleX,
                  top: best_bounding_box.y1 * scaleY,
                  width: (best_bounding_box.x2 - best_bounding_box.x1) * scaleX,
                  height:
                    (best_bounding_box.y2 - best_bounding_box.y1) * scaleY,
                }}
              />
            </div>
          )}

          {/* METADATA INFO... */}
          <section></section>
          <label>
            <input
              type="checkbox"
              className="cursor-pointer"
              // checked={manualPredion}
              // onChange={(e) => {
              //   setManualPrediction;
              // }}
            />
            Enter Prediction Manually
          </label>
          <button type="submit">SUBMIT</button>
        </form>
      </div>
    </div>
  );
}

export default Form;
