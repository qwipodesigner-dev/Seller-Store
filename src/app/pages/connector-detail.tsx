import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Link2,
  Key,
  Plus,
  Trash2,
  Edit,
  Save,
  Database,
  Activity,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Connector configurations
const connectorConfigs: Record<string, any> = {
  bizom: {
    id: "bizom",
    name: "Bizom",
    type: "DMS",
    status: "active",
    description: "Retail intelligence & distribution platform",
    icon: "🏭",
    color: "blue",
    lastSync: "2 minutes ago",
    syncFrequency: "Real-time",
    apiEndpoint: "https://api.bizom.com/v1",
  },
  tally: {
    id: "tally",
    name: "Tally",
    type: "DMS",
    status: "active",
    description: "Business accounting & ERP software",
    icon: "📊",
    color: "green",
    lastSync: "5 minutes ago",
    syncFrequency: "Every 10 mins",
    apiEndpoint: "https://api.tallysolutions.com/v2",
  },
  sap: {
    id: "sap",
    name: "SAP",
    type: "DMS",
    status: "inactive",
    description: "Enterprise resource planning system",
    icon: "🏢",
    color: "purple",
    apiEndpoint: "https://api.sap.com/erp",
  },
  ondc: {
    id: "ondc",
    name: "ONDC",
    type: "Marketplace",
    status: "active",
    description: "Open Network for Digital Commerce",
    icon: "🌐",
    color: "orange",
    lastSync: "1 minute ago",
    syncFrequency: "Real-time",
    apiEndpoint: "https://staging.registry.ondc.org",
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    type: "Marketplace",
    status: "active",
    description: "World's largest online marketplace",
    icon: "📦",
    color: "amber",
    lastSync: "3 minutes ago",
    syncFrequency: "Every 5 mins",
    apiEndpoint: "https://sellingpartnerapi-na.amazon.com",
  },
  flipkart: {
    id: "flipkart",
    name: "Flipkart",
    type: "Marketplace",
    status: "inactive",
    description: "India's leading ecommerce marketplace",
    icon: "🛒",
    color: "indigo",
    apiEndpoint: "https://api.flipkart.net/sellers",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    type: "Marketplace",
    status: "configuring",
    description: "Complete commerce platform",
    icon: "🛍️",
    color: "green",
    apiEndpoint: "https://yourstore.myshopify.com/admin/api/2024-01",
  },
};

