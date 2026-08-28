import { Navigate } from "react-router-dom";

function ProtectedRoute() {
  const token = "get the token";

  if (!token) {
    return <Navigate to="/login" />;
  }
  return;
}

export default ProtectedRoute;
