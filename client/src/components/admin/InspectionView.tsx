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
                    <a
                      href={inspection.image_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={inspection.image_url}
                        alt={`Inspection classified as ${inspection.prediction}`}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    </a>
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

export default InspectionView;
