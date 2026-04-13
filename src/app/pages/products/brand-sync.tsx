import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  logo: string;
  productsCount: number;
  category: string;
  status: "verified" | "popular" | "new";
}

const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Cafe Delight",
    logo: "☕",
    productsCount: 45,
    category: "Beverages",
    status: "verified",
  },
  {
    id: "2",
    name: "TeaTime",
    logo: "🍵",
    productsCount: 38,
    category: "Beverages",
    status: "popular",
  },
  {
    id: "3",
    name: "HealthyEats",
    logo: "🌾",
    productsCount: 120,
    category: "Food & Grocery",
    status: "verified",
  },
  {
    id: "4",
    name: "PureOil",
    logo: "🫒",
    productsCount: 15,
    category: "Cooking Oils",
    status: "new",
  },
  {
    id: "5",
    name: "BeeNatural",
    logo: "🍯",
    productsCount: 22,
    category: "Natural Products",
    status: "verified",
  },
  {
    id: "6",
    name: "FreshDairy",
    logo: "🥛",
    productsCount: 67,
    category: "Dairy Products",
    status: "popular",
  },
];

export function BrandSync() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("ondc");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const filteredBrands = mockBrands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSync = (brand: Brand) => {
    setSelectedBrand(brand);
    toast.success(`Syncing ${brand.productsCount} products from ${brand.name}...`);
    
    // Simulate sync process
    setTimeout(() => {
      toast.success(`Successfully synced ${brand.productsCount} products!`);
      setTimeout(() => {
        navigate("/products/add-sku");
      }, 1500);
    }, 2500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/products/add-sku"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Add SKU
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Brand Catalog Sync</h1>
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </div>
        <p className="text-gray-600 mt-1">
          Instantly import complete product catalogs from verified brands
        </p>
      </div>

      {/* Source Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Data Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => setSelectedSource("ondc")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSource === "ondc"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">ONDC Store</p>
                  <p className="text-xs text-gray-600">500+ brands</p>
                </div>
              </div>
              {selectedSource === "ondc" && (
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              )}
            </button>

            <button
              onClick={() => setSelectedSource("external")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSource === "external"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">External Provider</p>
                  <p className="text-xs text-gray-600">Third-party APIs</p>
                </div>
              </div>
              {selectedSource === "external" && (
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              )}
            </button>

            <button
              onClick={() => setSelectedSource("direct")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSource === "direct"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Brand Direct</p>
                  <p className="text-xs text-gray-600">Official brand API</p>
                </div>
              </div>
              {selectedSource === "direct" && (
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Banner */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Save Time</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Import entire catalogs in seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verified Data</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Accurate product information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Complete Details</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Images, pricing, and specs included
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Brands ({filteredBrands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {brand.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-600">{brand.category}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      brand.status === "verified"
                        ? "default"
                        : brand.status === "popular"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {brand.status}
                  </Badge>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Products</span>
                    <span className="font-semibold text-gray-900">
                      {brand.productsCount}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSync(brand)}
                  disabled={selectedBrand?.id === brand.id}
                  className="w-full"
                >
                  {selectedBrand?.id === brand.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Catalog
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 mb-2">How Brand Sync Works</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>
                Select your preferred data source (ONDC is recommended for most brands)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>
                Choose the brand whose catalog you want to import
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>
                Click "Sync Catalog" to automatically import all products with complete details
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>
                Products will be added to your catalog instantly with pricing, images, and specifications
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