// Field Mapping Data - specific to each connector
const connectorFieldMappings: Record<string, any[]> = {
  ondc: [
    { id: "1", sourceField: "seller_app.product_name", targetField: "descriptor.name", transformation: "Direct", required: true },
    { id: "2", sourceField: "seller_app.short_description", targetField: "descriptor.short_desc", transformation: "Direct", required: false },
    { id: "3", sourceField: "seller_app.long_description", targetField: "descriptor.long_desc", transformation: "Direct", required: false },
    { id: "4", sourceField: "seller_app.product_images", targetField: "descriptor.images[]", transformation: "Array format", required: true },
    { id: "5", sourceField: "seller_app.sku_code", targetField: "descriptor.code", transformation: "Direct", required: true },
    { id: "6", sourceField: "seller_app.category", targetField: "category_id", transformation: "Map to ONDC taxonomy", required: true },
    { id: "7", sourceField: "seller_app.selling_price", targetField: "price.value", transformation: "Direct", required: true },
    { id: "8", sourceField: "seller_app.mrp", targetField: "price.maximum_value", transformation: "Direct", required: true },
    { id: "9", sourceField: "seller_app.currency", targetField: "price.currency", transformation: "Direct (INR)", required: true },
    { id: "10", sourceField: "seller_app.available_quantity", targetField: "quantity.available.count", transformation: "Direct", required: true },
    { id: "11", sourceField: "seller_app.max_order_quantity", targetField: "quantity.maximum.count", transformation: "Direct", required: false },
    { id: "12", sourceField: "seller_app.unit_type", targetField: "quantity.unitized.measure.unit", transformation: "Direct", required: true },
    { id: "13", sourceField: "seller_app.unit_value", targetField: "quantity.unitized.measure.value", transformation: "Default: 1", required: true },
    { id: "14", sourceField: "seller_app.fulfillment_type", targetField: "fulfillment_id", transformation: "Direct", required: true },
    { id: "15", sourceField: "seller_app.store_warehouse", targetField: "location_id", transformation: "Direct", required: true },
    { id: "16", sourceField: "seller_app.time_to_ship", targetField: "@ondc/org/time_to_ship", transformation: "Direct", required: true },
    { id: "17", sourceField: "seller_app.returnable", targetField: "@ondc/org/returnable", transformation: "Boolean", required: true },
    { id: "18", sourceField: "seller_app.cancellable", targetField: "@ondc/org/cancellable", transformation: "Boolean", required: true },
    { id: "19", sourceField: "seller_app.return_pickup_available", targetField: "@ondc/org/seller_pickup_return", transformation: "Boolean", required: false },
    { id: "20", sourceField: "seller_app.cod_available", targetField: "@ondc/org/available_on_cod", transformation: "Boolean", required: false },
    { id: "21", sourceField: "seller_app.manufacturer_name", targetField: "@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_name", transformation: "Direct", required: true },
    { id: "22", sourceField: "seller_app.manufacturer_address", targetField: "@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address", transformation: "Direct", required: true },
    { id: "23", sourceField: "seller_app.generic_product_name", targetField: "@ondc/org/statutory_reqs_packaged_commodities.common_or_generic_name_of_commodity", transformation: "Direct", required: true },
    { id: "24", sourceField: "seller_app.manufacture_date", targetField: "@ondc/org/statutory_reqs_packaged_commodities.month_year_of_manufacture_packing_import", transformation: "Date format", required: true },
    { id: "25", sourceField: "seller_app.support_details", targetField: "@ondc/org/contact_details_consumer_care", transformation: "Composite (name,email,phone)", required: true },
    { id: "26", sourceField: "seller_app.country_of_origin", targetField: "tags.origin.country", transformation: "Tag format", required: false },
  ],
  amazon: [
    { id: "1", sourceField: "seller_app.sku_name", targetField: "amazon.product_name", transformation: "Direct", required: true },
    { id: "2", sourceField: "seller_app.unit_price", targetField: "amazon.your_price", transformation: "Direct", required: true },
    { id: "3", sourceField: "seller_app.inventory_count", targetField: "amazon.quantity", transformation: "Direct", required: true },
    { id: "4", sourceField: "seller_app.category_id", targetField: "amazon.product_type", transformation: "Map to Amazon categories", required: true },
    { id: "5", sourceField: "seller_app.manufacturer", targetField: "amazon.brand", transformation: "Direct", required: true },
    { id: "6", sourceField: "seller_app.asin", targetField: "amazon.asin", transformation: "Direct", required: false },
    { id: "7", sourceField: "seller_app.retail_price", targetField: "amazon.list_price", transformation: "Direct", required: false },
  ],
  bizom: [
    { id: "1", sourceField: "bizom.product_name", targetField: "seller_app.sku_name", transformation: "Direct", required: true },
    { id: "2", sourceField: "bizom.item_price", targetField: "seller_app.unit_price", transformation: "Direct", required: true },
    { id: "3", sourceField: "bizom.stock_qty", targetField: "seller_app.inventory_count", transformation: "Direct", required: true },
    { id: "4", sourceField: "bizom.product_category", targetField: "seller_app.category_id", transformation: "Map to internal taxonomy", required: true },
    { id: "5", sourceField: "bizom.brand_name", targetField: "seller_app.manufacturer", transformation: "Direct", required: false },
    { id: "6", sourceField: "bizom.mrp", targetField: "seller_app.retail_price", transformation: "Direct", required: true },
  ],
  tally: [
    { id: "1", sourceField: "tally.stock_item_name", targetField: "seller_app.sku_name", transformation: "Direct", required: true },
    { id: "2", sourceField: "tally.rate", targetField: "seller_app.unit_price", transformation: "Direct", required: true },
    { id: "3", sourceField: "tally.closing_balance", targetField: "seller_app.inventory_count", transformation: "Direct", required: true },
    { id: "4", sourceField: "tally.stock_group", targetField: "seller_app.category_id", transformation: "Map to categories", required: true },
    { id: "5", sourceField: "tally.hsn_code", targetField: "seller_app.tax_code", transformation: "Direct", required: true },
  ],
};

