import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  User as UserIcon,
  FileText,
  Plug,
  ShieldCheck,
  Building2,
  Database,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSellerById,
  updateSellerPermissions,
  updateSellerBizomConfig,
  updateSellerOndcConfig,
  disconnectSellerConnector,
  updateManagedCompanies,
  getQwipoCompanies,
  emptyBizomConfig,
  emptyOndcConfig,
  type Seller,
  type SellerPermissions,
  type BizomConfig,
  type OndcConfig,
  type ConnectorType,
} from "../../lib/mock-store";

const emptyPermissions: SellerPermissions = {
  view: false,
  write: false,
  edit: false,
  update: false,
};

const DATA_SYNC_TYPES = ["SKU", "Orders", "Customers", "Inventory", "Pricing"];

export function AdminSellerDetail() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Permissions state
  const [permissions, setPermissions] = useState<SellerPermissions>(emptyPermissions);
  const [permissionsDirty, setPermissionsDirty] = useState(false);

  // Connectors state — dialogs
  const [addConnectorOpen, setAddConnectorOpen] = useState(false);
  const [bizomDialogOpen, setBizomDialogOpen] = useState(false);
  const [ondcDialogOpen, setOndcDialogOpen] = useState(false);
  const [bizomForm, setBizomForm] = useState<BizomConfig>(emptyBizomConfig());
  const [ondcForm, setOndcForm] = useState<OndcConfig>(emptyOndcConfig());
  const [confirmDisconnect, setConfirmDisconnect] = useState<ConnectorType | null>(null);

  // Managed Companies dialog
  const [addCompaniesOpen, setAddCompaniesOpen] = useState(false);
  const [companiesSelection, setCompaniesSelection] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sellerId) return;
    const s = getSellerById(sellerId);
    setSeller(s || null);
    if (s) {
      setPermissions(s.permissions);
      setPermissionsDirty(false);
    }
  }, [sellerId]);

  if (!seller) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Seller not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sellers
          </Button>
        </div>
      </div>
    );
  }

  // ---- Helpers ----

  const togglePermission = (key: keyof SellerPermissions) => {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
    setPermissionsDirty(true);
  };

  const savePermissions = () => {
    const updated = updateSellerPermissions(seller.id, permissions);
    if (updated) {
      toast.success(`Permissions updated for ${seller.name}`);
      setSeller(updated);
      setPermissionsDirty(false);
    } else {
      toast.error("Failed to update permissions");
    }
  };

  const openBizomConfig = () => {
    setBizomForm(seller.connectors.bizom.config ?? emptyBizomConfig());
    setBizomDialogOpen(true);
    setAddConnectorOpen(false);
  };

  const openOndcConfig = () => {
    setOndcForm(seller.connectors.ondc.config ?? emptyOndcConfig());
    setOndcDialogOpen(true);
    setAddConnectorOpen(false);
  };

  // Managing an already-connected connector opens the full connector details
  // page — the same screen the seller uses at /connectors/:connectorId.
  const openConnectorDetailPage = (type: ConnectorType) => {
    navigate(`/admin/users/${seller.id}/connectors/${type}`);
  };

  const saveBizomConfig = () => {
    if (!bizomForm.baseUrl.trim()) {
      toast.error("Base URL is required");
      return;
    }
    const updated = updateSellerBizomConfig(seller.id, bizomForm);
    if (updated) {
      toast.success("Bizom connector saved");
      setSeller(updated);
      setBizomDialogOpen(false);
    } else {
      toast.error("Failed to save Bizom connector");
    }
  };

  const saveOndcConfig = () => {
    if (!ondcForm.subscriberId.trim() || !ondcForm.apiEndpoint.trim()) {
      toast.error("Subscriber ID and API Endpoint are required");
      return;
    }
    const updated = updateSellerOndcConfig(seller.id, ondcForm);
    if (updated) {
      toast.success("ONDC connector saved");
      setSeller(updated);
      setOndcDialogOpen(false);
    } else {
      toast.error("Failed to save ONDC connector");
    }
  };

  const handleDisconnect = () => {
    if (!confirmDisconnect) return;
    const updated = disconnectSellerConnector(seller.id, confirmDisconnect);
    if (updated) {
      toast.success(
        `${confirmDisconnect === "bizom" ? "Bizom" : "ONDC"} disconnected`,
      );
      setSeller(updated);
    }
    setConfirmDisconnect(null);
  };

  const toggleSyncType = (type: string) => {
    setOndcForm((f) => ({
      ...f,
      dataSyncTypes: f.dataSyncTypes.includes(type)
        ? f.dataSyncTypes.filter((t) => t !== type)
        : [...f.dataSyncTypes, type],
    }));
  };

  const openAddCompanies = () => {
    setCompaniesSelection(new Set(seller.managedCompanies));
    setAddCompaniesOpen(true);
  };

  const saveManagedCompanies = () => {
    const updated = updateManagedCompanies(
      seller.id,
      Array.from(companiesSelection),
    );
    if (updated) {
      toast.success("Managed companies updated");
      setSeller(updated);
      setAddCompaniesOpen(false);
    } else {
      toast.error("Failed to update companies");
    }
  };

  const removeCompany = (companyId: string) => {
    const next = seller.managedCompanies.filter((id) => id !== companyId);
    const updated = updateManagedCompanies(seller.id, next);
    if (updated) {
      toast.success("Company removed");
      setSeller(updated);
    }
  };

  // ---- Badges ----

  const kycBadge = () => {
    if (seller.kyc.status === "verified") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          Verified
        </Badge>
      );
    }
    if (seller.kyc.status === "submitted") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          Submitted
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
        Not Started
      </Badge>
    );
  };

  const connectorBadge = (state: { status: "connected" | "not_connected" }) =>
    state.status === "connected" ? (
      <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Connected
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600">
        Not Connected
      </Badge>
    );

  const permissionItems: {
    key: keyof SellerPermissions;
    label: string;
    description: string;
  }[] = [
    { key: "view", label: "View", description: "Read-only access to data on assigned modules" },
    { key: "write", label: "Write", description: "Create new records (e.g., add SKUs, add customers)" },
    { key: "edit", label: "Edit", description: "Modify existing records on assigned modules" },
    { key: "update", label: "Update", description: "Push updates to downstream connectors (e.g., sync price)" },
  ];

  const qwipoCompanies = getQwipoCompanies();
  const linkedCompanies = qwipoCompanies.filter((c) =>
    seller.managedCompanies.includes(c.id),
  );

  const bizomConnected = seller.connectors.bizom.status === "connected";
  const ondcConnected = seller.connectors.ondc.status === "connected";

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {seller.name}
              </h2>
              <p className="text-sm text-gray-500">
                {seller.businessName} • {seller.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {kycBadge()}
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              Active Seller
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 p-3">
              <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-wrap">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="kyc"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  KYC
                </TabsTrigger>
                <TabsTrigger
                  value="connectors"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Connectors
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Managed Companies
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile */}
            <TabsContent value="profile" className="p-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <Field label="Full Name" value={seller.name} />
                <Field label="Email" value={seller.email} />
                <Field label="Phone" value={seller.phone} />
                <Field label="City" value={seller.city} />
                <Field label="Business Name" value={seller.businessName} />
                <Field
                  label="Approved On"
                  value={
                    seller.approvedAt
                      ? new Date(seller.approvedAt).toLocaleDateString()
                      : "—"
                  }
                />
              </div>
            </TabsContent>

            {/* KYC */}
            <TabsContent value="kyc" className="p-6 mt-0">
              {seller.kyc.status === "not_started" ? (
                <div className="text-center py-10">
                  <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">KYC not started</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seller has not submitted KYC information yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                  <Field label="PAN" value={seller.kyc.pan || "—"} />
                  <Field label="Aadhaar" value={seller.kyc.aadhaar || "—"} />
                  <Field label="GSTIN" value={seller.kyc.gstin || "—"} />
                  <Field
                    label="Bank Account"
                    value={seller.kyc.bankAcct || "—"}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Business Address"
                      value={seller.kyc.businessAddress || "—"}
                    />
                  </div>
                  <Field
                    label="Submitted On"
                    value={
                      seller.kyc.updatedAt
                        ? new Date(seller.kyc.updatedAt).toLocaleDateString()
                        : "—"
                    }
                  />
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div className="mt-1">{kycBadge()}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Connectors */}
            <TabsContent value="connectors" className="p-6 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Connectors
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage this seller's integrations with external systems
                  </p>
                </div>
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setAddConnectorOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Connector
                </Button>
              </div>

              {!bizomConnected && !ondcConnected ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Plug className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">
                    No connectors added
                  </p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Click "Add Connector" to link Bizom (DMS) or ONDC
                    (Marketplace).
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setAddConnectorOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Connector
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bizomConnected && (
                    <ConnectorCard
                      icon={<Database className="h-5 w-5" />}
                      iconBg="bg-blue-100 text-blue-600"
                      name="Bizom"
                      subtitle="DMS Connector"
                      description="Distributor management system — SKU, customer and order sync."
                      badge={connectorBadge(seller.connectors.bizom)}
                      onManage={() => openConnectorDetailPage("bizom")}
                      onRemove={() => setConfirmDisconnect("bizom")}
                    />
                  )}
                  {ondcConnected && (
                    <ConnectorCard
                      icon={<ShoppingBag className="h-5 w-5" />}
                      iconBg="bg-orange-100 text-orange-600"
                      name="ONDC"
                      subtitle="Marketplace"
                      description="Open Network for Digital Commerce — buyer-side order routing."
                      badge={connectorBadge(seller.connectors.ondc)}
                      onManage={() => openConnectorDetailPage("ondc")}
                      onRemove={() => setConfirmDisconnect("ondc")}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            {/* Permissions */}
            <TabsContent value="permissions" className="p-6 mt-0">
              <div className="max-w-2xl space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Grant per-seller access levels. Changes take effect
                  immediately on save.
                </p>
                {permissionItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={permissions[item.key]}
                      onCheckedChange={() => togglePermission(item.key)}
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    disabled={!permissionsDirty}
                    onClick={() => {
                      setPermissions(seller.permissions);
                      setPermissionsDirty(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!permissionsDirty}
                    onClick={savePermissions}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Managed Companies */}
            <TabsContent value="companies" className="p-6 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Managed Companies
                  </h3>
                  <p className="text-sm text-gray-500">
                    Qwipo catalog companies this distributor is linked to. The
                    seller will only see products from these companies when
                    adding SKUs.
                  </p>
                </div>
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={openAddCompanies}
                >
                  <Plus className="h-4 w-4" />
                  Add Companies
                </Button>
              </div>

              {linkedCompanies.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Building2 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">
                    No companies linked
                  </p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Link Qwipo catalog companies to grant this seller access to
                    their products.
                  </p>
                  <Button
                    variant="outline"
                    onClick={openAddCompanies}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Companies
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {linkedCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg flex-shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {c.category}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => removeCompany(c.id)}
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* -------- Dialogs -------- */}

      {/* Add Connector (chooser) */}
      <Dialog open={addConnectorOpen} onOpenChange={setAddConnectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Connector</DialogTitle>
            <DialogDescription>
              Choose the type of connector you want to add for this seller.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            <button
              type="button"
              disabled={bizomConnected}
              onClick={openBizomConfig}
              className={`p-4 rounded-lg border text-left transition-all ${
                bizomConnected
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : "border-gray-200 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <Database className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-900">Bizom</p>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs my-1">
                DMS
              </Badge>
              <p className="text-xs text-gray-600 mt-1">
                Distributor management system. Sync SKUs, customers and orders.
              </p>
              {bizomConnected && (
                <p className="text-xs text-green-600 font-medium mt-2">
                  Already added
                </p>
              )}
            </button>

            <button
              type="button"
              disabled={ondcConnected}
              onClick={openOndcConfig}
              className={`p-4 rounded-lg border text-left transition-all ${
                ondcConnected
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : "border-gray-200 hover:border-orange-400 hover:shadow-sm"
              }`}
            >
              <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-900">ONDC</p>
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs my-1">
                Marketplace
              </Badge>
              <p className="text-xs text-gray-600 mt-1">
                Open Network for Digital Commerce. Buyer-side order routing.
              </p>
              {ondcConnected && (
                <p className="text-xs text-green-600 font-medium mt-2">
                  Already added
                </p>
              )}
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddConnectorOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bizom Config Dialog */}
      <Dialog open={bizomDialogOpen} onOpenChange={setBizomDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Bizom (DMS) Configuration
            </DialogTitle>
            <DialogDescription>
              Enter the Bizom connection details and API endpoints. These let
              Qwipo talk to the distributor's DMS software.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bz-base">
                  Base URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bz-base"
                  placeholder="https://api.bizom.com/v1"
                  value={bizomForm.baseUrl}
                  onChange={(e) =>
                    setBizomForm({ ...bizomForm, baseUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bz-auth">Auth Token / API Key</Label>
                <Input
                  id="bz-auth"
                  type="password"
                  placeholder="••••••••••••"
                  value={bizomForm.authToken}
                  onChange={(e) =>
                    setBizomForm({ ...bizomForm, authToken: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                API Endpoints
              </p>
              <div className="grid grid-cols-1 gap-3">
                <ApiField
                  label="Create SKU"
                  value={bizomForm.apiCreateSku}
                  placeholder="/products/create"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiCreateSku: v })
                  }
                />
                <ApiField
                  label="Get All SKU Details"
                  value={bizomForm.apiGetAllSkus}
                  placeholder="/products/list"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiGetAllSkus: v })
                  }
                />
                <ApiField
                  label="Update SKU Details"
                  value={bizomForm.apiUpdateSku}
                  placeholder="/products/update/{id}"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiUpdateSku: v })
                  }
                />
                <ApiField
                  label="Create Order"
                  value={bizomForm.apiCreateOrder}
                  placeholder="/orders/create"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiCreateOrder: v })
                  }
                />
                <ApiField
                  label="View Order Details"
                  value={bizomForm.apiGetOrderDetails}
                  placeholder="/orders/{id}"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiGetOrderDetails: v })
                  }
                />
                <ApiField
                  label="Get All Customer Details"
                  value={bizomForm.apiGetAllCustomers}
                  placeholder="/customers/list"
                  onChange={(v) =>
                    setBizomForm({ ...bizomForm, apiGetAllCustomers: v })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBizomDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveBizomConfig}
            >
              Save Connector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ONDC Config Dialog */}
      <Dialog open={ondcDialogOpen} onOpenChange={setOndcDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              ONDC (Marketplace) Configuration
            </DialogTitle>
            <DialogDescription>
              Enter the ONDC credentials and sync settings for this seller.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ondc-sub">
                  Subscriber ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ondc-sub"
                  placeholder="seller.ondc.org"
                  value={ondcForm.subscriberId}
                  onChange={(e) =>
                    setOndcForm({ ...ondcForm, subscriberId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ondc-key">Unique Key ID</Label>
                <Input
                  id="ondc-key"
                  placeholder="KEY-001"
                  value={ondcForm.uniqueKeyId}
                  onChange={(e) =>
                    setOndcForm({ ...ondcForm, uniqueKeyId: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="ondc-private">Encrypted Private Key</Label>
                <Input
                  id="ondc-private"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={ondcForm.privateKey}
                  onChange={(e) =>
                    setOndcForm({ ...ondcForm, privateKey: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ondc-api">
                  API Endpoint <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ondc-api"
                  placeholder="https://ondc-gw.qwipo.com/api/v1"
                  value={ondcForm.apiEndpoint}
                  onChange={(e) =>
                    setOndcForm({ ...ondcForm, apiEndpoint: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ondc-webhook">Webhook URL</Label>
                <Input
                  id="ondc-webhook"
                  placeholder="https://ondc-gw.qwipo.com/webhook"
                  value={ondcForm.webhookUrl}
                  onChange={(e) =>
                    setOndcForm({ ...ondcForm, webhookUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Data Sync Types
              </p>
              <div className="flex flex-wrap gap-3">
                {DATA_SYNC_TYPES.map((t) => {
                  const checked = ondcForm.dataSyncTypes.includes(t);
                  return (
                    <label
                      key={t}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        checked
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleSyncType(t)}
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Sync Configuration
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ondc-freq">
                    Sync Frequency (minutes)
                  </Label>
                  <Input
                    id="ondc-freq"
                    type="number"
                    min={1}
                    value={ondcForm.syncFrequencyMinutes}
                    onChange={(e) =>
                      setOndcForm({
                        ...ondcForm,
                        syncFrequencyMinutes: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ondc-retries">Max Retry Attempts</Label>
                  <Input
                    id="ondc-retries"
                    type="number"
                    min={0}
                    max={10}
                    value={ondcForm.maxRetries}
                    onChange={(e) =>
                      setOndcForm({
                        ...ondcForm,
                        maxRetries: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Auto Retry on Failure
                    </p>
                    <p className="text-xs text-gray-500">
                      Automatically retry failed syncs up to max attempts
                    </p>
                  </div>
                  <Switch
                    checked={ondcForm.autoRetry}
                    onCheckedChange={(v) =>
                      setOndcForm({ ...ondcForm, autoRetry: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Enable Auto Sync
                    </p>
                    <p className="text-xs text-gray-500">
                      Run sync automatically at the configured frequency
                    </p>
                  </div>
                  <Switch
                    checked={ondcForm.autoSyncEnabled}
                    onCheckedChange={(v) =>
                      setOndcForm({ ...ondcForm, autoSyncEnabled: v })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOndcDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveOndcConfig}
            >
              Save Connector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect confirm */}
      <Dialog
        open={confirmDisconnect !== null}
        onOpenChange={(o) => !o && setConfirmDisconnect(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Connector?</DialogTitle>
            <DialogDescription>
              This will disconnect{" "}
              <b>{confirmDisconnect === "bizom" ? "Bizom" : "ONDC"}</b> for{" "}
              {seller.name}. You can re-add it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDisconnect(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Managed Companies */}
      <Dialog open={addCompaniesOpen} onOpenChange={setAddCompaniesOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link Companies from Qwipo Catalog</DialogTitle>
            <DialogDescription>
              Select the companies this distributor can sell products from.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {qwipoCompanies.map((c) => {
              const checked = companiesSelection.has(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        const next = new Set(companiesSelection);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        setCompaniesSelection(next);
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500">{c.category}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCompaniesOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveManagedCompanies}
            >
              Save ({companiesSelection.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Small helpers ----------

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <p className="mt-1 text-sm text-gray-900 font-medium">{value}</p>
    </div>
  );
}

function ApiField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
      <Label className="text-xs text-gray-600 md:text-right">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="md:col-span-2 font-mono text-xs"
      />
    </div>
  );
}

function ConnectorCard({
  icon,
  iconBg,
  name,
  subtitle,
  description,
  badge,
  onManage,
  onRemove,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  subtitle: string;
  description: string;
  badge: React.ReactNode;
  onManage: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
            <div>
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          {badge}
        </div>
        <p className="text-xs text-gray-600 mb-4">{description}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 flex-1"
            onClick={onManage}
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            Manage
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
