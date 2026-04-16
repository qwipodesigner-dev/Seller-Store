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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configDialogType, setConfigDialogType] = useState<ConnectorType | "">("");
  const [configSellerId, setConfigSellerId] = useState("");
  const [configApiKey, setConfigApiKey] = useState("");
  const [configBrandName, setConfigBrandName] = useState("");
  const [confirmDisconnect, setConfirmDisconnect] = useState<ConnectorType | null>(null);

  // Additional DMS connectors (brand-mapped, beyond the single mock-store slot)
  interface ExtraDmsConnector {
    id: string;
    brandName: string;
    type: ConnectorType;
    sellerId: string;
  }
  const [extraDmsConnectors, setExtraDmsConnectors] = useState<ExtraDmsConnector[]>([
    { id: "bizom-pepsi", brandName: "Pepsi", type: "bizom", sellerId: "BIZ-PP-002" },
    { id: "bizom-marico", brandName: "Marico", type: "bizom", sellerId: "BIZ-MR-003" },
  ]);

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

  const openConnectorConfig = (type: ConnectorType) => {
    setConfigDialogType(type);
    setConfigSellerId("");
    setConfigApiKey("");
    setConfigBrandName("");
    setConfigDialogOpen(true);
    setAddConnectorOpen(false);
  };

  // Managing an already-connected connector opens the full connector details page.
  const openConnectorDetailPage = (type: ConnectorType) => {
    navigate(`/admin/users/${seller.id}/connectors/${type}`);
  };

  const saveConnectorConfig = () => {
    if (!configSellerId.trim()) { toast.error("Seller ID is required"); return; }
    if (!configApiKey.trim()) { toast.error("API Key is required"); return; }
    const type = configDialogType as ConnectorType;

    // For Bizom DMS — require brand name
    if (type === "bizom") {
      if (!configBrandName.trim()) { toast.error("Brand / Company Name is required"); return; }
      // Check if brand already exists
      const brandExists = extraDmsConnectors.some(c => c.brandName.toLowerCase() === configBrandName.trim().toLowerCase());
      if (brandExists) { toast.error(`A Bizom connector for "${configBrandName.trim()}" already exists`); return; }

      // If first bizom not connected, use the store slot
      if (!bizomConnected) {
        const config = { baseUrl: "", authToken: configApiKey, apiCreateSku: "", apiGetAllSkus: "", apiUpdateSku: "", apiCreateOrder: "", apiGetOrderDetails: "", apiGetAllCustomers: "" };
        const updated = updateSellerBizomConfig(seller.id, config);
        if (updated) {
          toast.success(`Bizom – ${configBrandName.trim()} connector added`);
          setSeller(updated);
          // Store brand name for the primary bizom connector
          setExtraDmsConnectors(prev => [{ id: `bizom-primary-brand`, brandName: configBrandName.trim(), type: "bizom", sellerId: configSellerId }, ...prev.filter(c => c.id !== "bizom-primary-brand")]);
          setConfigDialogOpen(false);
        } else {
          toast.error("Failed to save connector");
        }
      } else {
        // Add as extra DMS connector
        setExtraDmsConnectors(prev => [...prev, {
          id: `bizom-${configBrandName.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          brandName: configBrandName.trim(),
          type: "bizom",
          sellerId: configSellerId,
        }]);
        toast.success(`Bizom – ${configBrandName.trim()} connector added`);
        setConfigDialogOpen(false);
      }
    } else {
      // ONDC
      const updated = updateSellerOndcConfig(seller.id, {
        subscriberId: configSellerId, uniqueKeyId: "", privateKey: "", apiEndpoint: "", webhookUrl: "",
        dataSyncTypes: [], syncFrequencyMinutes: 15, maxRetries: 3, autoRetry: true, autoSyncEnabled: true,
      });
      if (updated) {
        toast.success("ONDC connector added");
        setSeller(updated);
        setConfigDialogOpen(false);
      } else {
        toast.error("Failed to save connector");
      }
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
                  value="connectors"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Connectors
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
                {/* Active/Inactive Toggle */}
                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <p className="text-xs text-gray-500">
                        Toggle to activate or deactivate this seller
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700">
                        Active
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* KYC — hidden */}
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

              {!bizomConnected && !ondcConnected && extraDmsConnectors.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Plug className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">
                    No connectors added
                  </p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Click "Add Connector" to link Bizom (DMS) or ONDC
                    (Marketplace). You can add multiple DMS connectors — one per brand.
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
                  {/* Primary Bizom connector from store */}
                  {bizomConnected && (
                    <ConnectorCard
                      icon={<Database className="h-5 w-5" />}
                      iconBg="bg-blue-100 text-blue-600"
                      name={`Bizom${extraDmsConnectors.find(c => c.id === "bizom-primary-brand")?.brandName ? ` – ${extraDmsConnectors.find(c => c.id === "bizom-primary-brand")?.brandName}` : " – Freedom Oil"}`}
                      subtitle="DMS Connector"
                      description="Distributor management system — SKU, customer and order sync."
                      badge={connectorBadge(seller.connectors.bizom)}
                      onManage={() => openConnectorDetailPage("bizom")}
                      onRemove={() => setConfirmDisconnect("bizom")}
                    />
                  )}
                  {/* Extra DMS connectors (brand-mapped) */}
                  {extraDmsConnectors.filter(c => c.id !== "bizom-primary-brand").map((c) => (
                    <ConnectorCard
                      key={c.id}
                      icon={<Database className="h-5 w-5" />}
                      iconBg="bg-blue-100 text-blue-600"
                      name={`Bizom – ${c.brandName}`}
                      subtitle="DMS Connector"
                      description="Distributor management system — SKU, customer and order sync."
                      badge={<Badge className="bg-green-100 text-green-700 border-green-300 gap-1"><CheckCircle2 className="h-3 w-3" />Connected</Badge>}
                      onManage={() => openConnectorDetailPage("bizom")}
                      onRemove={() => {
                        setExtraDmsConnectors(prev => prev.filter(ec => ec.id !== c.id));
                        toast.success(`Bizom – ${c.brandName} disconnected`);
                      }}
                    />
                  ))}
                  {/* ONDC */}
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
              onClick={() => openConnectorConfig("bizom")}
              className="p-4 rounded-lg border text-left transition-all border-gray-200 hover:border-blue-400 hover:shadow-sm"
            >
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                <Database className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-900">Bizom</p>
              <div className="flex gap-1 my-1">
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  DMS
                </Badge>
                <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                  Multi-brand
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Add one connector per brand. Sync SKUs, customers and orders.
              </p>
            </button>

            <button
              type="button"
              disabled={ondcConnected}
              onClick={() => openConnectorConfig("ondc")}
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

      {/* Connector Config Dialog — Seller ID + API Key only */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configDialogType === "bizom" ? (
                <Database className="h-5 w-5 text-blue-600" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              )}
              {configDialogType === "bizom" ? "Connect Bizom" : "Connect ONDC"}
            </DialogTitle>
            <DialogDescription>
              Enter the Seller ID and API Key to connect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {configDialogType === "bizom" && (
              <div className="space-y-2">
                <Label>
                  Brand / Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Freedom Oil, Pepsi, Marico"
                  value={configBrandName}
                  onChange={(e) => setConfigBrandName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  The brand or company this connector is mapped to
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>
                Seller ID <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter seller ID"
                value={configSellerId}
                onChange={(e) => setConfigSellerId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter API key"
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveConnectorConfig}
            >
              Connect
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
