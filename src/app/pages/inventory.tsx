import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Search,
  Upload,
  Download,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  Edit,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { InventoryFilterDrawer } from "../components/InventoryFilterDrawer";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  brand: string;
  availableStock: number;
  reservedStock: number;
  thresholdLevel: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

const initialInventory: InventoryItem[] = [
  {
    id: "1",
    productName: "Premium Coffee Beans 500g",
    sku: "PCB-500",
    category: "Beverages",
    brand: "Starbucks",
    availableStock: 120,
    reservedStock: 15,
    thresholdLevel: 50,
    status: "in-stock",
    lastUpdated: "2026-03-20",
  },
  {
    id: "2",
    productName: "Organic Green Tea Box",
    sku: "OGT-100",
    category: "Beverages",
    brand: "Lipton",
    availableStock: 85,
    reservedStock: 10,
    thresholdLevel: 40,
    status: "in-stock",
    lastUpdated: "2026-03-20",
  },
  {
    id: "3",
    productName: "Whole Wheat Pasta 1kg",
    sku: "WWP-1000",
    category: "Food & Grains",
    brand: "Barilla",
    availableStock: 200,
    reservedStock: 25,
    thresholdLevel: 100,
    status: "in-stock",
    lastUpdated: "2026-03-19",
  },
  {
    id: "4",
    productName: "Extra Virgin Olive Oil",
    sku: "EVOO-500",
    category: "Cooking Oils",
    brand: "Figaro",
    availableStock: 45,
    reservedStock: 8,
    thresholdLevel: 30,
    status: "low-stock",
    lastUpdated: "2026-03-20",
  },
  {
    id: "5",
    productName: "Organic Honey 250g",
    sku: "OH-250",
    category: "Sweeteners",
    brand: "Dabur",
    availableStock: 18,
    reservedStock: 5,
    thresholdLevel: 25,
    status: "low-stock",
    lastUpdated: "2026-03-20",
  },
  {
    id: "6",
    productName: "Basmati Rice 5kg",
    sku: "BR-5000",
    category: "Food & Grains",
    brand: "India Gate",
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 50,
    status: "out-of-stock",
    lastUpdated: "2026-03-18",
  },
  {
    id: "7",
    productName: "Dark Chocolate Bar 100g",
    sku: "DCB-100",
    category: "Confectionery",
    brand: "Cadbury",
    availableStock: 150,
    reservedStock: 20,
    thresholdLevel: 60,
    status: "in-stock",
    lastUpdated: "2026-03-21",
  },
  {
    id: "8",
    productName: "Instant Noodles Pack",
    sku: "INP-200",
    category: "Ready to Eat",
    brand: "Maggi",
    availableStock: 320,
    reservedStock: 45,
    thresholdLevel: 150,
    status: "in-stock",
    lastUpdated: "2026-03-21",
  },
];

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Calculate stats
  const totalSKUs = inventory.length;
  const lowStockSKUs = inventory.filter((item) => item.status === "low-stock").length;
  const outOfStockSKUs = inventory.filter((item) => item.status === "out-of-stock").length;
  const activeSKUs = inventory.filter((item) => item.status === "in-stock").length;

  // Get unique categories and brands
  const categories = ["all", ...Array.from(new Set(inventory.map((item) => item.category)))];
  const brands = ["all", ...Array.from(new Set(inventory.map((item) => item.brand)))];

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesBrand = filterBrand === "all" || item.brand === filterBrand;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const handleExport = () => {
    toast.success("Inventory data exported successfully!");
  };

  const handleImport = () => {
    toast.success("Stock imported successfully!");
  };

  const handleBulkUpdate = () => {
    toast.success("Bulk stock update completed!");
    setIsBulkUpdateOpen(false);
  };

  const handleUpdateStock = () => {
    if (!selectedItem) return;

    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              availableStock: editStock,
              lastUpdated: new Date().toISOString().split("T")[0],
              status:
                editStock === 0
                  ? "out-of-stock"
                  : editStock <= item.thresholdLevel
                  ? "low-stock"
                  : "in-stock",
            }
          : item
      )
    );

    toast.success("Stock updated successfully!");
    setIsEditOpen(false);
    setSelectedItem(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Out of Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const clearAllFilters = () => {
    setFilterCategory("all");
    setFilterBrand("all");
    setFilterStatus("all");
    toast.success("All filters cleared");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 p-[0px]">
      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total SKUs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalSKUs}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Low Stock SKUs</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{lowStockSKUs}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Out of Stock SKUs</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockSKUs}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active SKUs</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{activeSKUs}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Action Bar */}
          <div className="border-b border-gray-200 p-[12px]">
            <div className="flex items-center justify-between gap-4">
              {/* Clear Filters (Left) */}
              <div className="flex-1">
                {(filterCategory !== "all" || filterBrand !== "all" || filterStatus !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-2 text-gray-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Action Buttons (Right) */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkUpdateOpen(true)}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Bulk Update
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsThresholdOpen(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Threshold Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Threshold
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
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        item.status === "low-stock"
                          ? "bg-amber-50/30"
                          : item.status === "out-of-stock"
                          ? "bg-red-50/30"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.brand}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-gray-700">{item.sku}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{item.category}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-gray-900">{item.availableStock}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-600">{item.reservedStock}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-600">{item.thresholdLevel}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{item.lastUpdated}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setEditStock(item.availableStock);
                            setIsEditOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.productName} (SKU: {selectedItem?.sku})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Current Stock</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedItem?.availableStock}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reserved</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedItem?.reservedStock}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Threshold</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedItem?.thresholdLevel}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(Number(e.target.value))}
                placeholder="Enter new stock quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkUpdateOpen} onOpenChange={setIsBulkUpdateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Update Stock</DialogTitle>
            <DialogDescription>
              Upload Excel file or manually update multiple SKUs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">Excel file (.xlsx, .xls)</p>
              <Button variant="outline" className="mt-4" size="sm">
                Choose File
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <div className="space-y-2">
              <Label>Download Template</Label>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Excel Template
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Upload & Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Threshold Settings Dialog */}
      <Dialog open={isThresholdOpen} onOpenChange={setIsThresholdOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Threshold Settings</DialogTitle>
            <DialogDescription>
              Set minimum stock levels to trigger low stock alerts
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">Category-wise</TabsTrigger>
              <TabsTrigger value="sku">SKU-wise</TabsTrigger>
            </TabsList>

            {/* Category-wise Threshold */}
            <TabsContent value="category" className="space-y-4 mt-4">
              <div className="space-y-3">
                {categories.filter((cat) => cat !== "all").map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-xs text-gray-600">
                        {inventory.filter((item) => item.category === category).length} SKUs
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Min Stock:</Label>
                      <Input
                        type="number"
                        className="w-24"
                        placeholder="0"
                        defaultValue={50}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">Save Category Thresholds</Button>
            </TabsContent>

            {/* SKU-wise Threshold */}
            <TabsContent value="sku" className="space-y-4 mt-4">
              <div className="space-y-2 mb-4">
                <Label>Search SKU</Label>
                <Input placeholder="Search by SKU or product name" />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Threshold:</Label>
                      <Input
                        type="number"
                        className="w-24"
                        defaultValue={item.thresholdLevel}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">Save SKU Thresholds</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer */}
      <InventoryFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onClearFilters={clearAllFilters}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}