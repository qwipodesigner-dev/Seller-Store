import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Plus,
  Search,
  Calendar,
  Edit,
  Pause,
  Trash2,
  Tag,
  Gift,
  Package,
  Percent,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { OffersFilterDrawer } from "../../components/OffersFilterDrawer";

interface Offer {
  id: string;
  name: string;
  type: "BOGO" | "Value Slab" | "QPS" | "Combo Bundle" | "Off-Invoice";
  scope: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
  discount: string;
}

const mockOffers: Offer[] = [
  {
    id: "1",
    name: "Summer BOGO Sale",
    type: "BOGO",
    scope: "Beverages Category",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "Active",
    discount: "Buy 2 Get 1 Free",
  },
  {
    id: "2",
    name: "Bulk Order Discount",
    type: "Value Slab",
    scope: "All Products",
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    status: "Active",
    discount: "Up to 15% off",
  },
  {
    id: "3",
    name: "Festival Special",
    type: "Combo Bundle",
    scope: "Selected Brands",
    startDate: "2026-04-01",
    endDate: "2026-04-10",
    status: "Scheduled",
    discount: "Bundle at 20% off",
  },
  {
    id: "4",
    name: "Quantity Discount Tier",
    type: "QPS",
    scope: "Food & Grocery",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    status: "Expired",
    discount: "Tiered pricing",
  },
  {
    id: "5",
    name: "Invoice Discount Q1",
    type: "Off-Invoice",
    scope: "Premium Customers",
    startDate: "2026-03-10",
    endDate: "2026-06-30",
    status: "Active",
    discount: "5% flat discount",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "BOGO":
      return <Gift className="h-4 w-4" />;
    case "Combo Bundle":
      return <Package className="h-4 w-4" />;
    case "Value Slab":
    case "QPS":
      return <Tag className="h-4 w-4" />;
    case "Off-Invoice":
      return <Percent className="h-4 w-4" />;
    default:
      return <Tag className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Expired":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function OffersList() {
  const [offers] = useState<Offer[]>(mockOffers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    const matchesType = typeFilter === "all" || offer.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const clearAllFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    toast.success("All filters cleared");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            View active promotions and discount schemes for your products
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {(statusFilter !== "all" || typeFilter !== "all") && (
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
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Offers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {offer.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="gap-1.5 font-medium text-xs"
                  >
                    {getTypeIcon(offer.type)}
                    {offer.type}
                  </Badge>
                  <Badge
                    className={`${getStatusColor(
                      offer.status
                    )} border font-medium text-xs`}
                  >
                    {offer.status}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <p className="text-gray-500 text-xs mb-1">Applicable to</p>
                  <p className="text-gray-900">{offer.scope}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 text-xs mb-1">Validity</p>
                  <p className="text-gray-900">
                    {new Date(offer.startDate).toLocaleDateString()} -{" "}
                    {new Date(offer.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 text-xs mb-1">Discount</p>
                  <p className="text-gray-900 font-medium">{offer.discount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No offers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see available offers
            </p>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <OffersFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onClearFilters={clearAllFilters}
      />
    </div>
  );
}