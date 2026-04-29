import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Store,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Shield,
  Navigation,
  Building2,
  Hash,
  Zap,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  findCustomer,
  customers as allCustomers,
  DELIVERY_DAY_OPTIONS,
  type CompanyApproval,
  type DeliveryDay,
} from "../lib/customers-data";

interface CustomerDetail {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  customerId?: string; // DMS/Brand ID like HUL ID
  gstNumber?: string;
  source: "ONDC" | "Network" | "Manual";
  syncStatus: "Synced" | "Pending" | "Failed";
  approvalType: "Auto" | "Manual";
  status: "Pending Approval" | "Active" | "Rejected" | "Suspended";
  registrationDate: string;
  approvedDate?: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalRevenue: number;
  category?: string;
  notes?: string;
}

// Mock customer data - in real app, this would come from API
const mockCustomerData: CustomerDetail = {
  id: "CUST-001",
  storeName: "Ramesh Kirana Store",
  ownerName: "Ramesh Kumar",
  phone: "+91 98765 43210",
  email: "ramesh.kumar@example.com",
  address: "Shop No. 45, MG Road, Near City Mall",
  city: "Bangalore",
  state: "Karnataka",
  pincode: "560001",
  latitude: 12.9716,
  longitude: 77.5946,
  customerId: "HUL-BLR-00234",
  gstNumber: "29ABCDE1234F1Z5",
  source: "ONDC",
  syncStatus: "Synced",
  approvalType: "Manual",
  status: "Pending Approval",
  registrationDate: "2026-03-27",
  totalOrders: 0,
  totalRevenue: 0,
  category: "Retail Kirana",
  notes: "Premium location with high footfall. Requested priority approval.",
};

