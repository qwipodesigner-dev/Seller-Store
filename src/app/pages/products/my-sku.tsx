import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { MultiSelect } from "../../components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Eye,
  Pencil,
  MoreVertical,
  Filter,
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  FileCheck,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { validateSKU, ValidationError, SKUInput } from "../../lib/ondc-validation";

// ONDC Data structure
interface ONDCData {
  productName: string;
  mrp: string;
  hsnCode: string;
  countryOfOrigin: string;
  manufacturerName: string;
  manufacturerAddress: string;
  importerPackerName: string;
  importerPackerAddress: string;
  productLength: string;
  productWidth: string;
  productHeight: string;
  productWeight: string;
  returnPolicy: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
}

interface SKUData {
  id: string;
  name: string;
  category: string;
  brand: string;
  source: string;
  status: string;
  lastUpdated: string;
  sku: string;
  ondcCompliance: {
    isCompliant: boolean;
    missingFields: string[];
    ondcData: Partial<ONDCData>;
  };
}

// SKU data — aligned with the Bizom DMS inventory export (Freedom / Sri Krupa / First Klass).
const sampleSKUs: SKUData[] = [
  {
    id: "180000005",
    name: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-22",
    sku: "180000005",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000006",
    name: "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-22",
    sku: "180000006",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000008",
    name: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-22",
    sku: "180000008",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000076",
    name: "FREEDOM REF.SUNFLOWER OIL 1 LTR X 12PET",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-14",
    sku: "180000076",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000179",
    name: "FREEDOM REF.SUNFLOWER OIL 2 LTR X 6 PET",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-08",
    sku: "180000179",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000248",
    name: "FREEDOM FILTE. GROUNDNUT OIL 1 LTRX10NOS",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-03-20",
    sku: "180000248",
    ondcCompliance: {
      isCompliant: false,
      missingFields: ["Stock"],
      ondcData: {},
    },
  },
  {
    id: "180000249",
    name: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-14",
    sku: "180000249",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000260",
    name: "FREEDOM K.GHANI MUSTARD OIL 1LTRX12 PET",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-06",
    sku: "180000260",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000377",
    name: "Sri Krupa 1Ltr X 12 Pet",
    category: "Edible Oil",
    brand: "Sri Krupa",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-03-20",
    sku: "180000377",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000419",
    name: "FREEDOM FILTE. GROUNDNUT OIL 1 LTRX10NOS-OFFER",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-08",
    sku: "180000419",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000437",
    name: "FREEDOM REF. RICE BRAN OIL 1 LTR.X16 NOS",
    category: "Edible Oil",
    brand: "Freedom",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-08",
    sku: "180000437",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "180000490",
    name: "FIRST KLASS REF PALMOLEIN 750G X 15 NOS",
    category: "Edible Oil",
    brand: "First Klass",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-03-16",
    sku: "180000490",
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
];


// ONDC mandatory fields for bulk-import validation (column headers in template)
const ONDC_REQUIRED_COLUMNS = [
  "Item Status",
  "Item Name",
  "Item Code",
  "Symbol/Thumbnail",
  "Short Description",
  "Long Description",
  "Measure Unit",
  "Measure Value",
  "Available Count",
  "Maximum Order Qty",
  "Minimum Order Qty",
  "Category ID",
  "Fulfillment ID",
  "Location ID",
  "Returnable",
  "Cancellable",
  "Time to Ship",
  "Available on COD",
  "Consumer Care Contact",
  "Country of Origin",
  "Brand Attribute",
];

const ONDC_OPTIONAL_COLUMNS = [
  "Unitized Count (Pack Size)",
  "Additional Images",
  "Manufacturer/Packer Name",
  "Manufacturer/Packer Address",
  "Additional Images (Statutory)",
  "Return Window",
];

interface ValidationRow {
  rowNumber: number;
  skuCode: string;
  skuName: string;
  status: "valid" | "invalid";
  errors: ValidationError[];
  parsed: SKUInput;
}

interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  details: ValidationRow[];
}

