type UserStatus = "pending" | "approved" | "rejected";
import { useState } from "react";

interface PendingUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface SignUpApprovalProps {
  pendingUsers: PendingUser[];
  onStatusesUpdated: (userIds: string[]) => void;
}

function SignUpApproval({
  pendingUsers,
  onStatusesUpdated,
}: SignUpApprovalProps) {
  const [statusChanges, setStatusChanges] = useState<
    Record<string, UserStatus>
  >({});

  const changeStatus = (userId: string, status: UserStatus) => {
    setStatusChanges((currentChanges) => ({
      ...currentChanges,
      [userId]: status,
    }));
  };

  const submitChanges = async () => {
    const updates = Object.entries(statusChanges).map(([userId, status]) => ({
      user_id: userId,
      status,
    }));

    if (updates.length === 0) return;

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/user/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ updates }),
      },
    );

    console.log("TESTING", JSON.stringify({ updates }));

    if (!response.ok) {
      throw new Error("Could not update user statuses.");
    }

    alert("Successfully status updated");
    onStatusesUpdated(
      updates
        .filter(({ status }) => status !== "pending")
        .map(({ user_id }) => user_id),
    );
    setStatusChanges({});
  };

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-row justify-between items-center border-b border-stone-200 px-5 py-4 dark:border-gray-800">
        <h2 className="m-0 text-xl font-bold">Update Pending Requests</h2>
        <button
          type="button"
          disabled={Object.keys(statusChanges).length === 0}
          onClick={submitChanges}
          aria-label="Save status"
          className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 font-semibold bg-emerald-700 text-white hover:bg-emerald-800 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Save changes
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-stone-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td className="pl-3">{user.email}</td>

                <td>
                  <select
                    value={statusChanges[user.id] ?? "pending"}
                    onChange={(event) =>
                      changeStatus(user.id, event.target.value as UserStatus)
                    }
                    className="cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SignUpApproval;
