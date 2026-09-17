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
    <main>
      <table>
        <tbody>
          {pendingUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>

              <td>
                <select
                  value={statusChanges[user.id] ?? "pending"}
                  onChange={(event) =>
                    changeStatus(user.id, event.target.value as UserStatus)
                  }
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

      <button
        type="button"
        disabled={Object.keys(statusChanges).length === 0}
        onClick={submitChanges}
        className="cursor-pointer"
      >
        Save changes
      </button>
    </main>
  );
}

export default SignUpApproval;
