/*
DECLARATION OF REUSE of admin dashboard code 
I copied the same admin dashboard as the one inside my Anti-Apartheid Legacy Centre
project and then refactored with project relevant data.
AALC-project repo: https://github.com/SujitBhatta21/AALC-IndividualProject
*/

import { useEffect, useMemo, useState } from "react";

interface AdminProps {
  handleLogout: () => void;
}

interface Inspection {
  id: string;
  user_id: string;
  image_url: string;
  prediction: string;
  confidence: number;
  human_corrected: boolean;
  corrected_label: string | null;
  created_at: string;
}

type DashboardView = "inspections" | "signup";

function Admin({ handleLogout }: AdminProps) {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [view, setView] = useState<DashboardView>("inspections");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const response = await fetch(
          `${VITE_SERVER_URL}/api/v1/submission/retrieve_inspections`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        if (!response.ok)
          throw new Error(`Could not load inspections (${response.status}).`);
        setInspections(await response.json());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load inspections.",
        );
      } finally {
        setLoading(false);
      }
    };
    void loadInspections();
  }, [VITE_SERVER_URL]);

  const correctedCount = useMemo(
    () => inspections.filter((inspection) => inspection.human_corrected).length,
    [inspections],
  );

  const exportManifest = () => {
    const header = [
      "id",
      "image_url",
      "prediction",
      "confidence",
      "human_corrected",
      "corrected_label",
      "created_at",
    ];
    const rows = inspections.map((inspection) =>
      [
        inspection.id,
        inspection.image_url,
        inspection.prediction,
        inspection.confidence,
        inspection.human_corrected,
        inspection.corrected_label ?? "",
        inspection.created_at,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[header.join(","), ...rows].join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `inspection-dataset-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-left text-slate-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex flex-col gap-4 border-b border-stone-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Cocoa inspection
          </p>
          <h1 className="m-0 text-2xl font-bold">Admin dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={exportManifest}
            disabled={inspections.length === 0}
            className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export dataset CSV
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 font-semibold hover:bg-red-300 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex h-fit gap-2 rounded-xl border border-stone-200 bg-white p-3 lg:flex-col dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setView("inspections")}
            className={`cursor-pointer rounded-lg px-4 py-3 text-left font-semibold ${view === "inspections" ? "bg-emerald-700 text-white" : "hover:bg-stone-100 dark:hover:bg-gray-800"}`}
          >
            Inspections
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className={`cursor-pointer rounded-lg px-4 py-3 text-left font-semibold ${view === "signup" ? "bg-emerald-700 text-white" : "hover:bg-stone-100 dark:hover:bg-gray-800"}`}
          >
            Sign Up approvals
          </button>
        </nav>

        <section className="min-w-0">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total inspections" value={inspections.length} />
            <SummaryCard label="Human corrected" value={correctedCount} />
            <SummaryCard label="Pending users" value="-" />
          </div>

          {view === "signup" ? (
            <div className="rounded-xl border border-stone-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-2 text-xl font-bold">
                Pending Sign Up approvals
              </h2>
              <p className="max-w-2xl text-slate-600 dark:text-gray-400">
                This section is ready for the approval workflow. Add a user
                status field and an admin users endpoint before enabling approve
                and reject actions.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-stone-200 px-5 py-4 dark:border-gray-800">
                <h2 className="m-0 text-xl font-bold">Inspection review</h2>
              </div>
              {loading ? (
                <p className="p-8 text-center">Loading inspections…</p>
              ) : error ? (
                <p className="p-8 text-center text-red-600">{error}</p>
              ) : inspections.length === 0 ? (
                <p className="p-8 text-center">
                  No inspections have been submitted.
                </p>
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
                            {inspection.corrected_label ??
                              inspection.prediction}
                          </td>
                          <td className="p-3">
                            {Math.round(inspection.confidence * 100)}%
                          </td>
                          <td className="p-3">
                            {inspection.human_corrected ? "Yes" : "No"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {new Date(
                              inspection.created_at,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default Admin;
