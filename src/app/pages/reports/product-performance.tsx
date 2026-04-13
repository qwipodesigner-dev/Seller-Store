import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Star, TrendingUp, Download, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const topProducts = [
  { name: "Instant Noodles Pack", sales: 1245, revenue: 186750, growth: "+23%" },
  { name: "Dark Chocolate Bar", sales: 982, revenue: 147300, growth: "+18%" },
  { name: "Premium Coffee Beans", sales: 856, revenue: 128400, growth: "+15%" },
  { name: "Organic Green Tea", sales: 734, revenue: 110100, growth: "+12%" },
  { name: "Whole Wheat Pasta", sales: 689, revenue: 103350, growth: "+8%" },
];

const lowPerformers = [
  { name: "Specialty Sauce 200ml", sales: 23, revenue: 3450 },
  { name: "Gourmet Pickle 250g", sales: 34, revenue: 5100 },
  { name: "Premium Vinegar 500ml", sales: 41, revenue: 6150 },
];

const chartData = topProducts.map((p) => ({ name: p.name.split(" ")[0], sales: p.sales }));

export function ProductPerformanceReport() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Star className="h-8 w-8 text-amber-600" />
            Product Performance Report
          </h1>
          <p className="text-gray-600 mt-1">Top & low performing SKUs</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 font-medium">Top Performer</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Instant Noodles</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">1,245 units sold</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 font-medium">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">1,284</p>
            <span className="text-xs text-gray-600">Active SKUs</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 font-medium">Low Performers</p>
            <p className="text-2xl font-bold text-red-600 mt-1">23</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600 font-medium">Need attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Products by Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar key="product-sales" dataKey="sales" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                      {product.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowPerformers.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                    <Badge variant="destructive" className="mt-1">Low Sales</Badge>
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
