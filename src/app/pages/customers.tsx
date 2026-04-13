import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  CheckCircle2,
  XCircle,
  Eye,
  Settings,
  Database,
  ShoppingBag,
  Users,
  UserCheck,
  Zap,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { FilterDrawer } from "../components/FilterDrawer";
import { CustomerSettingsDrawer } from "../components/CustomerSettingsDrawer";

// Master Customer (Unified view)
interface MasterCustomer {
  id: string;
  customerName: string;
  mobile: string;
  customerId?: string; // DMS Customer ID
  address: string;
  brands: {
    name: string;
    status: "Pending" | "Approved" | "Rejected";
    source: "DMS" | "ONDC";
    syncStatus: "Synced" | "Not Synced";
    registrationDate?: string;
  }[];
  approvalStatus: "Pending" | "Approved" | "Rejected";
  lastUpdated: string;
}

// Brand Settings
interface BrandSettings {
  brandName: string;
  approvalMode: "DMS" | "Seller";
  matchCriteria: "Mobile Number" | "Customer ID";
}

// Mock Data
const masterCustomers: MasterCustomer[] = [
  {
    id: "M-001",
    customerName: "Ramesh Kirana Store",
    mobile: "+91 98765 43210",
    customerId: "DMS-101",
    address: "MG Road, Bangalore",
    brands: [
      { name: "ITC", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "HUL", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "Parle", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "Britannia", status: "Pending", source: "DMS", syncStatus: "Not Synced" },
      { name: "Nestle", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "Dabur", status: "Rejected", source: "DMS", syncStatus: "Not Synced" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-04-01 10:30 AM",
  },
  {
    id: "M-002",
    customerName: "Sharma Grocery",
    mobile: "+91 98765 43211",
    address: "Andheri West, Mumbai",
    brands: [
      { name: "ITC", status: "Pending", source: "ONDC", syncStatus: "Not Synced", registrationDate: "2026-04-02" },
      { name: "HUL", status: "Pending", source: "ONDC", syncStatus: "Not Synced", registrationDate: "2026-04-02" },
    ],
    approvalStatus: "Pending",
    lastUpdated: "2026-04-02 02:15 PM",
  },
  {
    id: "M-003",
    customerName: "City Supermart",
    mobile: "+91 98765 43212",
    customerId: "DMS-102",
    address: "Connaught Place, Delhi",
    brands: [
      { name: "ITC", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "Parle", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "Britannia", status: "Approved", source: "DMS", syncStatus: "Synced" },
      { name: "HUL", status: "Pending", source: "DMS", syncStatus: "Not Synced" },
      { name: "Nestle", status: "Rejected", source: "DMS", syncStatus: "Not Synced" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-03-30 09:45 AM",
  },
  {
    id: "M-004",
    customerName: "Modern Retail Hub",
    mobile: "+91 98765 43213",
    address: "Whitefield, Bangalore",
    brands: [
      { name: "HUL", status: "Rejected", source: "ONDC", syncStatus: "Not Synced", registrationDate: "2026-04-03" },
    ],
    approvalStatus: "Rejected",
    lastUpdated: "2026-04-03 11:20 AM",
  },
  {
    id: "M-005",
    customerName: "Quick Mart",
    mobile: "+91 98765 43214",
    customerId: "DMS-103",
    address: "Koramangala, Bangalore",
    brands: [
      { name: "ITC", status: "Approved", source: "ONDC", syncStatus: "Synced", registrationDate: "2026-03-31" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-03-31 04:20 PM",
  },
  {
    id: "M-006",
    customerName: "Metro Foods",
    mobile: "+91 98765 43216",
    customerId: "DMS-104",
    address: "Bandra, Mumbai",
    brands: [
      { name: "HUL", status: "Approved", source: "DMS", syncStatus: "Synced" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-03-29 03:20 PM",
  },
  {
    id: "M-007",
    customerName: "Green Valley Traders",
    mobile: "+91 98765 43217",
    address: "Kothrud, Pune",
    brands: [
      { name: "Nestle", status: "Approved", source: "ONDC", syncStatus: "Synced", registrationDate: "2026-04-05" },
      { name: "Britannia", status: "Approved", source: "ONDC", syncStatus: "Synced", registrationDate: "2026-04-05" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-04-05 10:00 AM",
  },
  {
    id: "M-008",
    customerName: "Southern Superstore",
    mobile: "+91 98765 43218",
    address: "T Nagar, Chennai",
    brands: [
      { name: "Parle", status: "Approved", source: "ONDC", syncStatus: "Synced", registrationDate: "2026-04-06" },
    ],
    approvalStatus: "Approved",
    lastUpdated: "2026-04-06 01:15 PM",
  },
];

export function Customers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dms");
  const [searchQuery, setSearchQuery] = useState("");
  const [masterSearchQuery, setMasterSearchQuery] = useState("");
  const [dmsSearchQuery, setDmsSearchQuery] = useState("");
  const [ondcSearchQuery, setOndcSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string>("all");
  
  // Master tab filters
  const [masterApprovalFilter, setMasterApprovalFilter] = useState<string>("all");
  const [masterSourceFilter, setMasterSourceFilter] = useState<string>("all");
  const [masterSyncFilter, setMasterSyncFilter] = useState<string>("all");

  // ONDC tab filters
  const [ondcApprovalFilter, setOndcApprovalFilter] = useState<string>("all");
  const [ondcMatchFilter, setOndcMatchFilter] = useState<string>("all");
  const [ondcSyncFilter, setOndcSyncFilter] = useState<string>("all");

  // Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Export CSV (ONDC) dialog
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // Dialogs
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<MasterCustomer | null>(null);

  // Brand Status Dialog
  const [isBrandStatusDialogOpen, setIsBrandStatusDialogOpen] = useState(false);
  const [selectedBrandStatusCustomer, setSelectedBrandStatusCustomer] = useState<MasterCustomer | null>(null);

  // DMS Brand List Dialog
  const [isDMSBrandDialogOpen, setIsDMSBrandDialogOpen] = useState(false);
  const [selectedDMSCustomer, setSelectedDMSCustomer] = useState<MasterCustomer | null>(null);

  // Customer Settings Drawer
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useState<BrandSettings[]>([
    { brandName: "ITC", approvalMode: "Seller", matchCriteria: "Mobile Number" },
    { brandName: "HUL", approvalMode: "DMS", matchCriteria: "Customer ID" },
    { brandName: "Parle", approvalMode: "Seller", matchCriteria: "Mobile Number" },
    { brandName: "Britannia", approvalMode: "Seller", matchCriteria: "Mobile Number" },
    { brandName: "Nestle", approvalMode: "DMS", matchCriteria: "Customer ID" },
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle tab change and reset pagination
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Calculate stats
  const totalCustomers = masterCustomers.length;
  const pendingApprovals = masterCustomers.filter((c) => c.approvalStatus === "Pending").length;
  const activeCustomers = masterCustomers.filter((c) => c.approvalStatus === "Approved").length;
  const ondcCustomersCount = masterCustomers.filter((c) => c.brands.some(b => b.source === "ONDC")).length;

  // Filter functions
  const filteredMasterCustomers = masterCustomers.filter((customer) => {
    const matchesSearch =
      customer.customerName.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
      customer.mobile.includes(masterSearchQuery) ||
      customer.customerId?.toLowerCase().includes(masterSearchQuery.toLowerCase());
    
    const matchesBrand = selectedBrands === "all" || 
      customer.brands.some(b => b.name === selectedBrands);
    
    const matchesApproval = masterApprovalFilter === "all" || 
      customer.approvalStatus === masterApprovalFilter;
    
    const matchesSource = masterSourceFilter === "all" || 
      customer.brands.some(b => b.source === masterSourceFilter);
    
    const matchesSync = masterSyncFilter === "all" || 
      customer.brands.some(b => b.syncStatus === masterSyncFilter);

    return matchesSearch && matchesBrand && matchesApproval && matchesSource && matchesSync;
  });

  const filteredDMSCustomers = masterCustomers.filter((customer) => {
    const matchesSearch =
      customer.customerName.toLowerCase().includes(dmsSearchQuery.toLowerCase()) ||
      customer.mobile.includes(dmsSearchQuery) ||
      customer.customerId?.toLowerCase().includes(dmsSearchQuery.toLowerCase());
    
    const hasDMSBrands = customer.brands.some(b => b.source === "DMS");
    
    const matchesBrand = selectedBrands === "all" || 
      customer.brands.some(b => b.name === selectedBrands);
    
    const matchesApproval = masterApprovalFilter === "all" || 
      customer.approvalStatus === masterApprovalFilter;
    
    const matchesSync = masterSyncFilter === "all" || 
      customer.brands.some(b => b.syncStatus === masterSyncFilter);

    return matchesSearch && hasDMSBrands && matchesBrand && matchesApproval && matchesSync;
  });

  const filteredONDCCustomers = masterCustomers.filter((customer) => {
    const matchesSearch =
      customer.customerName.toLowerCase().includes(ondcSearchQuery.toLowerCase()) ||
      customer.mobile.includes(ondcSearchQuery) ||
      customer.customerId?.toLowerCase().includes(ondcSearchQuery.toLowerCase());
    
    const hasONDCBrands = customer.brands.some(b => b.source === "ONDC");
    
    const matchesBrand = selectedBrands === "all" || 
      customer.brands.some(b => b.name === selectedBrands);
    
    const matchesApproval = ondcApprovalFilter === "all" || 
      customer.approvalStatus === ondcApprovalFilter;

    return matchesSearch && hasONDCBrands && matchesBrand && matchesApproval;
  });

  // Badge components
  const getApprovalBadge = (status: "Pending" | "Approved" | "Rejected") => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Approved</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Rejected</Badge>;
    }
  };

  const getSyncBadge = (status: "Synced" | "Not Synced") => {
    if (status === "Synced") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">Synced</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Not Synced</Badge>;
  };

  const getSourceBadge = (source: "DMS" | "ONDC") => {
    if (source === "DMS") {
      return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">DMS</Badge>;
    }
    return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">ONDC</Badge>;
  };

  const handleApprove = (customer: MasterCustomer) => {
    setSelectedCustomer(customer);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (customer: MasterCustomer) => {
    setSelectedCustomer(customer);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    toast.success(`Customer "${selectedCustomer?.customerName}" has been approved!`);
    setIsApproveDialogOpen(false);
    setSelectedCustomer(null);
  };

  const confirmReject = () => {
    toast.error(`Customer "${selectedCustomer?.customerName}" has been rejected.`);
    setIsRejectDialogOpen(false);
    setSelectedCustomer(null);
  };

  const clearAllFilters = () => {
    setSelectedBrands("all");
    setMasterApprovalFilter("all");
    setMasterSourceFilter("all");
    setMasterSyncFilter("all");
    setOndcApprovalFilter("all");
    setOndcMatchFilter("all");
    setOndcSyncFilter("all");
    toast.success("All filters cleared");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* KPI Summary Cards */}
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
                <UserCheck className="h-7 w-7 text-blue-600" />
                <div>
                  <div className="text-xl font-bold text-blue-600">{pendingApprovals}</div>
                  <p className="text-xs text-gray-600">Pending Approvals</p>
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
                <ShoppingBag className="h-7 w-7 text-purple-600" />
                <div>
                  <div className="text-xl font-bold text-purple-600">{ondcCustomersCount}</div>
                  <p className="text-xs text-gray-600">ONDC Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Tab Headers with Filters */}
            <div className="border-b border-gray-200 p-[12px]">
              <div className="flex items-center justify-between gap-4 overflow-x-auto p-[0px]">
                {/* Tab Toggle */}
                <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-shrink-0">
                  <TabsTrigger
                    value="dms"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    <span className="font-medium">DMS</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ondc"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span className="font-medium">ONDC</span>
                  </TabsTrigger>
                </TabsList>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* Filters Button */}
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsFilterDrawerOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>

                  {/* Export Button — opens date-range dialog (ONDC tab only) */}
                  {activeTab === "ondc" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsExportDialogOpen(true)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Master Tab */}
            {/* DMS Tab */}
            <TabsContent value="dms" className="mt-0">
              {/* DMS Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, mobile, or customer ID..."
                    value={dmsSearchQuery}
                    onChange={(e) => setDmsSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {dmsSearchQuery && (
                    <button
                      onClick={() => setDmsSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* DMS Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer ID (DMS)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Brands
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Synced At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const dmsCustomers = filteredDMSCustomers;
                      
                      if (dmsCustomers.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Database className="h-12 w-12 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">No DMS customers found</p>
                                <p className="text-sm text-gray-500">
                                  {searchQuery 
                                    ? `No DMS customers match "${searchQuery}". Try adjusting your search.`
                                    : "No DMS customers match the selected filters."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return dmsCustomers.map((customer) => {
                        const dmsBrands = customer.brands.filter(b => b.source === "DMS");
                        return (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-medium text-gray-900">{customer.customerName}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{customer.mobile}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-600">{customer.customerId}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{customer.address}</p>
                            </td>
                            <td className="px-6 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  setSelectedDMSCustomer(customer);
                                  setIsDMSBrandDialogOpen(true);
                                }}
                              >
                                <span className="text-sm font-medium">{dmsBrands.length} {dmsBrands.length === 1 ? "Brand" : "Brands"}</span>
                              </Button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs text-gray-600">{customer.lastUpdated}</p>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* ONDC Tab */}
            <TabsContent value="ondc" className="mt-0">
              {/* ONDC Search Bar */}
              <div className="px-6 py-4 border-b">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, mobile, or customer ID..."
                    value={ondcSearchQuery}
                    onChange={(e) => setOndcSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {ondcSearchQuery && (
                    <button
                      onClick={() => setOndcSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ONDC Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Registration Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Requested Brand Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const ondcEntries = filteredONDCCustomers
                        .flatMap((customer) =>
                          customer.brands
                            .filter(b => b.source === "ONDC")
                            .map((brand, brandIdx) => ({
                              ...customer,
                              brand: brand,
                              uniqueKey: `${customer.id}-${brandIdx}`
                            }))
                        )
                        .sort((a, b) =>
                          (b.brand.registrationDate || "").localeCompare(a.brand.registrationDate || "")
                        );

                      if (ondcEntries.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <ShoppingBag className="h-12 w-12 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">No ONDC requests found</p>
                                <p className="text-sm text-gray-500">
                                  {ondcSearchQuery
                                    ? `No ONDC requests match "${ondcSearchQuery}". Try adjusting your search.`
                                    : "No ONDC requests match the selected filters."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return ondcEntries.map((entry) => (
                        <tr key={entry.uniqueKey} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{entry.brand.registrationDate || "-"}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-medium text-gray-900">{entry.customerName}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{entry.mobile}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">{entry.address}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs">
                              {entry.brand.name}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/customers/${entry.id}`)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Customer</DialogTitle>
            <DialogDescription>
              You are about to approve "{selectedCustomer?.customerName}". This customer will be created and sent to DMS.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Customer</DialogTitle>
            <DialogDescription>
              You are about to reject "{selectedCustomer?.customerName}". This action can be reviewed later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Status Dialog */}
      <Dialog open={isBrandStatusDialogOpen} onOpenChange={setIsBrandStatusDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Brand-wise Status</DialogTitle>
            <DialogDescription>
              {selectedBrandStatusCustomer && (
                <>
                  View approval status for each brand for <strong>{selectedBrandStatusCustomer.customerName}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Brand Status Table */}
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Brand Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Sync Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedBrandStatusCustomer?.brands.map((brand, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getApprovalBadge(brand.status)}
                    </td>
                    <td className="px-4 py-3">
                      {getSourceBadge(brand.source)}
                    </td>
                    <td className="px-4 py-3">
                      {getSyncBadge(brand.syncStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button onClick={() => setIsBrandStatusDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DMS Brand List Dialog */}
      <Dialog open={isDMSBrandDialogOpen} onOpenChange={setIsDMSBrandDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>DMS Brand List</DialogTitle>
            <DialogDescription>
              {selectedDMSCustomer && (
                <>
                  View brands for <strong>{selectedDMSCustomer.customerName}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Brand List Table */}
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Brand Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Sync Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedDMSCustomer?.brands.filter(b => b.source === "DMS").map((brand, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getApprovalBadge(brand.status)}
                    </td>
                    <td className="px-4 py-3">
                      {getSyncBadge(brand.syncStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button onClick={() => setIsDMSBrandDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export ONDC Customers Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export ONDC Customers</DialogTitle>
            <DialogDescription>
              Select a date range based on the registration request date. The
              matching customers will be downloaded as a CSV file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="export-start">Start Date</Label>
              <Input
                id="export-start"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-end">End Date</Label>
              <Input
                id="export-end"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={() => {
                if (!exportStartDate || !exportEndDate) {
                  toast.error("Please select both start and end dates");
                  return;
                }
                if (exportStartDate > exportEndDate) {
                  toast.error("Start date must be before end date");
                  return;
                }
                // Collate all ONDC brand rows within the date range
                const rows = masterCustomers.flatMap((customer) =>
                  customer.brands
                    .filter(
                      (b) =>
                        b.source === "ONDC" &&
                        b.registrationDate &&
                        b.registrationDate >= exportStartDate &&
                        b.registrationDate <= exportEndDate,
                    )
                    .map((brand) => ({
                      registrationDate: brand.registrationDate || "",
                      customerName: customer.customerName,
                      mobile: customer.mobile,
                      address: customer.address,
                      brand: brand.name,
                    })),
                );
                if (rows.length === 0) {
                  toast.error("No ONDC customers found in the selected date range");
                  return;
                }
                const headers = [
                  "Registration Request Date",
                  "Customer Name",
                  "Mobile Number",
                  "Address",
                  "Requested Brand Name",
                ];
                const escape = (v: string) =>
                  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
                const csv = [
                  headers.join(","),
                  ...rows.map((r) =>
                    [
                      r.registrationDate,
                      r.customerName,
                      r.mobile,
                      r.address,
                      r.brand,
                    ]
                      .map(escape)
                      .join(","),
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ondc-customers-${exportStartDate}-to-${exportEndDate}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success(`Exported ${rows.length} customer${rows.length > 1 ? "s" : ""}`);
                setIsExportDialogOpen(false);
              }}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        activeTab={activeTab}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        masterApprovalFilter={masterApprovalFilter}
        setMasterApprovalFilter={setMasterApprovalFilter}
        masterSourceFilter={masterSourceFilter}
        setMasterSourceFilter={setMasterSourceFilter}
        masterSyncFilter={masterSyncFilter}
        setMasterSyncFilter={setMasterSyncFilter}
        ondcApprovalFilter={ondcApprovalFilter}
        setOndcApprovalFilter={setOndcApprovalFilter}
        ondcMatchFilter={ondcMatchFilter}
        setOndcMatchFilter={setOndcMatchFilter}
        ondcSyncFilter={ondcSyncFilter}
        setOndcSyncFilter={setOndcSyncFilter}
        onClearFilters={clearAllFilters}
      />

      {/* Customer Settings Drawer */}
      <CustomerSettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        brandSettings={brandSettings}
        setBrandSettings={setBrandSettings}
      />
    </div>
  );
}