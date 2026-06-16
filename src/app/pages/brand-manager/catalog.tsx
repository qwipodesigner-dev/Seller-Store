import { ProductStoreBrowse } from "../../components/product-store-browse";
import { psSkus, psCompanies, psBrands } from "../../lib/product-store-data";
import { useAuth } from "../../lib/auth-context";
import { Info } from "lucide-react";

// Mock mapping: brand-manager-1 (Arjun Mehta) is mapped to ITC.
// In production this would come from Seller Admin's company-to-brand-manager mapping API.
export const BM_COMPANY_IDS = ["ITC"];

export function BrandManagerCatalog() {
  const { user } = useAuth();

  // Filter the PS data to only the brand manager's mapped companies
  const myCompanyIds = BM_COMPANY_IDS;
  const filteredSkus = psSkus.filter((s) => myCompanyIds.includes(s.companyId));

  // Verify the filtered companies/brands exist (defensive — should always be true for mock)
  const myCompanyNames = psCompanies
    .filter((c) => myCompanyIds.includes(c.id))
    .map((c) => c.name)
    .join(", ");
  const myBrandCount = psBrands.filter((b) => myCompanyIds.includes(b.companyId)).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Catalog</h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing SKUs for your mapped {myCompanyIds.length > 1 ? "companies" : "company"}:{" "}
          <span className="font-medium text-gray-700">{myCompanyNames}</span>
          {" "}— {myBrandCount} brands, {filteredSkus.length} SKUs.
        </p>
      </div>

      {/* Scope banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-teal-900">
          <span className="font-medium">Catalog scope:</span> You can only see companies and brands
          mapped to your account ({user?.businessName}). Contact Catalog Admin to update your mappings.
        </p>
      </div>

      <ProductStoreBrowse
        mode="admin"
        skuList={filteredSkus}
      />
    </div>
  );
}
