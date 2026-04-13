import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Store,
  ChevronRight,
  Database,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { getSellers, type Seller } from "../../lib/mock-store";
import qwipoLogo from "../../../imports/Qwipo_Secondary_Logo_for_Light_BG@4x-8.png";

export function SellerPicker() {
  const navigate = useNavigate();
  const { user, setActiveSeller } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSellers(getSellers());
  }, []);

  const filtered = sellers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.businessName.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  });

  const handleSelectSeller = (seller: Seller) => {
    setActiveSeller({
      sellerId: seller.id,
      sellerName: seller.name,
      businessName: seller.businessName,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={qwipoLogo}
            alt="Qwipo"
            className="h-10 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Select a seller account to manage
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sellers by name, business, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Seller Cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <Store className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-600 font-medium">No sellers found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "No seller accounts available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((seller) => (
              <Card
                key={seller.id}
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                onClick={() => handleSelectSeller(seller)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Store className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {seller.businessName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {seller.name} • {seller.city}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {seller.connectors.bizom.status === "connected"
                                ? "Bizom"
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {seller.connectors.ondc.status === "connected"
                                ? "ONDC"
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          You can switch sellers anytime from the profile menu.
        </p>
      </div>
    </div>
  );
}
