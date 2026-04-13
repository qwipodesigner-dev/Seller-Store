import {
  LayoutDashboard,
  Users,
  Plug,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  subItems?: { name: string; href: string }[];
}

// Admin sidebar — flat menu, no sub-items.
export const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Connectors", href: "/admin/connectors", icon: Plug },
];

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Admin Dashboard";
  if (pathname.startsWith("/admin/users/add")) return "Add User";
  if (pathname.startsWith("/admin/users/")) return "User Details";
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/connectors/")) return "Connector Details";
  if (pathname.startsWith("/admin/connectors")) return "Connectors";
  // Legacy routes still used by seller-detail
  if (pathname.startsWith("/admin/sellers/")) return "User Details";
  return "Admin Portal";
}
