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
import {
  importBizomCsv,
  BizomValidationResult,
  BIZOM_REQUIRED_HEADERS,
  AggregatedSKU,
} from "../../lib/bizom-validation";
import { Layers } from "lucide-react";

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
  // Price & Inventory fields — merged into the SKU record (previously on a separate page)
  mrp?: number;
  sellingPrice?: number;
  availableStock?: number;
  isInfiniteStock?: boolean;
  thresholdLevel?: number;
  reservedStock?: number;
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
    mrp: 3091, sellingPrice: 2810, availableStock: 1, isInfiniteStock: false, thresholdLevel: 5, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 2838, sellingPrice: 2580, availableStock: 252, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 188, sellingPrice: 171, availableStock: 642, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
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
    mrp: 191, sellingPrice: 174, availableStock: 27, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 388, sellingPrice: 353, availableStock: 1, isInfiniteStock: false, thresholdLevel: 5, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 190, sellingPrice: 173, availableStock: 0, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 963, sellingPrice: 875, availableStock: 138, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
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
    mrp: 194, sellingPrice: 176, availableStock: 12, isInfiniteStock: false, thresholdLevel: 5, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 172, sellingPrice: 156, availableStock: 9, isInfiniteStock: false, thresholdLevel: 5, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 190, sellingPrice: 173, availableStock: 28, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    mrp: 179, sellingPrice: 163, availableStock: 50, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
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
    mrp: 129, sellingPrice: 117.4, availableStock: 19, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "Unit Value", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
];


