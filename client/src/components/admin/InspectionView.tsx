import { useEffect, useState } from "react";
import type { Inspection } from "../../page/admin";

interface InspectionViewProps {
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
}

function InspectionView({
  inspections,
  loading,
  error,
}: InspectionViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-stone-200 px-5 py-4 dark:border-gray-800">
        <h2 className="m-0 text-xl font-bold">Inspection review</h2>
      </div>
      {loading ? (
        <p className="p-8 text-center">Loading inspections…</p>
      ) : error ? (
        <p className="p-8 text-center text-red-600">{error}</p>
      ) : inspections.length === 0 ? (
        <p className="p-8 text-center">No inspections have been submitted.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-stone-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Final label</th>
                <th className="p-3 text-left">Confidence</th>
                <th className="p-3 text-left">Reviewed</th>
                <th className="p-3 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  className="border-t border-stone-200 dark:border-gray-800"
                >
                  <td className="p-3">
                    <InspectionThumbnail inspection={inspection} />
                  </td>
                  <td className="p-3 font-semibold">
                    {inspection.corrected_label ?? inspection.prediction}
                  </td>
                  <td className="p-3">
                    {Math.round(inspection.confidence * 100)}%
                  </td>
                  <td className="p-3">
                    {inspection.human_corrected ? "Yes" : "No"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(inspection.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InspectionThumbnail({ inspection }: { inspection: Inspection }) {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        const response = await fetch(
          `${VITE_SERVER_URL}/api/v1/admin/submissions/${inspection.id}/image`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Could not load image (${response.status}).`);
        }

        objectUrl = URL.createObjectURL(await response.blob());
        setImageUrl(objectUrl);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      }
    };

    void loadImage();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [VITE_SERVER_URL, inspection.id]);

  if (failed) {
    return (
      <div
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100 text-center text-xs text-slate-500 dark:bg-gray-800 dark:text-gray-400"
        role="img"
        aria-label={`Image unavailable for inspection ${inspection.id}`}
      >
        Unavailable
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div
        className="h-14 w-14 animate-pulse rounded-lg bg-stone-200 dark:bg-gray-800"
        role="status"
        aria-label={`Loading image for inspection ${inspection.id}`}
      />
    );
  }

  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open image for inspection ${inspection.id}`}
      className="block h-14 w-14 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
    >
      <img
        src={imageUrl}
        alt={`Inspection classified as ${inspection.prediction}`}
        className="h-14 w-14 rounded-lg object-cover"
      />
    </a>
  );
}

export default InspectionView;
