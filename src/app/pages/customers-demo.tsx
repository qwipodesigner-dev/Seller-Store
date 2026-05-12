import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
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
  Eye,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ListPagination } from "../components/ui/list-pagination";
import {
  DELIVERY_DAY_OPTIONS,
  NEXT_DAY,
  type DeliveryDay,
} from "../lib/customers-data";
import {
  getDemoCustomers,
  setDemoCustomers,
  subscribeToDemoCustomers,
  type CompanyLink as SharedCompanyLink,
  type DemoCustomer as SharedDemoCustomer,
} from "../lib/customers-demo-data";
import { isEmptyMode } from "../lib/data-mode";
import { EmptyState } from "../components/empty-state";

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

// Types and seed live in lib/customers-demo-data.ts so the list page and
// the new detail page (customer-demo-detail.tsx) share the same store —
// a delivery-day change made on either surface is immediately visible
// on the other.
type CompanyLink = SharedCompanyLink;
type DemoCustomer = SharedDemoCustomer;

// Seed data — 7 customers, two of whom span multiple companies so the
// count badge has interesting cases.

// CSV escape helper (one row per customer, with company list joined).
/** Format an ISO date as `26 Apr 2026` for the Linked Companies popup
 *  and the detail page. Falls back to the raw value when the input
 *  isn't a valid date so we never render "Invalid Date". */
