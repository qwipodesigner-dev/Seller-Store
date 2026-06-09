import {
  LayoutDashboard,
  Database,
  Inbox,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface CatalogNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "pending_requests";
}

export const catalogAdminNavigation: CatalogNavItem[] = [
  { name: "Dashboard", href: "/catalog-admin", icon: LayoutDashboard },
  {
    name: "Requests",
    href: "/catalog-admin/requests",
    icon: Inbox,
    badgeKey: "pending_requests",
  },
  { name: "Browse Catalog", href: "/catalog-admin/catalog", icon: Database },
  { name: "Create SKU", href: "/catalog-admin/catalog/create", icon: Package },
];

export function getCatalogAdminPageTitle(pathname: string): string {
  if (pathname === "/catalog-admin") return "Dashboard";
  if (pathname === "/catalog-admin/requests") return "Requests";
  if (pathname.startsWith("/catalog-admin/catalog/create")) return "Create SKU";
  if (pathname.startsWith("/catalog-admin/catalog/")) return "SKU Detail";
  if (pathname.startsWith("/catalog-admin/catalog")) return "Browse Catalog";
  return "Product Store";
}
