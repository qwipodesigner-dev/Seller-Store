import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  ArrowLeft,
  Package,
  Pencil,
  Tag,
  Barcode,
  Calendar,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Archive,
} from "lucide-react";

// Sample SKU data (in real app, this would be fetched based on ID)
const skuData: Record<string, any> = {
  "1": {
    id: "1",
    name: "Fortune Sunlite Refined Sunflower Oil",
    sku: "FOR-SUN-1L-001",
    category: "Edible Oil",
    brand: "Fortune",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-25",
    description: "Premium quality refined sunflower oil for healthy cooking. Rich in Vitamin E and low in saturated fats.",
    specifications: {
      weight: "1 Liter",
      packaging: "Plastic Bottle",
      shelfLife: "12 months",
      manufacturer: "Adani Wilmar Ltd",
      countryOfOrigin: "India",
    },
    pricing: {
      mrp: "₹185.00",
      sellingPrice: "₹165.00",
      costPrice: "₹145.00",
      margin: "13.79%",
    },
    inventory: {
      currentStock: 450,
      minStockLevel: 50,
      reorderPoint: 100,
      warehouse: "WH-Mumbai-01",
    },
    tax: {
      gstRate: "18%",
      hsnCode: "15121900",
    },
  },
  "2": {
    id: "2",
    name: "Maggi 2-Minute Noodles Masala",
    sku: "MAG-NOO-70G-002",
    category: "Instant Food",
    brand: "Maggi",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-24",
    description: "Quick and tasty instant noodles with the classic Maggi masala flavor. Ready in just 2 minutes.",
    specifications: {
      weight: "70 Grams",
      packaging: "Pouch",
      shelfLife: "9 months",
      manufacturer: "Nestle India Ltd",
      countryOfOrigin: "India",
    },
    pricing: {
      mrp: "₹14.00",
      sellingPrice: "₹12.00",
      costPrice: "₹9.50",
      margin: "26.32%",
    },
    inventory: {
      currentStock: 1200,
      minStockLevel: 200,
      reorderPoint: 300,
      warehouse: "WH-Delhi-02",
    },
    tax: {
      gstRate: "12%",
      hsnCode: "19023010",
    },
  },
};

export function SKUDetail() {
  const navigate = useNavigate();
  const { skuId } = useParams();
  
  const sku = skuData[skuId || "1"] || skuData["1"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Inactive</Badge>;
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "Brand Sync":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300">Brand Sync</Badge>;
      case "Manual":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Manual</Badge>;
      case "Excel Import":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Excel Import</Badge>;
      case "DMS":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">DMS</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/products/my-sku")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{sku.name}</h1>
              {getStatusBadge(sku.status)}
            </div>
            <p className="text-gray-600 mt-1">SKU: {sku.sku}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/products/my-sku/edit/${sku.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit SKU
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Product Description</h3>
                <p className="text-gray-600">{sku.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Category</h3>
                  <p className="text-gray-900">{sku.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Brand</h3>
                  <p className="text-gray-900">{sku.brand}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Source</h3>
                  {getSourceBadge(sku.source)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Last Updated</h3>
                  <p className="text-gray-900">{sku.lastUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Weight/Size</h3>
                  <p className="text-gray-900">{sku.specifications.weight}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Packaging</h3>
                  <p className="text-gray-900">{sku.specifications.packaging}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Shelf Life</h3>
                  <p className="text-gray-900">{sku.specifications.shelfLife}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Manufacturer</h3>
                  <p className="text-gray-900">{sku.specifications.manufacturer}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Country of Origin</h3>
                  <p className="text-gray-900">{sku.specifications.countryOfOrigin}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">MRP</h3>
                  <p className="text-xl font-bold text-gray-900">{sku.pricing.mrp}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Selling Price</h3>
                  <p className="text-xl font-bold text-green-600">{sku.pricing.sellingPrice}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Cost Price</h3>
                  <p className="text-gray-900">{sku.pricing.costPrice}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Margin</h3>
                  <p className="text-gray-900">{sku.pricing.margin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Secondary Information */}
        <div className="space-y-6">
          {/* Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-indigo-600" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Current Stock</h3>
                <p className="text-2xl font-bold text-gray-900">{sku.inventory.currentStock} units</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Min Stock Level</h3>
                <p className="text-gray-900">{sku.inventory.minStockLevel} units</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Reorder Point</h3>
                <p className="text-gray-900">{sku.inventory.reorderPoint} units</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Warehouse</h3>
                <p className="text-gray-900">{sku.inventory.warehouse}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-600" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">GST Rate</h3>
                <p className="text-xl font-bold text-gray-900">{sku.tax.gstRate}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">HSN Code</h3>
                <code className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                  {sku.tax.hsnCode}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Product Image Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-pink-600" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
