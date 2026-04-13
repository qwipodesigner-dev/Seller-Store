import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Edit,
  Eye,
  MoreVertical,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Filter,
  Settings,
  Database,
  Infinity,
  ShieldCheck,
  AlertCircle as AlertCircleIcon,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";

interface Product {
  id: string;
  skuName: string;
  skuCode: string;
  brand: string;
  category: string;
  source: "DMS Sync" | "Manual" | "Brand Sync";
  mrp: number;
  sellingPrice: number;
  availableStock: number;
  reservedStock: number;
  thresholdLevel: number;
  isInfiniteStock: boolean;
  status: "Active" | "Inactive";
  lastUpdated: string;
  ondcCompliant: boolean;
  missingOndcFields: string[];
}

const mockProducts: Product[] = [
  {
    id: "1",
    skuName: "107 Ajay Complete Briysh 12 Pcs Pack",
    skuCode: "AJY-BRS-12",
    brand: "Ajay",
    category: "Personal Care",
    source: "DMS Sync",
    mrp: 2500.0,
    sellingPrice: 2350.0,
    availableStock: 5,
    reservedStock: 2,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-05",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "2",
    skuName: "110 Ajay Prime Premium Brush -1 Sheet, 5 Pcs, + 3 Pcs",
    skuCode: "AJY-PRM-8",
    brand: "Ajay",
    category: "Personal Care",
    source: "Manual",
    mrp: 450.0,
    sellingPrice: 420.0,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-05",
    ondcCompliant: false,
    missingOndcFields: ["HSN Code", "Country of Origin"],
  },
  {
    id: "3",
    skuName: "111 Rest Quality Pairana Ful-55 Kg, 1 Bag",
    skuCode: "DWN-PAI-55",
    brand: "Dwin Brand",
    category: "Food & Grains",
    source: "DMS Sync",
    mrp: 5500.0,
    sellingPrice: 5200.0,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 0,
    isInfiniteStock: true,
    status: "Active",
    lastUpdated: "2026-04-04",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "4",
    skuName: "123 Ajay Flexi Junior-12 Pcs Pack",
    skuCode: "AJY-FLX-12",
    brand: "Ajay",
    category: "Personal Care",
    source: "Manual",
    mrp: 350.0,
    sellingPrice: 330.0,
    availableStock: 12,
    reservedStock: 3,
    thresholdLevel: 8,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-03",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "5",
    skuName: "70-70 Gold Butter Cookies -55 S Gm, 1 Pack",
    skuCode: "PUN-CKI-55",
    brand: "Pune",
    category: "Food & Grains",
    source: "DMS Sync",
    mrp: 120.0,
    sellingPrice: 115.0,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 0,
    isInfiniteStock: true,
    status: "Active",
    lastUpdated: "2026-04-02",
    ondcCompliant: false,
    missingOndcFields: ["Manufacturer Address"],
  },
  {
    id: "6",
    skuName: "24 Carrot Gold Brand Masoor Dal -50 Kg Bag",
    skuCode: "24C-DAL-50",
    brand: "24 Carrot",
    category: "Food & Grains",
    source: "Manual",
    mrp: 4360.0,
    sellingPrice: 4200.0,
    availableStock: 8,
    reservedStock: 1,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-01",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "7",
    skuName: "3 Roses Tea Dust -500 Gm Box",
    skuCode: "3RT-TEA-500",
    brand: "3 Roses Tea",
    category: "Beverages",
    source: "DMS Sync",
    mrp: 255.0,
    sellingPrice: 245.0,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 0,
    isInfiniteStock: true,
    status: "Active",
    lastUpdated: "2026-03-31",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "8",
    skuName: "3 Roses Tea Dust-100 gm Box",
    skuCode: "3RT-TEA-100",
    brand: "3 Roses Tea",
    category: "Beverages",
    source: "Manual",
    mrp: 90.0,
    sellingPrice: 85.0,
    availableStock: 25,
    reservedStock: 5,
    thresholdLevel: 15,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-03-30",
    ondcCompliant: false,
    missingOndcFields: ["Support Email", "Support Phone"],
  },
  {
    id: "9",
    skuName: "3 Roses Tea Dust-250 gm Box",
    skuCode: "3RT-TEA-250",
    brand: "3 Roses Tea",
    category: "Beverages",
    source: "DMS Sync",
    mrp: 225.0,
    sellingPrice: 215.0,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 0,
    isInfiniteStock: true,
    status: "Active",
    lastUpdated: "2026-03-29",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "10",
    skuName: "365 VRJ Bakery Marda -1 Bag, 50 Kg",
    skuCode: "365-BAK-50",
    brand: "365",
    category: "Food & Grains",
    source: "Manual",
    mrp: 3800.0,
    sellingPrice: 3650.0,
    availableStock: 3,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Inactive",
    lastUpdated: "2026-03-28",
    ondcCompliant: true,
    missingOndcFields: [],
  },
];

