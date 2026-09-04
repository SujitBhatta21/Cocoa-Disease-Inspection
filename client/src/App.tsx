import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./page/home";
import UploadPage from "./page/upload";
import ProtectedRoute, { type AuthStatus } from "./ProtectedRoute";
import { useCallback, useEffect, useState } from "react";
import type { UserData } from "./types/auth";
import Admin from "./page/admin";

function App() {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    localStorage.getItem("access_token") ? "checking" : "unauthenticated",
  );
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const loadProfile = useCallback(
    async (token: string): Promise<UserData | null> => {
      try {
        const response = await fetch(
          `${VITE_SERVER_URL}/api/v1/auth/current_user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("access_token");
          setCurrentUser(null);
          setAuthStatus("unauthenticated");
          console.log("Token Expired: ", data.detail);
          return null;
        } else {
          setCurrentUser(data);
          setAuthStatus("authenticated");
          return data;
        }
      } catch (err) {
        console.error("Unable to validate the current session:", err);
        setCurrentUser(null);
        setAuthStatus("unauthenticated");
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // loadProfile updates state only after its asynchronous request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile(token);
  }, [loadProfile]);

  const handleLogin = async (accessToken: string): Promise<UserData | null> => {
    localStorage.setItem("access_token", accessToken);
    setAuthStatus("checking");
    return loadProfile(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
    setAuthStatus("unauthenticated");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              authenticated={authStatus === "authenticated"}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
            />
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute
              authStatus={authStatus}
              userRole={currentUser?.role}
              requiredRole="user"
              element={
                <UploadPage
                  handleLogout={handleLogout}
                  currentUser={currentUser}
                />
              }
            />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              authStatus={authStatus}
              element={<Admin handleLogout={handleLogout} />}
              userRole={currentUser?.role}
              requiredRole="admin"
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