// Value Mapping Data
const connectorValueMappings: Record<string, any[]> = {
  ondc: [
    { id: "1", field: "Category", sourceValue: "Cooking Oil", targetValue: "F&B > Packaged Foods > Edible Oils" },
    { id: "2", field: "Category", sourceValue: "Snacks", targetValue: "F&B > Packaged Foods > Snacks" },
    { id: "3", field: "Fulfillment Type", sourceValue: "Standard", targetValue: "Delivery" },
    { id: "4", field: "Fulfillment Type", sourceValue: "Express", targetValue: "Delivery" },
    { id: "5", field: "Unit", sourceValue: "kg", targetValue: "kilogram" },
    { id: "6", field: "Unit", sourceValue: "gm", targetValue: "gram" },
    { id: "7", field: "Unit", sourceValue: "ltr", targetValue: "litre" },
  ],
  amazon: [
    { id: "1", field: "Condition", sourceValue: "New", targetValue: "New" },
    { id: "2", field: "Fulfillment Channel", sourceValue: "Seller", targetValue: "MFN" },
    { id: "3", field: "Fulfillment Channel", sourceValue: "Amazon", targetValue: "AFN" },
    { id: "4", field: "Category", sourceValue: "Cooking Oil", targetValue: "Grocery & Gourmet Food" },
  ],
  bizom: [
    { id: "1", field: "Category", sourceValue: "Cooking Oil", targetValue: "Edible Oils" },
    { id: "2", field: "Category", sourceValue: "Snacks", targetValue: "Packaged Snacks" },
    { id: "3", field: "Status", sourceValue: "In Stock", targetValue: "AVAILABLE" },
    { id: "4", field: "Status", sourceValue: "Out of Stock", targetValue: "OUT_OF_STOCK" },
  ],
  tally: [
    { id: "1", field: "Unit", sourceValue: "Kg", targetValue: "kilogram" },
    { id: "2", field: "Unit", sourceValue: "Nos", targetValue: "piece" },
    { id: "3", field: "Stock Group", sourceValue: "FMCG Products", targetValue: "Packaged Foods" },
  ],
};

// Workflow Mapping Data
const connectorWorkflowMappings: Record<string, any[]> = {
  ondc: [
    { id: "1", stage: "Order Received", sourceStatus: "Created", targetStatus: "ONDC:Created", autoApprove: true },
    { id: "2", stage: "Order Confirmed", sourceStatus: "Accepted", targetStatus: "ONDC:Accepted", autoApprove: true },
    { id: "3", stage: "Order Packed", sourceStatus: "In-progress", targetStatus: "ONDC:In-progress", autoApprove: false },
    { id: "4", stage: "Ready to Ship", sourceStatus: "Packed", targetStatus: "ONDC:Packed", autoApprove: true },
    { id: "5", stage: "Out for Delivery", sourceStatus: "Out-for-delivery", targetStatus: "ONDC:Out-for-delivery", autoApprove: true },
    { id: "6", stage: "Order Delivered", sourceStatus: "Completed", targetStatus: "ONDC:Completed", autoApprove: true },
    { id: "7", stage: "Order Cancelled", sourceStatus: "Cancelled", targetStatus: "ONDC:Cancelled", autoApprove: false },
  ],
  amazon: [
    { id: "1", stage: "Order Received", sourceStatus: "Pending", targetStatus: "Amazon:Pending", autoApprove: true },
    { id: "2", stage: "Order Confirmed", sourceStatus: "Unshipped", targetStatus: "Amazon:Unshipped", autoApprove: true },
    { id: "3", stage: "Order Shipped", sourceStatus: "Shipped", targetStatus: "Amazon:Shipped", autoApprove: true },
    { id: "4", stage: "Order Delivered", sourceStatus: "Delivered", targetStatus: "Amazon:Delivered", autoApprove: true },
    { id: "5", stage: "Order Cancelled", sourceStatus: "Canceled", targetStatus: "Amazon:Canceled", autoApprove: false },
  ],
  bizom: [
    { id: "1", stage: "Order Created", sourceStatus: "Bizom:Created", targetStatus: "Created", autoApprove: true },
    { id: "2", stage: "Order Approved", sourceStatus: "Bizom:Approved", targetStatus: "Accepted", autoApprove: false },
    { id: "3", stage: "Order Dispatched", sourceStatus: "Bizom:Dispatched", targetStatus: "Packed", autoApprove: true },
    { id: "4", stage: "Order Delivered", sourceStatus: "Bizom:Delivered", targetStatus: "Completed", autoApprove: true },
  ],
  tally: [
    { id: "1", stage: "Invoice Created", sourceStatus: "Tally:Invoiced", targetStatus: "Accepted", autoApprove: true },
    { id: "2", stage: "Payment Received", sourceStatus: "Tally:Paid", targetStatus: "Completed", autoApprove: true },
  ],
};

