// =====================================================================
// Customer Detail (Customers 2)
// ---------------------------------------------------------------------
// Mirrors the canonical /customers/:customerId detail layout — header,
// Linked Companies card, and a 2-column main with Basic Information /
// Address Details / Business Information on the left and a sticky
// embedded map on the right. The auto-register demo doesn't have an
// approval queue, so the per-company row carries an inline delivery-day
// Select instead of Approve / Reject buttons. All mutations go through
// the shared store so the list page stays in sync.
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  Navigation,
  Building2,
  AlertCircle,
  ExternalLink,
  Truck,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import {
  DELIVERY_DAY_OPTIONS,
  NEXT_DAY,
  type DeliveryDay,
} from "../lib/customers-data";
import {
  getDemoCustomerById,
  setDemoCompanyDeliveryDay,
  setDemoStatus,
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

  // Block / Unblock confirmation. The action lives on the detail page
  // now (per spec) so the seller acknowledges the consequence in
  // context, with the customer's full record in front of them.
  const [pendingBlockToggle, setPendingBlockToggle] = useState<
    "block" | "unblock" | null
  >(null);

  const handleConfirmBlockToggle = () => {
    if (!customer || !pendingBlockToggle) return;
    if (pendingBlockToggle === "block") {
      setDemoStatus([customer.customerId], "Blocked");
      toast.success(
        `${customer.businessName} has been blocked — no new orders until you unblock.`,
      );
    } else {
      setDemoStatus([customer.customerId], "Active");
      toast.success(
        `${customer.businessName} is active again and can place orders.`,
      );
    }
    setPendingBlockToggle(null);
  };

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
      `Delivery day for ${co?.companyName ?? "company"} set to ${day === NEXT_DAY ? "Next Day Delivery" : day}.`,
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

  // Embedded OpenStreetMap iframe centred on the customer's coords; the
  // overlay link redirects to Google Maps (same pattern as the canonical
  // detail page so seller muscle memory stays consistent).
  const latDelta = 0.01;
  const lonDelta = 0.01;
  const bbox = `${customer.longitude - lonDelta},${customer.latitude - latDelta},${customer.longitude + lonDelta},${customer.latitude + latDelta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${customer.latitude},${customer.longitude}`;
  const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`;

  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Header — store name + owner + phone, plus the Block / Unblock
          action pulled in from the list page so it's reviewed in
          context with the customer's full record. */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/customers-demo")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {customer.businessName}
            </h1>
            {customer.status === "Blocked" ? (
              <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
                <Ban className="h-3 w-3" />
                Blocked
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">
            {customer.customerName} · {customer.mobile}
          </p>
        </div>
        <div className="shrink-0">
          {customer.status === "Active" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setPendingBlockToggle("block")}
            >
              <Ban className="h-4 w-4" />
              Block Customer
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setPendingBlockToggle("unblock")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Unblock Customer
            </Button>
          )}
        </div>
      </div>

      {/* Linked Companies — per-company delivery-day picker. The auto-
          register demo has no approval state, so each row just carries
          a Select bound to the seven delivery-day options. Picking a
          value persists immediately. */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Linked Companies ({customer.companies.length})
            </CardTitle>
            {unassignedCount > 0 && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
                <AlertCircle className="h-2.5 w-2.5" />
                {unassignedCount} need a day
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {customer.companies.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No companies linked to this customer yet.
            </p>
          ) : (
            <div className="space-y-2">
              {customer.companies.map((co) => (
                <div
                  key={co.companyId}
                  className={`flex items-center justify-between gap-3 border rounded-lg p-3 ${
                    co.deliveryDay
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900">
                        {co.companyName}
                      </p>
                      {co.deliveryDay ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-white border-gray-200 text-gray-700"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {co.deliveryDay === NEXT_DAY
                            ? "Next Day Delivery"
                            : co.deliveryDay}
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-amber-500 text-white border-transparent">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Pick a delivery day to commit a beat for this company.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-gray-500" />
                    <Select
                      value={co.deliveryDay ?? ""}
                      onValueChange={(v) =>
                        handleChangeDay(co.companyId, v as DeliveryDay)
                      }
                    >
                      <SelectTrigger className="h-8 w-44 text-sm bg-white">
                        <SelectValue placeholder="Pick a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d === NEXT_DAY ? "Next Day Delivery (NDD)" : d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid — left column (details) + right column (map),
          matching the canonical detail page exactly. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Basic Information */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <p className="text-[11px] text-gray-500">Store Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Owner Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.mobile}
                  </p>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-[11px] text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.email}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-500">Class</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.classType}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {customer.fullAddress && (
                <div>
                  <p className="text-[11px] text-gray-500">Full Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.fullAddress}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-5 gap-x-3 gap-y-2">
                <div>
                  <p className="text-[11px] text-gray-500">City</p>
                  <p className="text-sm text-gray-900">{customer.city}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">State</p>
                  <p className="text-sm text-gray-900">{customer.state}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Pincode</p>
                  <p className="text-sm text-gray-900">{customer.pincode}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Latitude</p>
                  <p className="text-xs font-mono text-gray-900">
                    {customer.latitude}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Longitude</p>
                  <p className="text-xs font-mono text-gray-900">
                    {customer.longitude}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <p className="text-[11px] text-gray-500">Customer ID</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {customer.customerId.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">GSTN Number</p>
                  {customer.gstNumber ? (
                    <p className="text-sm font-mono text-gray-900">
                      {customer.gstNumber}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Not applicable
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-500">
                    Registered On (First Order)
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formattedRegDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Map (sticky, embedded iframe) */}
        <div>
          <Card className="lg:sticky lg:top-4 overflow-hidden">
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-red-600" />
                  Location Map
                </CardTitle>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Click map to open in Google Maps
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full h-[360px] lg:h-[480px]">
                <iframe
                  src={osmEmbedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Customer location map"
                  loading="lazy"
                />
                {/* Transparent overlay — captures clicks and redirects
                    to Google Maps so the seller can navigate. */}
                <a
                  href={openInMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 cursor-pointer group"
                  aria-label="Open in Google Maps"
                >
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 shadow-md opacity-90 group-hover:opacity-100 group-hover:shadow-lg transition-all">
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    Open in Google Maps
                  </span>
                </a>
              </div>
              {/* Compact address + coords strip below the map */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs gap-3">
                <span className="text-gray-700 truncate">
                  <MapPin className="inline h-3.5 w-3.5 text-gray-500 mr-1" />
                  {customer.area}, {customer.city} — {customer.pincode}
                </span>
                <span className="font-mono text-gray-500 shrink-0">
                  {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Block / Unblock confirmation. Both directions get a popup so
          the seller acknowledges the consequence — block stops new
          orders until manually unblocked; unblock lets the customer
          place orders again. */}
      <Dialog
        open={pendingBlockToggle !== null}
        onOpenChange={(o) => !o && setPendingBlockToggle(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingBlockToggle === "block" ? (
                <>
                  <Ban className="h-5 w-5 text-red-600" />
                  Block this customer?
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Unblock this customer?
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {pendingBlockToggle === "block"
                ? `${customer.businessName} won't be able to place new orders until you manually unblock them. Existing orders are not affected.`
                : `${customer.businessName} will be able to place orders again immediately.`}
            </DialogDescription>
          </DialogHeader>
          <div
            className={
              pendingBlockToggle === "block"
                ? "bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900"
                : "bg-emerald-50 border border-emerald-200 rounded-md p-3 text-xs text-emerald-900"
            }
          >
            {pendingBlockToggle === "block" ? (
              <>
                <b>Heads up:</b> there is no auto-unblock — you'll need to
                come back here and reverse this manually.
              </>
            ) : (
              <>
                The customer will see your storefront as available the next
                time they check in.
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingBlockToggle(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBlockToggle}
              className={
                pendingBlockToggle === "block"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {pendingBlockToggle === "block"
                ? "Yes, block customer"
                : "Yes, unblock customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
