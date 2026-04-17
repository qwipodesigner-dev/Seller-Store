import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { MultiSelect } from "../../components/ui/multi-select";
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
  Database,
  Infinity,
  ShieldCheck,
  AlertCircle as AlertCircleIcon,
  X,
  Search,
  Info,
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

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
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesBrand
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
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPage(1);
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
              </div>
            </div>

            {/* Applied Filter Tags */}
            {(statusFilter !== "all" ||
              selectedCategories.length > 0 ||
              selectedBrands.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Status: {statusFilter}
                    <button onClick={() => { setStatusFilter("all"); setCurrentPage(1); }} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {cat}
                    <button onClick={() => { setSelectedCategories(selectedCategories.filter(c => c !== cat)); setCurrentPage(1); }} className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedBrands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-green-50 text-green-700 border-green-200">
                    {brand}
                    <button onClick={() => { setSelectedBrands(selectedBrands.filter(b => b !== brand)); setCurrentPage(1); }} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 text-xs h-6"
                >
                  Clear all
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Price & Inventory</DialogTitle>
            <DialogDescription>
              {selectedProduct?.skuName} — DMS values are read-only reference.
              Only the ONDC column will be used for publishing.
            </DialogDescription>
          </DialogHeader>

          {/* Legend */}
          <div className="flex items-center gap-2 pb-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              DMS: Read-only reference
            </Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
              ONDC: Final source for publishing
            </Badge>
          </div>

          {/* Section 1 — Price Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Price Information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                      Field Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      DMS Value (Read-only)
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ONDC Value (Editable)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* MRP Row */}
                  <tr
                    className={
                      String(selectedProduct?.mrp ?? "") !== editMrp ? "bg-amber-50/40" : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">MRP</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      ₹{selectedProduct?.mrp?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={editMrp}
                          onChange={(e) => setEditMrp(e.target.value)}
                          className={`pl-7 ${
                            !editMrp
                              ? "border-red-400"
                              : String(selectedProduct?.mrp ?? "") !== editMrp
                                ? "border-amber-400"
                                : ""
                          }`}
                        />
                      </div>
                      {!editMrp && (
                        <p className="text-xs text-red-600 mt-1">Required</p>
                      )}
                    </td>
                  </tr>

                  {/* Selling Price Row */}
                  <tr
                    className={
                      String(selectedProduct?.sellingPrice ?? "") !== editSellingPrice
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Selling Price</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      ₹{selectedProduct?.sellingPrice?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={editSellingPrice}
                          onChange={(e) => setEditSellingPrice(e.target.value)}
                          className={`pl-7 ${
                            !editSellingPrice ||
                            (editMrp &&
                              parseFloat(editSellingPrice) > parseFloat(editMrp))
                              ? "border-red-400"
                              : String(selectedProduct?.sellingPrice ?? "") !==
                                  editSellingPrice
                                ? "border-amber-400"
                                : ""
                          }`}
                        />
                      </div>
                      {!editSellingPrice && (
                        <p className="text-xs text-red-600 mt-1">Required</p>
                      )}
                      {editSellingPrice &&
                        editMrp &&
                        parseFloat(editSellingPrice) > parseFloat(editMrp) && (
                          <p className="text-xs text-red-600 mt-1">
                            Selling Price must be ≤ MRP
                          </p>
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2 — Inventory Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Inventory Information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                      Field Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      DMS Value (Read-only)
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ONDC Value (Editable)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Available Quantity Row */}
                  <tr
                    className={
                      !editIsInfiniteStock && String(selectedProduct?.availableStock ?? "") !== editStock
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Available Quantity</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {selectedProduct?.isInfiniteStock
                        ? "∞ (Infinite)"
                        : (selectedProduct?.availableStock ?? "—")}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {editIsInfiniteStock ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-purple-200 bg-purple-50">
                          <Infinity className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Infinite Stock</span>
                        </div>
                      ) : (
                        <>
                          <Input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className={
                              !editStock || parseInt(editStock) < 0
                                ? "border-red-400"
                                : String(selectedProduct?.availableStock ?? "") !== editStock
                                  ? "border-amber-400"
                                  : ""
                            }
                          />
                          {(!editStock || parseInt(editStock) < 0) && (
                            <p className="text-xs text-red-600 mt-1">
                              Quantity must be ≥ 0
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Infinite Stock Row */}
                  <tr
                    className={
                      selectedProduct?.isInfiniteStock !== editIsInfiniteStock
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Mark as Infinite</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {selectedProduct?.isInfiniteStock ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={editIsInfiniteStock}
                          onCheckedChange={(checked) => {
                            setEditIsInfiniteStock(checked);
                            if (checked) {
                              setEditStock("0");
                              setEditThreshold("0");
                            } else {
                              setEditStock(String(selectedProduct?.availableStock ?? 0));
                              setEditThreshold(String(selectedProduct?.thresholdLevel ?? 0));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {editIsInfiniteStock ? "Infinite stock enabled" : "Finite stock"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled, stock is always available and quantity is not tracked.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info footer */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Only ONDC values will be stored and used for catalog publishing. DMS
              values remain unchanged as the source reference.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save ONDC Values
            </Button>
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

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <MultiSelect
                      options={uniqueCategories.map((c) => ({ label: c, value: c }))}
                      selected={selectedCategories}
                      onChange={setSelectedCategories}
                      placeholder="All Categories"
                      className="w-full"
                    />
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Brand</Label>
                    <MultiSelect
                      options={uniqueBrands.map((b) => ({ label: b, value: b }))}
                      selected={selectedBrands}
                      onChange={setSelectedBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
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

    </div>
  );
}