export function MySKU() {
  const navigate = useNavigate();
  const [skus, setSkus] = useState<SKUData[]>(sampleSKUs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add SKU bulk import dialog
  const [isAddSkuOpen, setIsAddSkuOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [ondcFilter, setOndcFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(skus.map((s) => s.category))).sort();
  const uniqueBrands = Array.from(new Set(skus.map((s) => s.brand))).sort();

  // Filtered SKUs
  const filteredSKUs = skus.filter((sku) => {
    const matchesSearch =
      sku.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sku.status === statusFilter;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sku.category);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sku.brand);
    const matchesOndc =
      ondcFilter === "all" ||
      (ondcFilter === "compliant" && sku.ondcCompliance.isCompliant) ||
      (ondcFilter === "non-compliant" && !sku.ondcCompliance.isCompliant);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesBrand &&
      matchesOndc
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSKUs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSKUs = filteredSKUs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleViewDetails = (sku: SKUData) => {
    navigate(`/products/sku-detail/${sku.id}`);
  };

  const handleEditSKU = (sku: SKUData) => {
    navigate(`/products/my-sku/edit/${sku.id}`);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setOndcFilter("all");
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

  const handleExport = () => {
    toast.success("Exporting SKU data...");
  };

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  // ---- Add SKU: bulk import ----
  const handleOpenAddSku = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setIsAddSkuOpen(true);
  };

  const handleDownloadSample = () => {
    const mandatoryHeaders = ONDC_REQUIRED_COLUMNS.map((c) => `${c}*`);
    const headers = [...mandatoryHeaders, ...ONDC_OPTIONAL_COLUMNS];

    // Two example rows per ONDC spec
    const sampleRows = [
      [
        "enable", // Item Status
        "Ashirwad Plain Atta 1kg", // Item Name (3-100 chars, brand + variant + pack size)
        "1:8901030865278", // Item Code — valid EAN-13 with correct checksum
        "https://seller-np.com/images/ashirwad-atta-1kg.png", // Thumbnail (HTTPS, .png/.jpg/.jpeg/.webp, ≤ 2MB)
        "Ashirwad Plain Atta 1kg Pack — premium wheat flour", // Short Description (10-150 chars)
        "Premium quality whole wheat flour sourced from the finest Indian wheat, perfect for making soft rotis and parathas.", // Long Description (20-1000 chars)
        "kilogram", // Measure Unit (lowercase enum)
        "1", // Measure Value (>0, up to 3 decimals)
        "50", // Available Count (0-99)
        "20", // Maximum Order Qty (≤ Available Count)
        "1", // Minimum Order Qty (≥1, ≤ Max)
        "Atta, Flours and Sooji", // Category ID (from ONDC taxonomy)
        "F1", // Fulfillment ID (must exist at provider)
        "L1", // Location ID (enabled location)
        "TRUE", // Returnable
        "TRUE", // Cancellable
        "PT4H", // Time to Ship (PT15M..P7D)
        "FALSE", // Available on COD
        "Support Team,support@abcdist.com,18004254444", // Consumer Care (name,email,phone — no spaces after commas)
        "IND", // Country of Origin (ISO 3166-1 alpha-3)
        "Ashirwad", // Brand Attribute (2-50 chars)
        "10", // Unitized Count (Pack Size)
        "https://seller-np.com/images/img1.jpg;https://seller-np.com/images/img2.jpg", // Additional Images (semicolon-separated)
        "ITC Limited", // Manufacturer Name
        "ITC Quality Care Cell, P.O Box 592, Bangalore 560005", // Manufacturer Address (must contain 6-digit PIN)
        "back_image|https://seller-np.com/images/back.jpg", // Statutory Images (type|url;...)
        "P7D", // Return Window (P1D..P30D, required when Returnable=true)
      ],
    ];

    // Create a CSV as stand-in for .xlsx (full xlsx needs a writer lib; CSV opens in Excel).
    const csv = [
      headers.join(","),
      ...sampleRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKU_Import_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample template downloaded");
  };

  const validateFile = (file: File) => {
    setIsValidating(true);
    setValidationResult(null);

    // Basic file type check
    const validExts = [".xlsx", ".xls", ".csv"];
    const name = file.name.toLowerCase();
    if (!validExts.some((e) => name.endsWith(e))) {
      setIsValidating(false);
      toast.error("Invalid file format. Please upload .xlsx, .xls, or .csv");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");

      // Simple CSV parser — handles quoted fields with embedded commas and escaped quotes.
      const parseCsv = (t: string): string[][] => {
        const rows: string[][] = [];
        let row: string[] = [];
        let field = "";
        let inQuotes = false;
        for (let i = 0; i < t.length; i++) {
          const c = t[i];
          if (inQuotes) {
            if (c === '"' && t[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') { inQuotes = false; }
            else { field += c; }
          } else {
            if (c === '"') { inQuotes = true; }
            else if (c === ',') { row.push(field); field = ""; }
            else if (c === '\n' || c === '\r') {
              if (c === '\r' && t[i + 1] === '\n') i++;
              row.push(field); rows.push(row); row = []; field = "";
            } else { field += c; }
          }
        }
        if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
        return rows.filter((r) => r.some((c) => c.trim() !== ""));
      };

      const allRows = parseCsv(text);
      if (allRows.length < 2) {
        setIsValidating(false);
        toast.error("File is empty or has no data rows.");
        return;
      }

      // Normalise headers: strip trailing "*" (mandatory marker) and trim
      const headers = allRows[0].map((h) => h.replace(/\*+\s*$/, "").trim());
      const dataRows = allRows.slice(1);

      // Map CSV header → SKUInput key
      const headerMap: Record<string, keyof SKUInput | "__ignore__"> = {
        "Item Status": "itemStatus",
        "Item Name": "itemName",
        "Item Code": "itemCode",
        "Symbol/Thumbnail": "thumbnail",
        "Symbol / Thumbnail": "thumbnail",
        "Short Description": "shortDesc",
        "Long Description": "longDesc",
        "Additional Images": "additionalImages",
        "Unitized Count (Pack Size)": "unitizedCount",
        "Measure Unit": "measureUnit",
        "Measure Value": "measureValue",
        "Available Count": "availableCount",
        "Maximum Order Qty": "maximumOrderQty",
        "Minimum Order Qty": "minimumOrderQty",
        "Category ID": "categoryId",
        "Fulfillment ID": "fulfillmentId",
        "Location ID": "locationId",
        "Returnable": "returnable",
        "Cancellable": "cancellable",
        "Time to Ship": "timeToShip",
        "Available on COD": "availableOnCod",
        "Consumer Care Contact": "consumerCareContact",
        "Manufacturer/Packer Name": "manufacturerName",
        "Manufacturer / Packer Name": "manufacturerName",
        "Manufacturer/Packer Address": "manufacturerAddress",
        "Manufacturer / Packer Address": "manufacturerAddress",
        "Country of Origin": "countryOfOrigin",
        "Brand Attribute": "brandAttribute",
        "Additional Images (Statutory)": "statutoryImages",
        "Return Window": "returnWindow",
      };

      const seenCodes = new Set<string>();
      const seenNames = new Set<string>();

      const details: ValidationRow[] = dataRows.map((cols, idx) => {
        const input: SKUInput = {};
        headers.forEach((h, ci) => {
          const key = headerMap[h];
          if (!key || key === "__ignore__") return;
          const raw = (cols[ci] ?? "").trim();
          if (raw === "") return;

          if (key === "returnable" || key === "cancellable" || key === "availableOnCod") {
            (input as any)[key] = /^true|1|yes$/i.test(raw);
          } else if (key === "additionalImages") {
            input.additionalImages = raw.split(";").map((s) => s.trim()).filter(Boolean);
          } else if (key === "statutoryImages") {
            // Format: type1|url1;type2|url2
            input.statutoryImages = raw.split(";").map((s) => {
              const [type, url] = s.split("|").map((x) => x.trim());
              return { type, url };
            });
          } else {
            (input as any)[key] = raw;
          }
        });

        // Flag packaged commodity conditionally — simple heuristic: has manufacturer fields or F&B categories
        const catLower = (input.categoryId || "").toLowerCase();
        input.isPackagedCommodity =
          !!(input.manufacturerName || input.manufacturerAddress) ||
          /atta|flour|biscuit|salt|oil|food|packaged/.test(catLower);

        const errors = validateSKU(input, {
          existingItemCodes: seenCodes,
          existingItemNames: seenNames,
        });

        if (input.itemCode) seenCodes.add(input.itemCode.trim());
        if (input.itemName) seenNames.add(input.itemName.trim().toLowerCase());

        return {
          rowNumber: idx + 2, // +1 for header, +1 for 1-based
          skuCode: input.itemCode || "",
          skuName: input.itemName || "",
          status: errors.length === 0 ? "valid" : "invalid",
          errors,
          parsed: input,
        };
      });

      const result: ValidationResult = {
        totalRows: details.length,
        validRows: details.filter((d) => d.status === "valid").length,
        invalidRows: details.filter((d) => d.status === "invalid").length,
        details,
      };

      setValidationResult(result);
      setIsValidating(false);
      if (result.invalidRows > 0) {
        toast.warning(`${result.invalidRows} row(s) failed validation. Review errors below.`);
      } else {
        toast.success(`All ${result.validRows} rows passed validation`);
      }
    };
    reader.onerror = () => {
      setIsValidating(false);
      toast.error("Could not read file.");
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      validateFile(file);
    }
  };

  const handleImportValid = () => {
    if (!validationResult) return;
    const valid = validationResult.details.filter((d) => d.status === "valid");

    const newSkus: SKUData[] = valid.map((row, idx) => ({
      id: String(skus.length + idx + 1),
      name: row.skuName,
      category: "Imported",
      brand: "—",
      source: "Excel Import",
      status: "Active",
      lastUpdated: new Date().toISOString().split("T")[0],
      sku: row.skuCode,
      ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
    }));

    setSkus((prev) => [...newSkus, ...prev]);
    toast.success(`${newSkus.length} SKU(s) imported successfully`);
    setIsAddSkuOpen(false);
    setUploadedFile(null);
    setValidationResult(null);
  };

  const getSourceBadge = (source: string) => {
    const badgeMap: Record<string, { color: string; icon?: React.ReactNode }> = {
      "Brand Sync": {
        color: "border-purple-300 text-purple-700 bg-purple-50",
        icon: <Database className="h-3 w-3 mr-1" />,
      },
      DMS: {
        color: "border-blue-300 text-blue-700 bg-blue-50",
        icon: <Database className="h-3 w-3 mr-1" />,
      },
      Manual: { color: "border-gray-300 text-gray-700 bg-gray-50" },
      "Excel Import": { color: "border-green-300 text-green-700 bg-green-50" },
    };

    const badge = badgeMap[source] || badgeMap.Manual;

    return (
      <Badge variant="outline" className={badge.color}>
        {badge.icon}
        {source}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Header with Search and Actions */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by SKU name, code, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenAddSku}
                  className="gap-2 flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add SKU
                </Button>
              </div>
            </div>

            {/* Applied Filter Tags */}
            {(statusFilter !== "all" ||
              selectedCategories.length > 0 ||
              selectedBrands.length > 0 ||
              ondcFilter !== "all") && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Status: {statusFilter}
                    <button onClick={() => { setStatusFilter("all"); setCurrentPage(1); }} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {cat}
                    <button onClick={() => { setSelectedCategories(selectedCategories.filter(c => c !== cat)); setCurrentPage(1); }} className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedBrands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-green-50 text-green-700 border-green-200">
                    {brand}
                    <button onClick={() => { setSelectedBrands(selectedBrands.filter(b => b !== brand)); setCurrentPage(1); }} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {ondcFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-orange-50 text-orange-700 border-orange-200">
                    ONDC: {ondcFilter === "compliant" ? "Compliant" : "Non-Compliant"}
                    <button onClick={() => { setOndcFilter("all"); setCurrentPage(1); }} className="ml-1 hover:bg-orange-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 text-xs h-6"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* SKU Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ONDC Compliance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSKUs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No SKUs found
                    </td>
                  </tr>
                ) : (
                  paginatedSKUs.map((sku) => (
                    <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {sku.sku}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{sku.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{sku.brand}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{sku.category}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge
                          className={
                            sku.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {sku.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {sku.ondcCompliance.isCompliant ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Compliant
                          </Badge>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Non-Compliant
                            </Badge>
                            {sku.ondcCompliance.missingFields.length > 0 && (
                              <span className="text-[10px] text-gray-500">
                                {sku.ondcCompliance.missingFields.length} field{sku.ondcCompliance.missingFields.length > 1 ? "s" : ""} missing
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{sku.lastUpdated}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Details"
                          onClick={() => handleViewDetails(sku)}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSKUs.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSKUs.length)} of{" "}
                {filteredSKUs.length} SKUs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFilterDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filter SKUs</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select 
                      value={statusFilter} 
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <MultiSelect
                      options={uniqueCategories.map((c) => ({ label: c, value: c }))}
                      selected={selectedCategories}
                      onChange={(values) => { setSelectedCategories(values); handleFilterChange(); }}
                      placeholder="All Categories"
                      className="w-full"
                    />
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Brand</Label>
                    <MultiSelect
                      options={uniqueBrands.map((b) => ({ label: b, value: b }))}
                      selected={selectedBrands}
                      onChange={(values) => { setSelectedBrands(values); handleFilterChange(); }}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>

                  {/* ONDC Compliance Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">ONDC Compliance</Label>
                    <Select
                      value={ondcFilter}
                      onValueChange={(value) => {
                        setOndcFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="compliant">ONDC Compliant</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStatusFilter("all");
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setOndcFilter("all");
                    setCurrentPage(1);
                    toast.success("All filters cleared");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setIsFilterDrawerOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add SKU — Bulk Import Dialog */}
      <Dialog open={isAddSkuOpen} onOpenChange={setIsAddSkuOpen}>
        <DialogContent className="!max-w-[min(95vw,1200px)] w-[min(95vw,1200px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-blue-600" />
              Add SKU — Bulk Import
            </DialogTitle>
            <DialogDescription>
              Upload an Excel/CSV file with your SKUs. The system validates each row against
              ONDC eB2B mandatory rules. Rows that pass validation are stored to your Seller Store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Steps 1 + 2 — side-by-side to save vertical space */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Step 1 — Download Sample */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Download sample template</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Columns marked <span className="font-mono text-red-600">*</span> are mandatory.
                    </p>
                    <div className="flex items-center gap-2 mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">SKU_Import_Template.csv</p>
                        <p className="text-[10px] text-gray-500">
                          {ONDC_REQUIRED_COLUMNS.length} mandatory + {ONDC_OPTIONAL_COLUMNS.length} optional
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDownloadSample} className="gap-1 h-7 px-2 text-xs">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 — Upload File */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Upload filled file</p>
                    <p className="text-xs text-gray-600 mt-0.5">Supported: .xlsx, .xls, .csv</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!uploadedFile ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-xs font-medium">Click to browse file</span>
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setUploadedFile(null);
                            setValidationResult(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Validation Results (full width, tall for multiple errors) */}
            {(isValidating || validationResult) && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Validation results</p>
                  </div>
                  {validationResult && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        Total <b>{validationResult.totalRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        <FileCheck className="h-3 w-3" /> Valid <b>{validationResult.validRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        <FileWarning className="h-3 w-3" /> Invalid <b>{validationResult.invalidRows}</b>
                      </span>
                    </div>
                  )}
                </div>

                {isValidating && (
                  <p className="text-sm text-gray-600 py-4 text-center">Validating file against ONDC rules…</p>
                )}

                {validationResult && (
                  <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="text-left">
                          <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-14">Row</th>
                          <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-44">Item Code</th>
                          <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-56">Item Name</th>
                          <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-28">Status</th>
                          <th className="px-3 py-2 text-xs font-semibold text-gray-600">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {validationResult.details.map((r) => (
                          <tr key={r.rowNumber} className={r.status === "invalid" ? "bg-red-50/50" : ""}>
                            <td className="px-3 py-2 text-gray-700 align-top">{r.rowNumber}</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top break-all">
                              {r.skuCode || "—"}
                            </td>
                            <td className="px-3 py-2 text-gray-900 align-top">{r.skuName || "—"}</td>
                            <td className="px-3 py-2 align-top">
                              {r.status === "valid" ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Valid
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                                  <AlertCircle className="h-3 w-3" /> {r.errors.length} error
                                  {r.errors.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {r.errors.length === 0 ? (
                                <span className="text-xs text-green-700">All checks passed.</span>
                              ) : (
                                <ul className="space-y-1 text-xs text-red-700">
                                  {r.errors.map((err, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span
                                        className="font-mono font-semibold text-[10px] bg-red-100 text-red-800 border border-red-200 px-1 py-0.5 rounded shrink-0 self-start"
                                        title={`Rule ${err.ruleId} — field: ${err.field}`}
                                      >
                                        {err.code}
                                      </span>
                                      <span>{err.message}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Validation rule reference — cites rule IDs from ONDC_SKU_Validation_Rules */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-semibold mb-1">Validation rules (ONDC eB2B SKU, 23-Apr-2026):</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><span className="font-mono">V-001</span> Item Status — enum <span className="font-mono">enable</span>/<span className="font-mono">disable</span> (lowercase).</li>
                <li><span className="font-mono">V-002</span> Item Name — 3–100 chars, brand + variant + pack size, unique per location.</li>
                <li><span className="font-mono">V-003</span> Item Code — <span className="font-mono">type:code</span> (1=EAN 13d, 2=ISBN 10/13d, 3=GTIN 8/12/13/14d, 4=HSN 4–8d, 5=Others). EAN/GTIN checksum enforced.</li>
                <li><span className="font-mono">V-004</span> Thumbnail — HTTPS URL; .png/.jpg/.jpeg/.webp only; ≤ 2 MB.</li>
                <li><span className="font-mono">V-005</span> Short Desc — 10–150 chars, no HTML, no line breaks.</li>
                <li><span className="font-mono">V-006</span> Long Desc — 20–1000 chars, no HTML/scripts.</li>
                <li><span className="font-mono">V-007</span> Additional Images — max 8; same URL rules as thumbnail.</li>
                <li><span className="font-mono">V-008</span> Pack Size — positive integer, ≤ 10,000.</li>
                <li><span className="font-mono">V-009</span> Measure Unit — unit/dozen/gram/kilogram/tonne/litre/millilitre (lowercase).</li>
                <li><span className="font-mono">V-010</span> Measure Value — positive number, up to 3 decimals.</li>
                <li><span className="font-mono">V-011</span> Available Count — integer 0–99.</li>
                <li><span className="font-mono">V-012/13/27</span> Min ≤ Max ≤ Available Count.</li>
                <li><span className="font-mono">V-019</span> Time to Ship — ISO-8601 duration between PT15M and P7D.</li>
                <li><span className="font-mono">V-021</span> Consumer Care — <span className="font-mono">name,email,contact_no</span> (no spaces; name letters only; 10–11 digit phone).</li>
                <li><span className="font-mono">V-022/23/29</span> Manufacturer Name & Address — required for packaged commodities (address must contain 6-digit PIN).</li>
                <li><span className="font-mono">V-024</span> Country of Origin — ISO 3166-1 alpha-3 uppercase (e.g., IND).</li>
                <li><span className="font-mono">V-025</span> Brand — 2–50 chars, letters/digits/spaces/hyphen/apostrophe.</li>
                <li><span className="font-mono">V-028</span> Return Window required when Returnable = true (P1D..P30D).</li>
                <li><span className="font-mono">V-032</span> Duplicate item code / item name rejected within the same location.</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSkuOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImportValid}
              disabled={!validationResult || validationResult.validRows === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import {validationResult?.validRows ?? 0} Valid SKU
              {(validationResult?.validRows ?? 0) !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}