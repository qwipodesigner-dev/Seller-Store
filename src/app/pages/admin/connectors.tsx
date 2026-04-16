import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Database,
  ShoppingBag,
  Activity,
  CheckCircle,
  ChevronRight,
  Settings,
  Plus,
  ArrowRight,
  Globe,
  Factory,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectorInfo {
  id: string;
  name: string;
  brandName?: string;
  type: "DMS" | "Marketplace";
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  status: "active" | "inactive";
  lastSync: string;
  syncFrequency: string;
}

export function AdminConnectors() {
  const navigate = useNavigate();

  const [connectors, setConnectors] = useState<ConnectorInfo[]>([
    {
      id: "bizom-freedom-oil",
      name: "Bizom",
      brandName: "Freedom Oil",
      type: "DMS",
      description: "Retail intelligence & distribution platform.",
      icon: <Database className="h-6 w-6" />,
      iconBg: "bg-blue-100 text-blue-600",
      status: "active",
      lastSync: "2 minutes ago",
      syncFrequency: "Real-time",
    },
    {
      id: "bizom-pepsi",
      name: "Bizom",
      brandName: "Pepsi",
      type: "DMS",
      description: "Retail intelligence & distribution platform.",
      icon: <Database className="h-6 w-6" />,
      iconBg: "bg-blue-100 text-blue-600",
      status: "active",
      lastSync: "5 minutes ago",
      syncFrequency: "Real-time",
    },
    {
      id: "bizom-marico",
      name: "Bizom",
      brandName: "Marico",
      type: "DMS",
      description: "Retail intelligence & distribution platform.",
      icon: <Database className="h-6 w-6" />,
      iconBg: "bg-blue-100 text-blue-600",
      status: "active",
      lastSync: "3 minutes ago",
      syncFrequency: "Real-time",
    },
    {
      id: "ondc",
      name: "ONDC",
      type: "Marketplace",
      description: "Open Network for Digital Commerce. Buyer-side order routing, catalog publishing and fulfillment updates.",
      icon: <ShoppingBag className="h-6 w-6" />,
      iconBg: "bg-orange-100 text-orange-600",
      status: "active",
      lastSync: "1 minute ago",
      syncFrequency: "Real-time",
    },
    {
      id: "tally",
      name: "Tally",
      type: "DMS",
      description: "Business accounting & ERP software. Invoice, ledger and payment reconciliation.",
      icon: <Activity className="h-6 w-6" />,
      iconBg: "bg-green-100 text-green-600",
      status: "active",
      lastSync: "5 minutes ago",
      syncFrequency: "Every 10 mins",
    },
  ]);

  // Add connector dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<"Marketplace" | "DMS" | "">("");
  const [selectedType, setSelectedType] = useState("");
  const [brandName, setBrandName] = useState("");
  const [salesCode, setSalesCode] = useState("");

  // Check if marketplace connector already exists
  const isMarketplaceAdded = (type: string) => {
    return connectors.some(
      (c) => c.name.toLowerCase() === type.toLowerCase() && c.type === "Marketplace"
    );
  };

  // Check if brand name already used for a DMS type
  const isBrandNameTaken = (dmsType: string, brand: string) => {
    return connectors.some(
      (c) => c.name.toLowerCase() === dmsType.toLowerCase() && c.brandName?.toLowerCase() === brand.toLowerCase()
    );
  };

  const typeBadge = (type: ConnectorInfo["type"]) =>
    type === "DMS" ? (
      <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1 text-xs">
        <Database className="h-3 w-3" />
        DMS
      </Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-700 border-orange-300 gap-1 text-xs">
        <ShoppingBag className="h-3 w-3" />
        Marketplace
      </Badge>
    );

  const statusBadge = (status: ConnectorInfo["status"]) =>
    status === "active" ? (
      <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600">
        Inactive
      </Badge>
    );

  const handleAddConnector = () => {
    setAddStep(1);
    setSelectedCategory("");
    setSelectedType("");
    setBrandName("");
    setSalesCode("");
    setIsAddDialogOpen(true);
  };

  const handleCategoryNext = () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    setAddStep(2);
  };

  const handleTypeNext = () => {
    if (!selectedType) {
      toast.error("Please select a connector type");
      return;
    }
    if (selectedCategory === "Marketplace" && isMarketplaceAdded(selectedType)) {
      toast.error(`${selectedType} connector is already added`);
      return;
    }
    setAddStep(3);
  };

  const handleAddConnectorSubmit = () => {
    if (selectedCategory === "DMS") {
      if (!brandName.trim()) {
        toast.error("Please enter Brand / Company Name");
        return;
      }
      if (isBrandNameTaken(selectedType, brandName.trim())) {
        toast.error(`A ${selectedType} connector for "${brandName.trim()}" already exists`);
        return;
      }
      if (!salesCode.trim()) {
        toast.error("Please enter Sales Code");
        return;
      }
    }

    const connectorId = selectedCategory === "DMS"
      ? `${selectedType.toLowerCase()}-${brandName.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      : selectedType.toLowerCase();

    const iconMap: Record<string, { icon: React.ReactNode; iconBg: string }> = {
      Bizom: { icon: <Database className="h-6 w-6" />, iconBg: "bg-blue-100 text-blue-600" },
      Tally: { icon: <Activity className="h-6 w-6" />, iconBg: "bg-green-100 text-green-600" },
      ONDC: { icon: <ShoppingBag className="h-6 w-6" />, iconBg: "bg-orange-100 text-orange-600" },
    };

    const newConnector: ConnectorInfo = {
      id: connectorId,
      name: selectedType,
      brandName: selectedCategory === "DMS" ? brandName.trim() : undefined,
      type: selectedCategory as "DMS" | "Marketplace",
      description: selectedCategory === "DMS"
        ? "Retail intelligence & distribution platform."
        : "Open Network for Digital Commerce.",
      icon: iconMap[selectedType]?.icon || <Database className="h-6 w-6" />,
      iconBg: iconMap[selectedType]?.iconBg || "bg-blue-100 text-blue-600",
      status: "active",
      lastSync: "Just now",
      syncFrequency: "Real-time",
    };

    setConnectors((prev) => [...prev, newConnector]);

    toast.success(
      selectedCategory === "DMS"
        ? `${selectedType} – ${brandName.trim()} connector added successfully!`
        : `${selectedType} connector added successfully!`
    );

    setIsAddDialogOpen(false);
    setAddStep(1);
    setSelectedCategory("");
    setSelectedType("");
    setBrandName("");
    setSalesCode("");
  };

  const handleBack = () => {
    if (addStep === 2) {
      setAddStep(1);
      setSelectedType("");
    } else if (addStep === 3) {
      setAddStep(2);
      setBrandName("");
      setSalesCode("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connectors</h2>
            <p className="text-sm text-gray-500">
              Manage integrations with external systems — add multiple DMS connectors per brand
            </p>
          </div>
          <Button
            onClick={handleAddConnector}
            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Connector
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((c) => (
            <Card
              key={c.id}
              className="border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${c.iconBg} p-2.5 rounded-lg`}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {c.name}{c.brandName ? ` – ${c.brandName}` : ""}
                      </p>
                      {c.brandName && (
                        <p className="text-xs text-blue-600 font-medium">
                          {c.brandName}
                        </p>
                      )}
                      {typeBadge(c.type)}
                    </div>
                  </div>
                  {statusBadge(c.status)}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {c.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Last Sync</p>
                    <p className="text-sm font-medium text-gray-900">
                      {c.lastSync}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Frequency</p>
                    <p className="text-sm font-medium text-gray-900">
                      {c.syncFrequency}
                    </p>
                  </div>
                </div>

                {/* Manage */}
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => navigate(`/admin/connectors/${c.id}`)}
                >
                  <Settings className="h-4 w-4" />
                  Manage
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Connector Placeholder */}
          <Card
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer hover:bg-blue-50/50 transition-all"
            onClick={handleAddConnector}
          >
            <CardContent className="p-5 flex flex-col items-center justify-center min-h-[280px] text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Add New Connector
              </h3>
              <p className="text-sm text-gray-600">
                Connect a DMS system or marketplace
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Connector Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Connector
            </DialogTitle>
            <DialogDescription>
              {addStep === 1 && "Step 1 of 3: Select connector category"}
              {addStep === 2 && "Step 2 of 3: Choose connector type"}
              {addStep === 3 && "Step 3 of 3: Configure connector"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  addStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {step}
                </div>
                {step < 3 && <ChevronRight className={`h-4 w-4 ${addStep > step ? "text-blue-600" : "text-gray-400"}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-4 py-4">
            {/* Step 1: Select Category */}
            {addStep === 1 && (
              <div className="space-y-4">
                <Label>Select Connector Category <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      selectedCategory === "Marketplace" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCategory("Marketplace")}
                  >
                    <CardContent className="p-5 text-center">
                      <ShoppingBag className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-1">Marketplace</h4>
                      <p className="text-xs text-gray-600">Sell products online</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      selectedCategory === "DMS" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCategory("DMS")}
                  >
                    <CardContent className="p-5 text-center">
                      <Database className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-1">DMS</h4>
                      <p className="text-xs text-gray-600">Distribution system</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Select Type */}
            {addStep === 2 && (
              <div className="space-y-4">
                <Label>Select {selectedCategory} Connector <span className="text-red-500">*</span></Label>
                <div className="space-y-3">
                  {selectedCategory === "Marketplace" && (
                    <Card
                      className={`cursor-pointer transition-all border-2 ${
                        selectedType === "ONDC" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      } ${isMarketplaceAdded("ONDC") ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => !isMarketplaceAdded("ONDC") && setSelectedType("ONDC")}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Globe className="h-10 w-10 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">ONDC</h4>
                          <p className="text-xs text-gray-600">Open Network for Digital Commerce</p>
                        </div>
                        {isMarketplaceAdded("ONDC") && (
                          <Badge className="bg-green-100 text-green-700 border-green-300">Already Added</Badge>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {selectedCategory === "DMS" && (
                    <>
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          selectedType === "Bizom" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedType("Bizom")}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Factory className="h-10 w-10 text-blue-600" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Bizom</h4>
                            <p className="text-xs text-gray-600">Sales Code based integration</p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-blue-200">Multi-brand</Badge>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          selectedType === "Tally" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedType("Tally")}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Activity className="h-10 w-10 text-green-600" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Tally</h4>
                            <p className="text-xs text-gray-600">Business accounting & ERP</p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-blue-200">Multi-brand</Badge>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Configuration */}
            {addStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center gap-2">
                    {selectedCategory === "DMS" ? (
                      <Factory className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Globe className="h-5 w-5 text-orange-600" />
                    )}
                    <div>
                      <p className="font-semibold text-blue-900">{selectedType}</p>
                      <p className="text-xs text-blue-700">{selectedCategory} Connector</p>
                    </div>
                  </div>
                </div>

                {selectedCategory === "DMS" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="brandName">
                        Brand / Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="brandName"
                        placeholder="e.g., Freedom Oil, Pepsi, Marico"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                      />
                      <p className="text-xs text-gray-600">
                        The brand or company this connector is mapped to
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salesCode">
                        Sales Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="salesCode"
                        placeholder={`Enter your ${selectedType} Sales Code`}
                        value={salesCode}
                        onChange={(e) => setSalesCode(e.target.value)}
                      />
                      <p className="text-xs text-gray-600">
                        Your unique Sales Code provided by {selectedType}
                      </p>
                    </div>
                  </>
                )}

                {selectedCategory === "Marketplace" && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {selectedType} connector will be configured with default settings.
                      You can customize it later from the connector management page.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {addStep > 1 && (
              <Button variant="outline" onClick={handleBack}>Back</Button>
            )}
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            {addStep === 1 && (
              <Button onClick={handleCategoryNext} className="gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {addStep === 2 && (
              <Button onClick={handleTypeNext} className="gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {addStep === 3 && (
              <Button onClick={handleAddConnectorSubmit} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Connector
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
