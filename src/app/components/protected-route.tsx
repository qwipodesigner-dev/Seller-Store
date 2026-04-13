import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth, type Role } from "../lib/auth-context";

interface ProtectedRouteProps {
  allow: Role | Role[];
  children: ReactNode;
}

// Client-side route guard.
// - Not authenticated → /login
// - Wrong role → own home
// - admin_seller without active seller on seller routes → /select-seller
export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, activeSeller } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!allowed.includes(user.role)) {
    // Redirect to own home
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "admin_seller") {
      // If they have an active seller, send to seller home
      if (activeSeller) return <Navigate to="/" replace />;
      return <Navigate to="/select-seller" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // admin_seller accessing seller routes must have picked a seller
  if (
    user.role === "admin_seller" &&
    allowed.includes("admin_seller") &&
    !activeSeller &&
    location.pathname !== "/select-seller"
  ) {
    return <Navigate to="/select-seller" replace />;
  }

  return <>{children}</>;
}
