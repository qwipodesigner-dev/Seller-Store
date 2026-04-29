import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { MultiSelect } from "../components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Search,
  Eye,
  Users,
  UserCheck,
  ShoppingBag,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  customers as allCustomers,
  CLASS_TYPES,
  ClassType,
  Customer,
  type CompanyApproval,
  type DeliveryDay,
  DELIVERY_DAY_OPTIONS,
} from "../lib/customers-data";

type TabKey = "pending" | "approved" | "rejected";

export function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Tabs split the list by approval status so the seller doesn't have to filter
  // manually. Pending shows ONE ROW PER (customer × company) — so a buyer who
  // requested two brands shows up as two rows. Approved & Rejected are GROUPED
  // by mobile (the customer-uniqueness key) — multiple brands collapse into a
  // single row with a "View Companies" button for the breakdown.
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  // Filters
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [regFromDate, setRegFromDate] = useState<string>("");
  const [regToDate, setRegToDate] = useState<string>("");

  // Per-customer "Linked Companies" detail popup — used when the seller clicks
  // a row's status pill so we don't drown the table in inline detail.
  const [breakdownCustomer, setBreakdownCustomer] = useState<Customer | null>(null);

  // ---- In-page mutable approvals (so Approve/Reject can act inline) ----
  // Keyed by customerId. Falls back to the seeded data when no override exists.
  const [overrides, setOverrides] = useState<Record<string, CompanyApproval[]>>({});
  const getApprovalsFor = (c: Customer): CompanyApproval[] =>
    overrides[c.id] ?? c.companyApprovals ?? [];
  const setApprovalsFor = (customerId: string, next: CompanyApproval[]) =>
    setOverrides((prev) => ({ ...prev, [customerId]: next }));

  // ---- Inline Approve / Reject dialogs ----
  const [approveTarget, setApproveTarget] = useState<{ customer: Customer; companyId: string } | null>(null);
  const [approveDeliveryDay, setApproveDeliveryDay] = useState<DeliveryDay | "">("");
  const [rejectTarget, setRejectTarget] = useState<{ customer: Customer; companyId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOtherReason, setRejectOtherReason] = useState("");

  const todayIso = () => new Date().toISOString().slice(0, 10);

  const openApprove = (customer: Customer, companyId: string) => {
    setApproveTarget({ customer, companyId });
    setApproveDeliveryDay("");
  };
  const closeApprove = () => {
    setApproveTarget(null);
    setApproveDeliveryDay("");
  };
  const handleApprove = () => {
    if (!approveTarget || !approveDeliveryDay) return;
    const { customer, companyId } = approveTarget;
    const next = getApprovalsFor(customer).map((a) =>
      a.companyId === companyId
        ? {
            ...a,
            status: "approved" as const,
            deliveryDay: approveDeliveryDay,
            decidedAt: todayIso(),
            rejectionReason: undefined,
          }
        : a,
    );
    setApprovalsFor(customer.id, next);
    const co = next.find((a) => a.companyId === companyId);
    toast.success(
      `Approved ${customer.businessName} for ${co?.companyName} · delivery ${approveDeliveryDay}`,
    );
    closeApprove();
  };

  const openReject = (customer: Customer, companyId: string) => {
    setRejectTarget({ customer, companyId });
    setRejectReason("");
    setRejectOtherReason("");
  };
  const closeReject = () => {
    setRejectTarget(null);
    setRejectReason("");
    setRejectOtherReason("");
  };
  const handleReject = () => {
    if (!rejectTarget) return;
    const reason = rejectReason === "Other" ? rejectOtherReason : rejectReason;
    if (!reason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    const { customer, companyId } = rejectTarget;
    const next = getApprovalsFor(customer).map((a) =>
      a.companyId === companyId
        ? {
            ...a,
            status: "rejected" as const,
            deliveryDay: undefined,
            decidedAt: todayIso(),
            rejectionReason: reason,
          }
        : a,
    );
    setApprovalsFor(customer.id, next);
    const co = next.find((a) => a.companyId === companyId);
    toast.error(`Rejected ${customer.businessName} for ${co?.companyName}`);
    closeReject();
  };

  // ---- Multi-select bulk actions on the Pending tab ----
  // Selection key = `${customerId}__${companyId}` so the same buyer's
  // requests for different brands stay independent.
  const rowKey = (customerId: string, companyId: string) =>
    `${customerId}__${companyId}`;
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const toggleRow = (key: string) =>
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const clearSelection = () => setSelectedRows(new Set());

  // Bulk dialogs
  const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
  const [bulkApproveDeliveryDay, setBulkApproveDeliveryDay] = useState<DeliveryDay | "">("");
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkRejectOtherReason, setBulkRejectOtherReason] = useState("");

  const handleBulkApprove = () => {
    if (!bulkApproveDeliveryDay) {
      toast.error("Please select a delivery day to apply to all.");
      return;
    }
    if (selectedRows.size === 0) return;
    // Group selections by customerId so we apply patches in one update per customer.
    const byCustomer = new Map<string, Set<string>>();
    selectedRows.forEach((k) => {
      const [cid, coid] = k.split("__");
      if (!byCustomer.has(cid)) byCustomer.set(cid, new Set());
      byCustomer.get(cid)!.add(coid);
    });
    setOverrides((prev) => {
      const next = { ...prev };
      byCustomer.forEach((coIds, cid) => {
        const customer = allCustomers.find((c) => c.id === cid);
        if (!customer) return;
        const current = next[cid] ?? customer.companyApprovals ?? [];
        next[cid] = current.map((a) =>
          coIds.has(a.companyId)
            ? {
                ...a,
                status: "approved" as const,
                deliveryDay: bulkApproveDeliveryDay as DeliveryDay,
                decidedAt: todayIso(),
                rejectionReason: undefined,
              }
            : a,
        );
      });
      return next;
    });
    toast.success(
      `Approved ${selectedRows.size} request${selectedRows.size === 1 ? "" : "s"} · delivery ${bulkApproveDeliveryDay}`,
    );
    setBulkApproveOpen(false);
    setBulkApproveDeliveryDay("");
    clearSelection();
  };

  const handleBulkReject = () => {
    const reason = bulkRejectReason === "Other" ? bulkRejectOtherReason : bulkRejectReason;
    if (!reason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    if (selectedRows.size === 0) return;
    const byCustomer = new Map<string, Set<string>>();
    selectedRows.forEach((k) => {
      const [cid, coid] = k.split("__");
      if (!byCustomer.has(cid)) byCustomer.set(cid, new Set());
      byCustomer.get(cid)!.add(coid);
    });
    setOverrides((prev) => {
      const next = { ...prev };
      byCustomer.forEach((coIds, cid) => {
        const customer = allCustomers.find((c) => c.id === cid);
        if (!customer) return;
        const current = next[cid] ?? customer.companyApprovals ?? [];
        next[cid] = current.map((a) =>
          coIds.has(a.companyId)
            ? {
                ...a,
                status: "rejected" as const,
                deliveryDay: undefined,
                decidedAt: todayIso(),
                rejectionReason: reason,
              }
            : a,
        );
      });
      return next;
    });
    toast.error(
      `Rejected ${selectedRows.size} request${selectedRows.size === 1 ? "" : "s"} · ${reason}`,
    );
    setBulkRejectOpen(false);
    setBulkRejectReason("");
    setBulkRejectOtherReason("");
    clearSelection();
  };

  // Export date range
  const [exportFrom, setExportFrom] = useState<string>("");
  const [exportTo, setExportTo] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---- Derived stats ----
  const totalCustomers = allCustomers.length;
  const activeCustomers = allCustomers.filter((c) => c.totalOrders > 0).length;
  const newThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return allCustomers.filter((c) => new Date(c.registeredDate) >= monthStart).length;
  }, []);
  const repeatBuyers = allCustomers.filter((c) => c.totalOrders >= 10).length;

  // Master list of every (Company name, Company id) pair we know about across
  // all customers — drives the multi-select Brand/Company filter.
  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    allCustomers.forEach((c) => {
      (overrides[c.id] ?? c.companyApprovals ?? []).forEach((a) => {
        if (!map.has(a.companyId)) map.set(a.companyId, a.companyName);
      });
    });
    return Array.from(map, ([id, name]) => ({ value: id, label: name })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [overrides]);

  // Counts per tab (always reflect search/class/date/company filters so the
  // numbers match the rows the seller will see in each tab).
  const matchesBaseFilters = (c: Customer) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      c.customerName.toLowerCase().includes(q) ||
      c.businessName.toLowerCase().includes(q) ||
      c.mobile.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
      c.area.toLowerCase().includes(q) ||
      c.pincode.includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchesClass =
      selectedClassTypes.length === 0 || selectedClassTypes.includes(c.classType);
    const matchesDateFrom = !regFromDate || c.registeredDate >= regFromDate;
    const matchesDateTo = !regToDate || c.registeredDate <= regToDate;
    return matchesSearch && matchesClass && matchesDateFrom && matchesDateTo;
  };

  // Pending rows = one row per (customer, pending company-approval).
  type PendingRow = { customer: Customer; approval: CompanyApproval };
  const pendingRows: PendingRow[] = useMemo(() => {
    return allCustomers
      .filter(matchesBaseFilters)
      .flatMap((c) =>
        getApprovalsFor(c)
          .filter((a) => a.status === "pending")
          .filter((a) =>
            selectedCompanies.length === 0
              ? true
              : selectedCompanies.includes(a.companyId),
          )
          .map<PendingRow>((approval) => ({ customer: c, approval })),
      )
      .sort((a, b) =>
        b.customer.registeredDate.localeCompare(a.customer.registeredDate),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedClassTypes, selectedCompanies, regFromDate, regToDate, overrides]);

  // Approved / Rejected rows = grouped by customer (mobile uniqueness),
  // include only customers that have at least one matching approval.
  const buildGrouped = (status: "approved" | "rejected") =>
    allCustomers
      .filter(matchesBaseFilters)
      .filter((c) => {
        const list = getApprovalsFor(c).filter((a) => a.status === status);
        if (list.length === 0) return false;
        if (selectedCompanies.length === 0) return true;
        return list.some((a) => selectedCompanies.includes(a.companyId));
      })
      .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));

  const approvedRows: Customer[] = useMemo(
    () => buildGrouped("approved"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, selectedClassTypes, selectedCompanies, regFromDate, regToDate, overrides],
  );
  const rejectedRows: Customer[] = useMemo(
    () => buildGrouped("rejected"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, selectedClassTypes, selectedCompanies, regFromDate, regToDate, overrides],
  );

  const tabCount = (k: TabKey) =>
    k === "pending"
      ? pendingRows.length
      : k === "approved"
        ? approvedRows.length
        : rejectedRows.length;

  // ---- Pagination on the active tab ----
  const activeRows: any[] =
    activeTab === "pending"
      ? pendingRows
      : activeTab === "approved"
        ? approvedRows
        : rejectedRows;
  const totalPages = Math.max(1, Math.ceil(activeRows.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = activeRows.slice(startIdx, startIdx + itemsPerPage);

  const hasActiveFilters =
    selectedClassTypes.length > 0 ||
    selectedCompanies.length > 0 ||
    regFromDate !== "" ||
    regToDate !== "";

  // ---- Handlers ----
  const handleClearFilters = () => {
    setSelectedClassTypes([]);
    setSelectedCompanies([]);
    setRegFromDate("");
    setRegToDate("");
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
  };

  const getClassTypeBadge = (classType: ClassType) => {
    const colorMap: Record<ClassType, string> = {
      Kirana: "bg-blue-50 text-blue-700 border-blue-200",
      Wholesaler: "bg-purple-50 text-purple-700 border-purple-200",
      Bakery: "bg-amber-50 text-amber-700 border-amber-200",
      Grocery: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Supermarket: "bg-cyan-50 text-cyan-700 border-cyan-200",
      Restaurant: "bg-rose-50 text-rose-700 border-rose-200",
      Hotel: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <Badge variant="outline" className={`text-xs font-medium ${colorMap[classType]}`}>
        {classType}
      </Badge>
    );
  };

  const handleExport = () => {
    // Filter by export date range (applied ONLY to the export, not the table)
    const rowsToExport = allCustomers.filter((c) => {
      const from = !exportFrom || c.registeredDate >= exportFrom;
      const to = !exportTo || c.registeredDate <= exportTo;
      return from && to;
    });

    if (rowsToExport.length === 0) {
      toast.error("No customers found in the selected date range");
      return;
    }

    const headers = [
      "Customer ID",
      "Customer Name",
      "Business Name",
      "Class Type",
      "Mobile Number",
      "Area",
      "Pincode",
      "City",
      "State",
      "Full Address",
      "Latitude",
      "Longitude",
      "Registered Date (First Order)",
      "Total Orders",
      "Total Revenue (INR)",
      "Email",
      "GST Number",
    ];
    const toCell = (v: string | number | undefined) => {
      const s = v === undefined || v === null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(toCell).join(","),
      ...rowsToExport.map((c) =>
        [
          c.id,
          c.customerName,
          c.businessName,
          c.classType,
          c.mobile,
          c.area,
          c.pincode,
          c.city,
          c.state,
          c.fullAddress,
          c.latitude,
          c.longitude,
          c.registeredDate,
          c.totalOrders,
          c.totalRevenue,
          c.email ?? "",
          c.gstNumber ?? "",
        ]
          .map(toCell)
          .join(","),
      ),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label =
      exportFrom || exportTo ? `${exportFrom || "start"}_to_${exportTo || "end"}` : "all";
    a.href = url;
    a.download = `customers_${label}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rowsToExport.length} customer${rowsToExport.length === 1 ? "" : "s"}`);
    setIsExportDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* KPI Summary */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-7 w-7 text-gray-600" />
                <div>
                  <div className="text-xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-gray-600">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-7 w-7 text-green-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">{activeCustomers}</div>
                  <p className="text-xs text-gray-600">Active Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-7 w-7 text-blue-600" />
                <div>
                  <div className="text-xl font-bold text-blue-600">{newThisMonth}</div>
                  <p className="text-xs text-gray-600">New this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-7 w-7 text-purple-600" />
                <div>
                  <div className="text-xl font-bold text-purple-600">{repeatBuyers}</div>
                  <p className="text-xs text-gray-600">Repeat buyers (10+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Tabs — Pending / Approved / Rejected */}
          <div className="border-b border-gray-200 px-4 pt-3">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(
                [
                  { key: "pending", label: "Pending Approval", icon: Clock, color: "amber" },
                  { key: "approved", label: "Approved", icon: CheckCircle2, color: "green" },
                  { key: "rejected", label: "Rejected", icon: XCircle, color: "red" },
                ] as const
              ).map(({ key, label, icon: Icon, color }) => {
                const active = activeTab === key;
                const count = tabCount(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveTab(key);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        color === "amber"
                          ? "text-amber-600"
                          : color === "green"
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    />
                    {label}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        active
                          ? color === "amber"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : color === "green"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header with Search + Actions */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, business, mobile, area or pincode..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="bg-blue-600 text-white border-blue-600 ml-1 h-5 px-1.5 text-[10px]">
                      {selectedClassTypes.length +
                        selectedCompanies.length +
                        (regFromDate ? 1 : 0) +
                        (regToDate ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setExportFrom("");
                    setExportTo("");
                    setIsExportDialogOpen(true);
                  }}
                  className="gap-2 flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Applied Filter Tags */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selectedClassTypes.map((ct) => (
                  <Badge
                    key={ct}
                    variant="secondary"
                    className="gap-1 pl-2 pr-1 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Class: {ct}
                    <button
                      onClick={() => {
                        setSelectedClassTypes(selectedClassTypes.filter((x) => x !== ct));
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedCompanies.map((coId) => {
                  const label = companyOptions.find((o) => o.value === coId)?.label ?? coId;
                  return (
                    <Badge
                      key={coId}
                      variant="secondary"
                      className="gap-1 pl-2 pr-1 py-1 text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                      Company: {label}
                      <button
                        onClick={() => {
                          setSelectedCompanies(selectedCompanies.filter((x) => x !== coId));
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {regFromDate && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pl-2 pr-1 py-1 text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Registered from: {regFromDate}
                    <button
                      onClick={() => {
                        setRegFromDate("");
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {regToDate && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pl-2 pr-1 py-1 text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Registered to: {regToDate}
                    <button
                      onClick={() => {
                        setRegToDate("");
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-500 text-xs h-6"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Bulk-action bar — shown only on Pending tab when at least one
              row is selected. Lets the seller approve / reject multiple
              requests at once with a single delivery-day or rejection reason. */}
          {activeTab === "pending" && selectedRows.size > 0 && (
            <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-blue-900 flex items-center gap-2">
                <Checkbox checked className="pointer-events-none" />
                <b>{selectedRows.size}</b> request
                {selectedRows.size === 1 ? "" : "s"} selected
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
                  className="h-8 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setBulkRejectReason("");
                    setBulkRejectOtherReason("");
                    setBulkRejectOpen(true);
                  }}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Reject Selected
                </Button>
                <Button
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setBulkApproveDeliveryDay("");
                    setBulkApproveOpen(true);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Approve Selected
                </Button>
              </div>
            </div>
          )}

          {/* Tab-aware Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                {activeTab === "pending" ? (
                  (() => {
                    const visibleKeys = (paginated as PendingRow[]).map((r) =>
                      rowKey(r.customer.id, r.approval.companyId),
                    );
                    const allSelected =
                      visibleKeys.length > 0 &&
                      visibleKeys.every((k) => selectedRows.has(k));
                    const someSelected =
                      visibleKeys.some((k) => selectedRows.has(k)) && !allSelected;
                    return (
                      <tr>
                        <th className="pl-4 pr-2 py-3 w-8">
                          <Checkbox
                            checked={allSelected ? true : someSelected ? "indeterminate" : false}
                            onCheckedChange={(v) => {
                              if (v) {
                                setSelectedRows((prev) => {
                                  const next = new Set(prev);
                                  visibleKeys.forEach((k) => next.add(k));
                                  return next;
                                });
                              } else {
                                setSelectedRows((prev) => {
                                  const next = new Set(prev);
                                  visibleKeys.forEach((k) => next.delete(k));
                                  return next;
                                });
                              }
                            }}
                            aria-label="Select all on this page"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Business</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand / Company</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Area / Pincode</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Registered</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    );
                  })()
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Linked Companies</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Area / Pincode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "pending" ? 9 : 8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {activeTab === "pending"
                            ? "No pending requests"
                            : activeTab === "approved"
                              ? "No approved customers"
                              : "No rejected customers"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : activeTab === "pending" ? (
                  (paginated as PendingRow[]).map(({ customer: c, approval: a }) => {
                    const k = rowKey(c.id, a.companyId);
                    const selected = selectedRows.has(k);
                    return (
                    <tr
                      key={k}
                      className={`hover:bg-gray-50 transition-colors ${selected ? "bg-blue-50/50" : ""}`}
                    >
                      <td className="pl-4 pr-2 py-4 align-top">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleRow(k)}
                          aria-label={`Select ${c.businessName} for ${a.companyName}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{c.customerName}</p>
                      </td>
                      <td className="px-4 py-4">{getClassTypeBadge(c.classType)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-800">{c.businessName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 whitespace-nowrap">{c.mobile}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {a.companyName}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-800">{c.area}</p>
                        <p className="text-xs text-gray-500">{c.pincode} · {c.city}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 whitespace-nowrap">{c.registeredDate}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => openReject(c, a.companyId)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700"
                            onClick={() => openApprove(c, a.companyId)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                            onClick={() => navigate(`/customers/${c.id}`)}
                            title="Open customer detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  // approved / rejected — grouped by mobile, "View Companies" popup for detail
                  (paginated as Customer[]).map((c) => {
                    const approvals = getApprovalsFor(c);
                    const matchingStatus = activeTab === "approved" ? "approved" : "rejected";
                    const matching = approvals.filter((a) => a.status === matchingStatus);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 text-sm">{c.customerName}</p>
                        </td>
                        <td className="px-4 py-4">{getClassTypeBadge(c.classType)}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-800">{c.businessName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 whitespace-nowrap">{c.mobile}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-7 gap-1.5 ${
                              activeTab === "approved"
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                            onClick={() => setBreakdownCustomer(c)}
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            {matching.length} {matching.length === 1 ? "company" : "companies"}
                            <ChevronRight className="h-3 w-3 opacity-60" />
                          </Button>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-800">{c.area}</p>
                          <p className="text-xs text-gray-500">{c.pincode} · {c.city}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 whitespace-nowrap">{c.registeredDate}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 px-2.5"
                            onClick={() => navigate(`/customers/${c.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {activeRows.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, activeRows.length)}{" "}
                of {activeRows.length}{" "}
                {activeTab === "pending" ? "pending requests" : "customers"}
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Customers
            </DialogTitle>
            <DialogDescription>
              Select a registration date range. The file includes customer name, business name,
              class type, mobile, full address, lat/long, pincode, and order history. Downloads as
              a CSV that opens in Excel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="export-from">Registered From</Label>
              <Input
                id="export-from"
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-to">Registered To</Label>
              <Input
                id="export-to"
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-1">
            Leave dates empty to export all customers.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (exportFrom && exportTo && exportFrom > exportTo) {
                  toast.error("'From' date must be before 'To' date");
                  return;
                }
                handleExport();
              }}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer (inline) */}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filter Customers</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Brand / Company filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    Brand / Company
                  </Label>
                  <MultiSelect
                    options={companyOptions}
                    selected={selectedCompanies}
                    onChange={setSelectedCompanies}
                    placeholder="All companies"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Filter rows to specific brand/company onboarding requests.
                  </p>
                </div>

                {/* Class Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-gray-500" />
                    Class Type
                  </Label>
                  <MultiSelect
                    options={CLASS_TYPES.map((ct) => ({ label: ct, value: ct }))}
                    selected={selectedClassTypes}
                    onChange={setSelectedClassTypes}
                    placeholder="All class types"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Filter by business category (Kirana, Wholesaler, Bakery, etc.)
                  </p>
                </div>

                {/* Registration Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Registration Date Range
                  </Label>
                  <p className="text-xs text-gray-500">
                    "Registered" = date of the customer's first order.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="filter-from" className="text-xs text-gray-600">From</Label>
                      <Input
                        id="filter-from"
                        type="date"
                        value={regFromDate}
                        onChange={(e) => setRegFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="filter-to" className="text-xs text-gray-600">To</Label>
                      <Input
                        id="filter-to"
                        type="date"
                        value={regToDate}
                        onChange={(e) => setRegToDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                  Clear
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleApplyFilters}>
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Approve dialog — applies one delivery day to every selected row. */}
      <Dialog open={bulkApproveOpen} onOpenChange={setBulkApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve {selectedRows.size} request{selectedRows.size === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              Pick one delivery day — it will be applied to every selected
              customer × company request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-xs">
              Delivery Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={bulkApproveDeliveryDay}
              onValueChange={(v) => setBulkApproveDeliveryDay(v as DeliveryDay)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a delivery day…" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "Next Day" ? "Next Day Delivery (NDD)" : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">
              All selected requests will be approved with this same day.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={!bulkApproveDeliveryDay}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve {selectedRows.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject dialog */}
      <Dialog open={bulkRejectOpen} onOpenChange={setBulkRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject {selectedRows.size} request{selectedRows.size === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              Pick one reason — it will be applied to every selected request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <RadioGroup value={bulkRejectReason} onValueChange={setBulkRejectReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Outside Service Area" id="br1" />
                <Label htmlFor="br1">Outside Service Area</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Incomplete Information" id="br2" />
                <Label htmlFor="br2">Incomplete Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Invalid Documents" id="br3" />
                <Label htmlFor="br3">Invalid Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Duplicate Registration" id="br4" />
                <Label htmlFor="br4">Duplicate Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="br5" />
                <Label htmlFor="br5">Other</Label>
              </div>
            </RadioGroup>
            {bulkRejectReason === "Other" && (
              <Textarea
                placeholder="Please specify the reason..."
                value={bulkRejectOtherReason}
                onChange={(e) => setBulkRejectOtherReason(e.target.value)}
                rows={3}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={
                !bulkRejectReason || (bulkRejectReason === "Other" && !bulkRejectOtherReason)
              }
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject {selectedRows.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline Approve dialog — fires straight from the Pending tab row.
          Forces the seller to assign a delivery day (Mon–Sun OR Next Day). */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && closeApprove()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve customer
            </DialogTitle>
            <DialogDescription>
              Approve <b>{approveTarget?.customer.businessName}</b> for{" "}
              <b>
                {(approveTarget &&
                  getApprovalsFor(approveTarget.customer).find(
                    (a) => a.companyId === approveTarget.companyId,
                  )?.companyName) ??
                  ""}
              </b>{" "}
              and pin a delivery day for this customer's beat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-xs">
              Delivery Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={approveDeliveryDay}
              onValueChange={(v) => setApproveDeliveryDay(v as DeliveryDay)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a delivery day…" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "Next Day" ? "Next Day Delivery (NDD)" : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">
              Pin a fixed weekday or commit to next-day delivery.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApprove}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={!approveDeliveryDay}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && closeReject()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject customer
            </DialogTitle>
            <DialogDescription>
              Reject <b>{rejectTarget?.customer.businessName}</b> for{" "}
              <b>
                {(rejectTarget &&
                  getApprovalsFor(rejectTarget.customer).find(
                    (a) => a.companyId === rejectTarget.companyId,
                  )?.companyName) ??
                  ""}
              </b>
              . Pick a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <RadioGroup value={rejectReason} onValueChange={setRejectReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Outside Service Area" id="r1" />
                <Label htmlFor="r1">Outside Service Area</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Incomplete Information" id="r2" />
                <Label htmlFor="r2">Incomplete Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Invalid Documents" id="r3" />
                <Label htmlFor="r3">Invalid Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Duplicate Registration" id="r4" />
                <Label htmlFor="r4">Duplicate Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="r5" />
                <Label htmlFor="r5">Other</Label>
              </div>
            </RadioGroup>
            {rejectReason === "Other" && (
              <Textarea
                placeholder="Please specify the reason..."
                value={rejectOtherReason}
                onChange={(e) => setRejectOtherReason(e.target.value)}
                rows={3}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReject}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason || (rejectReason === "Other" && !rejectOtherReason)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Per-customer Linked Companies breakdown popup. Triggered by clicking
          the company chips in the table — keeps the table compact while still
          giving the seller the full per-company status / delivery-day view. */}
      <Dialog open={!!breakdownCustomer} onOpenChange={(o) => !o && setBreakdownCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              Linked Companies
            </DialogTitle>
            <DialogDescription>
              Per-company approval status for{" "}
              <b>{breakdownCustomer?.businessName}</b> ({breakdownCustomer?.mobile}).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            {(breakdownCustomer ? getApprovalsFor(breakdownCustomer) : []).map((a) => (
              <div
                key={a.companyId}
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{a.companyName}</p>
                  {a.status === "approved" && a.deliveryDay && (
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Delivery day: <b>{a.deliveryDay}</b>
                      {a.decidedAt ? ` · approved ${a.decidedAt}` : ""}
                    </p>
                  )}
                  {a.status === "rejected" && (
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {a.rejectionReason ? `Reason: ${a.rejectionReason}` : "Rejected"}
                      {a.decidedAt ? ` · ${a.decidedAt}` : ""}
                    </p>
                  )}
                  {a.status === "pending" && (
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Awaiting seller approval.
                    </p>
                  )}
                </div>
                <CompanyApprovalChip approval={a} />
              </div>
            ))}
            {(breakdownCustomer ? getApprovalsFor(breakdownCustomer) : []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No companies linked to this customer yet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBreakdownCustomer(null)}
            >
              Close
            </Button>
            {breakdownCustomer && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={() => {
                  navigate(`/customers/${breakdownCustomer.id}`);
                  setBreakdownCustomer(null);
                }}
              >
                <Eye className="h-4 w-4" />
                Open Customer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Compact pill showing one company's approval status. Includes the
// delivery day for approved entries so the seller sees the schedule at a glance.
function CompanyApprovalChip({ approval }: { approval: CompanyApproval }) {
  const colorMap = {
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  } as const;
  const labelMap = {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
  } as const;
  const dayShort = (d?: string) =>
    !d ? "" : d === "Next Day" ? "NDD" : d.slice(0, 3);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded px-1.5 py-0.5 ${colorMap[approval.status]}`}
      title={`${approval.companyName} — ${labelMap[approval.status]}${
        approval.deliveryDay ? ` · ${approval.deliveryDay}` : ""
      }`}
    >
      <span className="font-semibold">{approval.companyName}</span>
      <span className="opacity-70">·</span>
      <span>{labelMap[approval.status]}</span>
      {approval.status === "approved" && approval.deliveryDay && (
        <>
          <span className="opacity-70">·</span>
          <span>{dayShort(approval.deliveryDay)}</span>
        </>
      )}
    </span>
  );
}
