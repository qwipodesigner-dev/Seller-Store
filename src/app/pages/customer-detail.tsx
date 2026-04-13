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
  const [customer] = useState<CustomerDetail>(mockCustomerData);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOtherReason, setRejectOtherReason] = useState("");

  const handleApprove = () => {
    toast.success("Customer approved successfully!");
    setApproveDialogOpen(false);
    setTimeout(() => navigate("/customers"), 1500);
  };

  const handleReject = () => {
    const reason = rejectReason === "Other" ? rejectOtherReason : rejectReason;
    if (!reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    toast.success("Customer rejected");
    setRejectDialogOpen(false);
    setTimeout(() => navigate("/customers"), 1500);
  };

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

  // Generate Google Maps URL
  const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${customer.latitude},${customer.longitude}&zoom=15`;
  const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/customers")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {customer.storeName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge()}
              <Badge variant="outline" className="flex items-center gap-1.5">
                {customer.approvalType === "Auto" ? (
                  <Zap className="h-3.5 w-3.5 text-purple-600" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                )}
                {customer.approvalType} Approval
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {customer.source}
              </Badge>
            </div>
          </div>
        </div>

        {/* Retry Sync for failed records */}
        {customer.syncStatus === "Failed" && (
          <Button onClick={handleRetrySync} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Sync
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Customer Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Store Name</p>
                  <p className="font-medium text-gray-900">{customer.storeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                  <p className="font-medium text-gray-900">{customer.ownerName}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="font-medium text-gray-900">{customer.phone}</p>
                  </div>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 text-sm">{customer.email}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="font-medium text-gray-900">{customer.category || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Address</p>
                <p className="font-medium text-gray-900">{customer.address}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="font-medium text-gray-900">{customer.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="font-medium text-gray-900">{customer.state}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pincode</p>
                  <p className="font-medium text-gray-900">{customer.pincode}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Latitude</p>
                  <p className="font-mono text-sm text-gray-900">{customer.latitude}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Longitude</p>
                  <p className="font-mono text-sm text-gray-900">{customer.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {customer.customerId && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Customer ID</p>
                      <p className="font-medium text-gray-900">{customer.customerId}</p>
                    </div>
                  </div>
                )}
                {customer.gstNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">GST Number</p>
                    <p className="font-mono text-sm text-gray-900">{customer.gstNumber}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Source</p>
                  <Badge variant="outline">{customer.source}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sync Status</p>
                  {getSyncBadge()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration & Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Registration & Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Registered On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(customer.registrationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {customer.approvedDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Approved On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(customer.approvedDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{customer.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {customer.lastOrderDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Map View */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-red-600" />
                  Location Map
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-blue-600 hover:text-blue-700"
                >
                  <a href={openInMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Maps
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map Container */}
                <div className="relative w-full h-[400px] lg:h-[600px] rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  {/* Static Map Display with Fallback */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                    <div className="text-center p-6">
                      <MapPin className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        Customer Location
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {customer.address}
                        <br />
                        {customer.city}, {customer.state} - {customer.pincode}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                        <div className="text-xs text-gray-500">
                          <span className="font-mono">
                            {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-6">
                        💡 Click "Open in Maps" to view interactive map
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Info Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Serviceability Check
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        This location can help you validate if the customer is within your
                        serviceable area and make informed approval decisions.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Location Verified
                        </span>
                        <span>•</span>
                        <span>Coordinates Available</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                {customer.status === "Pending Approval" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setRejectDialogOpen(true)}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => setApproveDialogOpen(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve Customer
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve <strong>{customer.storeName}</strong>? The customer
              will be able to place orders immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Customer
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting <strong>{customer.storeName}</strong>.
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
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason || (rejectReason === "Other" && !rejectOtherReason)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
