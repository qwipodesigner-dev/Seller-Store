import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  TrendingUp,
  Package2,
  Star,
  Users,
  Tag,
  Truck,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const reportCategories: ReportCategory[] = [
  {
    id: "sales-orders",
    title: "Sales & Orders",
    description: "Orders, revenue, and trends",
    icon: <TrendingUp className="h-8 w-8" />,
    path: "/reports/sales-orders",
    gradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "inventory",
    title: "Inventory Insights",
    description: "Stock levels and movement",
    icon: <Package2 className="h-8 w-8" />,
    path: "/reports/inventory",
    gradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "product-performance",
    title: "Product Performance",
    description: "Top & low performing SKUs",
    icon: <Star className="h-8 w-8" />,
    path: "/reports/product-performance",
    gradient: "from-amber-50 to-amber-100/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "customer-insights",
    title: "Customer Insights",
    description: "Buyer behavior and trends",
    icon: <Users className="h-8 w-8" />,
    path: "/reports/customer-insights",
    gradient: "from-green-50 to-green-100/50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "schemes-offers",
    title: "Scheme & Offers Performance",
    description: "Impact of schemes and discounts",
    icon: <Tag className="h-8 w-8" />,
    path: "/reports/schemes-offers",
    gradient: "from-rose-50 to-rose-100/50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    id: "operations",
    title: "Operations & Delivery",
    description: "Fulfillment and delivery metrics",
    icon: <Truck className="h-8 w-8" />,
    path: "/reports/operations",
    gradient: "from-indigo-50 to-indigo-100/50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
];

export function Reports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("30");
  const [channel, setChannel] = useState("all");

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Reports
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Analyze your business performance
            </p>
          </div>

          {/* Global Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="ondc">ONDC</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCategories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-100"
              onClick={() => handleCategoryClick(category.path)}
            >
              <CardContent className="p-0">
                {/* Gradient Background */}
                <div className={`bg-gradient-to-br ${category.gradient} p-6 pb-8`}>
                  {/* Icon */}
                  <div
                    className={`${category.iconBg} ${category.iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    {category.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed min-h-[40px]">
                    {category.description}
                  </p>
                </div>

                {/* Footer with Arrow */}
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    View Report
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats Section */}
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Need Custom Reports?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Select a report category above to dive into detailed analytics and insights for your business.
                </p>
                <div className="flex gap-3">
                  <button
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => navigate("/support")}
                  >
                    Contact Support →
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Export All Data →
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
