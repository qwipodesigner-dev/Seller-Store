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
  Users,
  MessageCircle,
} from "lucide-react";

interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  comingSoon?: boolean;
}

const settingsCards: SettingCard[] = [
  {
    id: "store",
    title: "Store Settings",
    description: "Manage holidays and store availability",
    icon: <Store className="h-8 w-8" />,
    path: "/settings/store",
    gradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "order",
    title: "Order Settings",
    description: "Configure minimum order values and order rules",
    icon: <ShoppingCart className="h-8 w-8" />,
    path: "/settings/order",
    gradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "shipping",
    title: "Shipping Settings",
    description: "Set delivery charges and shipping rules",
    icon: <Truck className="h-8 w-8" />,
    path: "/settings/shipping",
    gradient: "from-amber-50 to-amber-100/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    comingSoon: true,
  },
  {
    id: "serviceability",
    title: "Serviceability",
    description: "Configure company-level delivery areas",
    icon: <MapPin className="h-8 w-8" />,
    path: "/settings/serviceability",
    gradient: "from-green-50 to-green-100/50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "payment",
    title: "Payment Settings",
    description: "Configure payment providers and modes",
    icon: <Wallet className="h-8 w-8" />,
    path: "/settings/payment",
    gradient: "from-rose-50 to-rose-100/50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    comingSoon: true,
  },
  // Customer Settings hidden for Phase 1 (can be revisited later)
  {
    id: "communication",
    title: "Communication Settings",
    description: "Configure email and SMS settings",
    icon: <MessageCircle className="h-8 w-8" />,
    path: "/settings/communication",
    gradient: "from-cyan-50 to-cyan-100/50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
];

export function Settings() {
  const navigate = useNavigate();

  const handleCardClick = (path: string, comingSoon?: boolean) => {
    // Don't navigate if coming soon
    if (comingSoon) return;
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-sm text-gray-600">
          Manage your store configurations
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Settings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCards.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  className={`group overflow-hidden border-2 border-gray-200 transition-all duration-300 ${
                    card.comingSoon
                      ? "opacity-60 blur-[2px] cursor-not-allowed"
                      : "cursor-pointer hover:border-gray-300 hover:shadow-xl hover:scale-105 active:scale-100"
                  }`}
                  onClick={() => handleCardClick(card.path, card.comingSoon)}
                >
                  <CardContent className="p-0">
                    {/* Gradient Background */}
                    <div className={`bg-gradient-to-br ${card.gradient} p-6 pb-8`}>
                      {/* Icon */}
                      <div
                        className={`${card.iconBg} ${card.iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
                          !card.comingSoon && "group-hover:scale-110"
                        } transition-transform duration-300`}
                      >
                        {card.icon}
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-2 ${
                          !card.comingSoon && "group-hover:text-gray-700"
                        } transition-colors`}
                      >
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed min-h-[40px]">
                        {card.description}
                      </p>
                    </div>

                    {/* Footer with Arrow */}
                    <div
                      className={`bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between ${
                        !card.comingSoon && "group-hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <span
                        className={`text-sm font-medium text-gray-700 ${
                          !card.comingSoon && "group-hover:text-gray-900"
                        }`}
                      >
                        Configure
                      </span>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 ${
                          !card.comingSoon &&
                          "group-hover:text-gray-700 group-hover:translate-x-1"
                        } transition-all duration-300`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Coming Soon Badge */}
                {card.comingSoon && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-base font-semibold shadow-2xl border-2 border-white">
                      🚀 Coming Soon
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Help Section */}
        <div className="max-w-7xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Need Help Configuring?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Check our documentation or contact support for assistance with
                    settings configuration.
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      onClick={() => navigate("/support")}
                    >
                      Visit Support →
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      View Docs →
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}