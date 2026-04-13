import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Tag, Download } from "lucide-react";

export function SchemesOffersReport() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tag className="h-8 w-8 text-rose-600" />
            Scheme & Offers Performance
          </h1>
          <p className="text-gray-600 mt-1">Impact of schemes and discounts</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Schemes", value: "12", color: "blue" },
          { label: "Total Discount Given", value: "₹2.4L", color: "red" },
          { label: "Orders with Offers", value: "234", color: "green" },
          { label: "Avg Discount %", value: "8.5%", color: "purple" },
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
          <h3 className="font-semibold text-lg mb-4">Active Schemes Performance</h3>
          <div className="space-y-3">
            {[
              { name: "Buy 2 Get 1 Free - Beverages", usage: 145, discount: "₹45K", status: "Active" },
              { name: "Flat 15% Off on Grains", usage: 89, discount: "₹28K", status: "Active" },
              { name: "Festival Mega Sale", usage: 234, discount: "₹87K", status: "Active" },
              { name: "Bulk Purchase 10% Off", usage: 56, discount: "₹34K", status: "Active" },
            ].map((scheme) => (
              <div key={scheme.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-gray-900">{scheme.name}</p>
                  <p className="text-sm text-gray-600">{scheme.usage} times used</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{scheme.discount}</p>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                    {scheme.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
