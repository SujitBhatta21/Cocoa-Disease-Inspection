import { useState } from "react";
import Login from "../components/login";
import SignUp from "../components/signup";
import { useNavigate } from "react-router-dom";
import LoggedIn from "../components/loggedIn";

interface HomeProps {
  authenticated: boolean;
  handleLogin: (accessToken: string) => Promise<boolean>;
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

    console.log(
      JSON.stringify({
        email: formData.get("username"),
        password: formData.get("password"),
      }),
    );

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

    const authenticated = await handleLogin(data.access_token);

    if (authenticated) {
      navigate("/upload");
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
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
    });

    if (!response.ok) {
      console.log(
        `RESPONSE Status: ${response.status}: ${response.statusText}`,
      );
    }
    console.log("GOT FROM BACKEND: ", response.body);
  };

  const handleNotRegistered = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    setLoginPage(!loginPage);
  };

  return (
    <div>
      <header className="text-2xl font-bold">App</header>
      {authenticated ? (
        <LoggedIn handleLogout={handleLogout} />
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
