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

  const detections = metadata?.detections;
  const all_confidence =
    metadata?.detections.map((detections) => detections.confidence) ?? [];
  const highest_confidence = Math.max(...all_confidence);

  const detection_with_highest_confidence = detections?.find(
    (detection) => detection.confidence == highest_confidence,
  );

  let best_bounding_box: BoundingBox | null = null;
  //   const scaleX = displayedWidth / originalWidth
  //   const scaleY = displayedHeight / originalHeight

  if (detection_with_highest_confidence) {
    best_bounding_box = detection_with_highest_confidence.bounding_box;
  }
  console.log("Detections: ", detections);
  console.log("All Confidence: ", all_confidence);
  console.log(detection_with_highest_confidence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
      <div className="w-full max-w-3xl bg-white p-6">
        <form className="flex flex-col gap-4">
          <button
            type="button"
            onClick={onClose}
            className="self-end cursor-pointer border-1 border-red-500 border-radius-2 p2"
          >
            Close
          </button>

          {/* BOUNDING BOX IMAGE OF HIGHEST CONFIDENCE */}
          {imageURL && best_bounding_box && (
            <div className="relative inline-block self-start border-2">
              <img
                src={imageURL}
                alt="analysed cocoa leaf"
                className="block max-w-[500px]"
              />

              <div
                className="pointer-events-none absolute border-2 border-red-500"
                style={{
                  left: best_bounding_box.x1,
                  top: best_bounding_box.y1,
                  width: best_bounding_box.x2 - best_bounding_box.x1,
                  height: best_bounding_box.y2 - best_bounding_box.y1,
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
