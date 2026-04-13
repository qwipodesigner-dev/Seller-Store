import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Users, Download } from "lucide-react";

export function CustomerInsightsReport() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            Customer Insights Report
          </h1>
          <p className="text-gray-600 mt-1">Buyer behavior and trends</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "248", color: "blue" },
          { label: "Active This Month", value: "156", color: "green" },
          { label: "New Customers", value: "34", color: "purple" },
          { label: "Repeat Rate", value: "68%", color: "amber" },
        ].map((stat) => (
          <Card key={stat.label} className={`border-l-4 border-l-${stat.color}-500`}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top Customers</h3>
          <div className="space-y-3">
            {[
              { name: "ABC Retailers", orders: 45, spent: "₹1.2L" },
              { name: "XYZ Distributors", orders: 38, spent: "₹98K" },
              { name: "Quick Mart", orders: 32, spent: "₹87K" },
              { name: "Super Store", orders: 28, spent: "₹76K" },
              { name: "Fresh Foods", orders: 24, spent: "₹65K" },
            ].map((customer) => (
              <div key={customer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{customer.spent}</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
