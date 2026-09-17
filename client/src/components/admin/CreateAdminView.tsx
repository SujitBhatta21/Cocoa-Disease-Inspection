import { useState } from "react";
import type { UserData } from "../../types/auth";

interface CreateAdminViewProps {
  handleSubmitSignUp: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  currentUser: UserData | null;
}

function CreateAdminView({
  handleSubmitSignUp,
  currentUser,
}: CreateAdminViewProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleShowPassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const organisation_value = currentUser?.organisation_name;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-stone-200 px-5 py-4 dark:border-gray-800">
        <h2 className="m-0 text-xl font-bold">Create Admin Form</h2>
      </div>
      <form
        onSubmit={handleSubmitSignUp}
        className="flex flex-col gap-4 border-3 rounded-xl p-4 bg-[#D3D3D3]"
      >
        <label className="flex flex-row gap-1 border-1 p-5 items-start">
          Organisation Name:
          <input
            name="organisation_name"
            type="text"
            readOnly
            value={organisation_value}
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1 text-gray-500"
            aria-label="don't change right now"
          />
        </label>
        <label className="flex flex-rot gap-1 border-1 p-5 items-start">
          Username/Email:
          <input
            required
            name="username"
            type="email"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
        </label>
        <label className="flex flex-row gap-2 border-1 p-5 items-start">
          Password:
          <input
            required
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
          <div className="flex flex-row items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="show-password"
              onChange={handleShowPassword}
              className="cursor-pointer"
            />
            <label className="select-none">
              {isPasswordVisible ? "Hide" : "Show"}
            </label>
          </div>
        </label>
        <label className="flex justify-center items-center">
          ROLE: <b>ADMIN</b>
        </label>
        <button
          type="submit"
          value="save"
          className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          SUBMIT
        </button>
      </form>
    </div>
  );
}

export default CreateAdminView;
