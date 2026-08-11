import { useState, useRef } from "react";
import { FaArrowDown } from "react-icons/fa";

function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className=".flex .flex-row .items-center .gap-16 .p-24 .border-green-500 .border-2">
      {/* Hidden file input strictly filtering for images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpeg, .jpg, .png"
        style={{ display: "none" }}
      />

      {previewUrl ? <h1>Image uploaded </h1> : <h1>Upload an image</h1>}

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
          <form>
            <input
              className="p-3 m-3.5 bg-[green] text-white border-10 border-[black]"
              type="submit"
              accept="image/*"
            ></input>
          </form>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
