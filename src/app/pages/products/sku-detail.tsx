import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ArrowLeft,
  Package,
  Pencil,
  Tag,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Archive,
  Gift,
  Percent,
  ShoppingCart,
  Users,
  PackageOpen,
  TrendingUp,
  Sparkles,
  Flame,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface OfferTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  savings?: number;
}

interface Offer {
  id: string;
  type:
    | "quantity-slab"
    | "buy-x-get-y"
    | "discount"
    | "cart-level"
    | "seller-specific"
    | "bundle";
  title: string;
  description: string;
  benefitText: string;
  conditions: string[];
  validity?: string;
  isActive: boolean;
  isBestOffer?: boolean;
  isMostPopular?: boolean;
  savings?: number;
  tiers?: OfferTier[];
  discountType?: "flat" | "percentage";
  discountValue?: number;
  buyQuantity?: number;
  getQuantity?: number;
  getFreeItem?: string;
  getDiscountPercent?: number;
  minCartValue?: number;
  cartDiscount?: number;
  cartDiscountType?: "flat" | "percentage";
  sellerName?: string;
  sellerDiscount?: number;
  bundleProducts?: { name: string; sku: string }[];
  bundleDiscount?: number;
  stackable?: boolean;
  expiresIn?: string;
  category?: "sku-level" | "conditional";
}

