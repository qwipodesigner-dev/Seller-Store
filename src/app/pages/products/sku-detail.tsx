import { useNavigate, useParams } from "react-router";
import { useRef, useState } from "react";
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
  IndianRupee,
  Upload,
  X,
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
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { validateSKU, ValidationError } from "../../lib/ondc-validation";
import { useAuth } from "../../lib/auth-context";
import { getSellerById } from "../../lib/mock-store";
import {
  getCompanies as getAdminCatalogCompanies,
  subscribeToCompanies as subscribeToAdminCatalog,
} from "../../lib/admin-catalog";
import { useEffect } from "react";

// ONDC eB2B category taxonomy — shown as the Category ID dropdown options.
const CATEGORY_OPTIONS = [
  "Fruits and Vegetables",
  "Masala & Seasoning",
  "Oil & Ghee",
  "Eggs, Meat & Fish",
  "Bakery, Cakes & Dairy",
  "Pet Care",
  "Detergents and Dishwash",
  "Dairy and Cheese",
  "Snacks, Dry Fruits, Nuts",
  "Pasta, Soup and Noodles",
  "Cereals and Breakfast",
  "Sauces, Spreads and Dips",
  "Chocolates and Biscuits",
  "Cooking and Baking Needs",
  "Tinned and Processed Food",
  "Atta, Flours and Sooji",
  "Rice and Rice Products",
  "Dals and Pulses",
  "Salt, Sugar and Jaggery",
  "Energy and Soft Drinks",
  "Water",
  "Tea and Coffee",
  "Fruit Juices and Fruit Drinks",
  "Snacks and Namkeen",
  "Ready to Cook and Eat",
  "Pickles and Chutney",
  "Indian Sweets",
  "Frozen Vegetables",
  "Frozen Snacks",
  "Gift Voucher",
  "Gourmet & World Foods",
  "Foodgrains",
  "Beverages",
  "Beauty & Hygiene",
  "Kitchen Accessories",
  "Baby Care",
  "Snacks & Branded Foods",
];

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
  // Fully-prefilled ONDC SKU — Aashirvaad Atta 10 kg from ITC Limited.
  // Used to demo what the SKU detail screen looks like once every ONDC field
  // is populated (including images). Linked to seller-1 via the ITC company.
  "190000001": {
    id: "190000001",
    name: "Aashirvaad Whole Wheat Atta 10 kg",
    sku: "190000001",
    category: "Cooking and Baking Needs",
    brand: "Aashirvaad",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-25",
    description:
      "Aashirvaad Atta is made from 100% whole wheat sourced from the heartlands of India, stone-ground for chakki-fresh taste. Each 10 kg pack delivers consistently soft, fluffy rotis with high fibre content and rich aroma.",
    specifications: {
      weight: "10 Kilogram",
      packaging: "Multi-layer Polypropylene Bag",
      shelfLife: "6 months",
      manufacturer: "ITC",
      countryOfOrigin: "India",
    },
    pricing: {
      mrp: 565.0,
      sellingPrice: 525.0,
      costPrice: 470.0,
      margin: "10.47%",
    },
    inventory: {
      currentStock: 320,
      minStockLevel: 30,
      reorderPoint: 60,
      warehouse: "WH-Hyderabad-001",
    },
    tax: {
      gstRate: "5%",
      hsnCode: "11010000",
    },
    // Pre-populated ONDC values — when present, ProductDetailsTab seeds the
    // ONDC editor with these instead of leaving the form blank.
    ondcPrefilled: {
      itemStatus: "enable",
      shortDesc:
        "Stone-ground whole wheat atta for soft, fluffy rotis. 10 kg value pack.",
      longDesc:
        "Aashirvaad Atta is made from 100% whole wheat sourced from the heartlands of India and stone-ground using the traditional chakki process for authentic taste. Each 10 kg pack delivers consistently soft, fluffy rotis with high fibre content, slow-release energy and a rich aroma. Hygienically packed in a multi-layer polypropylene bag to preserve freshness for up to six months.",
      measureUnit: "kilogram",
      measureValue: "10",
      unitizedCount: "1",
      maximumOrderQty: "100",
      minimumOrderQty: "1",
      upc: "8901725100015",
      skuWeight: "10",
      categoryId: "Cooking and Baking Needs",
      fulfillmentId: "Store Delivery",
      locationId: "WH-001",
      returnable: true,
      cancellable: true,
      timeToShip: "PT24H",
      availableOnCod: true,
      consumerCareContactName: "ITC Consumer Care",
      consumerCareContactEmail: "consumer.care@itc.in",
      consumerCareContactPhone: "18004253030",
      manufacturerName: "ITC",
      manufacturerAddress:
        "ITC Limited, Virginia House, 37 J.L. Nehru Road, Kolkata, West Bengal, India - 700071",
      countryOfOrigin: "India",
      brandAttribute: "Aashirvaad",
      productImages: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
        "https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&q=80",
        "https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=600&q=80",
      ],
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

// Product Details Tab Component — DMS (read-only reference) + ONDC (editable) dual-column layout.
function ProductDetailsTab({ sku }: { sku: any }) {
  // ----- Seller-scoped Company / Brand picker source -----
  // The Manufacturer/Packer Name dropdown is restricted to companies the
  // super-admin tagged to this seller; the Brand dropdown is restricted to
  // brands within the chosen company.
  const { user, activeSeller } = useAuth();
  const resolvedSellerId = activeSeller?.sellerId ?? user?.id ?? null;
  const seller = resolvedSellerId ? getSellerById(resolvedSellerId) : null;
  const [adminCompanies, setAdminCompanies] = useState(() => getAdminCatalogCompanies());
  useEffect(
    () => subscribeToAdminCatalog(() => setAdminCompanies([...getAdminCatalogCompanies()])),
    [],
  );
  const sellerSelections = seller?.companyBrandSelections ?? [];
  // Companies linked to this seller that are still active in the master catalog.
  let sellerCompanies = sellerSelections
    .map((sel) => {
      const c = adminCompanies.find((co) => co.id === sel.companyId);
      if (!c || c.isActive === false) return null;
      const brands =
        sel.brandIds.length === 0
          ? c.brands
          : c.brands.filter((b) => sel.brandIds.includes(b.id));
      return { ...c, brands };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Defensive: if the SKU ships with a prefilled company/brand (e.g. demo SKUs)
  // that the seller record doesn't currently link, still surface that company
  // in the dropdown so the prefilled value renders. This guards against stale
  // localStorage and makes demo SKUs work even before the catalog is wired up.
  const prefilledCompanyName = sku.ondcPrefilled?.manufacturerName as
    | string
    | undefined;
  if (prefilledCompanyName) {
    const already = sellerCompanies.some((c) => c.name === prefilledCompanyName);
    const fromCatalog = adminCompanies.find(
      (c) => c.name === prefilledCompanyName && c.isActive !== false,
    );
    if (!already && fromCatalog) {
      sellerCompanies = [
        { ...fromCatalog, brands: fromCatalog.brands },
        ...sellerCompanies,
      ];
    }
  }

  // DMS snapshot — read-only reference that comes from the DMS system of record.
  const dms = {
    itemStatus: sku.status === "Active" ? "enable" : "disable",
    itemName: sku.name || "",
    itemCode: "1:" + (sku.sku || ""),
    shortDesc: sku.description?.split(".")[0] || "",
    longDesc: sku.description || "",
    additionalImages: [] as string[],
    unitizedCount: "1",
    measureUnit: "litre",
    measureValue: "1",
    maximumOrderQty: "100",
    minimumOrderQty: "1",
    upc: "12",
    skuWeight: "1.05",
    categoryId: sku.category || "",
    fulfillmentId: "F1",
    locationId: "L1",
    returnable: true,
    cancellable: true,
    timeToShip: "PT4H",
    availableOnCod: false,
    consumerCareContactName: "Customer Support",
    consumerCareContactEmail: "support@seller.com",
    consumerCareContactPhone: "18004254444",
    manufacturerName: sku.specifications?.manufacturer || "",
    manufacturerAddress: "Ahmedabad, Gujarat, India - 380009",
    countryOfOrigin: "IND",
    brandAttribute: sku.brand || "",
    statutoryImages: [] as string[],
    productImages: [] as string[],
  };

  // ONDC starts mostly blank — only Item Name and Item Code are copied from DMS
  // (these are the unique identifiers). Everything else is left for the seller to fill in.
  const blankOndc: typeof dms = {
    ...dms,
    shortDesc: "",
    longDesc: "",
    additionalImages: [],
    unitizedCount: "",
    measureUnit: "",
    measureValue: "",
    maximumOrderQty: "",
    minimumOrderQty: "",
    upc: "",
    skuWeight: "",
    categoryId: "",
    fulfillmentId: "",
    locationId: "",
    returnable: false,
    cancellable: false,
    timeToShip: "",
    availableOnCod: false,
    consumerCareContactName: "",
    consumerCareContactEmail: "",
    consumerCareContactPhone: "",
    manufacturerName: "",
    manufacturerAddress: "",
    countryOfOrigin: "",
    brandAttribute: "",
    statutoryImages: [],
    productImages: [],
  };
  // Some SKUs (e.g. the demo Aashirvaad Atta) ship with a fully-populated ONDC
  // record. When present, seed the editor with those values so the page shows
  // what a "complete" SKU looks like.
  const seededOndc: typeof dms = sku.ondcPrefilled
    ? { ...blankOndc, ...sku.ondcPrefilled }
    : blankOndc;
  const [ondc, setOndc] = useState({ ...seededOndc });
  const update = (key: keyof typeof dms, value: any) =>
    setOndc((prev) => ({ ...prev, [key]: value }));
  const isEdited = (key: keyof typeof dms) =>
    JSON.stringify(dms[key]) !== JSON.stringify(ondc[key]);

  // The Manufacturer/Packer Name dropdown stores the company name as text
  // (matching the existing string field). We derive the company-id from the
  // saved name so the Brand dropdown can filter to that company's brands.
  const selectedSellerCompany = sellerCompanies.find(
    (c) => c.name === ondc.manufacturerName,
  );
  const handleCompanyChange = (companyName: string) => {
    update("manufacturerName", companyName);
    // Reset Brand if it no longer belongs to the new company
    const next = sellerCompanies.find((c) => c.name === companyName);
    if (!next || !next.brands.some((b) => b.name === ondc.brandAttribute)) {
      update("brandAttribute", "");
    }
  };

  // Incremental-save error summary — displayed as a non-blocking warning card
  // below the action bar after a save that had validation issues. Save always
  // succeeds; correctly-entered values are stored, fields with issues are listed
  // here so the seller can come back and complete them later.
  const [pendingErrors, setPendingErrors] = useState<ValidationError[]>([]);

  const handleReset = () => {
    setOndc({ ...blankOndc });
    setPendingErrors([]);
    toast.success("ONDC values reset");
  };

  const handleSave = () => {
    // Consumer Care combined into the "name,email,contact_no" format expected by validateSKU
    const ccc =
      ondc.consumerCareContactName || ondc.consumerCareContactEmail || ondc.consumerCareContactPhone
        ? `${ondc.consumerCareContactName},${ondc.consumerCareContactEmail},${ondc.consumerCareContactPhone}`
        : "";

    // Packaged-commodity heuristic — same one the bulk-import uses, so rules stay consistent
    const catLower = (ondc.categoryId || "").toLowerCase();
    const isPackagedCommodity =
      !!(ondc.manufacturerName || ondc.manufacturerAddress) ||
      /atta|flour|biscuit|salt|oil|food|packaged/.test(catLower);

    const errors = validateSKU(
      {
        itemStatus: ondc.itemStatus,
        itemName: ondc.itemName,
        itemCode: ondc.itemCode,
        shortDesc: ondc.shortDesc,
        longDesc: ondc.longDesc,
        additionalImages: ondc.additionalImages,
        unitizedCount: ondc.unitizedCount,
        measureUnit: ondc.measureUnit,
        measureValue: ondc.measureValue,
        availableCount: "99", // inventory lives on Price & Inventory now
        maximumOrderQty: ondc.maximumOrderQty,
        minimumOrderQty: ondc.minimumOrderQty,
        categoryId: ondc.categoryId,
        fulfillmentId: ondc.fulfillmentId,
        locationId: ondc.locationId,
        returnable: ondc.returnable,
        cancellable: ondc.cancellable,
        timeToShip: ondc.timeToShip,
        availableOnCod: ondc.availableOnCod,
        consumerCareContact: ccc,
        manufacturerName: ondc.manufacturerName,
        manufacturerAddress: ondc.manufacturerAddress,
        isPackagedCommodity,
        countryOfOrigin: ondc.countryOfOrigin,
        brandAttribute: ondc.brandAttribute,
      },
      {},
    );

    // Incremental save — always persist the values the seller has entered.
    // Split errors into:
    //   - "invalid" — values the seller TYPED but got wrong (bad format/range).
    //     These are surfaced as errors so the seller fixes them.
    //   - "missing" — required fields not yet entered.
    //     These are silent here (no error shown). They simply count against
    //     ONDC compliance and are shown on the SKU list page until the
    //     seller completes them.
    const invalidErrors = errors.filter(
      (e) => !/is required\.?|Please specify/i.test(e.message),
    );
    setPendingErrors(invalidErrors);
    if (invalidErrors.length > 0) {
      toast.warning(
        `Saved. ${invalidErrors.length} field${invalidErrors.length === 1 ? "" : "s"} ${invalidErrors.length === 1 ? "has" : "have"} invalid values — see the summary below.`,
      );
    } else if (errors.length > 0) {
      toast.success(
        `Saved. ${errors.length} required field${errors.length === 1 ? "" : "s"} still pending for full ONDC compliance.`,
      );
    } else {
      toast.success("Saved — SKU is ONDC compliant.");
    }
  };

  const isActive = ondc.itemStatus === "enable";

  return (
    <div className="space-y-3">
      {/* Sticky action bar — stays visible while the user scrolls so they can
          always hit Save without scrolling back to the top. */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Item Status</span>
          <StatusToggle
            active={isActive}
            onChange={(v) => update("itemStatus", v ? "enable" : "disable")}
          />
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 ml-2">
            DMS: Read-only reference
          </Badge>
          <Badge className="bg-green-50 text-green-700 border-green-200">
            ONDC: Final source for publishing
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            Save ONDC Values
          </Button>
        </div>
      </div>

      {/* Descriptor */}
      <DualSection title="Descriptor (Product Identity)" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <DualRow
          label="Item Name"
          required
          ondcRequired
          help="Display name: brand + variant + pack size (3–100 chars)"
          dms={dms.itemName}
          ondc={<TextInput value={ondc.itemName} onChange={(v) => update("itemName", v)} edited={isEdited("itemName")} required />}
        />
        <DualRow
          label="Item Code"
          required
          ondcRequired
          help="System-generated unique identifier — cannot be edited"
          dms={dms.itemCode}
          ondc={
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-900 font-mono">{ondc.itemCode || "—"}</p>
              <span
                className="inline-flex items-center shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 leading-none"
                title="Item Code is generated at SKU import and cannot be changed"
              >
                Read-only
              </span>
            </div>
          }
        />
        <DualRow
          label="Short Description"
          required
          ondcRequired
          help="10–150 chars, plain text"
          dms={""}
          ondc={<TextInput value={ondc.shortDesc} onChange={(v) => update("shortDesc", v)} edited={isEdited("shortDesc")} required />}
        />
        <DualRow
          label="Long Description"
          required
          ondcRequired
          help="20–1000 chars, plain text"
          dms={""}
          multiline
          ondc={<TextAreaInput value={ondc.longDesc} onChange={(v) => update("longDesc", v)} edited={isEdited("longDesc")} required />}
        />
      </DualSection>

      {/* Quantity */}
      <DualSection title="Quantity (Net Quantity & Inventory)" icon={<Package className="h-5 w-5 text-indigo-600" />}>
        <DualRow
          label="Measure Unit"
          required
          ondcRequired
          dms={""}
          ondc={
            <SelectInput
              value={ondc.measureUnit}
              onChange={(v) => update("measureUnit", v)}
              edited={isEdited("measureUnit")}
              options={["unit", "dozen", "gram", "kilogram", "tonne", "litre", "millilitre"]}
            />
          }
        />
        <DualRow
          label="Unit Value"
          required
          ondcRequired
          help="Up to 3 decimals"
          dms={""}
          ondc={<TextInput value={ondc.measureValue} onChange={(v) => update("measureValue", v)} edited={isEdited("measureValue")} required type="number" />}
        />
        <DualRow
          label="Pack Size (Inner Pack)"
          help="Optional, 1–10,000"
          dms={""}
          ondc={<TextInput value={ondc.unitizedCount} onChange={(v) => update("unitizedCount", v)} edited={isEdited("unitizedCount")} type="number" />}
        />
        <DualRow
          label="UPC (Unit Per Case)"
          help="Number of units in one case"
          dms={""}
          ondc={<TextInput value={ondc.upc} onChange={(v) => update("upc", v)} edited={isEdited("upc")} type="number" />}
        />
        <DualRow
          label="SKU Weight"
          help="Gross weight of the SKU (kg)"
          dms={""}
          ondc={<TextInput value={ondc.skuWeight} onChange={(v) => update("skuWeight", v)} edited={isEdited("skuWeight")} type="number" />}
        />
        <DualRow
          label="Min Order Qty"
          required
          ondcRequired
          dms={""}
          ondc={<TextInput value={ondc.minimumOrderQty} onChange={(v) => update("minimumOrderQty", v)} edited={isEdited("minimumOrderQty")} required type="number" />}
        />
        <DualRow
          label="Max Order Qty"
          required
          ondcRequired
          dms={""}
          ondc={<TextInput value={ondc.maximumOrderQty} onChange={(v) => update("maximumOrderQty", v)} edited={isEdited("maximumOrderQty")} required type="number" />}
        />
      </DualSection>

      {/* Category / Fulfillment / Location */}
      <DualSection title="Category, Fulfillment & Location" icon={<PackageOpen className="h-5 w-5 text-orange-600" />}>
        <DualRow
          label="Category ID"
          required
          ondcRequired
          help="ONDC eB2B taxonomy"
          dms={""}
          ondc={
            <SelectInput
              value={ondc.categoryId}
              onChange={(v) => update("categoryId", v)}
              edited={isEdited("categoryId")}
              options={CATEGORY_OPTIONS}
            />
          }
        />
        <DualRow
          label="Fulfillment ID"
          required
          ondcRequired
          help="e.g., Store Pick Up, Store Delivery"
          dms={""}
          ondc={
            <SelectInput
              value={ondc.fulfillmentId}
              onChange={(v) => update("fulfillmentId", v)}
              edited={isEdited("fulfillmentId")}
              options={["Store Pick Up", "Store Delivery"]}
            />
          }
        />
        <DualRow
          label="Location ID"
          required
          ondcRequired
          help="Warehouse/store"
          dms={""}
          ondc={<TextInput value={ondc.locationId} onChange={(v) => update("locationId", v)} edited={isEdited("locationId")} required />}
        />
      </DualSection>

      {/* ONDC Commerce Attributes */}
      <DualSection title="ONDC Commerce Attributes" icon={<ShieldCheck className="h-5 w-5 text-teal-600" />}>
        <DualRow
          label="Returnable"
          required
          ondcRequired
          dms={""}
          ondc={<BooleanToggle value={ondc.returnable} onChange={(v) => update("returnable", v)} />}
        />
        <DualRow
          label="Cancellable"
          required
          ondcRequired
          dms={""}
          ondc={<BooleanToggle value={ondc.cancellable} onChange={(v) => update("cancellable", v)} />}
        />
        <DualRow
          label="Available on COD"
          required
          ondcRequired
          dms={""}
          ondc={<BooleanToggle value={ondc.availableOnCod} onChange={(v) => update("availableOnCod", v)} />}
        />
        <DualRow
          label="Time to Ship"
          required
          ondcRequired
          help="ISO-8601 duration (e.g. PT4H = 4 hours)"
          dms={""}
          ondc={<TextInput value={ondc.timeToShip} onChange={(v) => update("timeToShip", v)} edited={isEdited("timeToShip")} required />}
        />
        <DualRow
          label="Consumer Care — Name"
          required
          ondcRequired
          dms={""}
          ondc={<TextInput value={ondc.consumerCareContactName} onChange={(v) => update("consumerCareContactName", v)} edited={isEdited("consumerCareContactName")} required />}
        />
        <DualRow
          label="Consumer Care — Email"
          required
          ondcRequired
          dms={""}
          ondc={<TextInput value={ondc.consumerCareContactEmail} onChange={(v) => update("consumerCareContactEmail", v)} edited={isEdited("consumerCareContactEmail")} required />}
        />
        <DualRow
          label="Consumer Care — Phone"
          required
          ondcRequired
          help="10–11 digits, numeric only"
          dms={""}
          ondc={<TextInput value={ondc.consumerCareContactPhone} onChange={(v) => update("consumerCareContactPhone", v)} edited={isEdited("consumerCareContactPhone")} required />}
        />
      </DualSection>

      {/* Company & Brand Information (was: Statutory — Packaged Commodities) */}
      <DualSection
        title="Company & Brand Information"
        icon={<Info className="h-5 w-5 text-rose-600" />}
      >
        <DualRow
          label="Manufacturer / Packer Name (Company Name)"
          required
          ondcRequired
          conditional
          help="Pick a company linked to your account"
          dms={""}
          ondc={
            sellerCompanies.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                No companies are linked to your account. Ask your administrator
                to link companies under Manage Seller → Companies &amp; Brands.
              </p>
            ) : (
              <Select
                value={ondc.manufacturerName || ""}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger
                  className={`h-9 text-sm ${
                    isEdited("manufacturerName")
                      ? "border-blue-400 ring-1 ring-blue-200"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select company…" />
                </SelectTrigger>
                <SelectContent>
                  {sellerCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        />
        <DualRow
          label="Brand"
          required
          ondcRequired
          help="Brands available depend on the selected company"
          dms={""}
          ondc={
            !selectedSellerCompany ? (
              <p className="text-xs text-gray-500">
                Select a company first to choose a brand.
              </p>
            ) : selectedSellerCompany.brands.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                No brands available for this company.
              </p>
            ) : (
              <Select
                value={ondc.brandAttribute || ""}
                onValueChange={(v) => update("brandAttribute", v)}
              >
                <SelectTrigger
                  className={`h-9 text-sm ${
                    isEdited("brandAttribute")
                      ? "border-blue-400 ring-1 ring-blue-200"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select brand…" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSellerCompany.brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        />
        <DualRow
          label="Manufacturer / Packer Address"
          conditional
          help="10–250 chars, must include 6-digit PIN"
          dms={""}
          multiline
          ondc={<TextAreaInput value={ondc.manufacturerAddress} onChange={(v) => update("manufacturerAddress", v)} edited={isEdited("manufacturerAddress")} />}
        />
      </DualSection>

      {/* Tags */}
      <DualSection title="Tags (Discovery & Attribute Enrichment)" icon={<Sparkles className="h-5 w-5 text-pink-600" />}>
        <DualRow
          label="Country of Origin"
          required
          ondcRequired
          help="ISO 3166-1 alpha-3 uppercase (e.g. IND)"
          dms={""}
          ondc={<TextInput value={ondc.countryOfOrigin} onChange={(v) => update("countryOfOrigin", v)} edited={isEdited("countryOfOrigin")} required />}
        />
      </DualSection>

      {/* Product Images — at least 1 mandatory, up to 5 total (1 + 4 more) */}
      <ProductImagesSection
        images={ondc.productImages}
        onChange={(imgs) => update("productImages", imgs)}
      />

      {/* Save-time error popup — shown when the user clicks Save and there are
          invalid values. Valid values have already been saved; this popup
          explains which fields cannot be saved and why. */}
      <Dialog
        open={pendingErrors.length > 0}
        onOpenChange={(o) => !o && setPendingErrors([])}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {pendingErrors.length} field
              {pendingErrors.length === 1 ? "" : "s"} cannot be saved
            </DialogTitle>
            <DialogDescription>
              The values below have errors and were not saved. Other fields that
              were filled in correctly have been saved. Please fix these and
              click <b>Save ONDC Values</b> again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {pendingErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm"
              >
                <span
                  className="font-mono font-semibold text-[10px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  title={`Rule ${err.ruleId}`}
                >
                  {err.code}
                </span>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{err.message}</p>
                  <p className="text-[11px] text-red-600 font-mono mt-0.5">
                    {err.field}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setPendingErrors([])}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Got it — I'll fix these
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offers summary — compact */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-800">Offers & Schemes</span>
          <span className="text-sm text-gray-600">
            {mockOffers[sku.id]?.length
              ? `— ${mockOffers[sku.id].length} offer(s) applied`
              : "— none"}
          </span>
        </div>
        <span className="text-xs text-gray-500">Managed in Offers & Schemes tab</span>
      </div>
    </div>
  );
}

// ---------- Compact form primitives (grid-based, minimal whitespace) ----------

// ---------- DMS / ONDC dual-column primitives ----------

function DualSection({
  title,
  icon,
  children,
  dense,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  /** Tighter vertical paddings — useful for short tabs like Price & Inventory */
  dense?: boolean;
}) {
  return (
    <Card>
      <CardHeader className={`${dense ? "py-1.5 px-3" : "py-2.5 px-4"} border-b border-gray-100`}>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Column headers */}
        <div className="grid grid-cols-[200px_1fr_1fr] bg-gray-50 border-b border-gray-200">
          <div className={`${dense ? "px-3 py-1" : "px-4 py-2"} text-[10px] font-semibold text-gray-600 uppercase tracking-wider`}>
            Field Name
          </div>
          <div className={`${dense ? "px-3 py-1" : "px-4 py-2"} text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200`}>
            DMS Value (Read-only)
          </div>
          <div className={`${dense ? "px-3 py-1" : "px-4 py-2"} text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200`}>
            ONDC Value (Editable)
          </div>
        </div>
        <div className="divide-y divide-gray-100">{children}</div>
      </CardContent>
    </Card>
  );
}

function DualRow({
  label,
  required,
  ondcRequired,
  conditional,
  help,
  dms,
  ondc,
  multiline,
  dense,
}: {
  label: string;
  required?: boolean;
  ondcRequired?: boolean;
  conditional?: boolean;
  help?: string;
  dms: React.ReactNode;
  ondc: React.ReactNode;
  multiline?: boolean;
  /** Tighter vertical paddings — useful for short tabs like Price & Inventory */
  dense?: boolean;
}) {
  const cellPad = dense ? "px-3 py-1.5" : "px-4 py-3";
  return (
    <div className="grid grid-cols-[200px_1fr_1fr] hover:bg-gray-50/40 transition-colors">
      <div className={`${cellPad} flex items-center flex-wrap gap-1`}>
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {conditional && (
          <span
            className="inline-flex items-center shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 leading-none"
            title="Conditional (packaged commodities)"
          >
            Cond.
          </span>
        )}
        {help && !dense && (
          <p className="text-[10px] text-gray-500 leading-tight w-full mt-0.5">{help}</p>
        )}
      </div>
      <div className={`${cellPad} border-l border-gray-100`}>
        {typeof dms === "string" ? (
          <p className={`text-sm text-gray-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>
            {dms || "—"}
          </p>
        ) : (
          dms
        )}
      </div>
      <div className={`${cellPad} border-l border-gray-100`}>{ondc}</div>
    </div>
  );
}

function CompactSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-2.5 px-4 border-b border-gray-100">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function CompactField({
  label,
  required,
  ondcRequired,
  conditional,
  help,
  span2,
  children,
}: {
  label: string;
  required?: boolean;
  ondcRequired?: boolean;
  conditional?: boolean;
  help?: string;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${span2 ? "md:col-span-2" : ""}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {ondcRequired && (
          <span
            className="inline-flex items-center shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 leading-none"
            title="Required for ONDC compliance"
          >
            ONDC
          </span>
        )}
        {conditional && (
          <span
            className="inline-flex items-center shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 leading-none"
            title="Conditional (packaged commodities)"
          >
            Conditional
          </span>
        )}
      </div>
      {children}
      {help && <p className="text-[11px] text-gray-500 leading-tight">{help}</p>}
    </div>
  );
}

function StatusToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
          active
            ? "bg-green-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Active
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
          !active
            ? "bg-gray-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Inactive
      </button>
    </div>
  );
}

function BooleanToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className={`text-xs font-medium ${value ? "text-blue-700" : "text-gray-500"}`}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

// ---------- Product Images section ----------
// At least one image is mandatory; up to 5 images total (1 + 4 more).
// Uses the browser File API to render real previews (URL.createObjectURL).
function ProductImagesSection({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_IMAGES = 5;
  const remaining = MAX_IMAGES - images.length;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // Only image files
    const imgFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imgFiles.length === 0) {
      toast.error("Only image files (PNG / JPG / JPEG / WEBP) are allowed.");
      return;
    }
    const slots = Math.max(0, MAX_IMAGES - images.length);
    if (slots === 0) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    const accepted = imgFiles.slice(0, slots);
    const urls = accepted.map((f) => URL.createObjectURL(f));
    onChange([...images, ...urls]);
    if (imgFiles.length > slots) {
      toast.warning(
        `Only ${slots} more image${slots === 1 ? "" : "s"} could be added (max ${MAX_IMAGES}).`,
      );
    } else {
      toast.success(
        `${accepted.length} image${accepted.length === 1 ? "" : "s"} added.`,
      );
    }
    // Reset input so the same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (idx: number) => {
    const removed = images[idx];
    if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed);
    onChange(images.filter((_, i) => i !== idx));
  };

  const isMissing = images.length === 0;

  return (
    <Card>
      <CardHeader className="py-2.5 px-4 border-b border-gray-100">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-fuchsia-600" />
          Product Images
          <span className="text-red-500 ml-0.5">*</span>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2 text-[10px]">
            {images.length}/{MAX_IMAGES}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="text-xs text-gray-600">
          At least <b>1 image is required</b>. You can add up to <b>{MAX_IMAGES} images</b> in
          total (1 primary + 4 more). PNG, JPG, JPEG, or WEBP.
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={handleSelect}
          className="hidden"
        />

        <div className="flex flex-wrap gap-3">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="relative w-28 h-28 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group"
            >
              <img src={src} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Upload tile — only shown if we still have slots */}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                isMissing
                  ? "border-red-400 hover:border-red-600 text-red-600 hover:text-red-700 bg-red-50"
                  : "border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600"
              }`}
            >
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Upload</span>
              <span className="text-[10px] mt-0.5">
                {remaining} more allowed
              </span>
            </button>
          )}
        </div>

        {isMissing && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <b>At least one product image is required.</b> The first image you upload becomes
              the primary image shown to buyers.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((_img, idx) => (
          <div
            key={idx}
            className="relative w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center group"
          >
            <ImageIcon className="h-6 w-6 text-gray-400" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 p-0.5 rounded bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...images, `img-${images.length + 1}`])}
          className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ImageIcon className="h-5 w-5 mb-1" />
          <span className="text-xs">Upload</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {images.length} image{images.length !== 1 ? "s" : ""} uploaded
      </p>
    </div>
  );
}

// ---------- Editable field primitives ----------

function TextInput({
  value,
  onChange,
  edited,
  required,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  edited?: boolean;
  required?: boolean;
  type?: "text" | "number";
  placeholder?: string;
}) {
  const missing = required && (!value || String(value).trim() === "");
  const borderClass = missing
    ? "border-red-400 focus:ring-red-500"
    : edited
      ? "border-amber-400 focus:ring-amber-500"
      : "border-gray-300 focus:ring-blue-500";
  return (
    <div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2.5 py-1.5 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 ${borderClass}`}
      />
      <FieldStatus edited={edited} missing={missing} />
    </div>
  );
}

function TextAreaInput({
  value,
  onChange,
  edited,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  edited?: boolean;
  required?: boolean;
}) {
  const missing = required && (!value || String(value).trim() === "");
  const borderClass = missing
    ? "border-red-400 focus:ring-red-500"
    : edited
      ? "border-amber-400 focus:ring-amber-500"
      : "border-gray-300 focus:ring-blue-500";
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={`w-full px-2.5 py-1.5 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 ${borderClass}`}
      />
      <FieldStatus edited={edited} missing={missing} />
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  edited,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  edited?: boolean;
}) {
  return (
    <div>
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
      <FieldStatus edited={edited} />
    </div>
  );
}

function FieldStatus({ edited, missing }: { edited?: boolean; missing?: boolean }) {
  if (!edited && !missing) return null;
  return (
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Active"
      ? "bg-green-100 text-green-700 border-green-300"
      : status === "Inactive"
        ? "bg-red-100 text-red-700 border-red-300"
        : "bg-gray-100 text-gray-700 border-gray-300";
  return <Badge className={cls}>{status}</Badge>;
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

// ---------- Price & Inventory Tab ----------
// Previously a separate page; now merged as a tab inside the SKU Detail so pricing + stock
// live with the SKU record. Uses the same edit-form validation (PV-003 / PV-004 / PV-005 /
// PV-011) as the Bizom bulk import.

function PriceInventoryTab({ sku }: { sku: any }) {
  // DMS snapshot — read-only reference from the DMS system.
  // Distributors typically can't enter real-time quantities (they sell offline
  // and on other marketplaces too), so stock is captured as a single toggle:
  // "Stock Available" yes/no. No piece-/case-level counts on this screen.
  const seedUnitsPerCase = String(sku.unitsPerCase ?? sku.ondcPrefilled?.unitizedCount ?? "1");
  const seedHasStock =
    sku.inStock !== undefined
      ? Boolean(sku.inStock)
      : Number(sku.availableStock ?? sku.inventory?.currentStock ?? 0) > 0 ||
        Boolean(sku.isInfiniteStock);

  const dmsPI = {
    mrp: String(sku.mrp ?? sku.pricing?.mrp ?? ""),
    sellingPrice: String(sku.sellingPrice ?? sku.pricing?.sellingPrice ?? ""),
    // Pack Size (Inner Pack) — optional, 1–10,000.
    packSize: String(sku.packSize ?? sku.ondcPrefilled?.unitizedCount ?? ""),
    unitsPerCase: seedUnitsPerCase,
    inStock: seedHasStock,
  };
  // ONDC (editable) — starts populated same as DMS (per business rule).
  // The seller reviews and edits if needed before publishing to ONDC.
  const [ondcPI, setOndcPI] = useState({ ...dmsPI });
  const updatePI = (key: keyof typeof dmsPI, value: any) =>
    setOndcPI((prev) => ({ ...prev, [key]: value }));

  // Incremental save — pending errors list shown as a non-blocking warning card
  const [pendingPIErrors, setPendingPIErrors] = useState<
    { code: string; field: string; message: string }[]
  >([]);

  const handleReset = () => {
    setOndcPI({ ...dmsPI });
    setPendingPIErrors([]);
    toast.success("ONDC price & inventory values reset to DMS");
  };

  const handleSave = () => {
    const errs: { code: string; field: string; message: string }[] = [];
    const mrp = parseFloat(ondcPI.mrp);
    const sp = parseFloat(ondcPI.sellingPrice);
    const upc = parseInt(ondcPI.unitsPerCase, 10);
    const packSize = parseInt(ondcPI.packSize, 10);
    // Pack Size (Inner Pack): optional, but if present must be 1–10,000.
    if (ondcPI.packSize !== "" && (isNaN(packSize) || packSize < 1 || packSize > 10000)) {
      errs.push({ code: "ERR_PI_009", field: "Pack Size (Inner Pack)", message: "Pack Size (Inner Pack) must be a whole number between 1 and 10,000." });
    }
    // UPC (Unit Per Case): required & ≥ 1
    if (ondcPI.unitsPerCase === "" || isNaN(upc)) {
      errs.push({ code: "ERR_PI_010", field: "UPC (Unit Per Case)", message: "UPC (Unit Per Case) is required." });
    } else if (upc < 1) {
      errs.push({ code: "ERR_PI_010", field: "UPC (Unit Per Case)", message: "UPC (Unit Per Case) must be at least 1." });
    }
    // MRP: required, numeric, > 0
    if (ondcPI.mrp === "" || isNaN(mrp)) {
      errs.push({ code: "ERR_PI_003", field: "MRP", message: "MRP is required and must be a valid number." });
    } else if (mrp <= 0) {
      errs.push({ code: "ERR_PI_003", field: "MRP", message: "MRP must be greater than 0." });
    }
    // Selling Price: required, numeric, > 0
    if (ondcPI.sellingPrice === "" || isNaN(sp)) {
      errs.push({ code: "ERR_PI_004", field: "Selling Price", message: "Selling price is required and must be a valid number." });
    } else if (sp < 0) {
      errs.push({ code: "ERR_PI_004", field: "Selling Price", message: "Selling price cannot be negative." });
    } else if (sp === 0) {
      errs.push({ code: "ERR_PI_004", field: "Selling Price", message: "Selling price must be greater than 0." });
    }
    // MRP ≥ SP
    if (!isNaN(mrp) && !isNaN(sp) && mrp > 0 && sp > 0 && mrp < sp) {
      errs.push({ code: "ERR_PI_005", field: "MRP", message: "MRP cannot be less than Selling Price — please enter a valid MRP (≥ Selling Price)." });
    }
    // Stock is now a single toggle (Stock Available). No quantity validation.
    // Incremental save — always persist. Show errors only for incorrectly
    // entered values, not for merely empty fields.
    const invalidErrs = errs.filter(
      (e) => !/is required\.?/i.test(e.message),
    );
    setPendingPIErrors(invalidErrs);
    if (invalidErrs.length > 0) {
      toast.warning(
        `Saved. ${invalidErrs.length} field${invalidErrs.length === 1 ? "" : "s"} ${invalidErrs.length === 1 ? "has" : "have"} invalid values — see the summary below.`,
      );
    } else if (errs.length > 0) {
      toast.success("Saved. Some optional fields still pending.");
    } else {
      toast.success("Price & inventory saved successfully");
    }
  };

  const isEditedPI = (key: keyof typeof dmsPI) =>
    JSON.stringify((dmsPI as any)[key]) !== JSON.stringify((ondcPI as any)[key]);

  return (
    <div className="space-y-3">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">
            Price & Inventory for <b>{sku.sku}</b>
          </span>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 ml-2">
            DMS: Read-only reference
          </Badge>
          <Badge className="bg-green-50 text-green-700 border-green-200">
            ONDC: Final source for publishing
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            Save Price & Stock
          </Button>
        </div>
      </div>

      {/* Inventory — compact, single Stock Available toggle */}
      <DualSection title="Inventory" icon={<Archive className="h-5 w-5 text-emerald-600" />} dense>
        <DualRow
          dense
          label="Pack Size (Inner Pack)"
          dms={dmsPI.packSize}
          ondc={
            <TextInput
              value={ondcPI.packSize}
              onChange={(v) => updatePI("packSize", v)}
              edited={isEditedPI("packSize")}
              type="number"
            />
          }
        />
        <DualRow
          dense
          label="UPC (Unit Per Case)"
          required
          dms={dmsPI.unitsPerCase}
          ondc={
            <TextInput
              value={ondcPI.unitsPerCase}
              onChange={(v) => updatePI("unitsPerCase", v)}
              edited={isEditedPI("unitsPerCase")}
              required
              type="number"
            />
          }
        />
        <DualRow
          dense
          label="Stock Available"
          dms={dmsPI.inStock ? "Yes" : "No"}
          ondc={
            <BooleanToggle
              value={ondcPI.inStock}
              onChange={(v) => updatePI("inStock", v)}
            />
          }
        />
      </DualSection>

      {/* Price — single SKU-level MRP + Selling Price */}
      <DualSection title="Price" icon={<IndianRupee className="h-5 w-5 text-green-600" />} dense>
        <DualRow
          dense
          label="MRP"
          required
          dms={dmsPI.mrp ? `₹${dmsPI.mrp}` : ""}
          ondc={
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">₹</span>
              <div className="pl-4">
                <TextInput
                  value={ondcPI.mrp}
                  onChange={(v) => updatePI("mrp", v)}
                  edited={isEditedPI("mrp")}
                  required
                  type="number"
                />
              </div>
            </div>
          }
        />
        <DualRow
          dense
          label="Selling Price"
          required
          dms={dmsPI.sellingPrice ? `₹${dmsPI.sellingPrice}` : ""}
          ondc={
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">₹</span>
              <div className="pl-4">
                <TextInput
                  value={ondcPI.sellingPrice}
                  onChange={(v) => updatePI("sellingPrice", v)}
                  edited={isEditedPI("sellingPrice")}
                  required
                  type="number"
                />
              </div>
            </div>
          }
        />
      </DualSection>

      {/* Save-time error popup */}
      <Dialog
        open={pendingPIErrors.length > 0}
        onOpenChange={(o) => !o && setPendingPIErrors([])}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {pendingPIErrors.length} field
              {pendingPIErrors.length === 1 ? "" : "s"} cannot be saved
            </DialogTitle>
            <DialogDescription>
              The values below have errors and were not saved. Please fix them
              and click <b>Save Price & Stock</b> again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {pendingPIErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm"
              >
                <span className="font-mono font-semibold text-[10px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  {err.code}
                </span>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{err.message}</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{err.field}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setPendingPIErrors([])}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Got it — I'll fix these
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main SKU Detail Component
export function SKUDetail() {
  const navigate = useNavigate();
  const { skuId } = useParams();
  const [activeTab, setActiveTab] = useState<"details" | "pricing" | "offers">("details");

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
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Header — compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/products/my-sku")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{sku.name}</h1>
              {getStatusBadge(sku.status)}
            </div>
            <p className="text-sm text-gray-600">SKU: {sku.sku}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
            onClick={() => setActiveTab("pricing")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "pricing"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Price & Inventory
            </div>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      {activeTab === "pricing" && <PriceInventoryTab sku={sku} />}
      {activeTab === "offers" && <OffersTab skuId={skuId || "1"} />}
    </div>
  );
}