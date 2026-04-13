import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Package2,
  AlertTriangle,
  TrendingUp,
  Download,
  XCircle,
} from "lucide-react";

const stockMovement = [
  { product: "Premium Coffee Beans 500g", inbound: 150, outbound: 120, current: 245 },
  { product: "Organic Green Tea Box", inbound: 80, outbound: 65, current: 130 },
  { product: "Whole Wheat Pasta 1kg", inbound: 200, outbound: 180, current: 220 },
  { product: "Extra Virgin Olive Oil", inbound: 60, outbound: 55, current: 75 },
  { product: "Organic Honey 250g", inbound: 40, outbound: 58, current: 18 },
];

export function InventoryInsightsReport() {
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
            <Package2 className="h-8 w-8 text-purple-600" />
            Inventory Insights Report
          </h1>
          <p className="text-gray-600 mt-1">
            Stock levels and movement analysis
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
                <p className="text-sm text-gray-600 font-medium">Total SKUs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">1,284</p>
              </div>
              <Package2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">47</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-1">12</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Stock Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹45.2L</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Inbound
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Outbound
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Current Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockMovement.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.product}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-600 font-semibold">+{item.inbound}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-red-600 font-semibold">-{item.outbound}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-gray-900">{item.current}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.current < 50 ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          In Stock
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Beverages", count: 342, value: "₹12.5L" },
                { category: "Food & Grains", count: 278, value: "₹15.2L" },
                { category: "Cooking Oils", count: 156, value: "₹8.7L" },
                { category: "Ready to Eat", count: 198, value: "₹5.4L" },
                { category: "Confectionery", count: 310, value: "₹3.4L" },
              ].map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{cat.category}</p>
                    <p className="text-sm text-gray-600">{cat.count} SKUs</p>
                  </div>
                  <p className="font-bold text-gray-900">{cat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { product: "Organic Honey 250g", stock: 18, threshold: 25 },
                { product: "Basmati Rice 5kg", stock: 8, threshold: 50 },
                { product: "Peanut Butter 500g", stock: 12, threshold: 30 },
                { product: "Coconut Oil 1L", stock: 15, threshold: 40 },
              ].map((alert) => (
                <div
                  key={alert.product}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{alert.product}</p>
                    <p className="text-xs text-gray-600">
                      Threshold: {alert.threshold} units
                    </p>
                  </div>
                  <Badge variant="destructive">{alert.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
