import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ArrowLeft,
  Search,
  Database,
  RefreshCw,
  CheckCircle2,
  Eye,
  Package,
  ChevronRight,
  Clock,
  Check,
  AlertCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Product interface
interface Product {
  id: string;
  name: string;
  skuCode: string;
  brand: string;
  category: string;
  subcategory: string;
  variant: string;
  packaging: string;
  image: string;
  syncStatus: "Already Synced" | "Newly Added in Catalog" | "Not Synced";
  lastUpdated: string;
}

// Brand interface
interface Brand {
  id: string;
  name: string;
  logo: string;
  productsCount: number;
  category: string;
  syncedCount: number;
}

// Mock brands from Qwipo Master Database
const mockBrands: Brand[] = [
  {
    id: "1",
    name: "ITC",
    logo: "🏭",
    productsCount: 245,
    category: "FMCG",
    syncedCount: 120,
  },
  {
    id: "2",
    name: "HUL (Hindustan Unilever)",
    logo: "🧴",
    productsCount: 380,
    category: "FMCG",
    syncedCount: 200,
  },
  {
    id: "3",
    name: "Nestle",
    logo: "🍫",
    productsCount: 156,
    category: "Food & Beverages",
    syncedCount: 0,
  },
  {
    id: "4",
    name: "Britannia",
    logo: "🍪",
    productsCount: 98,
    category: "Biscuits & Bakery",
    syncedCount: 45,
  },
  {
    id: "5",
    name: "Parle",
    logo: "🍬",
    productsCount: 125,
    category: "Biscuits & Confectionery",
    syncedCount: 0,
  },
  {
    id: "6",
    name: "Amul",
    logo: "🥛",
    productsCount: 89,
    category: "Dairy Products",
    syncedCount: 30,
  },
];

