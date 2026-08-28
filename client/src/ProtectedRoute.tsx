import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }: { element: React.ReactElement }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/" />;
  }
  return element;
}

export default ProtectedRoute;
