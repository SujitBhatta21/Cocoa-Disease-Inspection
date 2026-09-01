import { Navigate } from "react-router-dom";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface ProtectedRouteProps {
  element: React.ReactElement;
  authStatus: AuthStatus;
  userRole?: string;
  requiredRole: "user" | "admin";
}

function ProtectedRoute({
  element,
  authStatus,
  userRole,
  requiredRole,
}: ProtectedRouteProps) {
  if (authStatus === "checking") {
    return <p className="p-8 text-center">Checking your session...</p>;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/" replace />;
  }
  if (userRole !== requiredRole) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/upload"} replace />;
  }

  return element;
}

export default ProtectedRoute;
