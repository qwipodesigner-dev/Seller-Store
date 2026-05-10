import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  Ban,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ListPagination } from "../components/ui/list-pagination";
import {
  DELIVERY_DAY_OPTIONS,
  NEXT_DAY,
  type DeliveryDay,
} from "../lib/customers-data";

// =====================================================================
// Customers 2 — empty-mode demo of the auto-register flow.
//
// In this model, customers don't go through a Pending → Approved
// approval queue. They auto-register on their first order and land in
// the list as Active immediately. The seller's only state changes
// after that are:
//
//   1. Assigning a delivery day per (customer × company), in bulk or
//      one-by-one. Default delivery is Next Day until set.
//   2. Blocking a customer so they can't place new orders.
//
// Each row represents ONE customer. Customers who buy across multiple
// companies surface a count badge ("2 companies" / "3 companies") in
// the Company column — clicking the badge opens a Linked Companies
// popup that shows each company name with its delivery day inline.
// Brands no longer render in the row (they were noisy at row scale);
// the company is the identity that matters for delivery scheduling.
//
// Self-contained: no shared state with the canonical customers.tsx
// page. All data is mock-state local to this component. Routed under
// /customers-demo and surfaced only on the empty-mode sidebar.
// =====================================================================

/** A single (company → delivery day) pairing for a customer. */
interface CompanyLink {
  companyId: string;
  companyName: string;
  deliveryDay: DeliveryDay | null;
}

interface DemoCustomer {
  customerId: string;
  customerName: string;
  businessName: string;
  mobile: string;
  area: string;
  pincode: string;
  classType: "Wholesaler" | "Kirana" | "Modern Trade" | "HoReCa";
  /** First-order auto-registration date (drives the Registered On column). */
  registeredDate: string;
  totalOrders: number;
  /** Companies the customer buys from. Length ≥ 1. */
  companies: CompanyLink[];
  status: "Active" | "Blocked";
}

// Seed data — 7 customers, two of whom span multiple companies so the
// count badge has interesting cases.
const seedCustomers: DemoCustomer[] = [
  {
    customerId: "c1",
    customerName: "Priya Singh",
    businessName: "Sunshine Kirana",
    mobile: "+91 98765 43222",
    area: "Indiranagar",
    pincode: "560038",
    classType: "Kirana",
    registeredDate: "2026-04-12",
    totalOrders: 14,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Wednesday" },
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Monday" },
    ],
    status: "Active",
  },
  {
    customerId: "c2",
    customerName: "Lakshmi Rao",
    businessName: "Annapurna Wholesale",
    mobile: "+91 98765 43224",
    area: "Secunderabad",
    pincode: "500003",
    classType: "Wholesaler",
    registeredDate: "2026-04-08",
    totalOrders: 47,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Friday" },
    ],
    status: "Active",
  },
  {
    customerId: "c3",
    customerName: "Ramesh Patel",
    businessName: "Patel Provision Store",
    mobile: "+91 98765 43225",
    area: "Andheri West",
    pincode: "400058",
    classType: "Kirana",
    registeredDate: "2026-04-22",
    totalOrders: 6,
    companies: [
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: null,
      },
    ],
    status: "Active",
  },
  {
    customerId: "c4",
    customerName: "Suresh Kumar",
    businessName: "City Supermart",
    mobile: "+91 98765 43226",
    area: "Connaught Place",
    pincode: "110001",
    classType: "Modern Trade",
    registeredDate: "2026-03-30",
    totalOrders: 92,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Tuesday" },
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Thursday" },
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: NEXT_DAY,
      },
    ],
    status: "Active",
  },
  {
    customerId: "c5",
    customerName: "Anand Sharma",
    businessName: "Anand General Store",
    mobile: "+91 98765 43227",
    area: "Banjara Hills",
    pincode: "500034",
    classType: "Kirana",
    registeredDate: "2026-04-25",
    totalOrders: 3,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: null },
    ],
    status: "Active",
  },
  {
    customerId: "c6",
    customerName: "Vikram Shah",
    businessName: "Urban Kirana Stores",
    mobile: "+91 98765 43228",
    area: "Bandra",
    pincode: "400050",
    classType: "Kirana",
    registeredDate: "2026-04-18",
    totalOrders: 22,
    companies: [
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Saturday" },
    ],
    status: "Active",
  },
  {
    customerId: "c7",
    customerName: "Meena Iyer",
    businessName: "Coast Grocers Ltd",
    mobile: "+91 98765 43229",
    area: "T. Nagar",
    pincode: "600017",
    classType: "Wholesaler",
    registeredDate: "2026-04-02",
    totalOrders: 38,
    companies: [
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: "Wednesday",
      },
    ],
    status: "Blocked",
  },
];

