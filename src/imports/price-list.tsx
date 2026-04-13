import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Download,
  X,
  Search,
  Edit,
  Filter,
  Infinity,
  Database,
  FileEdit,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  skuName: string;
  brand: string;
  source: "DMS Sync" | "Manual";
  mrp: number;
  sellingPrice: number;
  stock: number;
  isInfiniteStock: boolean;
  status: "Active" | "Inactive";
  lastSyncOn: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    skuName: "107 Ajay Complete Briysh 12 Pcs Pack",
    brand: "Ajay",
    source: "DMS Sync",
    mrp: 2500.0,
    sellingPrice: 2350.0,
    stock: 5,
    isInfiniteStock: false,
    status: "Active",
    lastSyncOn: "2023-10-01T10:00:00Z",
  },
  {
    id: "2",
    skuName: "110 Ajay Prime Premium Brush -1 Sheet, 5 Pcs, + 3 Pcs",
    brand: "Ajay",
    source: "Manual",
    mrp: 450.0,
    sellingPrice: 420.0,
    stock: 0,
    isInfiniteStock: false,
    status: "Active",
    lastSyncOn: "2023-10-02T10:00:00Z",
  },
  {
    id: "3",
    skuName: "111 Rest Quality Pairana Ful-55 Kg, 1 Bag",
    brand: "Dwin Brand",
    source: "DMS Sync",
    mrp: 5500.0,
    sellingPrice: 5200.0,
    stock: 0,
    isInfiniteStock: true,
    status: "Active",
    lastSyncOn: "2023-10-03T10:00:00Z",
  },
  {
    id: "4",
    skuName: "123 Ajay Flexi Junior-12 Pcs Pack",
    brand: "Ajay",
    source: "Manual",
    mrp: 350.0,
    sellingPrice: 330.0,
    stock: 12,
    isInfiniteStock: false,
    status: "Active",
    lastSyncOn: "2023-10-04T10:00:00Z",
  },
  {
    id: "5",
    skuName: "70-70 Gold Butter Cookies -55 S Gm, 1 Pack",
    brand: "Pune",
    source: "DMS Sync",
    mrp: 120.0,
    sellingPrice: 115.0,
    stock: 0,
    isInfiniteStock: true,
    status: "Active",
    lastSyncOn: "2023-10-05T10:00:00Z",
  },
  {
    id: "6",
    skuName: "24 Carrot Gold Brand Masoor Dal -50 Kg Bag",
    brand: "24 Carrot",
    source: "Manual",
    mrp: 4360.0,
    sellingPrice: 4200.0,
    stock: 8,
    isInfiniteStock: false,
    status: "Active",
    lastSyncOn: "2023-10-06T10:00:00Z",
  },
  {
    id: "7",
    skuName: "3 Roses Tea Dust -500 Gm Box",
    brand: "3 Roses Tea",
    source: "DMS Sync",
    mrp: 255.0,
    sellingPrice: 245.0,
    stock: 0,
    isInfiniteStock: true,
    status: "Active",
    lastSyncOn: "2023-10-07T10:00:00Z",
  },
  {
    id: "8",
    skuName: "3 Roses Tea Dust-100 gm Box",
    brand: "3 Roses Tea",
    source: "Manual",
    mrp: 90.0,
    sellingPrice: 85.0,
    stock: 25,
    isInfiniteStock: false,
    status: "Active",
    lastSyncOn: "2023-10-08T10:00:00Z",
  },
  {
    id: "9",
    skuName: "3 Roses Tea Dust-250 gm Box",
    brand: "3 Roses Tea",
    source: "DMS Sync",
    mrp: 225.0,
    sellingPrice: 215.0,
    stock: 0,
    isInfiniteStock: true,
    status: "Active",
    lastSyncOn: "2023-10-09T10:00:00Z",
  },
  {
    id: "10",
    skuName: "365 VRJ Bakery Marda -1 Bag, 50 Kg",
    brand: "365",
    source: "Manual",
    mrp: 3800.0,
    sellingPrice: 3650.0,
    stock: 3,
    isInfiniteStock: false,
    status: "Inactive",
    lastSyncOn: "2023-10-10T10:00:00Z",
  },
];