// Bulk-import columns — Phase-change:
// The import file now carries ONLY the SKU Code and SKU Name. All other ONDC fields
// are filled in per-SKU via the SKU Detail page and validated on save there.
const ONDC_REQUIRED_COLUMNS = ["SKU Code", "SKU Name"];
const ONDC_OPTIONAL_COLUMNS: string[] = [];

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

  // Price & Stock bulk update dialog (Bizom DMS export)
  const [isPriceStockOpen, setIsPriceStockOpen] = useState(false);
  const [psFile, setPsFile] = useState<File | null>(null);
  const [isPsValidating, setIsPsValidating] = useState(false);
  const [psResult, setPsResult] = useState<BizomValidationResult | null>(null);
  const [psSkippedSkus, setPsSkippedSkus] = useState<AggregatedSKU[]>([]);
  const [psView, setPsView] = useState<"aggregated" | "batches">("aggregated");
  const psFileInputRef = useRef<HTMLInputElement | null>(null);

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
    // Phase-change: template only needs SKU Code + SKU Name.
    // All other ONDC attributes are filled in from the SKU Detail page.
    const headers = ONDC_REQUIRED_COLUMNS.map((c) => `${c}*`);
    const sampleRows: string[][] = [
      ["180000005", "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN"],
      ["180000006", "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN"],
      ["180000008", "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS."],
    ];

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

      // The import file has only two columns. Accept a few common header spellings.
      const skuCodeIdx = headers.findIndex((h) =>
        /^(sku code|sku id|item code|skucode)$/i.test(h),
      );
      const skuNameIdx = headers.findIndex((h) =>
        /^(sku name|item name|name)$/i.test(h),
      );

      if (skuCodeIdx < 0 || skuNameIdx < 0) {
        setIsValidating(false);
        toast.error(
          "File must contain 'SKU Code' and 'SKU Name' columns. Use the sample template.",
        );
        return;
      }

      const seenCodes = new Set<string>();
      // Existing catalog — for ERR_IMP_004 (SKU already exists, new-SKU import rejects)
      const existingCatalogCodes = new Set(skus.map((s) => s.sku));

      const details: ValidationRow[] = dataRows.map((cols, idx) => {
        const rowNumber = idx + 2;
        const skuCode = (cols[skuCodeIdx] ?? "").trim();
        const skuName = (cols[skuNameIdx] ?? "").trim();

        // Phase-change: only two fields are imported; the rest of the ONDC fields are
        // filled later from the SKU Detail page (validated on save there).
        const errors: ValidationError[] = [];
        if (!skuCode) {
          errors.push({
            ruleId: "V-001-IMP",
            code: "ERR_IMP_001",
            field: "SKU Code",
            message: "SKU Code is required.",
          });
        } else if (!/^[A-Za-z0-9_-]+$/.test(skuCode)) {
          errors.push({
            ruleId: "V-001-IMP",
            code: "ERR_IMP_001",
            field: "SKU Code",
            message: "SKU Code must be alphanumeric (letters, digits, dashes, or underscores).",
          });
        } else if (seenCodes.has(skuCode)) {
          errors.push({
            ruleId: "V-003-IMP",
            code: "ERR_IMP_003",
            field: "SKU Code",
            message: "Duplicate SKU Code in this file — already appeared in an earlier row.",
          });
        } else if (existingCatalogCodes.has(skuCode)) {
          // SKU Code is the uniqueness key. A new-SKU import cannot create an existing one.
          errors.push({
            ruleId: "V-004-IMP",
            code: "ERR_IMP_004",
            field: "SKU Code",
            message: `SKU "${skuCode}" already exists in your catalog. Use the Price & Stock Update flow to modify it.`,
          });
        }

        if (!skuName) {
          errors.push({
            ruleId: "V-002-IMP",
            code: "ERR_IMP_002",
            field: "SKU Name",
            message: "SKU Name is required.",
          });
        } else if (skuName.length < 3 || skuName.length > 100) {
          errors.push({
            ruleId: "V-002-IMP",
            code: "ERR_IMP_002",
            field: "SKU Name",
            message: "SKU Name must be between 3 and 100 characters.",
          });
        }

        if (skuCode) seenCodes.add(skuCode);

        const input: SKUInput = {
          itemCode: skuCode,
          itemName: skuName,
        };

        return {
          rowNumber,
          skuCode,
          skuName,
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

  // ---- Price & Stock update (Bizom DMS bulk import) ----
  // Business rule: if the SKU Code from the file does NOT exist in the catalog, the row
  // is silently skipped (no error, no record created). Only existing SKUs get their
  // price and stock updated.
  const handleDownloadPsSample = () => {
    const headers = [
      ...BIZOM_REQUIRED_HEADERS,
      "Saleable Stock( Case ),Saleable Stock( Unit )",
      "Total Non-Saleable Stock( Case ),Total Non-Saleable Stock( Unit )",
      "In Transit Stock( Case ),In Transit Stock( Unit )",
      "Total Stock( Case ),Total Stock( Unit )",
      "Amount/Value",
      "Stock Turnover Ratio(No. of days stock will last)",
    ];
    const sample = [
      ["2", "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN", "180000005", "26106600284101", "2026-04-06", "2026-07-05", "0.00000", "2810.00000", "5.00", "'1,0", "0,0", "0,0", "'1,0", "2810", "0", ""],
      ["3", "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN", "180000006", "26106600591101", "2026-04-08", "2026-07-07", "0.00000", "2580.00000", "5.00", "'52,0", "0,0", "0,0", "'52,0", "134160", "3", ""],
    ];
    const toCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      headers.map(toCell).join(","),
      ...sample.map((r) => r.map(toCell).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bizom_Price_Stock_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample template downloaded");
  };

  const handlePsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(csv|xlsx|xls)$/i.test(f.name)) {
      toast.error("Invalid file format. Upload .csv, .xlsx, or .xls.");
      return;
    }
    setPsFile(f);
    setIsPsValidating(true);
    setPsResult(null);
    setPsSkippedSkus([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const result = importBizomCsv(text);
      // Silent-skip: split aggregated SKUs into those present in the catalog vs not.
      const catalog = new Set(skus.map((s) => s.sku));
      const matched: AggregatedSKU[] = [];
      const skipped: AggregatedSKU[] = [];
      for (const agg of result.aggregated) {
        if (catalog.has(agg.skuCode)) matched.push(agg);
        else skipped.push(agg);
      }
      setPsResult({ ...result, aggregated: matched });
      setPsSkippedSkus(skipped);
      setIsPsValidating(false);

      if (result.fileLevelErrors.length > 0) {
        toast.error(result.fileLevelErrors[0].message);
      } else if (matched.length === 0 && skipped.length === 0) {
        toast.warning("No valid SKUs found in the file.");
      } else {
        toast.success(
          `${matched.length} SKU(s) ready to update${skipped.length > 0 ? `, ${skipped.length} skipped (not in catalog)` : ""}.`,
        );
      }
    };
    reader.readAsText(f);
  };

  const handleApplyPriceStock = () => {
    if (!psResult || psResult.aggregated.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    const byCode = new Map(psResult.aggregated.map((s) => [s.skuCode, s]));
    setSkus((prev) =>
      prev.map((s) => {
        const agg = byCode.get(s.sku);
        if (!agg) return s;
        return {
          ...s,
          mrp: agg.mrp,
          sellingPrice: agg.sellingPrice,
          availableStock: agg.totalStock,
          lastUpdated: today,
          source: "DMS Sync",
        };
      }),
    );
    toast.success(
      `Updated price & stock for ${psResult.aggregated.length} SKU(s)${psSkippedSkus.length > 0 ? ` — ${psSkippedSkus.length} row(s) skipped (unknown SKU Code)` : ""}.`,
    );
    setIsPriceStockOpen(false);
    setPsFile(null);
    setPsResult(null);
    setPsSkippedSkus([]);
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2 flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      Bulk Import
                      <MoreVertical className="h-3.5 w-3.5 opacity-80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem onClick={handleOpenAddSku} className="gap-2 cursor-pointer">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Add New SKUs</p>
                        <p className="text-[11px] text-gray-500">Create SKU stubs (SKU Code + Name)</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsPriceStockOpen(true)} className="gap-2 cursor-pointer">
                      <Database className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Update Price & Stock</p>
                        <p className="text-[11px] text-gray-500">From Bizom DMS export</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                          <Badge
                            className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1"
                            title="All ONDC fields are filled in correctly."
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            ONDC Compliant
                          </Badge>
                        ) : (
                          <div
                            className="inline-flex flex-col items-center gap-0.5"
                            title={`Missing / invalid fields: ${sku.ondcCompliance.missingFields.join(", ") || "—"}`}
                          >
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {sku.ondcCompliance.missingFields.length} field
                              {sku.ondcCompliance.missingFields.length === 1 ? "" : "s"} pending
                            </Badge>
                            <span className="text-[10px] text-gray-500">
                              Needs attention
                            </span>
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

      {/* Price & Stock Update Dialog (Bizom DMS) — silent-skip for unknown SKU codes */}
      <Dialog open={isPriceStockOpen} onOpenChange={setIsPriceStockOpen}>
        <DialogContent className="!max-w-[min(96vw,1280px)] w-[min(96vw,1280px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Database className="h-5 w-5 text-purple-600" />
              Update Price & Stock — Bulk Import (Bizom DMS)
            </DialogTitle>
            <DialogDescription>
              Upload the Bizom DMS export. Only existing SKUs are updated — rows whose SKU Code
              does not exist in your catalog are <b>silently skipped</b> (no error, no record
              created). Stock is summed across batches; prices follow the max-price-wins rule.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Download sample template</p>
                    <p className="text-xs text-gray-600 mt-0.5">Matches the Bizom DMS Price & Inventory export format.</p>
                    <div className="flex items-center gap-2 mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">Bizom_Price_Stock_Template.csv</p>
                        <p className="text-[10px] text-gray-500">Same columns as the Bizom DMS export</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDownloadPsSample} className="gap-1 h-7 px-2 text-xs">
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Upload Bizom DMS export</p>
                    <p className="text-xs text-gray-600 mt-0.5">Supported: .csv, .xlsx, .xls</p>
                    <input ref={psFileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handlePsFileChange} className="hidden" />
                    {!psFile ? (
                      <button
                        type="button"
                        onClick={() => psFileInputRef.current?.click()}
                        className="mt-2 w-full border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-xs font-medium">Click to browse file</span>
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{psFile.name}</p>
                          <p className="text-[10px] text-gray-500">{(psFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setPsFile(null);
                            setPsResult(null);
                            setPsSkippedSkus([]);
                            if (psFileInputRef.current) psFileInputRef.current.value = "";
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

            {(isPsValidating || psResult) && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-purple-600 font-semibold text-sm">3</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Validation & preview</p>
                  </div>
                  {psResult && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        Batch rows <b>{psResult.totalRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        <FileCheck className="h-3 w-3" /> Valid <b>{psResult.validBatchRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        <FileWarning className="h-3 w-3" /> Invalid <b>{psResult.invalidBatchRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <Layers className="h-3 w-3" /> Will update <b>{psResult.aggregated.length}</b>
                      </span>
                      {psSkippedSkus.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                          title="SKU Code not found in your catalog — silently skipped."
                        >
                          Skipped <b>{psSkippedSkus.length}</b>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isPsValidating && (
                  <p className="text-sm text-gray-600 py-4 text-center">Parsing and validating file…</p>
                )}

                {psResult && (
                  <>
                    {psResult.fileLevelErrors.length > 0 && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        {psResult.fileLevelErrors.map((err, i) => (
                          <p key={i} className="text-xs text-red-700">
                            <span className="font-mono font-semibold">[{err.code}]</span> {err.message}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mb-2 inline-flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setPsView("aggregated")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${psView === "aggregated" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
                      >
                        Will Update ({psResult.aggregated.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPsView("batches")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${psView === "batches" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
                      >
                        Batch Rows ({psResult.totalRows})
                      </button>
                    </div>

                    {psView === "aggregated" ? (
                      <div className="max-h-[45vh] overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-left">
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">SKU Code</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Name</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">Batches</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">MRP (max)</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">Selling Price (max)</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">Total Stock</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {psResult.aggregated.map((agg) => (
                              <tr key={agg.skuCode} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-xs text-gray-700">{agg.skuCode}</td>
                                <td className="px-3 py-2 text-gray-900">{agg.skuName}</td>
                                <td className="px-3 py-2 text-center">
                                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">{agg.batchCount}</Badge>
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">₹{agg.mrp.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-semibold text-green-700">₹{agg.sellingPrice.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">{agg.totalStock}</td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {agg.hasPriceDivergence && (
                                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]" title="Batches had different prices — system took the maximum.">
                                        Price varied
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {psSkippedSkus.map((agg) => (
                              <tr key={"sk-" + agg.skuCode} className="bg-amber-50/40">
                                <td className="px-3 py-2 font-mono text-xs text-gray-500">{agg.skuCode}</td>
                                <td className="px-3 py-2 text-gray-500">{agg.skuName}</td>
                                <td className="px-3 py-2 text-center text-gray-500">{agg.batchCount}</td>
                                <td className="px-3 py-2 text-right text-gray-500">—</td>
                                <td className="px-3 py-2 text-right text-gray-500">—</td>
                                <td className="px-3 py-2 text-right text-gray-500">—</td>
                                <td className="px-3 py-2">
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                    Skipped — SKU not in catalog
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                            {psResult.aggregated.length === 0 && psSkippedSkus.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">
                                  No valid SKUs to update.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="max-h-[45vh] overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-left">
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-14">Row</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">SKU Code</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Batch</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">MRP</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">Price</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-28">Status</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Errors</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {psResult.batchRows.map((b) => (
                              <tr key={b.raw.rowNumber} className={b.status === "invalid" ? "bg-red-50/50" : ""}>
                                <td className="px-3 py-2 text-gray-700 align-top">{b.raw.rowNumber}</td>
                                <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">{b.raw.skuCode || "—"}</td>
                                <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">{b.raw.batch || "—"}</td>
                                <td className="px-3 py-2 text-right text-gray-900 align-top">₹{b.parsed.mrp.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-green-700 align-top">₹{b.parsed.sellingPrice.toFixed(2)}</td>
                                <td className="px-3 py-2 align-top">
                                  {b.status === "valid" ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                                      <CheckCircle2 className="h-3 w-3" /> Valid
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                                      <AlertCircle className="h-3 w-3" /> {b.errors.length}
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  {b.errors.length === 0 ? (
                                    <span className="text-xs text-green-700">All checks passed.</span>
                                  ) : (
                                    <ul className="space-y-1 text-xs text-red-700">
                                      {b.errors.map((err, i) => (
                                        <li key={i} className="flex gap-2">
                                          <span className="font-mono font-semibold text-[10px] bg-red-100 text-red-800 border border-red-200 px-1 py-0.5 rounded shrink-0 self-start">
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
                  </>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-semibold mb-1">Rules for Price & Stock update:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>SKUs that exist in your catalog are updated — MRP = max across batches, Selling Price = max across batches, Stock = sum of saleable batches.</li>
                <li>Rows whose <b>SKU Code is not in your catalog</b> are <b>silently skipped</b> — no error is raised, no new SKU is created.</li>
                <li>Batch-level errors (negative price/stock, MRP &lt; SP, invalid dates, duplicates) still reject only those specific rows.</li>
                <li>To add a brand-new SKU, use <b>Bulk Import → Add New SKUs</b>.</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceStockOpen(false)}>Cancel</Button>
            <Button
              onClick={handleApplyPriceStock}
              disabled={!psResult || psResult.aggregated.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Update {psResult?.aggregated.length ?? 0} SKU{(psResult?.aggregated.length ?? 0) !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SKU — Bulk Import Dialog */}
      <Dialog open={isAddSkuOpen} onOpenChange={setIsAddSkuOpen}>
        <DialogContent className="!max-w-[min(95vw,1200px)] w-[min(95vw,1200px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-blue-600" />
              Add SKU — Bulk Import
            </DialogTitle>
            <DialogDescription>
              Upload a file containing just <b>SKU Code</b> and <b>SKU Name</b>. Imported SKUs are
              created as stubs — every other ONDC field is filled in from the SKU Detail page and
              fully validated there when you click <b>Save</b>.
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

            {/* Validation rules — simplified: import file only carries SKU Code + SKU Name */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-semibold mb-1">Import validation rules (SKU stubs only):</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><span className="font-mono">ERR_IMP_001</span> SKU Code required, alphanumeric (letters, digits, dashes or underscores).</li>
                <li><span className="font-mono">ERR_IMP_002</span> SKU Name required, 3–100 characters.</li>
                <li><span className="font-mono">ERR_IMP_003</span> Duplicate SKU Code within the same file is rejected.</li>
                <li><span className="font-mono">ERR_IMP_004</span> SKU Code already exists in catalog — use the <b>Price & Stock Update</b> flow to modify it.</li>
              </ul>
              <p className="mt-2 text-[11px]">
                <b>Note:</b> Only SKU Code and SKU Name are imported. All other ONDC fields
                (Item Code, Thumbnail, Descriptions, Measure Unit/Value, Commerce Attributes,
                Consumer Care, Country of Origin, Brand, etc.) are filled in per-SKU on the
                <b> SKU Detail</b> page and fully validated on <b>Save</b> against ONDC rules
                (V-001 → V-033).
              </p>
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