// Sync Log Data
const connectorSyncLogs: Record<string, any[]> = {
  ondc: [
    { id: "1", timestamp: "2024-03-26 14:30:15", dataType: "Product Catalog Publish", status: "success", recordsProcessed: 245, recordsFailed: 0, duration: "12s" },
    { id: "2", timestamp: "2024-03-26 14:28:42", dataType: "Inventory Update", status: "success", recordsProcessed: 156, recordsFailed: 0, duration: "8s" },
    { id: "3", timestamp: "2024-03-26 14:25:10", dataType: "Order Sync (Incoming)", status: "partial", recordsProcessed: 42, recordsFailed: 3, duration: "15s", error: "3 orders missing mandatory fields" },
    { id: "4", timestamp: "2024-03-26 14:20:05", dataType: "Price Update", status: "success", recordsProcessed: 312, recordsFailed: 0, duration: "18s" },
    { id: "5", timestamp: "2024-03-26 14:15:33", dataType: "Scheme/Offer Publish", status: "success", recordsProcessed: 15, recordsFailed: 0, duration: "5s" },
  ],
  amazon: [
    { id: "1", timestamp: "2024-03-26 14:32:20", dataType: "Inventory Feed", status: "success", recordsProcessed: 180, recordsFailed: 0, duration: "25s" },
    { id: "2", timestamp: "2024-03-26 14:27:15", dataType: "Order Fetch", status: "success", recordsProcessed: 23, recordsFailed: 0, duration: "10s" },
    { id: "3", timestamp: "2024-03-26 14:22:40", dataType: "Price Update Feed", status: "partial", recordsProcessed: 145, recordsFailed: 8, duration: "30s", error: "8 SKUs have pricing errors" },
  ],
  bizom: [
    { id: "1", timestamp: "2024-03-26 14:30:15", dataType: "Product Catalog Pull", status: "success", recordsProcessed: 245, recordsFailed: 0, duration: "12s" },
    { id: "2", timestamp: "2024-03-26 14:20:05", dataType: "Pricing Update Pull", status: "success", recordsProcessed: 312, recordsFailed: 0, duration: "18s" },
    { id: "3", timestamp: "2024-03-26 14:10:22", dataType: "Stock Level Pull", status: "success", recordsProcessed: 298, recordsFailed: 0, duration: "14s" },
  ],
  tally: [
    { id: "1", timestamp: "2024-03-26 14:25:10", dataType: "Stock Items Pull", status: "success", recordsProcessed: 156, recordsFailed: 0, duration: "20s" },
    { id: "2", timestamp: "2024-03-26 14:15:33", dataType: "Pricing Pull", status: "success", recordsProcessed: 156, recordsFailed: 0, duration: "18s" },
  ],
};

