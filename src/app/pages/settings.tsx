import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Store,
  ShoppingCart,
  Truck,
  MapPin,
  Wallet,
  ChevronRight,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  iconBg: string;
  iconColor: string;
  comingSoon?: boolean;
}

const settingsCards: SettingCard[] = [
  {
    id: "store",
    title: "Store Settings",
    description: "Manage holidays and store availability",
    icon: <Store className="h-6 w-6" />,
    path: "/settings/store",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "order",
    title: "Order Settings",
    description: "Configure minimum order values and order rules",
    icon: <ShoppingCart className="h-6 w-6" />,
    path: "/settings/order",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "shipping",
    title: "Shipping Settings",
    description: "Set delivery charges and shipping rules",
    icon: <Truck className="h-6 w-6" />,
    path: "/settings/shipping",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    comingSoon: true,
  },
  {
    id: "serviceability",
    title: "Serviceability",
    description: "Configure company-level delivery areas",
    icon: <MapPin className="h-6 w-6" />,
    path: "/settings/serviceability",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "payment",
    title: "Payment Settings",
    description: "Configure payment providers and modes",
    icon: <Wallet className="h-6 w-6" />,
    path: "/settings/payment",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    comingSoon: true,
  },
  {
    id: "communication",
    title: "Communication Settings",
    description: "Configure email and SMS settings",
    icon: <MessageCircle className="h-6 w-6" />,
    path: "/settings/communication",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
];

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar — matches other pages */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-sm text-gray-600">
          Manage your store configurations
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCards.map((card) => (
            <Card
              key={card.id}
              className={`border border-gray-200 transition-all ${
                card.comingSoon
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-md hover:border-gray-300"
              }`}
              onClick={() => !card.comingSoon && navigate(card.path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${card.iconBg} ${card.iconColor} p-2.5 rounded-lg`}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  {card.comingSoon && (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {card.description}
                </p>
                {!card.comingSoon && (
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    Configure
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Card */}
        <Card className="mt-6 border border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Need help configuring?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Check our documentation or contact support for assistance.
                </p>
                <div className="flex gap-4 mt-3">
                  <button
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => navigate("/support")}
                  >
                    Visit Support →
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
