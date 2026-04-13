import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Truck, Download } from "lucide-react";

export function OperationsDeliveryReport() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-indigo-600" />
            Operations & Delivery Report
          </h1>
          <p className="text-gray-600 mt-1">Fulfillment and delivery metrics</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "On-Time Delivery", value: "94.2%", color: "green" },
          { label: "Avg Delivery Time", value: "2.3 days", color: "blue" },
          { label: "Pending Shipments", value: "23", color: "amber" },
          { label: "Return Rate", value: "2.1%", color: "red" },
        ].map((stat) => (
          <Card key={stat.label} className={`border-l-4 border-l-${stat.color}-500`}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Delivery Performance by Zone</h3>
            <div className="space-y-3">
              {[
                { zone: "Zone A - Local", orders: 142, onTime: "96%", avgTime: "1.2 days" },
                { zone: "Zone B - Regional", orders: 98, onTime: "94%", avgTime: "2.1 days" },
                { zone: "Zone C - State-wide", orders: 73, onTime: "91%", avgTime: "3.5 days" },
              ].map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-900">{zone.zone}</p>
                    <p className="text-sm text-gray-600">{zone.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{zone.onTime}</p>
                    <p className="text-xs text-gray-600">{zone.avgTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Courier Partner Performance</h3>
            <div className="space-y-3">
              {[
                { partner: "Delhivery", orders: 145, rating: "4.5", onTime: "95%" },
                { partner: "DTDC", orders: 98, rating: "4.2", onTime: "92%" },
                { partner: "Shiprocket", orders: 67, rating: "4.7", onTime: "97%" },
              ].map((partner) => (
                <div key={partner.partner} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-900">{partner.partner}</p>
                    <p className="text-sm text-gray-600">{partner.orders} deliveries</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {partner.onTime}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">⭐ {partner.rating}</p>
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
