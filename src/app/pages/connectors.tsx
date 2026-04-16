import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageHeader } from "../components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Database,
  ShoppingBag,
  CheckCircle,
  Settings,
  Plus,
  ArrowRight,
  Globe,
  Factory,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Connector Types
interface Connector {
  id: string;
  name: string;
  brandName?: string; // Brand/Company mapped to this connector (required for DMS)
  type: "DMS" | "Marketplace";
  status: "connected" | "not-connected";
  description: string;
  icon: string;
  salesCode?: string;
}

export function Connectors() {
  const navigate = useNavigate();
  
  // State for connectors
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: "bizom-freedom-oil",
      name: "Bizom",
      brandName: "Freedom Oil",
      type: "DMS",
      status: "connected",
      description: "Sales Code based integration",
      icon: "🏭",
      salesCode: "BIZ-FO-001",
    },
    {
      id: "bizom-pepsi",
      name: "Bizom",
      brandName: "Pepsi",
      type: "DMS",
      status: "connected",
      description: "Sales Code based integration",
      icon: "🏭",
      salesCode: "BIZ-PP-002",
    },
    {
      id: "bizom-marico",
      name: "Bizom",
      brandName: "Marico",
      type: "DMS",
      status: "connected",
      description: "Sales Code based integration",
      icon: "🏭",
      salesCode: "BIZ-MR-003",
    },
    {
      id: "ondc",
      name: "ONDC",
      type: "Marketplace",
      status: "connected",
      description: "Open Network for Digital Commerce",
      icon: "🌐",
    },
  ]);

  // Add connector dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<"Marketplace" | "DMS" | "">("");
  const [selectedType, setSelectedType] = useState("");
  const [brandName, setBrandName] = useState("");
  const [salesCode, setSalesCode] = useState("");

  // Check if marketplace connector already exists (DMS allows multiple)
  const isMarketplaceAdded = (type: string) => {
    return connectors.some(
      (c) => c.name.toLowerCase() === type.toLowerCase() && c.type === "Marketplace" && c.status === "connected"
    );
  };

  // Check if brand name already used for a DMS type
  const isBrandNameTaken = (dmsType: string, brand: string) => {
    return connectors.some(
      (c) => c.name.toLowerCase() === dmsType.toLowerCase() && c.brandName?.toLowerCase() === brand.toLowerCase()
    );
  };

  // Get type badge
  const getTypeBadge = (type: "DMS" | "Marketplace") => {
    if (type === "DMS") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
          <Database className="h-3 w-3" />
          DMS
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-300 gap-1">
          <ShoppingBag className="h-3 w-3" />
          Marketplace
        </Badge>
      );
    }
  };

  // Get status badge
  const getStatusBadge = (status: "connected" | "not-connected") => {
    if (status === "connected") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600">
          Not Connected
        </Badge>
      );
    }
  };

  // Handle connector click
  const handleConnectorClick = (connector: Connector) => {
    if (connector.status === "connected") {
      navigate(`/connectors/${connector.id}`);
    }
  };

  // Open add connector dialog
  const handleAddConnector = () => {
    setAddStep(1);
    setSelectedCategory("");
    setSelectedType("");
    setBrandName("");
    setSalesCode("");
    setIsAddDialogOpen(true);
  };

  // Handle category selection
  const handleCategoryNext = () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    setAddStep(2);
  };

  // Handle type selection
  const handleTypeNext = () => {
    if (!selectedType) {
      toast.error("Please select a connector type");
      return;
    }

    // Only restrict marketplace connectors (DMS allows multiple for different brands)
    if (selectedCategory === "Marketplace" && isMarketplaceAdded(selectedType)) {
      toast.error(`${selectedType} connector is already added`);
      return;
    }

    setAddStep(3);
  };

  // Handle connector configuration and add
  const handleAddConnectorSubmit = () => {
    // Validation for DMS connectors
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

    // Generate unique ID
    const connectorId = selectedCategory === "DMS"
      ? `${selectedType.toLowerCase()}-${brandName.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      : selectedType.toLowerCase();

    // Add connector
    const newConnector: Connector = {
      id: connectorId,
      name: selectedType,
      brandName: selectedCategory === "DMS" ? brandName.trim() : undefined,
      type: selectedCategory as "DMS" | "Marketplace",
      status: "connected",
      description:
        selectedCategory === "DMS"
          ? "Sales Code based integration"
          : "Open Network for Digital Commerce",
      icon: selectedCategory === "DMS" ? "🏭" : "🌐",
      salesCode: selectedCategory === "DMS" ? salesCode : undefined,
    };

    setConnectors((prev) => [...prev, newConnector]);

    toast.success(
      selectedCategory === "DMS"
        ? `${selectedType} – ${brandName.trim()} connector added successfully!`
        : `${selectedType} connector added successfully!`
    );

    // Close dialog
    setIsAddDialogOpen(false);
    setAddStep(1);
    setSelectedCategory("");
    setSelectedType("");
    setBrandName("");
    setSalesCode("");
  };

  // Go back in add flow
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
      {/* Page Header */}
      <PageHeader
        description="Manage your DMS and Marketplace integrations"
        actions={
          <Button
            onClick={handleAddConnector}
            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Connector
          </Button>
        }
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Connector Framework</p>
              <p className="text-blue-800">
                Connect your DMS systems (Bizom) for each brand and marketplaces (ONDC) to sync
                products, inventory, orders, and more. You can add multiple DMS connectors — one per brand.
                Click on any connected connector to manage its configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Your Connectors ({connectors.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((connector) => (
              <Card
                key={connector.id}
                className={`hover:shadow-lg transition-all border-2 ${
                  connector.status === "connected"
                    ? "cursor-pointer hover:border-blue-400"
                    : "opacity-75"
                }`}
                onClick={() => handleConnectorClick(connector)}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{connector.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {connector.name}{connector.brandName ? ` – ${connector.brandName}` : ""}
                        </h3>
                        {connector.brandName && (
                          <p className="text-xs text-blue-600 font-medium mt-0.5">
                            {connector.brandName}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-0.5">
                          {connector.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {getTypeBadge(connector.type)}
                    {getStatusBadge(connector.status)}
                  </div>

                  {/* Additional Info */}
                  {connector.status === "connected" && connector.salesCode && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">Sales Code</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 mt-1">
                        {connector.salesCode}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {connector.status === "connected" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/connectors/${connector.id}`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Manage Configuration
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  )}

                  {connector.status === "not-connected" && (
                    <Button
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("Use 'Add Connector' to configure this connector");
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Empty State - Add More */}
            {(
              <Card
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer hover:bg-blue-50/50 transition-all"
                onClick={handleAddConnector}
              >
                <CardContent className="p-5 flex flex-col items-center justify-center min-h-[200px] text-center">
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
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Connect DMS
                </h4>
                <p className="text-sm text-gray-600">
                  Link your distribution management system like Bizom to import
                  product catalog and inventory
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Manage Products
                </h4>
                <p className="text-sm text-gray-600">
                  Review and configure products, pricing, and inventory in your
                  seller platform
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Publish to Marketplaces
                </h4>
                <p className="text-sm text-gray-600">
                  Sync products to ONDC and other marketplaces to start selling
                  across channels
                </p>
              </div>
            </div>
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

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  addStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <ChevronRight
                className={`h-4 w-4 ${
                  addStep >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  addStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <ChevronRight
                className={`h-4 w-4 ${
                  addStep >= 3 ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  addStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
            </div>

            <div className="space-y-4 py-4">
              {/* Step 1: Select Category */}
              {addStep === 1 && (
                <div className="space-y-4">
                  <Label>
                    Select Connector Category <span className="text-red-500">*</span>
                  </Label>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Marketplace Card */}
                    <Card
                      className={`cursor-pointer transition-all border-2 ${
                        selectedCategory === "Marketplace"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedCategory("Marketplace")}
                    >
                      <CardContent className="p-5 text-center">
                        <ShoppingBag className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Marketplace
                        </h4>
                        <p className="text-xs text-gray-600">
                          Sell products online
                        </p>
                      </CardContent>
                    </Card>

                    {/* DMS Card */}
                    <Card
                      className={`cursor-pointer transition-all border-2 ${
                        selectedCategory === "DMS"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedCategory("DMS")}
                    >
                      <CardContent className="p-5 text-center">
                        <Database className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-1">DMS</h4>
                        <p className="text-xs text-gray-600">
                          Distribution system
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: Select Type */}
              {addStep === 2 && (
                <div className="space-y-4">
                  <Label>
                    Select {selectedCategory} Connector{" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <div className="space-y-3">
                    {selectedCategory === "Marketplace" && (
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          selectedType === "ONDC"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          isMarketplaceAdded("ONDC") ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() =>
                          !isMarketplaceAdded("ONDC") && setSelectedType("ONDC")
                        }
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Globe className="h-10 w-10 text-orange-600" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">ONDC</h4>
                            <p className="text-xs text-gray-600">
                              Open Network for Digital Commerce
                            </p>
                          </div>
                          {isMarketplaceAdded("ONDC") && (
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              Already Added
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {selectedCategory === "DMS" && (
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          selectedType === "Bizom"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedType("Bizom")}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Factory className="h-10 w-10 text-blue-600" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Bizom</h4>
                            <p className="text-xs text-gray-600">
                              Sales Code based integration
                            </p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                            Multi-brand
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Configuration */}
              {addStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center gap-2">
                      {selectedType === "Bizom" ? (
                        <Factory className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Globe className="h-5 w-5 text-orange-600" />
                      )}
                      <div>
                        <p className="font-semibold text-blue-900">
                          {selectedType}
                        </p>
                        <p className="text-xs text-blue-700">
                          {selectedCategory} Connector
                        </p>
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
                          placeholder="Enter your Bizom Sales Code"
                          value={salesCode}
                          onChange={(e) => setSalesCode(e.target.value)}
                        />
                        <p className="text-xs text-gray-600">
                          Your unique Sales Code provided by {selectedType}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedType === "ONDC" && (
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">
                          ONDC connector will be configured with default
                          settings. You can customize it later from the connector
                          management page.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {addStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              {addStep === 1 && (
                <Button onClick={handleCategoryNext} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {addStep === 2 && (
                <Button onClick={handleTypeNext} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
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
    </div>
  );
}