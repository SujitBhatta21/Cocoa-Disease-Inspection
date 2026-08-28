import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./page/home";
import UploadPage from "./page/upload";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  // MAke a endpoint to check if it's already authenticated.

  // return authenticated ? <UploadPage /> : <Home />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/upload"
          element={<ProtectedRoute element={<UploadPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
