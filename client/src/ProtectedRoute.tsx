import { Navigate } from "react-router-dom";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface ProtectedRouteProps {
  element: React.ReactElement;
  authStatus: AuthStatus;
}

function ProtectedRoute({ element, authStatus }: ProtectedRouteProps) {
  if (authStatus === "checking") {
    return <p className="p-8 text-center">Checking your session...</p>;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default ProtectedRoute;
