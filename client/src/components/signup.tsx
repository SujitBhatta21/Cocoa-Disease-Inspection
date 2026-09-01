import { useState } from "react";

interface SignUpProps {
  handleSubmitSignUp: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleNotRegistered: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
}

function SignUp({ handleSubmitSignUp, handleNotRegistered }: SignUpProps) {
  const [selectedRole, setSelectedRole] = useState("user");
  const organisation_sample_value = "Dummy_org";

  return (
    <div className="border-2 min-h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmitSignUp}
        className="flex flex-col gap-4 border-3 border-radius-1 p-4 bg-[#D3D3D3]"
      >
        <h2>Sign Up Page</h2>
        <label className="flex flex-col gap-1 border-1 p-5 items-start">
          Organisation Name
          <input
            name="organisation_name"
            type="text"
            defaultValue="Dummy_org"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
            aria-label="don't change right now"
          />
        </label>
        <label className="flex flex-col gap-1 border-1 p-5 items-start">
          Username/Email
          <input
            required
            name="username"
            type="email"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
        </label>
        <label className="flex flex-col gap-1 border-1 p-5 items-start">
          Password
          <input
            required
            name="password"
            type="password"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
        </label>

        <label className="">
          ROLE:
          <select
            name="role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            required
            className="border-3"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button
          className="bg-green-400 gap-3 hover:bg-green-500 text-black cursor-pointer"
          type="submit"
          value="save"
        >
          Sign Up
        </button>
      </form>
      <button
        onClick={handleNotRegistered}
        className="text-blue-300 gap-2 hover:text-blue-400 cursor-pointer"
      >
        Already registered? Go to login
      </button>
    </div>
  );
}

export default SignUp;
