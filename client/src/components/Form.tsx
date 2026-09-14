import { useEffect, useRef, useState } from "react";

import type {
  InspectionResult,
  BoundingBox,
  SubmissionData,
} from "../page/upload";
import type { UserData } from "../types/auth";

const MANUAL_CORRECTION_THRESHOLD = 0.5;

interface FormProps {
  imageURL: string | null;
  metadata: InspectionResult | null;
  onSubmit: (data: SubmissionData) => Promise<void>;
  onClose: () => void;
  currentUserData: UserData | null;
}

function Form({
  imageURL,
  metadata,
  onSubmit,
  onClose,
  currentUserData,
}: FormProps) {
  console.log(metadata && metadata);

  // DECONSTRUCTING Layers of metadata.
  const detections = metadata?.detections;
  const all_confidence =
    metadata?.detections.map((detections) => detections.confidence) ?? [];
  const highest_confidence = Math.max(...all_confidence);
  const detection_with_highest_confidence = detections?.find(
    (detection) => detection.confidence == highest_confidence,
  );

  const needManualPred = highest_confidence < MANUAL_CORRECTION_THRESHOLD;
  const [overrideManual, setOverrideManual] = useState(false);
  const [manualPrediction, setManualPrediction] = useState("");
  const useManualPrediction = needManualPred || overrideManual;

  // Scaling Bounding BOX variables.
  let best_bounding_box: BoundingBox | null = null;

  // Getting size for the image.
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const scaleX = imageSize.width / 640;
  const scaleY = imageSize.height / 640;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const updateImageSize = () => {
      setImageSize({
        width: image.clientWidth,
        height: image.clientHeight,
      });
    };

    updateImageSize();

    const resizeObserver = new ResizeObserver(updateImageSize);
    resizeObserver.observe(image);

    return () => resizeObserver.disconnect();
  }, [imageURL]);

  if (detection_with_highest_confidence) {
    best_bounding_box = detection_with_highest_confidence.bounding_box;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!detection_with_highest_confidence) return;

    await onSubmit({
      prediction: detection_with_highest_confidence.prediction,
      confidence: detection_with_highest_confidence.confidence,
      human_corrected: useManualPrediction,
      corrected_label: useManualPrediction ? manualPrediction : null,
    });
  };
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
      <div className="w-full max-w-3xl bg-white p-6 border-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="border-2 relative w-full max-w-3xl bg-white p-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="absolute top-4 right-4 cursor-pointer border-3 border-color-red bg-transparent px-2 text-3xl font-bold leading-none text-red-600 hover:text-red-800"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold text-black">Confirm Submission</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            {/* BOUNDING BOX IMAGE OF HIGHEST CONFIDENCE */}
            {imageURL && best_bounding_box && (
              <div className="relative inline-block border-2">
                <img
                  ref={imageRef}
                  src={imageURL}
                  alt="analysed cocoa leaf"
                  className="block h-auto max-h-[50vh] w-[100px] max-w-full object-contain"
                />

                <div
                  className="pointer-events-none absolute border-2 border-red-500"
                  style={{
                    left: best_bounding_box.x1 * scaleX,
                    top: best_bounding_box.y1 * scaleY,
                    width:
                      (best_bounding_box.x2 - best_bounding_box.x1) * scaleX,
                    height:
                      (best_bounding_box.y2 - best_bounding_box.y1) * scaleY,
                  }}
                />
              </div>
            )}

            {/* METADATA INFO */}
            <section className="mt-4 w-full max-w-md border border-gray-300 p-4 text-left">
              <h2 className="mb-2 text-base font-semibold text-black truncate">
                Metadata to be saved
              </h2>

              <dl className="divide-y divide-gray-200 text-sm text-gray-700 truncate">
                <div className="flex justify-between gap-4 py-2">
                  <dt className="font-medium">Organisation ID</dt>
                  <dd>{currentUserData?.organisation_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt className="font-medium">Username</dt>
                  <dd>{currentUserData?.email ?? "—"}</dd>
                </div>

                <div
                  className={`flex justify-between gap-4 py-2 ${needManualPred ? "text-red-600" : ""}`}
                >
                  <dt className="font-medium">Prediction</dt>
                  <dd>
                    {detection_with_highest_confidence?.prediction ??
                      "No detection"}
                    {needManualPred && (
                      <span className="ml-2 text-xs font-medium">
                        (Not submitted)
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt className="font-medium">Human correction</dt>
                  <dd className="flex items-center gap-2">
                    <input
                      id="human-correction"
                      type="checkbox"
                      checked={useManualPrediction}
                      disabled={needManualPred}
                      onChange={(event) => {
                        setOverrideManual(event.target.checked);
                        if (!event.target.checked) {
                          setManualPrediction("");
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <label htmlFor="human-correction">
                      {needManualPred
                        ? "Required"
                        : "Add correction (optional)"}
                    </label>
                  </dd>
                </div>

                {useManualPrediction && (
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="font-medium">Manual Prediction</dt>
                    <dd>
                      <select
                        name="cocoa-leaves"
                        value={manualPrediction}
                        onChange={(event) =>
                          setManualPrediction(event.target.value)
                        }
                        required
                        className="cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Select health status --
                        </option>

                        <option value="anthracnose">anthracnose</option>
                        <option value="cssvd">cssvd</option>
                        <option value="healthy">healthy</option>
                      </select>
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-4 py-2">
                  <dt className="font-medium">Confidence</dt>
                  <dd>
                    {detection_with_highest_confidence
                      ? highest_confidence.toFixed(2)
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* SUBMIT TO POSTGRESQL */}
            <button
              type="submit"
              className="cursor-pointer bg-green-200 hover:bg-green-500 p-2 rounded-lg my-2"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;
