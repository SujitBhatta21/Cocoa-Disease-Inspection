import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./page/home";
import UploadPage from "./page/upload";
import SignUp from "./page/signup";
import Login from "./page/login";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  // MAke a endpoint to check if it's already authenticated.

  return authenticated ? <UploadPage /> : <Home />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <Login
              handleSubmitLogin={function (
                e: React.FormEvent<HTMLFormElement>,
              ): Promise<void> {
                throw new Error("Function not implemented.");
              }}
              handleNotRegistered={function (
                e: React.MouseEvent<HTMLButtonElement>,
              ): Promise<void> {
                throw new Error("Function not implemented.");
              }}
            />
          }
        />
        {/* <Route path="/signup" element={<SignUp />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
