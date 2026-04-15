import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  MoreVertical,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";

// ONDC Data structure
interface ONDCData {
  productName: string;
  mrp: string;
  hsnCode: string;
  countryOfOrigin: string;
  manufacturerName: string;
  manufacturerAddress: string;
  importerPackerName: string;
  importerPackerAddress: string;
  productLength: string;
  productWidth: string;
  productHeight: string;
  productWeight: string;
  returnPolicy: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
}

interface SKUData {
  id: string;
  name: string;
  category: string;
  brand: string;
  source: string;
  status: string;
  lastUpdated: string;
  sku: string;
  ondcCompliance: {
    isCompliant: boolean;
    missingFields: string[];
    ondcData: Partial<ONDCData>;
  };
}

// Sample SKU data with ONDC compliance status
const sampleSKUs: SKUData[] = [
  {
    id: "1",
    name: "Fortune Sunlite Refined Sunflower oil",
    category: "Edible Oil",
    brand: "Fortune",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-25",
    sku: "FOR-SUN-1L-001",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Fortune Sunlite Refined Sunflower oil",
        mrp: "185.00",
        hsnCode: "15121900",
        countryOfOrigin: "India",
        manufacturerName: "Adani Wilmar Limited",
        manufacturerAddress: "Fortune House, Nr. Navrangpura Railway Crossing, Ahmedabad - 380009",
        importerPackerName: "Adani Wilmar Limited",
        importerPackerAddress: "Fortune House, Ahmedabad",
        productLength: "8.5",
        productWidth: "8.5",
        productHeight: "22.0",
        productWeight: "1000",
        returnPolicy: "No return on edible items once opened",
        supportName: "Fortune Customer Care",
        supportEmail: "care@adaniwilmar.com",
        supportPhone: "1800-123-4567",
      },
    },
  },
  {
    id: "2",
    name: "Maggi 2-Minute Noodles Masala",
    category: "Instant Food",
    brand: "Maggi",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-24",
    sku: "MAG-NOO-70G-002",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "HSN Code",
        "Manufacturer Address",
        "Product Dimensions",
        "Return Policy",
        "Support Email",
      ],
      ondcData: {
        productName: "Maggi 2-Minute Noodles Masala",
        mrp: "14.00",
        countryOfOrigin: "India",
        manufacturerName: "Nestle India Limited",
        supportName: "Maggi Consumer Care",
        supportPhone: "1800-102-4455",
      },
    },
  },
  {
    id: "3",
    name: "Britannia Good Day Butter Cookies",
    category: "Biscuits",
    brand: "Britannia",
    source: "Excel Import",
    status: "Inactive",
    lastUpdated: "2024-03-23",
    sku: "BRI-COO-100G-003",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "MRP",
        "Country of Origin",
        "Importer Name",
        "Product Weight",
        "Support Details",
      ],
      ondcData: {
        productName: "Britannia Good Day Butter Cookies",
        hsnCode: "19053100",
        manufacturerName: "Britannia Industries Ltd",
        manufacturerAddress: "Britannia House, Mumbai - 400001",
        returnPolicy: "7 days return policy if product is damaged",
      },
    },
  },
  {
    id: "4",
    name: "Tata Tea Gold Premium",
    category: "Tea",
    brand: "Tata Tea",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-22",
    sku: "TAT-TEA-250G-004",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Tata Tea Gold Premium",
        mrp: "165.00",
        hsnCode: "09023010",
        countryOfOrigin: "India",
        manufacturerName: "Tata Consumer Products Limited",
        manufacturerAddress: "1 Bishop Lefroy Road, Kolkata - 700020",
        importerPackerName: "Tata Consumer Products Limited",
        importerPackerAddress: "Kolkata, West Bengal",
        productLength: "10.0",
        productWidth: "5.0",
        productHeight: "15.0",
        productWeight: "250",
        returnPolicy: "No returns on tea products",
        supportName: "Tata Tea Support",
        supportEmail: "support@tatatea.com",
        supportPhone: "1800-209-5577",
      },
    },
  },
  {
    id: "5",
    name: "Amul Gold Full Cream Milk",
    category: "Dairy",
    brand: "Amul",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-21",
    sku: "AMU-MLK-1L-005",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Amul Gold Full Cream Milk",
        mrp: "66.00",
        hsnCode: "04011090",
        countryOfOrigin: "India",
        manufacturerName: "Gujarat Cooperative Milk Marketing Federation",
        manufacturerAddress: "Amul Dairy, Anand, Gujarat - 388001",
        importerPackerName: "GCMMF Ltd",
        importerPackerAddress: "Anand, Gujarat",
        productLength: "9.0",
        productWidth: "6.0",
        productHeight: "20.0",
        productWeight: "1000",
        returnPolicy: "Same day return for damaged products",
        supportName: "Amul Customer Care",
        supportEmail: "care@amul.com",
        supportPhone: "1800-258-3333",
      },
    },
  },
  {
    id: "6",
    name: "Parle-G Gold Biscuits",
    category: "Biscuits",
    brand: "Parle",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-20",
    sku: "PAR-BIS-1KG-006",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "7",
    name: "Coca Cola 2L Bottle",
    category: "Beverages",
    brand: "Coca Cola",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-19",
    sku: "COC-BEV-2L-007",
    ondcCompliance: {
      isCompliant: false,
      missingFields: ["Manufacturer Address"],
      ondcData: {},
    },
  },
  {
    id: "8",
    name: "Surf Excel Matic Detergent",
    category: "Household",
    brand: "Surf Excel",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-18",
    sku: "SUR-DET-2KG-008",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "9",
    name: "Bournvita Health Drink",
    category: "Beverages",
    brand: "Cadbury",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-17",
    sku: "CAD-BOU-500G-009",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "10",
    name: "Colgate Total Toothpaste",
    category: "Personal Care",
    brand: "Colgate",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-16",
    sku: "COL-TPA-200G-010",
    ondcCompliance: {
      isCompliant: false,
      missingFields: ["HSN Code", "Product Weight"],
      ondcData: {},
    },
  },
  {
    id: "11",
    name: "MDH Chana Masala",
    category: "Spices",
    brand: "MDH",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-15",
    sku: "MDH-SPI-100G-011",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "12",
    name: "Lays Classic Salted Chips",
    category: "Snacks",
    brand: "Lays",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-14",
    sku: "LAY-SNK-52G-012",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "13",
    name: "Dove Soap Bar",
    category: "Personal Care",
    brand: "Dove",
    source: "Brand Sync",
    status: "Inactive",
    lastUpdated: "2024-03-13",
    sku: "DOV-SOP-125G-013",
    ondcCompliance: {
      isCompliant: false,
      missingFields: ["MRP", "Country of Origin"],
      ondcData: {},
    },
  },
  {
    id: "14",
    name: "Vim Dishwash Liquid",
    category: "Household",
    brand: "Vim",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-12",
    sku: "VIM-DIS-500ML-014",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
  {
    id: "15",
    name: "Red Label Tea",
    category: "Tea",
    brand: "Red Label",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-11",
    sku: "RED-TEA-1KG-015",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {},
    },
  },
];

