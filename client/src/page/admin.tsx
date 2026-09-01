import { useState } from "react";

interface AdminProps {
  handleLogout: () => void;
}

function Admin({ handleLogout }: AdminProps) {
  const [isApproveNewUser, setIsApproveNewUser] = useState(true);

  return (
    <main>
      <header className="text-2xl font-bold">App (ADMIN)</header>
      <button
        type="button"
        onClick={handleLogout}
        className="flex ml-auto m-5 cursor-pointer rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        Log out
      </button>

      <div>
        <div className="flex flex-row gap-3">
          <ul>
            <li>Create Organisation</li>
            <li>Approve User</li>
          </ul>
          <button>1</button>
          <button>2</button>
          <button>3</button>
        </div>
      </div>
    </main>
  );
}

export default Admin;