// Mock products for selected brand
const getMockProducts = (brandName: string): Product[] => [
  {
    id: "1",
    name: `${brandName} Premium Tea Leaves 500g`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-TEA-500`,
    brand: brandName,
    category: "Beverages",
    subcategory: "Tea",
    variant: "Premium Blend",
    packaging: "500g Box",
    image: "🍵",
    syncStatus: "Already Synced",
    lastUpdated: "2023-10-01",
  },
  {
    id: "2",
    name: `${brandName} Gold Coffee Powder 200g`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-COF-200`,
    brand: brandName,
    category: "Beverages",
    subcategory: "Coffee",
    variant: "Gold Blend",
    packaging: "200g Pouch",
    image: "☕",
    syncStatus: "Not Synced",
    lastUpdated: "2023-09-15",
  },
  {
    id: "3",
    name: `${brandName} Digestive Biscuits 400g`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-BIS-400`,
    brand: brandName,
    category: "Food",
    subcategory: "Biscuits",
    variant: "Digestive",
    packaging: "400g Pack",
    image: "🍪",
    syncStatus: "Not Synced",
    lastUpdated: "2023-08-20",
  },
  {
    id: "4",
    name: `${brandName} Cooking Oil 1L`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-OIL-1L`,
    brand: brandName,
    category: "Cooking Essentials",
    subcategory: "Oils",
    variant: "Refined",
    packaging: "1L Bottle",
    image: "🫒",
    syncStatus: "Newly Added in Catalog",
    lastUpdated: "2023-07-10",
  },
  {
    id: "5",
    name: `${brandName} Wheat Flour 5kg`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-FLR-5KG`,
    brand: brandName,
    category: "Food",
    subcategory: "Flours",
    variant: "Whole Wheat",
    packaging: "5kg Bag",
    image: "🌾",
    syncStatus: "Not Synced",
    lastUpdated: "2023-06-05",
  },
  {
    id: "6",
    name: `${brandName} Instant Noodles 70g`,
    skuCode: `${brandName.substring(0, 3).toUpperCase()}-NOO-70`,
    brand: brandName,
    category: "Food",
    subcategory: "Ready to Eat",
    variant: "Masala Flavor",
    packaging: "70g Pack",
    image: "🍜",
    syncStatus: "Already Synced",
    lastUpdated: "2023-05-25",
  },
];

type ViewMode = "brands" | "products";

export function CentralCatalogSync() {
  const navigate = useNavigate();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("brands");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncType, setSyncType] = useState<"full" | "selective">("full");
  
  // Product filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter brands
  const filteredBrands = mockBrands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique categories from products
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || product.syncStatus === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get sync status badge
  const getSyncStatusBadge = (status: Product["syncStatus"]) => {
    switch (status) {
      case "Already Synced":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Already Synced
          </Badge>
        );
      case "Newly Added in Catalog":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
            <AlertCircle className="h-3 w-3" />
            Newly Added
          </Badge>
        );
      case "Not Synced":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300 gap-1">
            <Clock className="h-3 w-3" />
            Not Synced
          </Badge>
        );
    }
  };

  // Handle view products
  const handleViewProducts = (brand: Brand) => {
    setSelectedBrand(brand);
    setProducts(getMockProducts(brand.name));
    setViewMode("products");
    setSearchQuery("");
    setSelectedProducts([]);
  };

  // Handle back to brands
  const handleBackToBrands = () => {
    setViewMode("brands");
    setSelectedBrand(null);
    setProducts([]);
    setSelectedProducts([]);
    setSearchQuery("");
  };

  // Handle full catalog sync
  const handleFullCatalogSync = (brand: Brand) => {
    setSelectedBrand(brand);
    setSyncType("full");
    setIsSyncDialogOpen(true);
  };

  // Handle selective sync
  const handleSelectiveSync = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    setSyncType("selective");
    setIsSyncDialogOpen(true);
  };

  // Confirm sync
  const handleConfirmSync = () => {
    if (syncType === "full") {
      toast.success(
        `Syncing ${selectedBrand?.productsCount} products from ${selectedBrand?.name}...`
      );
    } else {
      toast.success(
        `Adding ${selectedProducts.length} selected product(s) to your store...`
      );
    }

    setTimeout(() => {
      if (syncType === "full") {
        toast.success(
          `Successfully synced ${selectedBrand?.productsCount} products from ${selectedBrand?.name}!`
        );
      } else {
        toast.success(
          `Successfully added ${selectedProducts.length} product(s) to MySKU!`
        );
      }
      setTimeout(() => {
        navigate("/products/my-sku");
      }, 1500);
    }, 2000);

    setIsSyncDialogOpen(false);
  };

  // Handle product selection
  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select products that are not already synced
      const notSyncedIds = filteredProducts
        .filter((p) => p.syncStatus !== "Already Synced")
        .map((p) => p.id);
      setSelectedProducts(notSyncedIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const allNotSyncedSelected =
    filteredProducts.filter((p) => p.syncStatus !== "Already Synced").length > 0 &&
    filteredProducts
      .filter((p) => p.syncStatus !== "Already Synced")
      .every((p) => selectedProducts.includes(p.id));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {viewMode === "brands" ? (
          <Link
            to="/products/add-sku"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Add SKU
          </Link>
        ) : (
          <button
            onClick={handleBackToBrands}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brands
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {viewMode === "brands"
                  ? "Qwipo Master Catalog"
                  : `${selectedBrand?.name} Products`}
              </h1>
              <p className="text-gray-600 mt-1">
                {viewMode === "brands"
                  ? "Select a brand to view and sync products"
                  : "Select products to add to your store"}
              </p>
            </div>
          </div>

          {viewMode === "products" && selectedProducts.length > 0 && (
            <Button
              onClick={handleSelectiveSync}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Check className="h-4 w-4" />
              Add Selected ({selectedProducts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full flex-shrink-0">
            <Database className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-sm text-purple-900">
            <p className="font-medium mb-1">Qwipo Master Database - Single Source of Truth</p>
            <p className="text-purple-800">
              All products are centrally managed and verified. Choose full catalog sync for
              complete brand inventory or select specific products for targeted additions.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={
                viewMode === "brands" ? "Search brands..." : "Search products..."
              }
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand View */}
      {viewMode === "brands" && (
        <Card>
          <CardHeader>
            <CardTitle>Available Brands ({filteredBrands.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-5 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  {/* Brand Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                      {brand.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{brand.name}</h3>
                      <p className="text-sm text-gray-600">{brand.category}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Products</p>
                      <p className="text-xl font-bold text-gray-900">
                        {brand.productsCount}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 mb-1">Already Synced</p>
                      <p className="text-xl font-bold text-green-700">{brand.syncedCount}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProducts(brand)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View Products
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleFullCatalogSync(brand)}
                      className="gap-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sync Catalog
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product View */}
      {viewMode === "products" && (
        <>
          {/* Filters Card */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex-1 flex gap-4">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Not Synced">Not Synced</SelectItem>
                      <SelectItem value="Already Synced">Already Synced</SelectItem>
                      <SelectItem value="Newly Added in Catalog">Newly Added</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Filter by Category" />
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
              </div>
            </CardContent>
          </Card>

          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              {filteredProducts.filter((p) => p.syncStatus !== "Already Synced").length >
                0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allNotSyncedSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select all available</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Select
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Image
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      SKU Code
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      SKU Name
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Brand
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Variant
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Packaging
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        product.syncStatus === "Already Synced" ? "opacity-60" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        {product.syncStatus !== "Already Synced" ? (
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) =>
                              handleProductSelect(product.id, checked as boolean)
                            }
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          {product.image}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {product.skuCode}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{product.category}</p>
                          <p className="text-xs text-gray-500">{product.subcategory}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{product.brand}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{product.variant}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{product.packaging}</p>
                      </td>
                      <td className="py-4 px-4">{getSyncStatusBadge(product.syncStatus)}</td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-gray-600">{product.lastUpdated}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}

      {/* Sync Confirmation Dialog */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              {syncType === "full" ? "Sync Full Catalog" : "Add Selected Products"}
            </DialogTitle>
            <DialogDescription>
              {syncType === "full"
                ? `You are about to sync the entire ${selectedBrand?.name} catalog to your store.`
                : `You are about to add ${selectedProducts.length} selected product(s) to your store.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-medium mb-2">What will happen:</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-800">
                    {syncType === "full" ? (
                      <>
                        <li>
                          All {selectedBrand?.productsCount} products from {selectedBrand?.name}{" "}
                          will be added
                        </li>
                        <li>Product details will be imported (images, specs, pricing)</li>
                        <li>Already synced products will be skipped</li>
                        <li>Products will appear in MySKU immediately</li>
                      </>
                    ) : (
                      <>
                        <li>{selectedProducts.length} selected products will be added</li>
                        <li>Complete product details will be imported</li>
                        <li>Products will appear in MySKU immediately</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {syncType === "full" && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Brand</p>
                    <p className="font-semibold text-gray-900">{selectedBrand?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Products</p>
                    <p className="font-semibold text-gray-900">
                      {selectedBrand?.productsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Already Synced</p>
                    <p className="font-semibold text-green-700">
                      {selectedBrand?.syncedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">New Products</p>
                    <p className="font-semibold text-blue-700">
                      {(selectedBrand?.productsCount || 0) - (selectedBrand?.syncedCount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSync}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4" />
              {syncType === "full" ? "Sync Catalog" : `Add ${selectedProducts.length} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* How It Works */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <ChevronRight className="h-5 w-5" />
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Flow 1: Full Catalog Sync</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Select a brand from the list</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Click "Sync Catalog"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Entire brand catalog syncs to MySKU</span>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Flow 2: Selective Sync</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Select a brand and click "View Products"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Browse and select specific products</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Click "Add Selected" to sync chosen products</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}