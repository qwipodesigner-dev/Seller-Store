// =====================================================================
// Customer Detail (Customers 2)
// ---------------------------------------------------------------------
// Mirrors the canonical /customers/:customerId detail surface, but for
// the simpler DemoCustomer model used by the empty-mode demo. The
// seller can:
//   • see the customer's profile (name, business, mobile, area, PIN,
//     class type, registration date, total orders, status)
//   • change the delivery day for each linked company independently
//     via a Select per row — same behaviour as the Linked Companies
//     popup on the list page
//
// All mutations go through the shared module store (lib/customers-
// demo-data.ts) so list and detail stay in sync without prop drilling.
// =====================================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  MapPin,
  Building2,
  Calendar,
  ShoppingBag,
  Truck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DELIVERY_DAY_OPTIONS,
  type DeliveryDay,
} from "../lib/customers-data";
import {
  getDemoCustomerById,
  setDemoCompanyDeliveryDay,
  subscribeToDemoCustomers,
  type DemoCustomer,
} from "../lib/customers-demo-data";

export function CustomerDemoDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<DemoCustomer | null>(
    customerId ? getDemoCustomerById(customerId) ?? null : null,
  );

  // Live updates — re-sync whenever the shared store changes so the
  // detail page reflects mutations made elsewhere (or that we make
  // ourselves below).
  useEffect(() => {
    if (!customerId) return;
    return subscribeToDemoCustomers(() => {
      setCustomer(getDemoCustomerById(customerId) ?? null);
    });
  }, [customerId]);

  if (!customer) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 font-medium mb-1">Customer not found</p>
          <p className="text-xs text-gray-500 mb-4">
            This customer may have been removed or never existed in the demo
            dataset.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/customers-demo")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const handleChangeDay = (companyId: string, day: DeliveryDay) => {
    setDemoCompanyDeliveryDay(customer.customerId, companyId, day);
    const co = customer.companies.find((c) => c.companyId === companyId);
    toast.success(
      `Delivery day for ${co?.companyName ?? "company"} set to ${day}.`,
    );
  };

  const formattedRegDate = new Date(
    customer.registeredDate + "T00:00:00",
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const unassignedCount = customer.companies.filter(
    (c) => c.deliveryDay === null,
  ).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/customers-demo")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                <UserIcon className="h-5 w-5 text-blue-600" />
                {customer.customerName}
                {customer.status === "Blocked" ? (
                  <Badge className="bg-red-50 text-red-700 border-red-200">
                    Blocked
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {customer.businessName} · {customer.mobile}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Profile card — read-only summary of the auto-registered data */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <ProfileField icon={<UserIcon className="h-3.5 w-3.5" />} label="Name" value={customer.customerName} />
              <ProfileField icon={<Building2 className="h-3.5 w-3.5" />} label="Business" value={customer.businessName} />
              <ProfileField icon={<Phone className="h-3.5 w-3.5" />} label="Mobile" value={customer.mobile} />
              <ProfileField
                icon={<ShoppingBag className="h-3.5 w-3.5" />}
                label="Class"
                value={customer.classType}
              />
              <ProfileField
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Area"
                value={`${customer.area}, ${customer.pincode}`}
              />
              <ProfileField
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Registered On"
                value={formattedRegDate}
                helper={`${customer.totalOrders} order${customer.totalOrders === 1 ? "" : "s"} placed`}
              />
            </CardContent>
          </Card>

          {/* Linked Companies — per-row delivery day Select. Same control
              the list-page popup uses, just laid out a little wider. */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-purple-600" />
                  Linked Companies
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                    {customer.companies.length}
                  </Badge>
                  {unassignedCount > 0 && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
                      <AlertCircle className="h-2.5 w-2.5" />
                      {unassignedCount} need a day
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-[11px] text-gray-500">
                Pick a delivery day per company. Changes save immediately and
                are reflected on the Customers list.
              </p>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
                {customer.companies.map((co) => (
                  <div
                    key={co.companyId}
                    className="grid grid-cols-1 md:grid-cols-[1fr_220px] items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {co.companyName}
                      </p>
                      {co.deliveryDay === null && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={co.deliveryDay ?? ""}
                      onValueChange={(v) =>
                        handleChangeDay(co.companyId, v as DeliveryDay)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Pick a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

function ProfileField({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="text-sm text-gray-900 truncate">{value}</p>
        {helper && <p className="text-[11px] text-gray-500">{helper}</p>}
      </div>
    </div>
  );
}
