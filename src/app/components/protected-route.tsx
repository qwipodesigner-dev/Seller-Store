import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth, type Role } from "../lib/auth-context";

interface ProtectedRouteProps {
  allow: Role | Role[];
  children: ReactNode;
}

// Client-side route guard.
// - Not authenticated → /login
// - Wrong role → own home (admin → /admin, seller → /)
export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!allowed.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