export function PriceList() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Edit form state
  const [editMrp, setEditMrp] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editIsInfiniteStock, setEditIsInfiniteStock] = useState(false);
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || product.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditMrp(product.mrp.toString());
    setEditSellingPrice(product.sellingPrice.toString());
    setEditStock(product.stock.toString());
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
              stock: editIsInfiniteStock ? 0 : parseInt(editStock),
              isInfiniteStock: editIsInfiniteStock,
              status: editStatus,
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
    setSelectedProduct(null);
  };

  const handleToggleStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: p.status === "Active" ? "Inactive" : "Active",
            }
          : p
      )
    );

    const product = products.find((p) => p.id === productId);
    if (product) {
      toast.success(
        `${product.skuName} ${
          product.status === "Active" ? "deactivated" : "activated"
        }`
      );
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSourceFilter("all");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || sourceFilter !== "all";

  const getSourceBadge = (source: "DMS Sync" | "Manual") => {
    if (source === "DMS Sync") {
      return (
        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 gap-1">
          <Database className="h-3 w-3" />
          DMS Sync
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
          <FileEdit className="h-3 w-3" />
          Manual
        </Badge>
      );
    }
  };

  const getStockDisplay = (product: Product) => {
    if (product.isInfiniteStock) {
      return (
        <div className="flex items-center justify-center gap-1 text-emerald-600">
          <Infinity className="h-4 w-4" />
          <span className="font-medium">Unlimited</span>
        </div>
      );
    } else {
      return (
        <span
          className={`font-medium ${
            product.stock === 0
              ? "text-red-600"
              : product.stock < 10
              ? "text-amber-600"
              : "text-gray-900"
          }`}
        >
          {product.stock}
        </span>
      );
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRefresh = () => {
    toast.loading("Syncing latest data from database...");
    
    // Simulate API call
    setTimeout(() => {
      // Update lastSyncOn for all products
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          lastSyncOn: new Date().toISOString(),
        }))
      );
      
      toast.dismiss();
      toast.success("Data refreshed successfully!");
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing & Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage pricing and stock for all products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Flexible Pricing Management</p>
            <p className="text-blue-800">
              You can edit price and stock for all products, regardless of
              source. Use "Infinite Stock" option for products you don't want
              to track inventory for.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU name or brand"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Source Filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="DMS Sync">DMS Sync</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 min-w-[320px]">
                  SKU Name
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Brand
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">
                  MRP
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">
                  Selling Price
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">
                  Stock
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Last Sync On
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">
                        {hasActiveFilters
                          ? "No products match your filters"
                          : "No products found"}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {product.skuName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {product.brand}
                    </TableCell>
                    <TableCell className="text-right text-gray-900 font-semibold">
                      ₹ {product.mrp.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-gray-900 font-semibold">
                      ₹ {product.sellingPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStockDisplay(product)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant={
                            product.status === "Active" ? "default" : "secondary"
                          }
                          className={
                            product.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatLastSync(product.lastSyncOn)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(product.id)}
                          className={
                            product.status === "Active"
                              ? "text-red-600 border-red-300 hover:bg-red-50"
                              : "text-green-600 border-green-300 hover:bg-green-50"
                          }
                        >
                          {product.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              of <span className="font-semibold">{products.length}</span>{" "}
              products
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                Active:{" "}
                <span className="font-semibold text-green-600">
                  {products.filter((p) => p.status === "Active").length}
                </span>
              </div>
              <div>
                Inactive:{" "}
                <span className="font-semibold text-gray-600">
                  {products.filter((p) => p.status === "Inactive").length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Product Pricing & Stock
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.skuName}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* Source Info */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-600 text-xs">Source</Label>
                    <div className="mt-1">{getSourceBadge(selectedProduct.source)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Brand</Label>
                    <p className="font-medium text-gray-900 mt-1">
                      {selectedProduct.brand}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mrp">
                      MRP (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mrp"
                      type="number"
                      value={editMrp}
                      onChange={(e) => setEditMrp(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={editSellingPrice}
                      onChange={(e) => setEditSellingPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                {parseFloat(editSellingPrice) > parseFloat(editMrp) && (
                  <p className="text-sm text-red-600">
                    ⚠️ Selling Price cannot be greater than MRP
                  </p>
                )}
              </div>

              {/* Stock Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                  Stock Management
                </h3>

                {/* Infinite Stock Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Infinity className="h-5 w-5 text-emerald-600" />
                    <div>
                      <Label className="text-emerald-900 font-medium">
                        Not Maintaining Stock (Infinite)
                      </Label>
                      <p className="text-sm text-emerald-700 mt-1">
                        Enable this for unlimited stock availability
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={editIsInfiniteStock}
                    onCheckedChange={setEditIsInfiniteStock}
                  />
                </div>

                {/* Stock Quantity Input */}
                {!editIsInfiniteStock && (
                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      Stock Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-600">
                      Current stock will be updated to this value
                    </p>
                  </div>
                )}

                {editIsInfiniteStock && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      ℹ️ With infinite stock enabled, this product will always
                      show as available regardless of order quantities.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                  Product Status
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as "Active" | "Inactive")}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Inactive products won't be visible to customers
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}