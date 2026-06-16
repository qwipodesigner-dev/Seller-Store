import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth, type Role } from "../lib/auth-context";

interface ProtectedRouteProps {
  allow: Role | Role[];
  children: ReactNode;
}

// Client-side route guard.
// - Not authenticated → /login (or /catalog-admin/login for catalog-admin routes)
// - Wrong role → own home
export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const allowed = Array.isArray(allow) ? allow : [allow];
  const isCatalogAdminRoute = location.pathname.startsWith("/catalog-admin");
  const isBrandManagerRoute = location.pathname.startsWith("/brand-manager");

  if (!isAuthenticated || !user) {
    const loginPath = isCatalogAdminRoute
      ? "/catalog-admin/login"
      : isBrandManagerRoute
        ? "/brand-manager/login"
        : "/login";
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (!allowed.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "designer") return <Navigate to="/design" replace />;
    if (user.role === "catalog-admin") return <Navigate to="/catalog-admin" replace />;
    if (user.role === "brand-manager") return <Navigate to="/catalog-admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
