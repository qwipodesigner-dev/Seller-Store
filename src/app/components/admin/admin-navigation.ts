import {
  LayoutDashboard,
  Store,
  Plug,
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  subItems?: { name: string; href: string }[];
}

// Admin sidebar — flat menu.
// Note: Categories is no longer a top-level page — it now lives inside each
// Company's edit dialog (per-company category images), so it's removed here.
export const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Sellers", href: "/admin/users", icon: Store },
  { name: "Companies & Brands", href: "/admin/companies", icon: Building2 },
  { name: "Connectors", href: "/admin/connectors", icon: Plug },
];

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Admin Dashboard";
  if (pathname.startsWith("/admin/users/add")) return "Add Seller";
  if (pathname.startsWith("/admin/users/")) return "Seller Details";
  if (pathname.startsWith("/admin/users")) return "Sellers";
  if (pathname.startsWith("/admin/companies")) return "Companies & Brands";
  if (pathname.startsWith("/admin/connectors/")) return "Connector Details";
  if (pathname.startsWith("/admin/connectors")) return "Connectors";
  if (pathname.startsWith("/admin/sellers/")) return "Seller Details";
  return "Admin Portal";
}
