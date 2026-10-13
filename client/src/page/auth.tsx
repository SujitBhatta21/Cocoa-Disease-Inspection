import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/login";
import SignUp from "../components/signup";
import LoggedIn from "../components/loggedIn";
import type { UserData } from "../types/auth";
import cocoaLogo from "../assets/Cocoa Disease Inspection Logo.png";
import cocoaFlower from "../assets/Theobroma_cacao_flower_01.png";

interface AuthProps {
  authenticated: boolean;
  handleLogin: (accessToken: string) => Promise<UserData | null>;
  handleLogout: () => void;
}

function Auth({ authenticated, handleLogin, handleLogout }: AuthProps) {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [loginPage, setLoginPage] = useState(true);
  const navigate = useNavigate();

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch(`${VITE_SERVER_URL}/api/v1/auth/token`, {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(`HTTP Error: (${response.status}) ${data.detail}`);
      return;
    }

    const loggedInUser = await handleLogin(data.access_token);
    if (loggedInUser?.role === "user") navigate("/upload");
    else if (loggedInUser?.role === "admin") navigate("/admin");
  };

  const handleSubmitSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch(`${VITE_SERVER_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organisation_name: formData.get("organisation_name"),
        email: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(`Error: ${response.status} ${data.detail ?? response.statusText}`);
      return;
    }

    alert("Sign up successful. Wait for admin approval.");
    setLoginPage(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <header className="border-b border-slate-300/70">
        <nav
          className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6"
          aria-label="Primary navigation"
        >
          <a
            href="#top"
            className="flex items-center gap-3 font-bold tracking-tight"
            aria-label="Cocoa Inspect home"
          >
            <span
              className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"
              aria-hidden="true"
            >
              <img
                src={cocoaLogo}
                alt="Cocoa Inspect Logo"
                className="size-10 rounded-lg object-contain"
              />
              <svg viewBox="0 0 32 32" className="size-5" fill="none"></svg>
            </span>
            Cocoa Inspect
          </a>
          <div className="flex items-center gap-7 text-sm font-semibold">
            <a
              href="#how-it-works"
              className="hidden text-slate-600 hover:text-blue-700 sm:block"
            >
              How it works
            </a>
            <a
              href="#account"
              className="rounded border border-slate-900 px-4 py-2 hover:bg-white"
            >
              {authenticated ? "Open session" : "Sign in"}
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Cocoa leaf inspection
            </p>
            <h1 className="m-0 max-w-3xl text-6xl leading-[0.96] font-bold tracking-[-0.06em] text-slate-950 sm:text-7xl lg:text-[84px]">
              See the signs sooner.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
              Check a cocoa leaf image for visible signs of disease and review
              the result before deciding what to do next.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a
                href="#account"
                className="rounded bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
              >
                {authenticated ? "Continue inspection" : "Start an inspection"}
              </a>
              <a
                href="#how-it-works"
                className="font-bold underline underline-offset-4"
              >
                What you’ll need
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img
              src={cocoaFlower}
              alt="Cocoa Inspect Logo"
              className="rounded-lg object-contain"
            />
            <p>Fig: Image of cocoa flower (Creative common)</p>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-6xl border-t border-slate-300/70 px-6 py-16"
          aria-labelledby="steps-heading"
        >
          <h2
            id="steps-heading"
            className="mb-8 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"
          >
            Before you start
          </h2>
          <ol className="grid gap-10 md:grid-cols-3">
            {[
              [
                "01",
                "Use a clear image",
                "Keep one whole leaf visible and in focus.",
              ],
              [
                "02",
                "Check the frame",
                "Remove people and personal information from view.",
              ],
              [
                "03",
                "Use it as guidance",
                "Confirm important decisions with an agricultural professional.",
              ],
            ].map(([number, title, copy]) => (
              <li key={number} className="border-t border-slate-400 pt-5">
                <span
                  className="text-xs font-bold text-blue-700"
                  aria-hidden="true"
                >
                  {number}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                  {copy}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="account"
          className="border-t border-slate-300/70 bg-white"
          aria-labelledby="account-heading"
        >
          <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-2 lg:gap-28">
            <div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Your account
              </p>
              <h2
                id="account-heading"
                className="m-0 text-5xl leading-none font-bold tracking-[-0.05em] text-slate-950"
              >
                Ready when the leaf is.
              </h2>
              <p className="mt-6 max-w-lg leading-7 text-slate-600">
                Sign in to upload an image. New accounts are reviewed before
                access is enabled.
              </p>
              <aside
                className="mt-10 max-w-lg border-l-3 border-blue-600 pl-4 text-sm leading-6 text-slate-600"
                aria-label="Inspection limitation"
              >
                Results can be affected by lighting, focus, and camera angle.
                Treat them as guidance, not a final diagnosis.
              </aside>
            </div>

            {authenticated ? (
              <LoggedIn
                handleLogout={handleLogout}
                handleGoBackToSession={() => navigate("/upload")}
              />
            ) : loginPage ? (
              <Login
                handleSubmitLogin={handleSubmitLogin}
                handleNotRegistered={async (e) => {
                  e.preventDefault();
                  setLoginPage(false);
                }}
              />
            ) : (
              <SignUp
                handleSubmitSignUp={handleSubmitSignUp}
                handleNotRegistered={async (e) => {
                  e.preventDefault();
                  setLoginPage(true);
                }}
              />
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-7 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Cocoa Inspect</span>
          <span>Built for informed inspection.</span>
        </div>
      </footer>
    </div>
  );
}

export default Auth;
