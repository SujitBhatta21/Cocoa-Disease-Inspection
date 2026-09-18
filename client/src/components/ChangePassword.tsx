import { useState } from "react";

interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

interface ChangePasswordProps {
  onClose: () => void;
}

function ChangePassword({ onClose }: ChangePasswordProps) {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Your new password must be different from your current one.");
      return;
    }

    const requestBody: PasswordChangeRequest = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${serverUrl}/api/v1/auth/change_password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data: { detail?: string } = await response
          .json()
          .catch(() => ({}));
        throw new Error(data.detail ?? "Could not change your password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been changed successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not change your password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="border-b border-stone-200 px-5 py-4 pr-14 dark:border-gray-800">
          <h2 id="change-password-title" className="m-0 text-xl font-bold">
            Change password
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Enter your current password before choosing a new one.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close password form"
          className="absolute right-4 top-3 cursor-pointer rounded-lg px-2 text-3xl leading-none text-slate-500 hover:bg-stone-100 hover:text-slate-900 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              Current password
            </span>
            <input
              required
              type={showPasswords ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              New password
            </span>
            <input
              required
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClassName}
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-gray-400">
              Use at least 8 characters.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              Confirm new password
            </span>
            <input
              required
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(event) => setShowPasswords(event.target.checked)}
              className="h-4 w-4 accent-emerald-700"
            />
            Show passwords
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Changing password…" : "Change password"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ChangePassword;