// Sample SKU data
const skuData: Record<string, any> = {
  "1": {
    id: "1",
    name: "Fortune Sunlite Refined Sunflower oil",
    sku: "FOR-SUN-1L-001",
    category: "Edible Oil",
    brand: "Fortune",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-25",
    description:
      "Premium quality refined sunflower oil for healthy cooking. Rich in Vitamin E and low in saturated fats.",
    specifications: {
      weight: "1 Liter",
      packaging: "Plastic Bottle",
      shelfLife: "12 months",
      manufacturer: "Adani Wilmar Ltd",
      countryOfOrigin: "India",
    },
    pricing: {
      mrp: 185.0,
      sellingPrice: 165.0,
      costPrice: 145.0,
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
    description:
      "Quick and tasty instant noodles with the classic Maggi masala flavor. Ready in just 2 minutes.",
    specifications: {
      weight: "70 Grams",
      packaging: "Pouch",
      shelfLife: "9 months",
      manufacturer: "Nestle India Ltd",
      countryOfOrigin: "India",
    },
    pricing: {
      mrp: 14.0,
      sellingPrice: 12.0,
      costPrice: 9.5,
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

// Mock Offers Data
const mockOffers: Record<string, Offer[]> = {
  "1": [
    // SKU-Level Offers
    {
      id: "off-1",
      type: "quantity-slab",
      category: "sku-level",
      title: "Bulk Purchase Discount",
      description: "Save more when you buy in bulk",
      benefitText: "Up to ₹25/unit savings",
      conditions: ["Minimum 1 unit", "Maximum 100 units per order"],
      validity: "Valid till 30 Apr 2026",
      isActive: true,
      isBestOffer: true,
      stackable: false,
      tiers: [
        { minQty: 1, maxQty: 10, pricePerUnit: 165, savings: 0 },
        { minQty: 11, maxQty: 20, pricePerUnit: 155, savings: 10 },
        { minQty: 21, maxQty: 50, pricePerUnit: 145, savings: 20 },
        { minQty: 51, pricePerUnit: 140, savings: 25 },
      ],
    },
    {
      id: "off-2",
      type: "buy-x-get-y",
      category: "sku-level",
      title: "Buy 2 Get 1 @ 50% Off",
      description: "Perfect for stocking up",
      benefitText: "Save ₹82.50 per combo",
      conditions: ["Buy 2 units", "Get 1 unit at 50% off"],
      validity: "Valid till 15 Apr 2026",
      isActive: true,
      isMostPopular: true,
      stackable: false,
      buyQuantity: 2,
      getQuantity: 1,
      getDiscountPercent: 50,
      savings: 82.5,
      expiresIn: "8 days",
    },
    {
      id: "off-3",
      type: "discount",
      category: "sku-level",
      title: "Instant Discount",
      description: "Flat discount on this SKU",
      benefitText: "Flat ₹15 Off",
      conditions: ["No minimum quantity", "Applied automatically"],
      validity: "Valid till 20 Apr 2026",
      isActive: true,
      stackable: true,
      discountType: "flat",
      discountValue: 15,
      savings: 15,
    },

    // Conditional Offers
    {
      id: "off-4",
      type: "cart-level",
      category: "conditional",
      title: "Cart Value Bonus",
      description: "Extra savings on higher cart value",
      benefitText: "Get 5% off on cart ₹5000+",
      conditions: ["Minimum cart value ₹5000", "Maximum discount ₹500"],
      validity: "Valid till 30 Apr 2026",
      isActive: true,
      stackable: true,
      minCartValue: 5000,
      cartDiscount: 5,
      cartDiscountType: "percentage",
    },
    {
      id: "off-5",
      type: "seller-specific",
      category: "conditional",
      title: "Premium Seller Deal",
      description: "Exclusive offer from verified seller",
      benefitText: "Extra 3% off from Fortune Direct",
      conditions: ["Only from seller: Fortune Direct", "Minimum 5 units"],
      validity: "Valid till 25 Apr 2026",
      isActive: true,
      stackable: true,
      sellerName: "Fortune Direct",
      sellerDiscount: 3,
    },
    {
      id: "off-6",
      type: "bundle",
      category: "conditional",
      title: "Cooking Essentials Bundle",
      description: "Buy together and save",
      benefitText: "Save ₹50 on combo",
      conditions: ["Buy all items in bundle", "Limited time offer"],
      validity: "Valid till 30 Apr 2026",
      isActive: true,
      stackable: false,
      bundleProducts: [
        { name: "Fortune Sunlite Oil 1L", sku: "FOR-SUN-1L-001" },
        { name: "Fortune Rice Bran Oil 1L", sku: "FOR-RBO-1L-002" },
        { name: "Fortune Mustard Oil 1L", sku: "FOR-MUS-1L-003" },
      ],
      bundleDiscount: 50,
      savings: 50,
    },
  ],
  "2": [
    // SKU-Level Offers for Maggi
    {
      id: "mag-1",
      type: "buy-x-get-y",
      category: "sku-level",
      title: "Buy 5 Get 1 Free",
      description: "Stock up and save",
      benefitText: "Get 1 pack absolutely free",
      conditions: ["Buy 5 packs", "Get 1 pack free"],
      validity: "Valid till 30 Apr 2026",
      isActive: true,
      isBestOffer: true,
      stackable: false,
      buyQuantity: 5,
      getQuantity: 1,
      getFreeItem: "Maggi 2-Minute Noodles Masala",
      savings: 12,
    },
    {
      id: "mag-2",
      type: "quantity-slab",
      category: "sku-level",
      title: "Wholesale Pricing",
      description: "Better prices for bulk orders",
      benefitText: "Save up to ₹2/unit",
      conditions: ["Volume-based pricing", "No maximum limit"],
      validity: "Always available",
      isActive: true,
      isMostPopular: true,
      stackable: false,
      tiers: [
        { minQty: 1, maxQty: 24, pricePerUnit: 12, savings: 0 },
        { minQty: 25, maxQty: 50, pricePerUnit: 11, savings: 1 },
        { minQty: 51, pricePerUnit: 10, savings: 2 },
      ],
    },
    {
      id: "mag-3",
      type: "discount",
      category: "sku-level",
      title: "Monsoon Special",
      description: "Limited time offer",
      benefitText: "10% Off",
      conditions: ["Valid on all quantities", "Auto-applied at checkout"],
      validity: "Valid till 10 Apr 2026",
      isActive: true,
      stackable: true,
      discountType: "percentage",
      discountValue: 10,
      savings: 1.2,
      expiresIn: "3 days",
    },
  ],
};

// Offer Card Component
function OfferCard({ offer, currentQty = 1 }: { offer: Offer; currentQty?: number }) {
  const [expanded, setExpanded] = useState(false);

  const getOfferIcon = () => {
    switch (offer.type) {
      case "quantity-slab":
        return <TrendingUp className="h-5 w-5" />;
      case "buy-x-get-y":
        return <Gift className="h-5 w-5" />;
      case "discount":
        return <Percent className="h-5 w-5" />;
      case "cart-level":
        return <ShoppingCart className="h-5 w-5" />;
      case "seller-specific":
        return <Users className="h-5 w-5" />;
      case "bundle":
        return <PackageOpen className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const getOfferTypeLabel = () => {
    switch (offer.type) {
      case "quantity-slab":
        return "Volume Pricing";
      case "buy-x-get-y":
        return "Freebie Offer";
      case "discount":
        return "Instant Discount";
      case "cart-level":
        return "Cart Offer";
      case "seller-specific":
        return "Seller Offer";
      case "bundle":
        return "Bundle Deal";
      default:
        return "Offer";
    }
  };

  const getOfferColor = () => {
    switch (offer.type) {
      case "quantity-slab":
        return "border-blue-200 bg-blue-50";
      case "buy-x-get-y":
        return "border-pink-200 bg-pink-50";
      case "discount":
        return "border-green-200 bg-green-50";
      case "cart-level":
        return "border-purple-200 bg-purple-50";
      case "seller-specific":
        return "border-orange-200 bg-orange-50";
      case "bundle":
        return "border-indigo-200 bg-indigo-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getBadgeColor = () => {
    switch (offer.type) {
      case "quantity-slab":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "buy-x-get-y":
        return "bg-pink-100 text-pink-700 border-pink-300";
      case "discount":
        return "bg-green-100 text-green-700 border-green-300";
      case "cart-level":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "seller-specific":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "bundle":
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Card className={`border-2 ${getOfferColor()} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${getOfferColor()}`}>{getOfferIcon()}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                  {offer.isBestOffer && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
                      <Star className="h-3 w-3 fill-amber-700" />
                      Best Offer
                    </Badge>
                  )}
                  {offer.isMostPopular && (
                    <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                      <Flame className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{offer.description}</p>
              </div>
            </div>
            <Badge className={getBadgeColor()}>{getOfferTypeLabel()}</Badge>
          </div>

          {/* Benefit Highlight */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">{offer.benefitText}</span>
              </div>
              {offer.savings && (
                <span className="text-sm text-gray-600">You save ₹{offer.savings.toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Quantity Slab Pricing Table */}
          {offer.type === "quantity-slab" && offer.tiers && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Volume Pricing Tiers</span>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {expanded ? (
                    <>
                      Collapse <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Expand <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              {expanded && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Quantity</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                          Price/Unit
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {offer.tiers.map((tier, idx) => {
                        const isActive =
                          currentQty >= tier.minQty &&
                          (!tier.maxQty || currentQty <= tier.maxQty);
                        return (
                          <tr
                            key={idx}
                            className={isActive ? "bg-green-50 font-medium" : "bg-white"}
                          >
                            <td className="px-3 py-2">
                              {tier.minQty}
                              {tier.maxQty ? `-${tier.maxQty}` : "+"} units
                              {isActive && (
                                <Badge className="ml-2 bg-green-100 text-green-700 border-green-300 text-xs">
                                  Active
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">₹{tier.pricePerUnit}</td>
                            <td className="px-3 py-2 text-right text-green-600">
                              {tier.savings ? `₹${tier.savings}/unit` : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bundle Products */}
          {offer.type === "bundle" && offer.bundleProducts && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Bundle Includes:</span>
              <div className="space-y-1">
                {offer.bundleProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm bg-white rounded p-2 border border-gray-200"
                  >
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-500 text-xs">({product.sku})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Progress (for cart-level offers) */}
          {offer.type === "cart-level" && offer.minCartValue && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cart value needed:</span>
                <span className="font-semibold text-gray-900">₹{offer.minCartValue}</span>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-gray-500">
                Add ₹2,750 more to unlock this offer (Current: ₹2,250)
              </p>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Conditions:</span>
            <ul className="space-y-0.5">
              {offer.conditions.map((condition, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {offer.validity && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{offer.validity}</span>
                </div>
              )}
              {offer.expiresIn && (
                <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Ends in {offer.expiresIn}
                </Badge>
              )}
              {offer.stackable && (
                <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                  Stackable
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Offer details coming soon")}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Details Tab Component
function ProductDetailsTab({ sku }: { sku: any }) {
  // DMS snapshot (read-only reference)
  const dms = {
    name: sku.name,
    skuCode: sku.sku,
    category: sku.category,
    brand: sku.brand,
    shortDescription: sku.description?.split(".")[0] || "",
    longDescription: sku.description || "",
    status: sku.status,
    sellingPrice: sku.pricing?.sellingPrice ?? 0,
    mrp: sku.pricing?.mrp ?? 0,
    currency: "INR",
    availableQty: sku.inventory?.currentStock ?? 0,
    maxOrderQty: 50,
    unitType: "Liter",
    unitValue: sku.specifications?.weight || "",
    weight: sku.specifications?.weight || "",
    packagingType: sku.specifications?.packaging || "",
    innerPack: "1",
    timeToShip: "2 days",
    manufacturerName: sku.specifications?.manufacturer || "",
    manufacturerAddress: "Ahmedabad, Gujarat, India",
    countryOfOrigin: sku.specifications?.countryOfOrigin || "India",
    fssaiLicense: "10012345000123",
    upc: "8901030874116",
  };

  // ONDC state (editable, pre-filled from DMS)
  const [ondc, setOndc] = useState({ ...dms });
  const [ondcImages, setOndcImages] = useState<string[]>([]);

  const update = (key: keyof typeof dms, value: any) =>
    setOndc((prev) => ({ ...prev, [key]: value }));

  const isEdited = (key: keyof typeof dms) =>
    JSON.stringify(dms[key]) !== JSON.stringify(ondc[key]);

  const handleSave = () => toast.success("ONDC values saved successfully");
  const handleReset = () => {
    setOndc({ ...dms });
    setOndcImages([]);
    toast.success("ONDC values reset to DMS defaults");
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            DMS: Read-only reference
          </Badge>
          <Badge className="bg-green-50 text-green-700 border-green-200">
            ONDC: Final source for publishing
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to DMS
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            Save ONDC Values
          </Button>
        </div>
      </div>

      {/* Two parallel containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== LEFT: DMS (Read-only) ===== */}
        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              DMS Values (Read-only)
            </h2>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadField label="Product (SKU) Name" value={dms.name} />
              <ReadField label="SKU Code" value={dms.skuCode} />
              <div className="grid grid-cols-2 gap-4">
                <ReadField label="Category" value={dms.category} />
                <ReadField label="Brand Name" value={dms.brand} />
              </div>
              <ReadField label="Short Description" value={dms.shortDescription} />
              <ReadField label="Long Description" value={dms.longDescription} multiline />
              <ReadField label="Status" value={dms.status} />
            </CardContent>
          </Card>

          {/* Unit & Measurement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-indigo-600" />
                Unit & Measurement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <ReadField label="Unit Type" value={dms.unitType} />
                <ReadField label="Unit Value" value={dms.unitValue} />
                <ReadField label="Weight" value={dms.weight} />
              </div>
            </CardContent>
          </Card>

          {/* Packaging & Logistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageOpen className="h-5 w-5 text-orange-600" />
                Packaging & Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <ReadField label="Packaging Type" value={dms.packagingType} />
                <ReadField label="Inner Pack" value={dms.innerPack} />
                <ReadField label="Time to Ship" value={dms.timeToShip} />
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-rose-600" />
                Manufacturer & Compliance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadField label="Manufacturer Name" value={dms.manufacturerName} />
              <ReadField label="Manufacturer Address" value={dms.manufacturerAddress} multiline />
              <div className="grid grid-cols-2 gap-4">
                <ReadField label="Country of Origin" value={dms.countryOfOrigin} />
                <ReadField label="FSSAI License Number" value={dms.fssaiLicense} />
              </div>
            </CardContent>
          </Card>

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-5 w-5 text-teal-600" />
                Identification & Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadField label="UPC" value={dms.upc} />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-pink-600" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From DMS — non-editable</p>
            </CardContent>
          </Card>

          {/* Offers & Schemes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-5 w-5 text-amber-600" />
                Offers & Schemes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                {mockOffers[sku.id]?.length
                  ? `${mockOffers[sku.id].length} offer(s) applied from DMS`
                  : "No offers from DMS"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Read-only — managed centrally in DMS
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ===== RIGHT: ONDC (Editable) ===== */}
        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <h2 className="text-sm font-bold text-green-900 flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              ONDC Values (Editable)
            </h2>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditField label="Product (SKU) Name" value={ondc.name} onChange={(v) => update("name", v)} edited={isEdited("name")} required />
              <EditField label="SKU Code" value={ondc.skuCode} onChange={(v) => update("skuCode", v)} edited={isEdited("skuCode")} required />
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Category" value={ondc.category} onChange={(v) => update("category", v)} edited={isEdited("category")} required />
                <EditField label="Brand Name" value={ondc.brand} onChange={(v) => update("brand", v)} edited={isEdited("brand")} required />
              </div>
              <EditField label="Short Description" value={ondc.shortDescription} onChange={(v) => update("shortDescription", v)} edited={isEdited("shortDescription")} />
              <EditField label="Long Description" value={ondc.longDescription} onChange={(v) => update("longDescription", v)} edited={isEdited("longDescription")} multiline />
              <EditSelectField label="Status" value={ondc.status} onChange={(v) => update("status", v)} edited={isEdited("status")} options={["Active", "Inactive", "Draft"]} />
            </CardContent>
          </Card>

          {/* Unit & Measurement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-indigo-600" />
                Unit & Measurement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <EditField label="Unit Type" value={ondc.unitType} onChange={(v) => update("unitType", v)} edited={isEdited("unitType")} />
                <EditField label="Unit Value" value={ondc.unitValue} onChange={(v) => update("unitValue", v)} edited={isEdited("unitValue")} />
                <EditField label="Weight" value={ondc.weight} onChange={(v) => update("weight", v)} edited={isEdited("weight")} />
              </div>
            </CardContent>
          </Card>

          {/* Packaging & Logistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageOpen className="h-5 w-5 text-orange-600" />
                Packaging & Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <EditField label="Packaging Type" value={ondc.packagingType} onChange={(v) => update("packagingType", v)} edited={isEdited("packagingType")} />
                <EditField label="Inner Pack" value={ondc.innerPack} onChange={(v) => update("innerPack", v)} edited={isEdited("innerPack")} />
                <EditField label="Time to Ship" value={ondc.timeToShip} onChange={(v) => update("timeToShip", v)} edited={isEdited("timeToShip")} />
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-rose-600" />
                Manufacturer & Compliance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditField label="Manufacturer Name" value={ondc.manufacturerName} onChange={(v) => update("manufacturerName", v)} edited={isEdited("manufacturerName")} required />
              <EditField label="Manufacturer Address" value={ondc.manufacturerAddress} onChange={(v) => update("manufacturerAddress", v)} edited={isEdited("manufacturerAddress")} required multiline />
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Country of Origin" value={ondc.countryOfOrigin} onChange={(v) => update("countryOfOrigin", v)} edited={isEdited("countryOfOrigin")} required />
                <EditField label="FSSAI License Number" value={ondc.fssaiLicense} onChange={(v) => update("fssaiLicense", v)} edited={isEdited("fssaiLicense")} />
              </div>
            </CardContent>
          </Card>

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-5 w-5 text-teal-600" />
                Identification & Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditField label="UPC" value={ondc.upc} onChange={(v) => update("upc", v)} edited={isEdited("upc")} />
            </CardContent>
          </Card>

          {/* Images — Editable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-pink-600" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ondcImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center group"
                  >
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setOndcImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-0.5 rounded bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOndcImages((prev) => [...prev, `img-${prev.length + 1}`])}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Upload</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {ondcImages.length} image{ondcImages.length !== 1 ? "s" : ""} uploaded — used in ONDC payload
              </p>
            </CardContent>
          </Card>

          {/* Offers & Schemes — display-only even on ONDC side per spec */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-5 w-5 text-amber-600" />
                Offers & Schemes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                {mockOffers[sku.id]?.length
                  ? `${mockOffers[sku.id].length} offer(s) inherited from DMS`
                  : "No offers inherited"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Managed centrally in DMS — no override available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Read-only field
function ReadField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {multiline ? (
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{value || "—"}</p>
      ) : (
        <p className="text-sm text-gray-900">{value || "—"}</p>
      )}
    </div>
  );
}

// Editable input field
function EditField({
  label,
  value,
  onChange,
  edited,
  required,
  multiline,
  prefix,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  edited?: boolean;
  required?: boolean;
  multiline?: boolean;
  prefix?: string;
  type?: "text" | "number";
}) {
  const missing = required && (!value || String(value).trim() === "");
  const borderClass = missing
    ? "border-red-400 focus-within:ring-red-500"
    : edited
      ? "border-amber-400 focus-within:ring-amber-500"
      : "border-gray-300 focus-within:ring-blue-500";

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 ${borderClass}`}
        />
      ) : (
        <div className={`flex items-center rounded-md border bg-white focus-within:ring-2 ${borderClass}`}>
          {prefix && <span className="pl-3 text-gray-500 text-sm">{prefix}</span>}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md text-sm bg-transparent focus:outline-none"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mt-1">
        {edited && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700">
            <Sparkles className="h-3 w-3" />
            Edited
          </span>
        )}
        {missing && (
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            Required
          </span>
        )}
      </div>
    </div>
  );
}

// Editable select field
function EditSelectField({
  label,
  value,
  onChange,
  edited,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  edited?: boolean;
  options: string[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={edited ? "border-amber-400" : ""}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {edited && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 mt-1">
          <Sparkles className="h-3 w-3" />
          Edited
        </span>
      )}
    </div>
  );
}

// Offers & Schemes Tab Component
function OffersTab({ skuId }: { skuId: string }) {
  const offers = mockOffers[skuId] || [];
  const [sortBy, setSortBy] = useState<"savings" | "relevance">("relevance");

  const skuLevelOffers = offers.filter((o) => o.category === "sku-level");
  const conditionalOffers = offers.filter((o) => o.category === "conditional");

  const sortOffers = (offerList: Offer[]) => {
    if (sortBy === "savings") {
      return [...offerList].sort((a, b) => (b.savings || 0) - (a.savings || 0));
    }
    return offerList;
  };

  const totalOffers = offers.length;
  const bestOffer = offers.find((o) => o.isBestOffer);

  if (totalOffers === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <Gift className="h-16 w-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers available</h3>
        <p className="text-gray-600 text-center max-w-md">
          There are currently no offers or schemes available for this SKU. Check back later for
          exciting deals!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Best Offer Available</h3>
              </div>
              {bestOffer ? (
                <div>
                  <p className="text-2xl font-bold text-green-700 mb-1">{bestOffer.benefitText}</p>
                  <p className="text-sm text-gray-600">{bestOffer.title}</p>
                </div>
              ) : (
                <p className="text-lg text-gray-700">Multiple offers available</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-white rounded-lg px-4 py-2 border border-green-300">
                <p className="text-sm text-gray-600">Total Offers</p>
                <p className="text-3xl font-bold text-gray-900">{totalOffers}</p>
              </div>
            </div>
          </div>
          {totalOffers > 1 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-gray-600">
                + {totalOffers - 1} more {totalOffers === 2 ? "offer" : "offers"} available below
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Offers</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SKU-Level Offers */}
      {skuLevelOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">SKU-Level Offers</h3>
            <Badge className="bg-green-100 text-green-700 border-green-300">
              {skuLevelOffers.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 -mt-2">Directly applicable on this SKU</p>
          <div className="grid gap-4">
            {sortOffers(skuLevelOffers).map((offer) => (
              <OfferCard key={offer.id} offer={offer} currentQty={15} />
            ))}
          </div>
        </div>
      )}

      {/* Conditional Offers */}
      {conditionalOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Conditional Offers</h3>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              {conditionalOffers.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 -mt-2">
            Dependent on cart value, seller, or product bundles
          </p>
          <div className="grid gap-4">
            {sortOffers(conditionalOffers).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main SKU Detail Component
export function SKUDetail() {
  const navigate = useNavigate();
  const { skuId } = useParams();
  const [activeTab, setActiveTab] = useState<"details" | "offers">("details");

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

  const offersCount = mockOffers[skuId || "1"]?.length || 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/products/my-sku")}>
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
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Product Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "offers"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Offers & Schemes
              {offersCount > 0 && (
                <Badge className="bg-red-500 text-white border-red-600 ml-1">
                  {offersCount}
                </Badge>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && <ProductDetailsTab sku={sku} />}
      {activeTab === "offers" && <OffersTab skuId={skuId || "1"} />}
    </div>
  );
}