export function MySKU() {
  const navigate = useNavigate();
  const [skus, setSkus] = useState<SKUData[]>(sampleSKUs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(skus.map((s) => s.category))).sort();
  const uniqueBrands = Array.from(new Set(skus.map((s) => s.brand))).sort();

  // Filtered SKUs
  const filteredSKUs = skus.filter((sku) => {
    const matchesSearch =
      sku.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sku.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || sku.category === categoryFilter;
    const matchesBrand = brandFilter === "all" || sku.brand === brandFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesBrand
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSKUs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSKUs = filteredSKUs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleAddSKU = () => {
    navigate("/products/add-sku");
  };

  const handleViewDetails = (sku: SKUData) => {
    navigate(`/products/sku-detail/${sku.id}`);
  };

  const handleEditSKU = (sku: SKUData) => {
    navigate(`/products/my-sku/edit/${sku.id}`);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setBrandFilter("all");
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

  const handleExport = () => {
    toast.success("Exporting SKU data...");
  };

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  const getSourceBadge = (source: string) => {
    const badgeMap: Record<string, { color: string; icon?: React.ReactNode }> = {
      "Brand Sync": {
        color: "border-purple-300 text-purple-700 bg-purple-50",
        icon: <Database className="h-3 w-3 mr-1" />,
      },
      DMS: {
        color: "border-blue-300 text-blue-700 bg-blue-50",
        icon: <Database className="h-3 w-3 mr-1" />,
      },
      Manual: { color: "border-gray-300 text-gray-700 bg-gray-50" },
      "Excel Import": { color: "border-green-300 text-green-700 bg-green-50" },
    };

    const badge = badgeMap[source] || badgeMap.Manual;

    return (
      <Badge variant="outline" className={badge.color}>
        {badge.icon}
        {source}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Header with Search and Actions */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by SKU name, code, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  onClick={handleAddSKU}
                  className="gap-2 flex-1 sm:flex-initial"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add SKU
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            {(statusFilter !== "all" ||
              categoryFilter !== "all" ||
              brandFilter !== "all") && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {/* SKU Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSKUs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No SKUs found
                    </td>
                  </tr>
                ) : (
                  paginatedSKUs.map((sku) => (
                    <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {sku.sku}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{sku.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{sku.brand}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{sku.category}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge
                          className={
                            sku.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {sku.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{sku.lastUpdated}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Details"
                          onClick={() => handleViewDetails(sku)}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSKUs.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSKUs.length)} of{" "}
                {filteredSKUs.length} SKUs
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
        </Card>
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFilterDrawerOpen(false)}
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
                <h2 className="text-lg font-semibold text-gray-900">Filter SKUs</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select 
                      value={statusFilter} 
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select 
                      value={categoryFilter} 
                      onValueChange={(value) => {
                        setCategoryFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Brand</Label>
                    <Select 
                      value={brandFilter} 
                      onValueChange={(value) => {
                        setBrandFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {uniqueBrands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setBrandFilter("all");
                    setCurrentPage(1);
                    toast.success("All filters cleared");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setIsFilterDrawerOpen(false)}
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