export function CustomerDetail() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  // Map the shared customer record (or fall back to the first record) to the UI model.
  const [customer] = useState<CustomerDetail>(() => {
    const source = (customerId && findCustomer(customerId)) || allCustomers[0];
    return {
      id: source.id,
      storeName: source.businessName,
      ownerName: source.customerName,
      phone: source.mobile,
      email: source.email,
      address: source.fullAddress,
      city: source.city,
      state: source.state,
      pincode: source.pincode,
      latitude: source.latitude,
      longitude: source.longitude,
      customerId: source.id,
      gstNumber: source.gstNumber,
      source: "Network",
      syncStatus: "Synced",
      approvalType: "Auto",
      status: "Active",
      registrationDate: source.registeredDate,
      totalOrders: source.totalOrders,
      totalRevenue: source.totalRevenue,
      category: source.classType,
    };
  });
  // Per-company approvals — mutable so the seller can act without round-tripping.
  const [companyApprovals, setCompanyApprovals] = useState<CompanyApproval[]>(() => {
    const source = (customerId && findCustomer(customerId)) || allCustomers[0];
    return (source.companyApprovals ?? []).map((a) => ({ ...a }));
  });
  // Approve / Reject per-company dialogs
  const [approveCompanyId, setApproveCompanyId] = useState<string | null>(null);
  const [approveDeliveryDay, setApproveDeliveryDay] = useState<DeliveryDay | "">("");
  const [rejectCompanyId, setRejectCompanyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOtherReason, setRejectOtherReason] = useState("");

  const todayIso = () => new Date().toISOString().slice(0, 10);

  // ----- Per-company Approve flow -----
  const openApproveCompany = (companyId: string) => {
    setApproveCompanyId(companyId);
    setApproveDeliveryDay("");
  };
  const closeApproveCompany = () => {
    setApproveCompanyId(null);
    setApproveDeliveryDay("");
  };
  const handleApproveCompany = () => {
    if (!approveCompanyId) return;
    if (!approveDeliveryDay) {
      toast.error("Please select a delivery day before approving.");
      return;
    }
    setCompanyApprovals((prev) =>
      prev.map((a) =>
        a.companyId === approveCompanyId
          ? {
              ...a,
              status: "approved",
              deliveryDay: approveDeliveryDay,
              decidedAt: todayIso(),
              rejectionReason: undefined,
            }
          : a,
      ),
    );
    const co = companyApprovals.find((a) => a.companyId === approveCompanyId);
    toast.success(
      `Approved for ${co?.companyName ?? "company"} · delivery ${approveDeliveryDay}`,
    );
    closeApproveCompany();
  };

  // ----- Per-company Reject flow -----
  const openRejectCompany = (companyId: string) => {
    setRejectCompanyId(companyId);
    setRejectReason("");
    setRejectOtherReason("");
  };
  const closeRejectCompany = () => {
    setRejectCompanyId(null);
    setRejectReason("");
    setRejectOtherReason("");
  };
  const handleRejectCompany = () => {
    if (!rejectCompanyId) return;
    const reason = rejectReason === "Other" ? rejectOtherReason : rejectReason;
    if (!reason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setCompanyApprovals((prev) =>
      prev.map((a) =>
        a.companyId === rejectCompanyId
          ? {
              ...a,
              status: "rejected",
              deliveryDay: undefined,
              decidedAt: todayIso(),
              rejectionReason: reason,
            }
          : a,
      ),
    );
    const co = companyApprovals.find((a) => a.companyId === rejectCompanyId);
    toast.error(`Rejected for ${co?.companyName ?? "company"} · ${reason}`);
    closeRejectCompany();
  };

  const approveCompany = companyApprovals.find((a) => a.companyId === approveCompanyId);
  const rejectCompany = companyApprovals.find((a) => a.companyId === rejectCompanyId);

  const handleRetrySync = () => {
    toast.info("Retrying customer sync...");
    setTimeout(() => {
      toast.success("Customer synced successfully!");
    }, 2000);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      "Pending Approval": { color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
      Active: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      Rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
      Suspended: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: AlertCircle },
    };

    const config = statusConfig[customer.status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border px-3 py-1 flex items-center gap-1.5 w-fit`}>
        <Icon className="h-3.5 w-3.5" />
        {customer.status}
      </Badge>
    );
  };

  const getSyncBadge = () => {
    const syncConfig = {
      Synced: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
      Pending: { color: "bg-amber-100 text-amber-700 border-amber-300", icon: Clock },
      Failed: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
    };

    const config = syncConfig[customer.syncStatus];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border px-2.5 py-0.5 flex items-center gap-1.5 w-fit text-xs`}>
        <Icon className="h-3 w-3" />
        {customer.syncStatus}
      </Badge>
    );
  };

  // Google Maps deep-link — opened when the user clicks the embedded map
  const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`;
  // Compact OpenStreetMap embed (no API key) centred on the customer's coordinates
  const latDelta = 0.01;
  const lonDelta = 0.01;
  const bbox = `${customer.longitude - lonDelta},${customer.latitude - latDelta},${customer.longitude + lonDelta},${customer.latitude + latDelta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${customer.latitude},${customer.longitude}`;

  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Header — title only, no status/approval/source badges */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/customers")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{customer.storeName}</h1>
          <p className="text-sm text-gray-600">
            {customer.ownerName} · {customer.phone}
          </p>
        </div>
      </div>

      {/* Linked Companies — per-company approvals + delivery-day assignment.
          A single customer (unique by mobile) can register against multiple
          companies; each must be approved/rejected independently. */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b border-gray-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Linked Companies ({companyApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {companyApprovals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No companies linked to this customer yet.
            </p>
          ) : (
            <div className="space-y-2">
              {companyApprovals.map((a) => {
                const colorMap = {
                  approved: "bg-green-50 border-green-200",
                  rejected: "bg-red-50 border-red-200",
                  pending: "bg-amber-50 border-amber-200",
                } as const;
                const labelColor = {
                  approved: "bg-green-600",
                  rejected: "bg-red-600",
                  pending: "bg-amber-500",
                } as const;
                const labelMap = {
                  approved: "Approved",
                  rejected: "Rejected",
                  pending: "Pending Approval",
                } as const;
                return (
                  <div
                    key={a.companyId}
                    className={`flex items-center justify-between gap-3 border rounded-lg p-3 ${colorMap[a.status]}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900">{a.companyName}</p>
                        <Badge
                          className={`text-[10px] text-white border-transparent ${labelColor[a.status]}`}
                        >
                          {labelMap[a.status]}
                        </Badge>
                        {a.status === "approved" && a.deliveryDay && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-white border-gray-200 text-gray-700"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {a.deliveryDay}
                          </Badge>
                        )}
                      </div>
                      {a.status === "rejected" && a.rejectionReason && (
                        <p className="text-[11px] text-gray-700 mt-0.5">
                          Reason: {a.rejectionReason}
                        </p>
                      )}
                      {a.decidedAt && a.status !== "pending" && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Acted on {a.decidedAt}
                        </p>
                      )}
                    </div>
                    {a.status === "pending" ? (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => openRejectCompany(a.companyId)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 hover:bg-green-700"
                          onClick={() => openApproveCompany(a.companyId)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-gray-600"
                        onClick={() => {
                          // Allow flipping the decision back to pending → re-action.
                          setCompanyApprovals((prev) =>
                            prev.map((x) =>
                              x.companyId === a.companyId
                                ? {
                                    ...x,
                                    status: "pending",
                                    deliveryDay: undefined,
                                    decidedAt: undefined,
                                    rejectionReason: undefined,
                                  }
                                : x,
                            ),
                          );
                          toast.info(`Re-opened decision for ${a.companyName}`);
                        }}
                        title="Re-open decision"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid — left column (details) + right column (map) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Basic Information — tight grid */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <p className="text-[11px] text-gray-500">Store Name</p>
                  <p className="text-sm font-medium text-gray-900">{customer.storeName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Owner Name</p>
                  <p className="text-sm font-medium text-gray-900">{customer.ownerName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-[11px] text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">{customer.category || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Details — condensed */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div>
                <p className="text-[11px] text-gray-500">Full Address</p>
                <p className="text-sm font-medium text-gray-900">{customer.address}</p>
              </div>
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
                  <p className="text-xs font-mono text-gray-900">{customer.latitude}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Longitude</p>
                  <p className="text-xs font-mono text-gray-900">{customer.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information — Customer ID + GST (if applicable) + Registered On */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {customer.customerId && (
                  <div>
                    <p className="text-[11px] text-gray-500">Customer ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{customer.customerId}</p>
                  </div>
                )}
                {customer.gstNumber ? (
                  <div>
                    <p className="text-[11px] text-gray-500">GSTN Number</p>
                    <p className="text-sm font-mono text-gray-900">{customer.gstNumber}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-gray-500">GSTN Number</p>
                    <p className="text-sm text-gray-400 italic">Not applicable</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-500">Registered On (First Order)</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(customer.registrationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes — only if present */}
          {customer.notes && (
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-gray-100">
                <CardTitle className="text-sm">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — Map (sticky, embedded iframe, click to open Google Maps) */}
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
              {/* Embedded OSM map — click anywhere on the overlay to redirect to Google Maps */}
              <div className="relative w-full h-[360px] lg:h-[480px]">
                <iframe
                  src={osmEmbedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Customer location map"
                  loading="lazy"
                />
                {/* Transparent overlay — captures clicks and redirects to Google Maps */}
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
                  {customer.city}, {customer.state} — {customer.pincode}
                </span>
                <span className="font-mono text-gray-500 shrink-0">
                  {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve dialog — per company. Forces the seller to assign a
          delivery day (Mon-Sun OR Next Day / NDD) before approval. */}
      <Dialog open={!!approveCompanyId} onOpenChange={(o) => !o && closeApproveCompany()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve for {approveCompany?.companyName}
            </DialogTitle>
            <DialogDescription>
              Approve <strong>{customer.storeName}</strong> for{" "}
              <strong>{approveCompany?.companyName}</strong> and pin a delivery day for
              the customer's beat. Required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-xs">
              Delivery Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={approveDeliveryDay}
              onValueChange={(v) => setApproveDeliveryDay(v as DeliveryDay)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a delivery day…" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "Next Day" ? "Next Day Delivery (NDD)" : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">
              Either pin a fixed weekday (Mon–Sun) or commit to next-day delivery.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApproveCompany}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveCompany}
              className="bg-green-600 hover:bg-green-700"
              disabled={!approveDeliveryDay}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog — per company */}
      <Dialog open={!!rejectCompanyId} onOpenChange={(o) => !o && closeRejectCompany()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject for {rejectCompany?.companyName}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting <strong>{customer.storeName}</strong>{" "}
              against <strong>{rejectCompany?.companyName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={rejectReason} onValueChange={setRejectReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Outside Service Area" id="reason1" />
                <Label htmlFor="reason1">Outside Service Area</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Incomplete Information" id="reason2" />
                <Label htmlFor="reason2">Incomplete Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Invalid Documents" id="reason3" />
                <Label htmlFor="reason3">Invalid Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Duplicate Registration" id="reason4" />
                <Label htmlFor="reason4">Duplicate Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="reason5" />
                <Label htmlFor="reason5">Other</Label>
              </div>
            </RadioGroup>

            {rejectReason === "Other" && (
              <Textarea
                placeholder="Please specify the reason..."
                value={rejectOtherReason}
                onChange={(e) => setRejectOtherReason(e.target.value)}
                rows={3}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectCompany}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectCompany}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason || (rejectReason === "Other" && !rejectOtherReason)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
