import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Download,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const orderTrends = [
  { date: "Mar 1", orders: 45, revenue: 67500 },
  { date: "Mar 5", orders: 52, revenue: 78000 },
  { date: "Mar 10", orders: 48, revenue: 72000 },
  { date: "Mar 15", orders: 61, revenue: 91500 },
  { date: "Mar 20", orders: 58, revenue: 87000 },
  { date: "Mar 25", orders: 71, revenue: 106500 },
];

const recentOrders = [
  { id: "ORD-1234", customer: "ABC Retailers", amount: 12500, status: "Delivered", channel: "ONDC" },
  { id: "ORD-1235", customer: "XYZ Distributors", amount: 8900, status: "Shipped", channel: "Amazon" },
  { id: "ORD-1236", customer: "Quick Mart", amount: 15200, status: "Processing", channel: "Flipkart" },
  { id: "ORD-1237", customer: "Super Store", amount: 6700, status: "Delivered", channel: "ONDC" },
  { id: "ORD-1238", customer: "Fresh Foods", amount: 9800, status: "Shipped", channel: "Direct" },
];

export function SalesOrdersReport() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/reports")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Sales & Orders Report
          </h1>
          <p className="text-gray-600 mt-1">
            Orders, revenue, and trends analysis
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">335</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12.5%</span>
                </div>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹5.02L</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+18.2%</span>
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹1,498</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+5.1%</span>
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">23</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">-8.3%</span>
                </div>
              </div>
              <ShoppingCart className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Order & Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={orderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                key="orders-trend"
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                key="revenue-trend"
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { channel: "ONDC", orders: 142, revenue: "₹2.13L", growth: "+15%" },
                { channel: "Amazon", orders: 98, revenue: "₹1.47L", growth: "+22%" },
                { channel: "Flipkart", orders: 73, revenue: "₹1.09L", growth: "+8%" },
                { channel: "Direct", orders: 22, revenue: "₹33K", growth: "+45%" },
              ].map((item) => (
                <div
                  key={item.channel}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.channel}</p>
                    <p className="text-sm text-gray-600">{item.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.revenue}</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                      {item.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.id}</p>
                    <p className="text-xs text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ₹{order.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
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
  );
}
