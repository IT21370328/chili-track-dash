// src/pages/ProtectedRoute.tsx  ✅ (or move to src/components/auth/)
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Add strict check to avoid accidental truthy strings like "false"
  if (isLoggedIn !== "true") {
    return <Navigate to="/" replace />;
  }

  return children;
};