const formatRegDate = (iso: string | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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
  const navigate = useNavigate();
  // Source of truth lives in lib/customers-demo-data.ts. We mirror it
  // in local state and re-pull on every store-change notification so
  // mutations from the detail page (or anywhere else) re-render here.
  //
  // Empty-mode (seller persona "Seller (Empty)") forces a zero-row
  // dataset for the inception-day screenshot. We seed `customers`
  // as [] and skip the store subscription so demo data never leaks
  // into the empty screen.
  const isEmpty = isEmptyMode();
  const [customers, setCustomersState] = useState<DemoCustomer[]>(() =>
    isEmpty ? [] : getDemoCustomers(),
  );
  useEffect(() => {
    if (isEmpty) return;
    return subscribeToDemoCustomers(() =>
      setCustomersState([...getDemoCustomers()]),
    );
  }, [isEmpty]);
  // Keep the existing `setCustomers(prev => …)` call sites working by
  // routing them through the shared store. Plain replacement saves
  // touching every site below.
  const setCustomers = (
    updater:
      | ((prev: DemoCustomer[]) => DemoCustomer[])
      | DemoCustomer[],
  ) => {
    const next =
      typeof updater === "function" ? updater(getDemoCustomers()) : updater;
    setDemoCustomers(next);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Per-row checkbox + bulk-action strip were retired in this
  // sweep. With Assign Delivery Day / Block moved to the detail
  // page, the list has no bulk actions left, so the leading
  // checkbox column was pure noise. Keeping the state names out
  // of the file entirely is the cleanest signal that the
  // surface is read-only at the list level.

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Assign Delivery Day state was retired alongside the row
  // checkbox column — the dialog was only reachable via the bulk
  // action strip. Per-company delivery days now live on the
  // detail page.

  // Block / Unblock has moved to the detail page; the list no longer
  // needs the dialog target state.

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

  // Bulk Assign Delivery Day handler removed alongside the row
  // checkbox column. Per-company delivery days are now managed
  // exclusively from the detail page's Linked Companies card.

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

  // Block / Unblock now lives on the detail page (lib/customers-demo-
  // data.ts → setDemoStatus). No list-side handlers needed.

  // ---- Export ----
  // CSV stays at line-item resolution (one row per (customer ×
  // company)) so downstream operations teams can still reconcile by
  // company. Phase 2 column set (locked by spec): Customer ID,
  // Customer Name, Business Name, Mobile, Class, Area, PIN, Company,
  // Status, Registered On — where Registered On is the per-company
  // first-order date, not the customer's overall registration.
  const handleExport = () => {
    const headers = [
      "Customer ID",
      "Customer Name",
      "Business Name",
      "Mobile",
      "Class",
      "Area",
      "PIN",
      "Company",
      "Status",
      "Registered On",
    ];
    const lines = [headers.join(",")];
    filteredCustomers.forEach((c) => {
      c.companies.forEach((co) => {
        lines.push(
          [
            c.customerId.toUpperCase(),
            c.customerName,
            c.businessName,
            c.mobile,
            c.classType,
            c.area,
            c.pincode,
            co.companyName,
            c.status,
            co.registeredAt ?? c.registeredDate,
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
      {/* KPI tiles removed per Phase 2 spec — the list page now starts
          directly with the toolbar + table. Delivery Day management
          moved to the detail page; column removed below too. */}

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
            {/* Filters + Export only render when there's data
                to filter or export. The empty-mode screen keeps
                the search bar (so the chrome reads as a real
                page) but drops these CTAs since neither has
                anything to act on. */}
            {!isEmpty && (
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
            )}
          </div>

          {/* Bulk action bar was removed alongside the row checkbox
              column — Assign Delivery Day / Block live on the
              detail page now, so the list has no bulk actions
              left. */}

          {/* Empty-mode short-circuit. The seller (Empty) persona
              should see no table chrome at all — just the search
              bar above and a clean empty state where the rows
              would go. The pagination underneath is also hidden
              in the same branch. */}
          {isEmpty ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={Users}
                title="No customers yet"
                description="Once retailers register against your brands from the buyer app, they'll auto-register as Active here and appear in this list."
              />
            </div>
          ) : (
            <>
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Business Name
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
                  {/* Area / PIN column removed — full address is shown
                      on the detail page. */}
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
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      No customers match your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    return (
                      <tr
                        key={c.customerId}
                        className={
                          (c.status === "Blocked" ? "opacity-70 " : "") +
                          "hover:bg-gray-50 transition-colors"
                        }
                      >
                        {/* Business Name only — Customer Name was
                            dropped per Phase 2 spec so the row carries
                            one identity, not two. */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left hover:underline focus:outline-none focus-visible:underline"
                            onClick={() =>
                              navigate(`/customers/${c.customerId}`)
                            }
                            title={`View details for ${c.businessName}`}
                          >
                            <p className="font-medium text-gray-900 text-sm">
                              {c.businessName}
                            </p>
                          </button>
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
                        {/* Area / PIN cell removed — full address is
                            on the detail page. Delivery Day was also
                            moved there. */}
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
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-blue-700 hover:bg-blue-50 hover:text-blue-700 h-8"
                              onClick={() =>
                                navigate(`/customers/${c.customerId}`)
                              }
                              title={`View details for ${c.businessName}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            {/* Block / Unblock has moved to the detail
                                page so the seller acknowledges the
                                consequence in context, with the full
                                customer + linked-companies view in
                                front of them. */}
                          </div>
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
            </>
          )}
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

      {/* The Bulk Assign Delivery Day dialog was retired along
          with the row checkbox column — per-company delivery days
          are edited on the customer detail page now. */}

      {/* Block / Unblock dialogs are gone from the list page — they
          live on the detail page now. */}

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
                  <b className="text-gray-900">{linkedCustomer.businessName}</b>
                  {" · "}
                  {linkedCustomer.companies.length}{" "}
                  {linkedCustomer.companies.length === 1 ? "company" : "companies"}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {linkedCustomer && (
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_140px] gap-3 px-3 py-2 bg-gray-50 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                  <span>Company</span>
                  <span>Registration Date</span>
                </div>
                {linkedCustomer.companies.map((co) => (
                  <div
                    key={co.companyId}
                    className="grid grid-cols-[1fr_140px] gap-3 px-3 py-2.5 items-center"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {co.companyName}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {formatRegDate(co.registeredAt)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-2 px-1">
                Registration date is the day the customer placed their first
                order with each company.
              </p>
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
