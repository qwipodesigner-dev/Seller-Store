import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { MultiSelect } from "../components/ui/multi-select";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import {
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  ShoppingCart,
  AlertCircle,
  PackageCheck,
  ExternalLink,
  Calendar,
  X,
  Filter,
  ChevronRight,
  ChevronLeft,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";

// Simplified Order interface with only 4 statuses
interface Order {
  id: string;
  brand: string;
  source: string;
  retailerName: string;
  itemsSummary: string;
  orderValue: number;
  paymentMode: "COD" | "Prepaid";
  orderDate: string;
  status: "New" | "Confirmed" | "Delivered" | "Rejected";
  marketplace: string;
}

// Mock orders with simplified statuses
const mockOrders: Order[] = [
  {
    id: "DKN-2025-12345",
    brand: "Freedom Oil",
    source: "DMS-Bizom",
    retailerName: "Ramesh's Kirana",
    itemsSummary: "15 units Parle-G + 2 more",
    orderValue: 1865,
    paymentMode: "COD",
    orderDate: "2026-03-27",
    status: "New",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12346",
    brand: "Marico",
    source: "DMS-Botery",
    retailerName: "Sharma Grocery Store",
    itemsSummary: "25 units Fortune Oil",
    orderValue: 4125,
    paymentMode: "Prepaid",
    orderDate: "2026-03-27",
    status: "New",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12347",
    brand: "Pepsi",
    source: "DMS-Bizom",
    retailerName: "Balaji Kirana",
    itemsSummary: "100 units Mixed SKUs",
    orderValue: 12450,
    paymentMode: "COD",
    orderDate: "2026-03-26",
    status: "Confirmed",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12348",
    brand: "Freedom Oil",
    source: "DMS-Botery",
    retailerName: "City Supermart",
    itemsSummary: "50 units Britannia Biscuits",
    orderValue: 8750,
    paymentMode: "Prepaid",
    orderDate: "2026-03-26",
    status: "Confirmed",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12349",
    brand: "Marico",
    source: "DMS-Bizom",
    retailerName: "Modern Retail Chain",
    itemsSummary: "200 units Maggi Noodles",
    orderValue: 24000,
    paymentMode: "Prepaid",
    orderDate: "2026-03-25",
    status: "Delivered",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12350",
    brand: "Pepsi",
    source: "DMS-Botery",
    retailerName: "Quick Mart",
    itemsSummary: "30 units Aashirvaad Atta",
    orderValue: 5400,
    paymentMode: "COD",
    orderDate: "2026-03-25",
    status: "Rejected",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12351",
    brand: "Freedom Oil",
    source: "DMS-Bizom",
    retailerName: "Sunrise Traders",
    itemsSummary: "75 units Sunfeast Biscuits",
    orderValue: 6825,
    paymentMode: "Prepaid",
    orderDate: "2026-03-24",
    status: "Confirmed",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12352",
    brand: "Marico",
    source: "DMS-Botery",
    retailerName: "Lucky Store",
    itemsSummary: "40 units Surf Excel",
    orderValue: 9200,
    paymentMode: "COD",
    orderDate: "2026-03-24",
    status: "Confirmed",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12353",
    brand: "Pepsi",
    source: "DMS-Bizom",
    retailerName: "New Era Retail",
    itemsSummary: "60 units Colgate Toothpaste",
    orderValue: 4320,
    paymentMode: "Prepaid",
    orderDate: "2026-03-23",
    status: "New",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12354",
    brand: "Freedom Oil",
    source: "DMS-Botery",
    retailerName: "Himalaya Traders",
    itemsSummary: "90 units Lizol Floor Cleaner",
    orderValue: 10800,
    paymentMode: "COD",
    orderDate: "2026-03-23",
    status: "Delivered",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12355",
    brand: "Marico",
    source: "DMS-Bizom",
    retailerName: "Anand General Store",
    itemsSummary: "120 units Tata Tea Gold",
    orderValue: 19800,
    paymentMode: "Prepaid",
    orderDate: "2026-03-22",
    status: "New",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12356",
    brand: "Pepsi",
    source: "DMS-Botery",
    retailerName: "Premium Retail Pvt Ltd",
    itemsSummary: "80 units Dove Soap",
    orderValue: 6400,
    paymentMode: "COD",
    orderDate: "2026-03-22",
    status: "Delivered",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12357",
    brand: "Freedom Oil",
    source: "DMS-Bizom",
    retailerName: "Vinayak Traders",
    itemsSummary: "45 units Ariel Detergent",
    orderValue: 13500,
    paymentMode: "Prepaid",
    orderDate: "2026-03-21",
    status: "Rejected",
    marketplace: "Amazon",
  },
];

type TabType = "all" | "new" | "confirmed" | "delivered" | "rejected";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("all");
  const [selectedBrandFilters, setSelectedBrandFilters] = useState<string[]>([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Unique brands and statuses for filter options
  const uniqueBrands = useMemo(
    () => Array.from(new Set(orders.map((o) => o.brand))).sort(),
    [orders]
  );
  const statusOptions = [
    { label: "New", value: "New" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Delivered", value: "Delivered" },
    { label: "Rejected", value: "Rejected" },
  ];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Form data
  const [estimatedDispatchDate, setEstimatedDispatchDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [estimatedDispatchTime, setEstimatedDispatchTime] = useState("08:00");
  const [acceptNotes, setAcceptNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Export form data
  const [exportStartDate, setExportStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  );
  const [exportEndDate, setExportEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exportFormat, setExportFormat] = useState("csv");

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "New").length,
      confirmed: orders.filter((o) => o.status === "Confirmed").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      rejected: orders.filter((o) => o.status === "Rejected").length,
    };
  }, [orders]);

  // Get orders for active tab
  const getTabOrders = (tab: TabType): Order[] => {
    const statusMap: Record<Exclude<TabType, "all">, Order["status"]> = {
      new: "New",
      confirmed: "Confirmed",
      delivered: "Delivered",
      rejected: "Rejected",
    };

    return orders.filter((order) => {
      // "all" tab bypasses the status filter
      const matchesStatus =
        tab === "all" ? true : order.status === statusMap[tab];
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.retailerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMarketplace =
        marketplaceFilter === "all" || order.marketplace === marketplaceFilter;
      const matchesBrand =
        selectedBrandFilters.length === 0 || selectedBrandFilters.includes(order.brand);
      const matchesStatusFilter =
        selectedStatusFilters.length === 0 || selectedStatusFilters.includes(order.status);

      let matchesDate = true;
      if (startDate && endDate) {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = orderDate >= start && orderDate <= end;
      }

      return (
        matchesStatus &&
        matchesSearch &&
        matchesMarketplace &&
        matchesBrand &&
        matchesStatusFilter &&
        matchesDate
      );
    });
  };

  const currentTabOrders = useMemo(
    () => getTabOrders(activeTab),
    [activeTab, orders, searchQuery, marketplaceFilter, selectedBrandFilters, selectedStatusFilters, startDate, endDate]
  );

  // Handle select all for current tab
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentTabOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle individual selection
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  // Clear selection when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSelectedOrders([]);
    setCurrentPage(1); // Reset to first page
  };

  // Pagination calculations
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentTabOrders.slice(startIndex, endIndex);
  }, [currentTabOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(currentTabOrders.length / itemsPerPage);
  const totalValue = useMemo(() => {
    return currentTabOrders.reduce((sum, order) => sum + order.orderValue, 0);
  }, [currentTabOrders]);

  // Confirm orders (New → Confirmed)
  const handleConfirmOrders = () => {
    if (!estimatedDispatchDate || !estimatedDispatchTime) {
      toast.error("Please provide estimated dispatch date and time");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        selectedOrders.includes(order.id)
          ? { ...order, status: "Confirmed" as const }
          : order
      )
    );

    toast.success(
      `${selectedOrders.length} order(s) confirmed successfully! Dispatch scheduled for ${estimatedDispatchDate} at ${estimatedDispatchTime}`
    );
    setSelectedOrders([]);
    setIsConfirmDialogOpen(false);
    setAcceptNotes("");
  };

  // Reject orders
  const handleRejectOrders = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        selectedOrders.includes(order.id)
          ? { ...order, status: "Rejected" as const }
          : order
      )
    );

    toast.success(
      `${selectedOrders.length} order(s) rejected. Reason: ${rejectReason}`
    );
    setSelectedOrders([]);
    setIsRejectDialogOpen(false);
    setRejectReason("");
  };

  // Mark as delivered (Confirmed → Delivered)
  const handleDeliverOrders = () => {
    if (!deliveryDate) {
      toast.error("Please provide delivery date");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        selectedOrders.includes(order.id)
          ? { ...order, status: "Delivered" as const }
          : order
      )
    );

    toast.success(
      `${selectedOrders.length} order(s) marked as delivered on ${deliveryDate}!`
    );
    setSelectedOrders([]);
    setIsDeliverDialogOpen(false);
    setDeliveryNotes("");
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setMarketplaceFilter("all");
    setSelectedBrandFilters([]);
    setSelectedStatusFilters([]);
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    searchQuery ||
    marketplaceFilter !== "all" ||
    selectedBrandFilters.length > 0 ||
    selectedStatusFilters.length > 0 ||
    startDate ||
    endDate;

  // Handle export
  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
      toast.error("Please select both start and end dates for export");
      return;
    }

    const start = new Date(exportStartDate);
    const end = new Date(exportEndDate);

    if (start > end) {
      toast.error("Start date cannot be after end date");
      return;
    }

    // Filter orders by export date range
    const ordersToExport = orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= start && orderDate <= end;
    });

    if (ordersToExport.length === 0) {
      toast.error("No orders found in the selected date range");
      return;
    }

    // Generate CSV content
    const headers = [
      "Order ID",
      "Company / Brand",
      "Source",
      "Retailer Name",
      "Order Value",
      "Payment Mode",
      "Order Date",
      "Status",
      "Marketplace",
    ];

    const csvRows = [headers.join(",")];

    ordersToExport.forEach((order) => {
      const row = [
        order.id,
        `"${order.brand}"`,
        order.source,
        `"${order.retailerName}"`,
        order.orderValue,
        order.paymentMode,
        order.orderDate,
        order.status,
        order.marketplace,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${exportStartDate}_to_${exportEndDate}.${exportFormat}`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `Successfully exported ${ordersToExport.length} order(s) from ${exportStartDate} to ${exportEndDate}`
    );
    setIsExportDialogOpen(false);
  };

  // Get status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            New
          </Badge>
        );
      case "Confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Confirmed
          </Badge>
        );
      case "Delivered":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            Delivered
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render action buttons based on active tab
  const renderActionButtons = () => {
    if (selectedOrders.length === 0) return null;

    switch (activeTab) {
      case "new":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm ({selectedOrders.length})
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectDialogOpen(true)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject ({selectedOrders.length})
            </Button>
          </div>
        );

      case "confirmed":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDeliverDialogOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <PackageCheck className="h-4 w-4" />
              Mark as Delivered ({selectedOrders.length})
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectDialogOpen(true)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject ({selectedOrders.length})
            </Button>
          </div>
        );

      case "delivered":
      case "rejected":
      case "all":
        return (
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            {selectedOrders.length} order(s) selected - View only
          </div>
        );

      default:
        return null;
    }
  };

  // Render order table
  const renderOrderTable = (ordersToRender: Order[]) => {
    if (ordersToRender.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {activeTab === "all" ? "No orders" : `No ${activeTab} orders`}
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? "No orders match your current filters"
              : activeTab === "all"
                ? "You don't have any orders yet"
                : `You don't have any ${activeTab} orders at the moment`}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    const isActionable = activeTab === "new" || activeTab === "confirmed";

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {isActionable && (
                <th className="text-left py-4 px-6 w-12">
                  <Checkbox
                    checked={
                      selectedOrders.length === ordersToRender.length &&
                      ordersToRender.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Order ID
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Company / Brand
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Source
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Retailer Name
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Order Value
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Marketplace
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Order Date
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {ordersToRender.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {isActionable && (
                  <td className="py-4 px-6">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOrder(order.id, checked as boolean)
                      }
                    />
                  </td>
                )}
                <td className="py-4 px-6">
                  <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                    {order.id}
                  </code>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">
                    {order.brand}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {order.source}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">
                    {order.retailerName}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-semibold text-gray-900">
                    ₹{order.orderValue.toLocaleString()}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <Badge variant="outline" className="bg-gray-50">
                    {order.marketplace}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{order.orderDate}</p>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(order.status)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Orders Card with Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Tab Headers with Filters */}
              <div className="border-b border-gray-200 p-[12px]">
                <div className="flex items-center justify-between gap-4 overflow-x-auto p-[0px]">
                  {/* Tab Toggle */}
                  <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-shrink-0">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <span className="font-medium">All ({summary.all})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      <span className="font-medium">New ({summary.new})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="confirmed"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span className="font-medium">Confirmed ({summary.confirmed})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="delivered"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <PackageCheck className="h-4 w-4 mr-2" />
                      <span className="font-medium">Delivered ({summary.delivered})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Rejected ({summary.rejected})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Filters Button */}
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setIsFilterDialogOpen(true)}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    
                    {/* Export Button */}
                    <Button 
                      className="gap-2 bg-gray-900 hover:bg-gray-800 text-white" 
                      onClick={() => setIsExportDialogOpen(true)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Bulk Action Buttons for New Tab */}
                {/* Removed - now beside search bar */}

                {/* Bulk Action Buttons for Confirmed Tab */}
                {/* Removed - now beside search bar */}
              </div>

              {/* Applied Filter Tags */}
              {(selectedBrandFilters.length > 0 || selectedStatusFilters.length > 0 || marketplaceFilter !== "all") && (
                <div className="px-6 py-2 border-b flex flex-wrap items-center gap-2">
                  {selectedBrandFilters.map((brand) => (
                    <Badge key={brand} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {brand}
                      <button onClick={() => setSelectedBrandFilters(selectedBrandFilters.filter(b => b !== brand))} className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedStatusFilters.map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {status}
                      <button onClick={() => setSelectedStatusFilters(selectedStatusFilters.filter(s => s !== status))} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {marketplaceFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-green-50 text-green-700 border-green-200">
                      {marketplaceFilter}
                      <button onClick={() => setMarketplaceFilter("all")} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 text-xs h-6">
                    Clear all
                  </Button>
                </div>
              )}

            {/* Tab Contents */}
            <TabsContent value="all" className="mt-0">
              {/* Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID, retailer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              {renderOrderTable(paginatedOrders)}

              {/* Pagination */}
              {currentTabOrders.length > 0 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentTabOrders.length)} of{" "}
                    {currentTabOrders.length} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              {/* Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID, retailer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Bulk Action Buttons */}
                  {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 mr-2">{selectedOrders.length} selected</span>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => setIsConfirmDialogOpen(true)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              {renderOrderTable(paginatedOrders)}

              {/* Pagination */}
              {currentTabOrders.length > 0 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentTabOrders.length)} of{" "}
                    {currentTabOrders.length} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-0">
              {/* Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID, retailer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Bulk Action Buttons */}
                  {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 mr-2">{selectedOrders.length} selected</span>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => setIsDeliverDialogOpen(true)}
                      >
                        <Truck className="h-4 w-4" />
                        Mark Delivered
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              {renderOrderTable(paginatedOrders)}
            </TabsContent>

            <TabsContent value="delivered" className="mt-0">
              {/* Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order ID, retailer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              {renderOrderTable(paginatedOrders)}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {/* Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order ID, retailer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              {renderOrderTable(paginatedOrders)}
            </TabsContent>
          </Tabs>
        </Card>
        </div>
      </div>

      {/* Confirm Orders Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Confirm Orders
            </DialogTitle>
            <DialogDescription>
              You are about to confirm {selectedOrders.length} order(s). Please
              provide dispatch details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dispatchDate">
                Estimated Dispatch Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dispatchDate"
                type="date"
                value={estimatedDispatchDate}
                onChange={(e) => setEstimatedDispatchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispatchTime">
                Estimated Dispatch Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dispatchTime"
                type="time"
                value={estimatedDispatchTime}
                onChange={(e) => setEstimatedDispatchTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acceptNotes">Notes (Optional)</Label>
              <Textarea
                id="acceptNotes"
                placeholder="Add any special instructions or notes..."
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmOrders} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Confirm {selectedOrders.length} Order(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Orders Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Orders
            </DialogTitle>
            <DialogDescription>
              You are about to reject {selectedOrders.length} order(s). Please
              provide a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectReason"
                placeholder="e.g., Out of stock, Cannot deliver to location, Customer request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Rejected orders will be notified to the customer and cannot be
                undone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOrders}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject {selectedOrders.length} Order(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Delivered Dialog */}
      <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Mark as Delivered
            </DialogTitle>
            <DialogDescription>
              Confirm delivery for {selectedOrders.length} order(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">
                Delivery Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="Add delivery confirmation details..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Delivery confirmation will be sent to customers.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeliverDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeliverOrders}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <PackageCheck className="h-4 w-4" />
              Mark {selectedOrders.length} as Delivered
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Orders Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Orders
            </DialogTitle>
            <DialogDescription>
              Select the date range and format to export orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exportStartDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exportStartDate"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportEndDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exportEndDate"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportFormat">
                Format <span className="text-red-500">*</span>
              </Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export {orders.length} Order(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Orders Drawer */}
      <AnimatePresence>
        {isFilterDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFilterDialogOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filter Orders</h2>
                <button
                  onClick={() => setIsFilterDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Company / Brand</Label>
                    <MultiSelect
                      options={uniqueBrands.map((b) => ({ label: b, value: b }))}
                      selected={selectedBrandFilters}
                      onChange={setSelectedBrandFilters}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <MultiSelect
                      options={statusOptions}
                      selected={selectedStatusFilters}
                      onChange={setSelectedStatusFilters}
                      placeholder="All Status"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketplaceFilter">Marketplace</Label>
                    <Select
                      value={marketplaceFilter}
                      onValueChange={setMarketplaceFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Marketplace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Marketplaces</SelectItem>
                        <SelectItem value="ONDC">ONDC</SelectItem>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="Flipkart">Flipkart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full"
                        placeholder="Start Date"
                      />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full"
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setIsFilterDialogOpen(false)}
                >
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