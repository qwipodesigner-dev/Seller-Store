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
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { customers as allCustomers, CLASS_TYPES, ClassType, Customer } from "../lib/customers-data";

export function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Filters
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [regFromDate, setRegFromDate] = useState<string>("");
  const [regToDate, setRegToDate] = useState<string>("");

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

  // ---- Filtered + sorted customers (most-recent first) ----
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCustomers
      .filter((c) => {
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
      })
      .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
  }, [searchQuery, selectedClassTypes, regFromDate, regToDate]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filteredCustomers.slice(startIdx, startIdx + itemsPerPage);

  const hasActiveFilters =
    selectedClassTypes.length > 0 || regFromDate !== "" || regToDate !== "";

  // ---- Handlers ----
  const handleClearFilters = () => {
    setSelectedClassTypes([]);
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
                      {selectedClassTypes.length + (regFromDate ? 1 : 0) + (regToDate ? 1 : 0)}
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

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Class Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Area / Pincode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Registered Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">No customers found</p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
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
                        <p className="text-sm text-gray-800">{c.area}</p>
                        <p className="text-xs text-gray-500">
                          {c.pincode} · {c.city}
                        </p>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredCustomers.length)}{" "}
                of {filteredCustomers.length} customers
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
    </div>
  );
}
