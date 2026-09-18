/*
DECLARATION OF REUSE of admin dashboard code 
I copied the same admin dashboard as the one inside my Anti-Apartheid Legacy Centre
project and then refactored with project relevant data.
AALC-project repo: https://github.com/SujitBhatta21/AALC-IndividualProject
*/

import { useEffect, useMemo, useState } from "react";
import InspectionView from "../components/admin/InspectionView";
import SignUpApproval from "../components/admin/SignUpApproval";
import CreateAdminView from "../components/admin/CreateAdminView";
import type { UserData } from "../types/auth";

interface AdminProps {
  handleLogout: () => void;
  currentUser: UserData | null;
}

export interface Inspection {
  id: string;
  user_id: string;
  image_url: string;
  prediction: string;
  confidence: number;
  human_corrected: boolean;
  corrected_label: string | null;
  created_at: string;
}

export interface OrgInspectionResponse {
  all_user_count: number[];
  inspections: Inspection[];
  human_corrected_count: number;
  pending_users: UserData[];
}

type DashboardView = "inspections" | "signup" | "createAdmin";

function Admin({ handleLogout, currentUser }: AdminProps) {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [view, setView] = useState<DashboardView>("inspections");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserData[]>([]);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let viewContent;

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const response = await fetch(
          `${VITE_SERVER_URL}/api/v1/submission/retrieve_org_inspections`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        if (!response.ok)
          throw new Error(`Could not load inspections (${response.status}).`);
        const data: OrgInspectionResponse = await response.json();
        console.log(data);
        setInspections(data.inspections);
        setPendingUsers(data.pending_users);
        setAdminCount(data.all_user_count[0]);
        setUserCount(data.all_user_count[1]);
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

  const exportManifestInspections = () => {
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

  const handleSubmitSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const response = await fetch(
      `${VITE_SERVER_URL}/api/v1/auth/signup/admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          email: formData.get("username"),
          password: formData.get("password"),
        }),
      },
    );

    const data = await response.json();
    console.log("DATA Testing in concsole: ", data);

    if (!response.ok) {
      alert(
        `Error: ${response.status ? `${response.status} (${response.statusText}) : ${data.detail}` : "Something went wrong"}`,
      );
      console.log(
        `RESPONSE Status: ${response.status}: ${response.statusText}`,
      );
    } else {
      console.log("GOT FROM BACKEND: ", data);
      alert(`Admin Sign Up Successful by: ${currentUser?.email}`);
    }
  };

  const handleStatusesUpdated = (updatedUserIds: string[]) => {
    setPendingUsers((currentUsers) =>
      currentUsers.filter((user) => !updatedUserIds.includes(user.id)),
    );
  };

  if (view === "inspections") {
    viewContent = (
      <InspectionView
        inspections={inspections}
        loading={loading}
        error={error}
      />
    );
  } else if (view === "signup") {
    viewContent = (
      <SignUpApproval
        pendingUsers={pendingUsers}
        onStatusesUpdated={handleStatusesUpdated}
      />
    );
  } else {
    viewContent = (
      <CreateAdminView
        handleSubmitSignUp={handleSubmitSignUp}
        currentUser={currentUser}
      />
    );
  }

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
            onClick={exportManifestInspections}
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
          <button
            type="button"
            onClick={() => setView("createAdmin")}
            className={`cursor-pointer rounded-lg px-4 py-3 text-left font-semibold ${view === "createAdmin" ? "bg-emerald-700 text-white" : "hover:bg-stone-100 dark:hover:bg-gray-800"}`}
          >
            Create Admin (+)
          </button>
        </nav>

        <section className="min-w-0">
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <SummaryCard label="Total Users" value={adminCount + userCount} />
            <SummaryCard label="Total inspections" value={inspections.length} />
            <SummaryCard label="Human corrected" value={correctedCount} />
            <SummaryCard label="Pending users" value={pendingUsers.length} />
          </div>

          {viewContent}
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
