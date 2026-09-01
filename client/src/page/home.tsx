import { useState } from "react";
import Login from "../components/login";
import SignUp from "../components/signup";
import { useNavigate } from "react-router-dom";
import LoggedIn from "../components/loggedIn";
import type { UserData } from "../types/auth";

interface HomeProps {
  authenticated: boolean;
  handleLogin: (accessToken: string) => Promise<UserData | null>;
  handleLogout: () => void;
}

function Home({ authenticated, handleLogin, handleLogout }: HomeProps) {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [loginPage, setLoginPage] = useState(true);
  const navigate = useNavigate();

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e.currentTarget);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const response = await fetch(`${VITE_SERVER_URL}/api/v1/auth/token`, {
      method: "POST",
      body: formData,
    });

    console.log("response is it true:", response.body);

    if (!response.ok) {
      alert(`HTTP Error: ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    const loggedInUser = await handleLogin(data.access_token);

    if (loggedInUser) {
      if (loggedInUser.role === "user") {
        navigate("/upload");
      } else if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  const handleSubmitSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const response = await fetch(`${VITE_SERVER_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "content-Type": "application/JSON",
      },
      body: JSON.stringify({
        organisation_name: formData.get("organisation_name"),
        email: formData.get("username"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        `Error: ${response.status ? `${response.status} (${response.statusText}) : ${data.detail}` : "Something went wrong"}`,
      );
      console.log(
        `RESPONSE Status: ${response.status}: ${response.statusText}`,
      );
    } else {
      console.log("GOT FROM BACKEND: ", data);
      setLoginPage(true);
    }
  };

  const handleNotRegistered = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    setLoginPage(!loginPage);
  };

  const handleGoBackToSession = async () => {
    // Check first if it's logged in or not.
    navigate("/upload");
  };

  return (
    <div>
      <header className="text-2xl font-bold">App</header>
      {authenticated ? (
        <LoggedIn
          handleLogout={handleLogout}
          handleGoBackToSession={handleGoBackToSession}
        />
      ) : loginPage ? (
        <Login
          handleSubmitLogin={handleSubmitLogin}
          handleNotRegistered={handleNotRegistered}
        />
      ) : (
        <SignUp
          handleSubmitSignUp={handleSubmitSignUp}
          handleNotRegistered={handleNotRegistered}
        />
      )}
    </div>
  );
}

export default Home;