export function PriceInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");
  const [ondcFilter, setOndcFilter] = useState<string>("all");

  // Edit form state
  const [editMrp, setEditMrp] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [editIsInfiniteStock, setEditIsInfiniteStock] = useState(false);
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const outOfStock = products.filter(
    (p) => p.availableStock === 0 && !p.isInfiniteStock
  ).length;
  const lowStock = products.filter(
    (p) =>
      p.availableStock > 0 &&
      p.availableStock <= p.thresholdLevel &&
      !p.isInfiniteStock
  ).length;
  const ondcCompliantCount = products.filter((p) => p.ondcCompliant).length;

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.isInfiniteStock) return "infinite";
    if (product.availableStock === 0) return "out-of-stock";
    if (product.availableStock <= product.thresholdLevel) return "low-stock";
    return "in-stock";
  };

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesSource = sourceFilter === "all" || product.source === sourceFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesBrand = brandFilter === "all" || product.brand === brandFilter;

    const stockStatus = getStockStatus(product);
    const matchesStockStatus =
      stockStatusFilter === "all" || stockStatus === stockStatusFilter;

    const matchesOndc =
      ondcFilter === "all" ||
      (ondcFilter === "compliant" && product.ondcCompliant) ||
      (ondcFilter === "non-compliant" && !product.ondcCompliant);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSource &&
      matchesCategory &&
      matchesBrand &&
      matchesStockStatus &&
      matchesOndc
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).sort();

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditMrp(product.mrp.toString());
    setEditSellingPrice(product.sellingPrice.toString());
    setEditStock(product.availableStock.toString());
    setEditThreshold(product.thresholdLevel.toString());
    setEditIsInfiniteStock(product.isInfiniteStock);
    setEditStatus(product.status);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    // Validation
    if (!editMrp || parseFloat(editMrp) < 0) {
      toast.error("Please enter a valid MRP");
      return;
    }

    if (!editSellingPrice || parseFloat(editSellingPrice) < 0) {
      toast.error("Please enter a valid Selling Price");
      return;
    }

    if (!editIsInfiniteStock && (!editStock || parseInt(editStock) < 0)) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    if (parseFloat(editSellingPrice) > parseFloat(editMrp)) {
      toast.error("Selling Price cannot be greater than MRP");
      return;
    }

    // Update product
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              mrp: parseFloat(editMrp),
              sellingPrice: parseFloat(editSellingPrice),
              availableStock: editIsInfiniteStock ? 0 : parseInt(editStock),
              thresholdLevel: editIsInfiniteStock ? 0 : parseInt(editThreshold),
              isInfiniteStock: editIsInfiniteStock,
              status: editStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );

    toast.success(
      `${selectedProduct.skuName} updated successfully!${
        editIsInfiniteStock ? " (Infinite stock enabled)" : ""
      }`
    );
    setIsEditDialogOpen(false);
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/products/sku-detail/${product.id}`);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSourceFilter("all");
    setCategoryFilter("all");
    setBrandFilter("all");
    setStockStatusFilter("all");
    setOndcFilter("all");
    toast.success("All filters cleared");
  };

  const handleExport = () => {
    toast.success("Exporting price & inventory data...");
  };

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  const handleBulkUpdate = () => {
    toast.info("Bulk update functionality coming soon");
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.isInfiniteStock) {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-300 gap-1">
          <Infinity className="h-3 w-3" />
          Infinite
        </Badge>
      );
    }

    if (product.availableStock === 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
          <XCircle className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    }

    if (product.availableStock <= product.thresholdLevel) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
        <CheckCircle className="h-3 w-3" />
        In Stock
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Header with Actions */}
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
                  size="sm"
                  onClick={() => setIsThresholdOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            {(statusFilter !== "all" ||
              sourceFilter !== "all" ||
              categoryFilter !== "all" ||
              brandFilter !== "all" ||
              stockStatusFilter !== "all" ||
              ondcFilter !== "all") && (
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

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    MRP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        getStockStatus(product) === "low-stock"
                          ? "bg-amber-50/30"
                          : getStockStatus(product) === "out-of-stock"
                          ? "bg-red-50/30"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {product.skuCode}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {product.skuName}
                          </p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{product.brand}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          ₹{Math.round(product.mrp)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-green-700">
                          ₹{Math.round(product.sellingPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {product.isInfiniteStock ? (
                          <Infinity className="h-4 w-4 text-purple-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {product.availableStock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge
                          className={
                            product.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Price & Stock"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Price & Inventory</DialogTitle>
            <DialogDescription>
              Update pricing and stock information for {selectedProduct?.skuName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Pricing Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-900">Pricing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mrp">MRP (₹)</Label>
                  <Input
                    id="edit-mrp"
                    type="number"
                    step="0.01"
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-selling-price">Selling Price (₹)</Label>
                  <Input
                    id="edit-selling-price"
                    type="number"
                    step="0.01"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Inventory Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-900">Inventory</h4>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-medium text-gray-900">Infinite Stock</p>
                  <p className="text-sm text-gray-600">
                    Enable unlimited inventory for this product
                  </p>
                </div>
                <Switch
                  checked={editIsInfiniteStock}
                  onCheckedChange={setEditIsInfiniteStock}
                />
              </div>

              {!editIsInfiniteStock && (
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Available Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-900">Status</h4>
              <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <h2 className="text-lg font-semibold text-gray-900">Filter Products</h2>
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
                    <Label className="text-sm font-medium text-gray-700">Product Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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

                  {/* Source Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Source</Label>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="DMS Sync">DMS Sync</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Brand Sync">Brand Sync</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
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

                  {/* Stock Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Stock Status</Label>
                    <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock Status</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        <SelectItem value="infinite">Infinite Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ONDC Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">ONDC Compliance</Label>
                    <Select value={ondcFilter} onValueChange={setOndcFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="compliant">ONDC Compliant</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
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
                    clearAllFilters();
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

      {/* Threshold Settings Dialog */}
      <Dialog open={isThresholdOpen} onOpenChange={setIsThresholdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventory Settings</DialogTitle>
            <DialogDescription>
              Configure default threshold levels and stock management settings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Settings functionality coming soon. You can set individual thresholds when
              editing each product.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsThresholdOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}