export function ConnectorDetail() {
  const { connectorId, sellerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Route-aware back navigation.
  const isAdminUserContext =
    location.pathname.startsWith("/admin/") && Boolean(sellerId);
  const isAdminConnectorContext =
    location.pathname.startsWith("/admin/connectors/") && !sellerId;
  const backPath = isAdminUserContext
    ? `/admin/users/${sellerId}`
    : isAdminConnectorContext
      ? "/admin/connectors"
      : "/connectors";
  const backLabel = isAdminUserContext
    ? "Back to User"
    : isAdminConnectorContext
      ? "Back to Connectors"
      : "Back";

  const connector = connectorConfigs[connectorId || ""];
  const fieldMappings = connectorFieldMappings[connectorId || ""] || [];
  const valueMappings = connectorValueMappings[connectorId || ""] || [];
  const workflowMappings = connectorWorkflowMappings[connectorId || ""] || [];
  const syncLogs = connectorSyncLogs[connectorId || ""] || [];

  if (!connector) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Connector Not Found</h2>
          <p className="text-gray-600 mt-2">The connector you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate(backPath)}>
            {backLabel}
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-gray-600">Inactive</Badge>;
      case "configuring":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Configuring</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-5xl">{connector.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{connector.name}</h1>
              <p className="text-gray-600">{connector.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(connector.status)}
          {connector.status === "active" && (
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          )}
          {connector.status === "inactive" && (
            <Button size="sm">Activate Connector</Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Only show for active connectors */}
      {connector.status === "active" && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Sync</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{connector.lastSync}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sync Frequency</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{connector.syncFrequency}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">98.5%</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">1,247</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-shrink-0">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Overview & Auth</span>
          </TabsTrigger>
          <TabsTrigger value="field-mapping" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Field Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="value-mapping" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Value Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="workflow-mapping" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Workflow Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="sync-logs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Sync Logs</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap">
            <span className="font-medium">Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview & Authentication Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Authentication — full width, vertical */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  {connector.id === "ondc" ? "ONDC Connection Settings" : "Authentication Configuration"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connector.id === "ondc" ? (
                  <>
                    <div>
                      <Label>Subscriber ID</Label>
                      <Input defaultValue="digidukaan.ondc.org/seller" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">Your unique ONDC Subscriber ID</p>
                    </div>
                    <div>
                      <Label>Unique Key ID</Label>
                      <Input defaultValue="uk-12345-abcde-67890" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">ONDC unique key identifier</p>
                    </div>
                    <div>
                      <Label>Signing Private Key</Label>
                      <Input type="password" defaultValue="***************" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">ED25519 private key for signing requests</p>
                    </div>
                    <div>
                      <Label>Encryption Private Key</Label>
                      <Input type="password" defaultValue="***************" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">X25519 private key for encryption</p>
                    </div>
                    <div>
                      <Label>API Endpoint</Label>
                      <Input defaultValue="https://staging.registry.ondc.org" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">ONDC registry endpoint</p>
                    </div>
                    <div>
                      <Label>Protocol Version</Label>
                      <Select defaultValue="1.2.0">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.2.0">1.2.0</SelectItem>
                          <SelectItem value="1.1.0">1.1.0</SelectItem>
                          <SelectItem value="1.0.0">1.0.0</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">ONDC protocol version</p>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Connection Status</p>
                            <p className="text-xs text-green-700">Connection test successful</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Test Connection</Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>API Endpoint</Label>
                      <Input defaultValue={connector.apiEndpoint} className="mt-1" />
                    </div>
                    <div>
                      <Label>API Key / Client ID</Label>
                      <Input type="password" placeholder="Enter API key" className="mt-1" />
                    </div>
                    <div>
                      <Label>Secret Token / Client Secret</Label>
                      <Input type="password" placeholder="Enter secret token" className="mt-1" />
                    </div>
                    {/* Seller/Store ID removed — not needed in admin context */}
                  </>
                )}
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Authentication
                </Button>
              </CardContent>
            </Card>

          {/* Sync Configuration — per data-type, 2x2 grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Sync Configuration
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Each data type has its own independent sync settings
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SyncTypeConfig
                  label="Product Catalog"
                  description="SKU, descriptions, images"
                  color="purple"
                  icon={<Database className="h-4 w-4 text-purple-600" />}
                  defaultFreq={connector.id === "ondc" ? "hourly" : "realtime"}
                  defaultEnabled
                />
                <SyncTypeConfig
                  label="Orders"
                  description="Order lifecycle sync"
                  color="teal"
                  icon={<RefreshCw className="h-4 w-4 text-teal-600" />}
                  defaultFreq="realtime"
                  defaultEnabled
                />
                <SyncTypeConfig
                  label="Pricing & Inventory"
                  description="Prices, stock levels"
                  color="indigo"
                  icon={<Activity className="h-4 w-4 text-indigo-600" />}
                  defaultFreq={connector.id === "ondc" ? "10min" : "5min"}
                  defaultEnabled
                />
                <SyncTypeConfig
                  label="Customers"
                  description="Customer master data"
                  color="blue"
                  icon={<Link2 className="h-4 w-4 text-blue-600" />}
                  defaultFreq="30min"
                  defaultEnabled={connector.status === "active"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration - Show for Marketplace connectors */}
          {connector.type === "Marketplace" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Webhook URL</Label>
                  <Input 
                    defaultValue={
                      connector.id === "ondc" 
                        ? "https://bharat-fmcg.in/api/webhooks/ondc-sync" 
                        : "https://your-domain.com/api/webhooks"
                    } 
                    className="mt-1" 
                    placeholder="https://your-domain.com/api/webhooks"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be HTTPS & publicly accessible</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Events to Notify</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order Created</p>
                        <p className="text-xs text-gray-600">New {connector.name} order received</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order Updated</p>
                        <p className="text-xs text-gray-600">Status changes / cancellations</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Inventory Changed</p>
                        <p className="text-xs text-gray-600">Stock updates from marketplace</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Payment Received</p>
                        <p className="text-xs text-gray-600">Payment confirmations</p>
                      </div>
                      <Switch />
                    </div>

                    {connector.id === "ondc" && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Return Initiated</p>
                            <p className="text-xs text-gray-600">Customer initiated return</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Complaint Raised</p>
                            <p className="text-xs text-gray-600">Customer complaint notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Webhook Configuration
                </Button>
              </CardContent>
            </Card>
          )}

        </TabsContent>

        {/* Field Mapping Tab */}
        <TabsContent value="field-mapping">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Field Mapping Configuration for {connector.name}</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source Field</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Target Field</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transformation</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Required</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMappings.map((mapping: any) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {mapping.sourceField}
                          </code>
                        </td>
                        <td className="text-center">
                          <Link2 className="h-4 w-4 text-gray-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {mapping.targetField}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {mapping.transformation || "-"}
                        </td>
                        <td className="text-center">
                          {mapping.required ? (
                            <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => toast.success("Edit functionality")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toast.error("Delete functionality")}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Value Mapping Tab */}
        <TabsContent value="value-mapping">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Value Mapping Configuration for {connector.name}</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Field</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source Value</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Target Value</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valueMappings.map((mapping: any) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">{mapping.field}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">{mapping.sourceValue}</span>
                        </td>
                        <td className="text-center">
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{mapping.targetValue}</span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => toast.success("Edit functionality")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toast.error("Delete functionality")}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Mapping Tab */}
        <TabsContent value="workflow-mapping">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow & Status Mapping for {connector.name}</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workflow Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Target Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Auto Approve</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowMappings.map((mapping: any) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{mapping.stage}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">{mapping.sourceStatus}</Badge>
                        </td>
                        <td className="text-center">
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{mapping.targetStatus}</Badge>
                        </td>
                        <td className="text-center">
                          <Switch checked={mapping.autoApprove} />
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => toast.success("Edit functionality")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toast.error("Delete functionality")}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="sync-logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sync Logs & Monitoring for {connector.name}</CardTitle>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data Type</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Processed</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Failed</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Error Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs text-gray-600">{log.timestamp}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.dataType}</td>
                        <td className="text-center">
                          {log.status === "success" && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Success</Badge>
                          )}
                          {log.status === "failed" && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Failed</Badge>
                          )}
                          {log.status === "partial" && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">Partial</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                          {log.recordsProcessed}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-red-600">
                          {log.recordsFailed}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">{log.duration}</td>
                        <td className="py-3 px-4 text-xs text-red-600">
                          {log.error || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <ConnectorUsersTab connectorName={connector.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Connector Users Tab ----------

interface ConnectorUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  status: "Active" | "Inactive";
}

const SEED_CONNECTOR_USERS: ConnectorUser[] = [
  { id: "cu-1", name: "Arun Mehta", mobile: "9876543210", email: "arun@distributor.in", status: "Active" },
  { id: "cu-2", name: "Kavitha Reddy", mobile: "9876543211", email: "kavitha@distributor.in", status: "Active" },
  { id: "cu-3", name: "Ravi Shankar", mobile: "9876543212", email: "ravi@distributor.in", status: "Inactive" },
];

function ConnectorUsersTab({ connectorName }: { connectorName: string }) {
  const [users, setUsers] = useState<ConnectorUser[]>(SEED_CONNECTOR_USERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<ConnectorUser | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState(true); // true = Active

  const openAdd = () => {
    setEditUser(null);
    setFormName("");
    setFormMobile("");
    setFormEmail("");
    setFormStatus(true);
    setDialogOpen(true);
  };

  const openEdit = (u: ConnectorUser) => {
    setEditUser(u);
    setFormName(u.name);
    setFormMobile(u.mobile);
    setFormEmail(u.email);
    setFormStatus(u.status === "Active");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    if (!formMobile.trim()) { toast.error("Mobile Number is required"); return; }

    if (editUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? { ...u, name: formName, mobile: formMobile, email: formEmail, status: formStatus ? "Active" : "Inactive" }
            : u,
        ),
      );
      toast.success(`User "${formName}" updated`);
    } else {
      const newUser: ConnectorUser = {
        id: `cu-${Date.now()}`,
        name: formName,
        mobile: formMobile,
        email: formEmail,
        status: formStatus ? "Active" : "Inactive",
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success(`User "${formName}" added`);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{connectorName} Users</CardTitle>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-500 text-sm">
                      No users yet. Click "Add User" to create one.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{u.mobile}</td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            u.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editUser
                ? "Update user details and status."
                : `Add a new user to ${connectorName}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number <span className="text-red-500">*</span></Label>
              <Input value={formMobile} onChange={(e) => setFormMobile(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="user@company.com" />
            </div>
            {editUser && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <Label className="text-sm">Status</Label>
                  <p className="text-xs text-gray-500">
                    {formStatus ? "User is active" : "User is inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${formStatus ? "text-green-700" : "text-gray-500"}`}>
                    {formStatus ? "Active" : "Inactive"}
                  </span>
                  <Switch checked={formStatus} onCheckedChange={setFormStatus} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              {editUser ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Per-data-type sync config ----------

function SyncTypeConfig({
  label,
  description,
  color,
  icon,
  defaultFreq,
  defaultEnabled,
}: {
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  defaultFreq: string;
  defaultEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className={`border rounded-lg ${enabled ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
      {/* Header toggle */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`bg-${color}-100 p-2 rounded-lg`}>{icon}</div>
          <div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Expanded settings — shown when enabled */}
      {enabled && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Sync Frequency</Label>
              <Select defaultValue={defaultFreq}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="10min">Every 10 minutes</SelectItem>
                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Max Retry Attempts</Label>
              <Select defaultValue="3">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto Retry</p>
              <p className="text-xs text-gray-500">Retry failed syncs automatically</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-sync</p>
              <p className="text-xs text-gray-500">Run sync at configured frequency</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      )}
    </div>
  );
}