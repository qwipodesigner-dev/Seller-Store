import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  Flame,
  TrendingDown,
  Rocket,
  ChevronRight,
  Tag,
  Users,
  Clock,
} from "lucide-react";

const topProducts = [
  { name: "Premium Coffee Beans 500g", orders: 245, revenue: 183750 },
  { name: "Instant Noodles Pack", orders: 198, revenue: 118800 },
  { name: "Organic Green Tea Box", orders: 176, revenue: 132000 },
  { name: "Dark Chocolate Bar 100g", orders: 134, revenue: 100500 },
  { name: "Whole Wheat Pasta 1kg", orders: 123, revenue: 92250 },
];

const recentOrders = [
  {
    id: "ORD-1234",
    customer: "ABC Retailers",
    amount: 12500,
    status: "Processing",
    marketplace: "ONDC",
  },
  {
    id: "ORD-1235",
    customer: "XYZ Distributors",
    amount: 8900,
    status: "Shipped",
    marketplace: "Amazon",
  },
  {
    id: "ORD-1236",
    customer: "Quick Mart",
    amount: 6700,
    status: "Delivered",
    marketplace: "Flipkart",
  },
  {
    id: "ORD-1237",
    customer: "Super Store",
    amount: 15200,
    status: "Processing",
    marketplace: "ONDC",
  },
  {
    id: "ORD-1238",
    customer: "Fresh Foods",
    amount: 9800,
    status: "Shipped",
    marketplace: "Direct",
  },
];

// Phase 1 placeholder — the full Dashboard (KPIs, charts, recent orders, etc.) is
// not part of the Phase 1 scope. We surface a clean "Coming Soon" screen and
// route the seller to the modules that ARE shipping in this phase.
export function Dashboard() {
  const navigate = useNavigate();

  const phase1Modules = [
    { label: "My SKU", description: "Manage your catalog and ONDC details", href: "/products/my-sku", icon: Package },
    { label: "Orders", description: "View and manage incoming orders", href: "/orders", icon: ShoppingCart },
    { label: "Customers", description: "Customer list, filters and exports", href: "/customers", icon: Users },
    { label: "Offers & Schemes", description: "Quantity Pricing Schemes (QPS)", href: "/offers", icon: Tag },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-xl mb-5">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 mb-3">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Dashboard is on the way
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Sales KPIs, smart insights, recent-orders feed and other dashboard
            visualisations are <b>not part of Phase 1</b>. They will be released in a
            later phase. In the meantime, jump straight into the modules below.
          </p>
        </div>

        <Card className="border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              Available now in Phase 1
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phase1Modules.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => navigate(m.href)}
                    className="group flex items-center gap-3 text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-600 truncate">{m.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          Have feedback or need a metric urgently?{" "}
          <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

// ---- Legacy Phase-1 dashboard implementation (kept for the future re-launch) ----
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _LegacyDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("30");
  const [channel, setChannel] = useState("all");

  const metrics = [
    {
      label: "Total Orders",
      value: "1,847",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-500",
    },
    {
      label: "Total Revenue",
      value: "₹28.4L",
      change: "+18.2%",
      trend: "up",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      borderColor: "border-l-green-500",
    },
    {
      label: "Avg Order Value",
      value: "₹1,538",
      change: "+5.1%",
      trend: "up",
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-l-purple-500",
    },
    {
      label: "Active SKUs",
      value: "1,284",
      change: "+8.3%",
      trend: "up",
      icon: Package,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-l-indigo-500",
    },
    {
      label: "Low Stock SKUs",
      value: "47",
      change: "-3.2%",
      trend: "down",
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-l-amber-500",
    },
    {
      label: "Orders in Progress",
      value: "156",
      change: "+23.4%",
      trend: "up",
      icon: Loader,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      borderColor: "border-l-orange-500",
    },
    {
      label: "Completed Orders",
      value: "1,634",
      change: "+15.7%",
      trend: "up",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-l-emerald-500",
    },
    {
      label: "Cancelled Orders",
      value: "57",
      change: "-8.9%",
      trend: "down",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      borderColor: "border-l-red-500",
    },
  ];

  const insights = [
    {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      borderColor: "border-amber-200",
      message: "12 SKUs are low on stock",
      detail: "Immediate restocking required",
      action: "View Inventory",
      link: "/inventory",
    },
    {
      icon: Flame,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      borderColor: "border-orange-200",
      message: "Top product: Premium Coffee Beans",
      detail: "245 orders • ₹1.84L revenue",
      action: "View Report",
      link: "/reports/product-performance",
    },
    {
      icon: TrendingDown,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      borderColor: "border-red-200",
      message: "Orders dropped by 8% vs last week",
      detail: "Consider running promotions",
      action: "View Analytics",
      link: "/reports/sales-orders",
    },
    {
      icon: Rocket,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      borderColor: "border-green-200",
      message: "3 products driving 60% revenue",
      detail: "Focus on high performers",
      action: "View Details",
      link: "/reports/product-performance",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-36">
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

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Metrics - 8 Cards in 2 Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className={`border-l-4 ${metric.borderColor} hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-600" />
                        )}
                        <span
                          className={`text-xs font-semibold ${
                            metric.trend === "up"
                              ? "text-green-600"
                              : "text-green-600"
                          }`}
                        >
                          {metric.change}
                        </span>
                        <span className="text-xs text-gray-500">
                          vs last period
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${metric.iconBg} ${metric.iconColor} p-3 rounded-xl`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Smart Insights Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              💡 Smart Insights
            </h2>
            <span className="text-sm text-gray-500">
              Real-time business intelligence
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <Card
                  key={idx}
                  className={`border-2 ${insight.borderColor} hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => navigate(insight.link)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`${insight.iconBg} ${insight.iconColor} p-3 rounded-xl flex-shrink-0`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base mb-1">
                          {insight.message}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {insight.detail}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent"
                        >
                          {insight.action}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Top Products & Recent Orders */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Top Products
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/reports/product-performance")}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {product.orders} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">
                      ₹{(product.revenue / 1000).toFixed(1)}K
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Orders
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/orders")}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.id}
                      </p>
                      <p className="text-xs text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        ₹{order.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Shipped"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}