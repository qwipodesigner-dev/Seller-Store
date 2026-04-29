import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/root-layout";
import { ProtectedRoute } from "./components/protected-route";
import { Dashboard } from "./pages/dashboard";
import { ProductCatalog } from "./pages/product-catalog";
import { Inventory } from "./pages/inventory";
import { Orders } from "./pages/orders-enhanced";
import { OrderDetail } from "./pages/order-detail";
import { Customers } from "./pages/customers";
import { CustomerDetail } from "./pages/customer-detail";
import { Profile } from "./pages/profile";
import { Connectors } from "./pages/connectors";
import { ConnectorDetail } from "./pages/connector-detail";
import { Support } from "./pages/support";
import { Settings } from "./pages/settings";
import { Reports } from "./pages/reports";
import { Login } from "./pages/auth/login";
import { Onboarding } from "./pages/auth/onboarding";
import { AddSKU } from "./pages/products/add-sku";
import { MySKU } from "./pages/products/my-sku";
import { SKUDetail } from "./pages/products/sku-detail";
import { AddManually } from "./pages/products/add-manually";
import { BulkImport } from "./pages/products/bulk-import";
import { BrandSync } from "./pages/products/brand-sync";
import { CentralCatalogSync } from "./pages/products/central-catalog-sync";
import { PriceList } from "./pages/products/price-list";
import { PriceInventory } from "./pages/products/price-inventory";
import { OffersList } from "./pages/offers/offers-list";
import { CreateScheme } from "./pages/offers/create-scheme";
import { StoreSettings } from "./pages/settings/store-settings";
import { OrderSettings } from "./pages/settings/order-settings";
import { ShippingSettings } from "./pages/settings/shipping-settings";
import { ServiceabilitySettings } from "./pages/settings/serviceability-settings";
import { PaymentSettings } from "./pages/settings/payment-settings";
import { CustomerSettings } from "./pages/settings/customer-settings";
import { CommunicationSettings } from "./pages/settings/communication-settings";
import { SalesOrdersReport } from "./pages/reports/sales-orders";
import { InventoryInsightsReport } from "./pages/reports/inventory-insights";
import { ProductPerformanceReport } from "./pages/reports/product-performance";
import { CustomerInsightsReport } from "./pages/reports/customer-insights";
import { SchemesOffersReport } from "./pages/reports/schemes-offers";
import { OperationsDeliveryReport } from "./pages/reports/operations-delivery";
import { KycPage } from "./pages/kyc";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminNewRequests } from "./pages/admin/new-requests";
import { AdminActiveSellers } from "./pages/admin/active-sellers";
import { AdminSellerDetail } from "./pages/admin/seller-detail";
import { AdminAddUser } from "./pages/admin/add-user";
import { AdminConnectors } from "./pages/admin/connectors";
import { AdminCompanies } from "./pages/admin/companies";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  // Admin subtree — role-gated to "admin"
  {
    path: "/admin",
    element: (
      <ProtectedRoute allow="admin">
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      // User Management (flat — was Active Sellers)
      { path: "users", Component: AdminActiveSellers },
      { path: "users/add", Component: AdminAddUser },
      { path: "users/:sellerId", Component: AdminSellerDetail },
      { path: "users/:sellerId/connectors/:connectorId", Component: ConnectorDetail },
      // Admin Connectors
      { path: "connectors", Component: AdminConnectors },
      { path: "connectors/:connectorId", Component: ConnectorDetail },
      // Admin Companies & Brands (Categories now live inside each company's edit dialog)
      { path: "companies", Component: AdminCompanies },
      // Legacy aliases (keep old URLs working)
      { path: "requests", Component: AdminNewRequests },
      { path: "sellers", Component: AdminActiveSellers },
      { path: "sellers/:sellerId", Component: AdminSellerDetail },
      { path: "sellers/:sellerId/connectors/:connectorId", Component: ConnectorDetail },
    ],
  },
  // Seller subtree — seller-only
  {
    path: "/",
    element: (
      <ProtectedRoute allow="seller">
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "products/my-sku/edit/:skuId", Component: AddManually },
      { path: "products/my-sku", Component: MySKU },
      { path: "products/sku-detail/:skuId", Component: SKUDetail },
      { path: "products/add-sku", Component: AddSKU },
      { path: "products/add-sku/central-catalog", Component: CentralCatalogSync },
      { path: "products/add-sku/manual", Component: AddManually },
      { path: "products/add-sku/import", Component: BulkImport },
      { path: "products/add-sku/brand-sync", Component: BrandSync },
      { path: "products/price-list", Component: PriceList },
      { path: "products/price-inventory", Component: PriceInventory },
      { path: "offers", Component: OffersList },
      { path: "offers/create", Component: CreateScheme },
      { path: "inventory", Component: Inventory },
      { path: "orders", Component: Orders },
      { path: "orders/:orderId", Component: OrderDetail },
      { path: "customers", Component: Customers },
      { path: "customers/:customerId", Component: CustomerDetail },
      { path: "profile", Component: Profile },
      { path: "connectors", Component: Connectors },
      { path: "connectors/:connectorId", Component: ConnectorDetail },
      { path: "kyc", Component: KycPage },
      { path: "support", Component: Support },
      { path: "settings", Component: Settings },
      { path: "settings/store", Component: StoreSettings },
      { path: "settings/order", Component: OrderSettings },
      { path: "settings/shipping", Component: ShippingSettings },
      { path: "settings/serviceability", Component: ServiceabilitySettings },
      { path: "settings/payment", Component: PaymentSettings },
      { path: "settings/customer", Component: CustomerSettings },
      { path: "settings/communication", Component: CommunicationSettings },
      { path: "reports", Component: Reports },
      { path: "reports/sales-orders", Component: SalesOrdersReport },
      { path: "reports/inventory", Component: InventoryInsightsReport },
      { path: "reports/product-performance", Component: ProductPerformanceReport },
      { path: "reports/customer-insights", Component: CustomerInsightsReport },
      { path: "reports/schemes-offers", Component: SchemesOffersReport },
      { path: "reports/operations", Component: OperationsDeliveryReport },
    ],
  },
]);