// CSV escape helper (one row per customer, with company list joined).
const escapeCsv = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Summarise a customer's per-company delivery days into the right
 * thing to show in the table cell:
 *   - all unassigned → "Unassigned"
 *   - one company → that day (or "Unassigned")
 *   - all same → that day
 *   - mixed → "Mixed (N)" — popup carries the breakdown
 */
type DaySummary =
  | { kind: "none" }
  | { kind: "single"; day: DeliveryDay }
  | { kind: "mixed"; count: number };

const summariseDays = (companies: CompanyLink[]): DaySummary => {
  const days = companies.map((c) => c.deliveryDay);
  const assigned = days.filter((d): d is DeliveryDay => d !== null);
  if (assigned.length === 0) return { kind: "none" };
  const unique = Array.from(new Set(assigned));
  if (unique.length === 1 && assigned.length === companies.length) {
    return { kind: "single", day: unique[0] };
  }
  if (unique.length === 1 && assigned.length < companies.length) {
    // partial — at least one is unassigned
    return { kind: "mixed", count: companies.length };
  }
  return { kind: "mixed", count: companies.length };
};

export function CustomersDemo() {
  const [customers, setCustomers] = useState<DemoCustomer[]>(seedCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Selection — Set of customerIds checked for bulk actions.
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Assign Delivery Day dialog
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignDay, setAssignDay] = useState<DeliveryDay | "">("");
  const [assignError, setAssignError] = useState<string | null>(null);

  // Block confirmation dialog — single OR bulk depending on
  // whether a single customerId is set.
  const [blockTarget, setBlockTarget] = useState<{
    mode: "single" | "bulk";
    customerIds: string[];
  } | null>(null);

  // Linked Companies popup — shows the per-company breakdown for one
  // customer. Triggered by clicking the count badge in the Company
  // column.
  const [linkedCustomer, setLinkedCustomer] = useState<DemoCustomer | null>(
    null,
  );

  // Companies derived from the dataset so the filter dropdown only
  // surfaces real values.
  const companyOptions = useMemo(() => {
    const seen = new Map<string, string>();
    customers.forEach((c) =>
      c.companies.forEach((co) => seen.set(co.companyId, co.companyName)),
    );
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        q === "" ||
        c.customerName.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.mobile.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.pincode.includes(q) ||
        c.companies.some((co) => co.companyName.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      const matchesCompany =
        companyFilter === "all" ||
        c.companies.some((co) => co.companyId === companyFilter);
      const matchesDay =
        dayFilter === "all" ||
        (dayFilter === "unassigned"
          ? c.companies.some((co) => co.deliveryDay === null)
          : c.companies.some((co) => co.deliveryDay === dayFilter));
      return matchesSearch && matchesStatus && matchesCompany && matchesDay;
    });
  }, [customers, searchQuery, statusFilter, companyFilter, dayFilter]);

  const totalCustomers = customers.length;
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const blockedCount = customers.filter((c) => c.status === "Blocked").length;
  // "Awaiting delivery day" = customers with at least one company
  // missing a delivery day. They're the ones the seller still needs
  // to attend to.
  const unassignedDayCount = customers.filter(
    (c) =>
      c.status === "Active" &&
      c.companies.some((co) => co.deliveryDay === null),
  ).length;

  // Pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const visibleKeys = paginated.map((c) => c.customerId);
  const allOnPageSelected =
    visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k));
  const someOnPageSelected =
    visibleKeys.some((k) => selected.has(k)) && !allOnPageSelected;

  const togglePageSelect = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleKeys.forEach((k) => next.add(k));
      } else {
        visibleKeys.forEach((k) => next.delete(k));
      }
      return next;
    });
  };

  const toggleRow = (customerId: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(customerId);
      else next.delete(customerId);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const filtersActive =
    statusFilter !== "all" ||
    companyFilter !== "all" ||
    dayFilter !== "all";
  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (companyFilter !== "all" ? 1 : 0) +
    (dayFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCompanyFilter("all");
    setDayFilter("all");
    setCurrentPage(1);
  };

  // ---- Bulk Assign Delivery Day ----
  // Bulk assign sets the same day for every company of every selected
  // customer. The Linked Companies popup is the place to set
  // per-company days individually if the seller wants finer control.
  const openAssignDialog = () => {
    setAssignDay("");
    setAssignError(null);
    setIsAssignOpen(true);
  };

  const handleAssign = () => {
    if (!assignDay) {
      setAssignError("Pick a delivery day");
      return;
    }
    const ids = new Set(selected);
    setCustomers((prev) =>
      prev.map((c) =>
        ids.has(c.customerId)
          ? {
              ...c,
              companies: c.companies.map((co) => ({
                ...co,
                deliveryDay: assignDay as DeliveryDay,
              })),
            }
          : c,
      ),
    );
    toast.success(
      `Delivery day set to ${assignDay} for ${ids.size} customer${ids.size === 1 ? "" : "s"}.`,
    );
    setIsAssignOpen(false);
    clearSelection();
  };

  // Set delivery day for a single (customer × company) pairing from
  // the Linked Companies popup.
  const setCompanyDay = (
    customerId: string,
    companyId: string,
    day: DeliveryDay | null,
  ) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.customerId === customerId
          ? {
              ...c,
              companies: c.companies.map((co) =>
                co.companyId === companyId ? { ...co, deliveryDay: day } : co,
              ),
            }
          : c,
      ),
    );
    // Keep the popup in sync so the user sees their change reflected.
    setLinkedCustomer((cur) =>
      cur && cur.customerId === customerId
        ? {
            ...cur,
            companies: cur.companies.map((co) =>
              co.companyId === companyId ? { ...co, deliveryDay: day } : co,
            ),
          }
        : cur,
    );
  };

  // ---- Block flow ----
  const openBlockBulk = () => {
    setBlockTarget({ mode: "bulk", customerIds: Array.from(selected) });
  };

  const openBlockSingle = (customerId: string) => {
    setBlockTarget({ mode: "single", customerIds: [customerId] });
  };

  const handleConfirmBlock = () => {
    if (!blockTarget) return;
    const ids = new Set(blockTarget.customerIds);
    setCustomers((prev) =>
      prev.map((c) =>
        ids.has(c.customerId) ? { ...c, status: "Blocked" } : c,
      ),
    );
    toast.success(
      `${ids.size} customer${ids.size === 1 ? "" : "s"} blocked.`,
    );
    setBlockTarget(null);
    clearSelection();
  };

  // ---- Unblock — convenience action on per-row blocked state ----
  const handleUnblock = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.customerId === customerId ? { ...c, status: "Active" } : c,
      ),
    );
    toast.success("Customer unblocked — they can place orders again.");
  };

  // ---- Export ----
  // CSV stays at line-item resolution (one row per (customer ×
  // company)) so downstream operations teams can still reconcile by
  // company. The customer-level columns repeat across their rows.
  const handleExport = () => {
    const headers = [
      "Customer",
      "Business",
      "Mobile",
      "Class",
      "Area",
      "PIN",
      "Company",
      "Delivery Day",
      "Status",
      "Registered On",
      "Total Orders",
    ];
    const lines = [headers.join(",")];
    filteredCustomers.forEach((c) => {
      c.companies.forEach((co) => {
        lines.push(
          [
            c.customerName,
            c.businessName,
            c.mobile,
            c.classType,
            c.area,
            c.pincode,
            co.companyName,
            co.deliveryDay ?? "—",
            c.status,
            c.registeredDate,
            c.totalOrders,
          ]
            .map(escapeCsv)
            .join(","),
        );
      });
    });
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-demo-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredCustomers.length} customer(s).`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* KPI Summary — four tiles */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-gray-100 text-gray-700 p-2 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-gray-600">Total Customers</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700">
                  {activeCount}
                </div>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-amber-700">
                  {unassignedDayCount}
                </div>
                <p className="text-xs text-gray-600">Awaiting delivery day</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-red-100 text-red-700 p-2 rounded-lg">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-red-700">
                  {blockedCount}
                </div>
                <p className="text-xs text-gray-600">Blocked</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Page area — Card stretches; only the rows scroll. */}
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header — search left, Export + Filters right */}
          <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, business, mobile, company, area, PIN…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-3 h-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {filtersActive && (
                  <Badge className="bg-blue-600 text-white border-blue-600 ml-1 h-5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Bulk action bar — only visible when at least one customer
              is selected. Sits above the table so the seller's eye
              tracks down from the actions to the rows. */}
          {selected.size > 0 && (
            <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
              <div className="text-sm text-blue-900 flex items-center gap-2">
                <Checkbox checked className="pointer-events-none" />
                <b>{selected.size}</b> customer
                {selected.size === 1 ? "" : "s"} selected
                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-2 text-xs text-blue-700 underline hover:text-blue-900"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={openAssignDialog}
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-700" />
                  Assign Delivery Day
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={openBlockBulk}
                >
                  <Ban className="h-3.5 w-3.5" />
                  Block Selected
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="pl-4 pr-2 py-3 w-8">
                    <Checkbox
                      checked={
                        allOnPageSelected
                          ? true
                          : someOnPageSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(v) => togglePageSelect(!!v)}
                      aria-label="Select all customers on this page"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Area / PIN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Delivery Day
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      No customers match your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    const isSel = selected.has(c.customerId);
                    const ds = summariseDays(c.companies);
                    return (
                      <tr
                        key={c.customerId}
                        className={
                          (isSel ? "bg-blue-50/40 " : "") +
                          (c.status === "Blocked" ? "opacity-70 " : "") +
                          "hover:bg-gray-50 transition-colors"
                        }
                      >
                        <td className="pl-4 pr-2 py-3">
                          <Checkbox
                            checked={isSel}
                            onCheckedChange={(v) =>
                              toggleRow(c.customerId, !!v)
                            }
                            aria-label={`Select ${c.customerName}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">
                            {c.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {c.businessName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                          >
                            {c.classType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 font-mono">
                            {c.mobile}
                          </p>
                        </td>
                        {/* Company — count badge that opens the
                            Linked Companies popup. Mirrors the
                            "Approved" tab's pattern in the canonical
                            Customers page. */}
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            onClick={() => setLinkedCustomer(c)}
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            {c.companies.length}{" "}
                            {c.companies.length === 1 ? "company" : "companies"}
                            <ChevronRight className="h-3 w-3 opacity-60" />
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{c.area}</p>
                          <p className="text-xs text-gray-500">{c.pincode}</p>
                        </td>
                        <td className="px-4 py-3">
                          {ds.kind === "single" ? (
                            <Badge
                              variant="outline"
                              className={
                                ds.day === NEXT_DAY
                                  ? "bg-blue-50 text-blue-700 border-blue-200 gap-1"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
                              }
                            >
                              <Calendar className="h-3 w-3" />
                              {ds.day}
                            </Badge>
                          ) : ds.kind === "mixed" ? (
                            <button
                              type="button"
                              onClick={() => setLinkedCustomer(c)}
                              title="Open Linked Companies to see per-company days"
                            >
                              <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 cursor-pointer hover:bg-indigo-100"
                              >
                                <Calendar className="h-3 w-3" />
                                Mixed ({ds.count})
                              </Badge>
                            </button>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Unassigned
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.status === "Active" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
                              <Ban className="h-3 w-3" />
                              Blocked
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.status === "Active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-700 hover:bg-red-50 hover:text-red-700 h-8"
                              onClick={() => openBlockSingle(c.customerId)}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Block
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 h-8"
                              onClick={() => handleUnblock(c.customerId)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Unblock
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <ListPagination
            page={currentPage}
            total={filteredCustomers.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="customer"
          />
        </Card>
      </div>

      {/* Filters drawer — Status + Company + Delivery Day */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Company
                  </Label>
                  <Select
                    value={companyFilter}
                    onValueChange={(v) => {
                      setCompanyFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companyOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Delivery Day
                  </Label>
                  <Select
                    value={dayFilter}
                    onValueChange={(v) => {
                      setDayFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {DELIVERY_DAY_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t border-gray-200 p-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClearFilters();
                  }}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Assign Delivery Day dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Assign Delivery Day
            </DialogTitle>
            <DialogDescription>
              Pick a delivery day for the {selected.size} selected customer
              {selected.size === 1 ? "" : "s"}. The day applies to every
              company they buy from. Use Linked Companies to set per-company
              days individually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">
              Delivery Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={assignDay}
              onValueChange={(v) => {
                setAssignDay(v as DeliveryDay);
                if (assignError) setAssignError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a day…" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                    {d === NEXT_DAY && (
                      <span className="text-[10px] text-blue-700 ml-2">
                        (express)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignError && (
              <p className="flex items-start gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                {assignError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!assignDay}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block confirmation dialog */}
      <Dialog
        open={blockTarget !== null}
        onOpenChange={(o) => !o && setBlockTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Ban className="h-5 w-5" />
              Block customer
              {blockTarget && blockTarget.customerIds.length === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              {blockTarget?.mode === "single"
                ? "This customer won't be able to place new orders. You can unblock them at any time."
                : `${blockTarget?.customerIds.length ?? 0} customer${(blockTarget?.customerIds.length ?? 0) === 1 ? "" : "s"} will be blocked. Affected customers can no longer place orders until you unblock them.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBlock}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Ban className="h-4 w-4" />
              Confirm Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Companies popup — per-company breakdown for one
          customer. Mirrors the canonical "Linked Companies" popup
          on the Customers page. */}
      <Dialog
        open={linkedCustomer !== null}
        onOpenChange={(o) => !o && setLinkedCustomer(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Linked Companies
            </DialogTitle>
            <DialogDescription>
              {linkedCustomer ? (
                <>
                  <b className="text-gray-900">{linkedCustomer.customerName}</b>{" "}
                  · {linkedCustomer.businessName} ·{" "}
                  {linkedCustomer.companies.length}{" "}
                  {linkedCustomer.companies.length === 1
                    ? "company"
                    : "companies"}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {linkedCustomer && (
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
              {linkedCustomer.companies.map((co) => (
                <div
                  key={co.companyId}
                  className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-800 border-gray-200 text-xs"
                    >
                      {co.companyName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 sm:w-56">
                    <Select
                      value={co.deliveryDay ?? "__unassigned__"}
                      onValueChange={(v) =>
                        setCompanyDay(
                          linkedCustomer.customerId,
                          co.companyId,
                          v === "__unassigned__"
                            ? null
                            : (v as DeliveryDay),
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Pick a day…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned__">
                          Unassigned
                        </SelectItem>
                        {DELIVERY_DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                            {d === NEXT_DAY && (
                              <span className="text-[10px] text-blue-700 ml-2">
                                (express)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setLinkedCustomer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
