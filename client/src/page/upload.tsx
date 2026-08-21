import { useState, useRef } from "react";
import { FaArrowDown } from "react-icons/fa";
import Form from "../Form";

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionResult {
  prediction: string;
  confidence: number;
  bounding_box: BoundingBox;
}

export interface InspectionResult {
  detections: DetectionResult[];
  detection_count: number;
}

export interface SubmissionData {
  // LAter add userID as well. To double check in backend.
  prediction: string;
  confidence: number;
  human_corrected: boolean | null;
  corrected_label: string | null;
}

function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [inspectResult, setInspectResult] = useState<InspectionResult | null>(
    null,
  );
  const [openForm, setOpenForm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyseSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) return;

    const formData = new FormData();

    formData.append("image", selectedImage);

    const response = await fetch(`${VITE_SERVER_URL}/api/v1/inspect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert(`HTTP Error: ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data: InspectionResult = await response.json();

    if (data.detection_count <= 0) {
      alert(
        "ERROR: Image uploaded has 0 confidence that a cocoa leaf is there.",
      );
    } else {
      setInspectResult(data);
      setOpenForm(true);

      console.log("data:", data);
      // console.log(JSON.stringify(data, null, 2));
    }
  };

  // Methods for Form.
  const handleFormSubmit = async (submissionData: SubmissionData) => {
    if (!selectedImage) {
      throw new Error("Select an image before submitting.");
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("prediction", submissionData.prediction);
    formData.append("confidence", String(submissionData.confidence));
    formData.append("human_corrected", String(submissionData.human_corrected));

    if (submissionData.corrected_label !== null) {
      formData.append("corrected_label", submissionData.corrected_label);
    }

    const response = await fetch(`${VITE_SERVER_URL}/api/v1/submission`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Submission failed (${response.status}): ${error}`);
    }

    await response.json();
    setOpenForm(false);
  };

  const onFormClose = async () => {
    setOpenForm(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-24">
      {/* Hidden file input strictly filtering for images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      {previewUrl ? <h1>Image uploaded </h1> : <h1>Upload an image</h1>}
      {
        <p className="py-4">
          # For reliable result, upload one clearly visible cocoa leaf per
          image.
        </p>
      }

      {/* Trigger Button Uploading */}
      <button
        aria-label="Upload Button"
        onClick={handleUploadButtonClick}
        className="px-5 py-2.5 mb-10 bg-[#0070f3] text-white border-none cursor-pointer font-bold"
      >
        +
      </button>

      {previewUrl && <FaArrowDown className="mx-auto my-5" />}

      {/* Preview Display */}
      {previewUrl && (
        <div className="mx-auto w-fit rounded-lg border border-dotted p-4">
          <div className="flex flex-col items-center">
            {/* Image */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[300px] max-w-[300px] rounded-lg"
            />

            {/* Preview heading + filename */}
            <div className="mt-2 flex flex-row items-center justify-center gap-2">
              <h3>PREVIEW</h3>

              {selectedImage && (
                <p className="text-sm text-gray-600">({selectedImage.name})</p>
              )}
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div>
          <form onSubmit={handleAnalyseSubmit}>
            <button
              className="p-3 m-3.5 bg-[green] text-white border-10 border-[black] cursor-pointer"
              type="submit"
            >
              ANALYSE
            </button>
          </form>
        </div>
      )}

      {openForm && (
        <Form
          imageURL={previewUrl}
          metadata={inspectResult}
          onSubmit={handleFormSubmit}
          onClose={onFormClose}
        />
      )}
    </div>
  );
}

export default UploadPage;
