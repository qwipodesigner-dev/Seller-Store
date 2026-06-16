import { useState } from "react";
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
  Send,
  Info,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Layers, PackageSearch } from "lucide-react";
import { isEmptyMode } from "../../lib/data-mode";
import { getMySkus } from "../../lib/my-sku-store";
import { EmptyState } from "../../components/empty-state";
import { CopyOnHover } from "../../components/copy-on-hover";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  BulkImportDialog,
  type BulkImportValidationResult,
  type BulkImportError as BulkImportErrorRow,
} from "../../components/bulk-import-dialog";
import { ProductStoreBrowse } from "../../components/product-store-browse";
import {
  SkuFormFields,
  type SkuFormState,
  emptySkuForm,
} from "../../components/sku-form-fields";
import { addFromProductStore, isImportedFromPS } from "../../lib/my-sku-store";
import {
  downloadSkuTemplate,
  parseSkuImportFile,
  SKU_FIELDS,
  type ParsedSkuRow,
} from "../../lib/sku-import-template";
import {
  psSkus,
  getBrandById,
  getCategoryById,
  addPsRequest,
  type PSCompany,
  type PSBrand,
  type PSSku,
} from "../../lib/product-store-data";
import { addSkuRequest } from "../../lib/sku-request-store";
import { sampleSKUs, type SKUData } from "../../lib/my-sku-data";
export type { SKUData } from "../../lib/my-sku-data";
export { sampleSKUs } from "../../lib/my-sku-data";


// Bulk-import columns — Phase-change:
// The import file now carries ONLY the SKU Code and SKU Name. All other ONDC fields
// are filled in per-SKU via the SKU Detail page and validated on save there.
const ONDC_REQUIRED_COLUMNS = ["SKU Code", "SKU Name"];
const ONDC_OPTIONAL_COLUMNS: string[] = [];

export function MySKU() {
  const navigate = useNavigate();
  const [skus, setSkus] = useState<SKUData[]>(() =>
    isEmptyMode() ? [] : getMySkus(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add SKU + Price/Stock bulk import are both driven through the
  // shared <BulkImportDialog>. Each owns only its open flag; the
  // dialog handles upload, validation, results, and import flow.
  const [isAddSkuBulkOpen, setIsAddSkuBulkOpen] = useState(false);
  const [isPriceStockBulkOpen, setIsPriceStockBulkOpen] = useState(false);

  // Product Store panel — opened via "Add from Product Store" button
  const [isProductStoreOpen, setIsProductStoreOpen] = useState(false);
  const [psImportSku, setPsImportSku] = useState<PSSku | null>(null);
  const [psBulkImport, setPsBulkImport] = useState<{ label: string; skus: PSSku[] } | null>(null);
  const [showPSRequestDialog, setShowPSRequestDialog] = useState(false);
  const [psReqForm, setPsReqForm] = useState<SkuFormState>(emptySkuForm);
  const [psReqImages, setPsReqImages] = useState<string[]>([]);
  const [showCompanyRequestDialog, setShowCompanyRequestDialog] = useState(false);
  const [companyReqName, setCompanyReqName] = useState("");
  const [companyReqMessage, setCompanyReqMessage] = useState("");
  const [showBrandRequestDialog, setShowBrandRequestDialog] = useState(false);
  const [brandReqName, setBrandReqName] = useState("");
  const [brandReqMessage, setBrandReqMessage] = useState("");
  const [brandReqCompanyName, setBrandReqCompanyName] = useState("");
  const [addedPsSkuIds, setAddedPsSkuIds] = useState<Set<string>>(
    () => new Set(psSkus.map((s) => s.id).filter((id) => isImportedFromPS(id)))
  );


  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [ondcFilter, setOndcFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(skus.map((s) => s.category))).sort();
  const uniqueBrands = Array.from(new Set(skus.map((s) => s.brand))).sort();

  // Filtered SKUs
  const filteredSKUs = skus.filter((sku) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sku.name.toLowerCase().includes(q) ||
      sku.sku.toLowerCase().includes(q) ||
      sku.brand.toLowerCase().includes(q) ||
      (sku.shortName ? sku.shortName.toLowerCase().includes(q) : false);

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

  // Render Product Store as full page content so the sidebar stays visible
  // ---- Add SKU bulk import ----
  // Both flows (Add SKU + Price/Stock) drive the shared
  // <BulkImportDialog>. The validate / onImport closures below adapt
  // the existing parsing logic to the standardized
  // BulkImportValidationResult shape so the dialog renders the same
  // summary card + Row/Field/Error table for every module.
  const handleDownloadAddSkuSample = async () => {
    try {
      await downloadSkuTemplate();
      toast.success("SKU import template downloaded");
    } catch (err) {
      console.error("Failed to generate SKU template", err);
      toast.error("Couldn't generate the template — please try again.");
    }
  };

  // Plain CSV parser shared by both validate adapters. Handles quoted
  // fields with embedded commas and escaped quotes.
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

  const readFileText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(String(ev.target?.result || ""));
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsText(file);
    });

  // Validate uploaded Add-SKU file → returns the standardized result
  // shape consumed by <BulkImportDialog>. Phase 2: file is a 3-tab
  // .xlsx with every SKU field as a column. Validation walks the
  // SKU_FIELDS schema so the rules stay aligned with the template.
  const validateAddSkuFile = async (
    file: File,
  ): Promise<BulkImportValidationResult> => {
    const parsed = await parseSkuImportFile(file);
    const errors: BulkImportErrorRow[] = [];

    if (parsed.fatalError) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [{ row: 1, field: "File", error: parsed.fatalError }],
        validData: [],
      };
    }
    if (parsed.rows.length === 0) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          {
            row: 1,
            field: "File",
            error:
              "Couldn't find any data rows. Use the Main SKU Upload sheet from the downloaded template.",
          },
        ],
        validData: [],
      };
    }
    // Header sanity — at minimum SKU Code + SKU Name must be present.
    const haveSkuCode = parsed.rows.some((r) => "skuCode" in r);
    const haveSkuName = parsed.rows.some((r) => "skuName" in r);
    if (!haveSkuCode || !haveSkuName) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          {
            row: 1,
            field: "Header",
            error:
              "File must contain 'SKU Code' and 'SKU Name' columns. Use the downloaded template.",
          },
        ],
        validData: [],
      };
    }

    const seenCodes = new Set<string>();
    const existing = new Set(skus.map((s) => s.sku));
    const validData: ParsedSkuRow[] = [];
    let validCount = 0;
    // The Main sheet starts at row 1 (header). Helper row is row 2.
    // Data rows therefore begin at spreadsheet row 3.
    const ROW_OFFSET = 3;

    parsed.rows.forEach((row, idx) => {
      const rowNumber = idx + ROW_OFFSET;
      const skuCode = (row.skuCode ?? "").trim();
      const skuName = (row.skuName ?? "").trim();
      const skuLabel = skuName || (skuCode ? `SKU ${skuCode}` : `Row ${rowNumber}`);
      const rowErrors: BulkImportErrorRow[] = [];

      // PS fast-path: if the SKU Code matches a Product Store SKU, skip
      // field-level validation entirely — Category 1 fields are overridden
      // from the catalog on import anyway. Only block duplicates.
      if (skuCode) {
        const psSku = psSkus.find((s) => s.skuCode === skuCode);
        if (psSku) {
          if (seenCodes.has(skuCode)) {
            errors.push({ row: rowNumber, field: "SKU Code", error: "Duplicate SKU Code in this file.", skuLabel, skuCode, skuName, value: skuCode });
            return;
          }
          seenCodes.add(skuCode);
          validCount++;
          validData.push({ ...row, _psSkuId: psSku.id });
          return;
        }
      }

      // Walk the schema: every mandatory field must be filled, and any
      // field with options must take a listed value. Custom format
      // checks for the heavy fields (SKU Code, email, phone, lat/lng-
      // style numbers etc.) follow.
      SKU_FIELDS.forEach((f) => {
        const value = (row[f.key] ?? "").trim();
        if (f.mandatory && value === "") {
          rowErrors.push({
            row: rowNumber,
            field: f.header,
            error: `${f.header} is required.`,
            skuLabel,
            skuCode,
            skuName,
            value,
          });
          return;
        }
        if (value === "") return; // optional + blank → skip further checks
        if (f.options && !f.options.includes(value)) {
          rowErrors.push({
            row: rowNumber,
            field: f.header,
            error: `${f.header} must be one of: ${f.options.join(", ")}.`,
            skuLabel,
            skuCode,
            skuName,
            value,
          });
        }
      });

      // Field-specific format checks (only the rules the schema can't
      // express declaratively). Every push carries skuCode + the
      // exact value so the downloadable error report can show
      // SKU Code, SKU Name, Field, Value Entered, Validation Message.
      if (skuCode) {
        if (!/^[A-Za-z0-9_-]+$/.test(skuCode)) {
          rowErrors.push({
            row: rowNumber,
            field: "SKU Code",
            error: "SKU Code must be alphanumeric (letters, digits, dashes, underscores).",
            skuLabel,
            skuCode,
            skuName,
            value: skuCode,
          });
        } else if (seenCodes.has(skuCode)) {
          rowErrors.push({
            row: rowNumber,
            field: "SKU Code",
            error: "Duplicate SKU Code in this file.",
            skuLabel,
            skuCode,
            skuName,
            value: skuCode,
          });
        } else if (existing.has(skuCode)) {
          rowErrors.push({
            row: rowNumber,
            field: "SKU Code",
            error: `SKU "${skuCode}" already exists. Use the Price & Stock Update flow to modify it.`,
            skuLabel,
            skuCode,
            skuName,
            value: skuCode,
          });
        }
      }
      if (skuName && (skuName.length < 3 || skuName.length > 100)) {
        rowErrors.push({
          row: rowNumber,
          field: "SKU Name",
          error: "SKU Name must be between 3 and 100 characters.",
          skuLabel,
          skuCode,
          skuName,
          value: skuName,
        });
      }

      const shortDesc = (row.shortDesc ?? "").trim();
      if (shortDesc && (shortDesc.length < 10 || shortDesc.length > 150)) {
        rowErrors.push({
          row: rowNumber,
          field: "Short Description",
          error: "Short Description must be between 10 and 150 characters.",
          skuLabel,
          skuCode,
          skuName,
          value: shortDesc,
        });
      }
      const longDesc = (row.longDesc ?? "").trim();
      if (longDesc && longDesc.length > 200) {
        rowErrors.push({
          row: rowNumber,
          field: "Long Description",
          error: "Long Description can't exceed 200 characters.",
          skuLabel,
          skuCode,
          skuName,
          value: longDesc,
        });
      }

      // Numeric ranges
      const positiveInt = (raw: string) => {
        const n = Number(raw);
        return Number.isInteger(n) && n > 0;
      };
      const numericOnly = (raw: string) => /^\d+$/.test(raw);
      if (row.measureValue && !positiveInt(row.measureValue)) {
        rowErrors.push({
          row: rowNumber,
          field: "SKU Weight",
          error: "SKU Weight must be a positive number.",
          skuLabel,
          skuCode,
          skuName,
          value: row.measureValue,
        });
      }
      if (row.unitizedCount && !positiveInt(row.unitizedCount)) {
        rowErrors.push({
          row: rowNumber,
          field: "Pack Size",
          error: "Pack Size must be a positive whole number.",
          skuLabel,
          skuCode,
          skuName,
          value: row.unitizedCount,
        });
      }
      if (row.upc && !numericOnly(row.upc)) {
        rowErrors.push({
          row: rowNumber,
          field: "UPC",
          error: "UPC must contain digits only.",
          skuLabel,
          skuCode,
          skuName,
          value: row.upc,
        });
      }
      if (row.packageTypeValue) {
        const n = Number(row.packageTypeValue);
        if (!Number.isFinite(n) || n <= 0) {
          rowErrors.push({
            row: rowNumber,
            field: "Package Type Value",
            error: "Package Type Value must be a positive number.",
            skuLabel,
            skuCode,
            skuName,
            value: row.packageTypeValue,
          });
        }
      }
      // Weight in KG is no longer user-input — the parser derives it
      // from Weight Measure × SKU Weight before we get here, so any
      // value that lands in row.skuWeight is the system-computed kg
      // figure and doesn't need its own validation rule.
      const minQ = row.minimumOrderQty
        ? Number(row.minimumOrderQty)
        : undefined;
      const maxQ = row.maximumOrderQty
        ? Number(row.maximumOrderQty)
        : undefined;
      if (row.minimumOrderQty && (!Number.isInteger(minQ!) || minQ! <= 0)) {
        rowErrors.push({
          row: rowNumber,
          field: "Min Order Quantity",
          error: "Min Order Quantity must be a positive whole number.",
          skuLabel,
          skuCode,
          skuName,
          value: row.minimumOrderQty,
        });
      }
      if (row.maximumOrderQty && (!Number.isInteger(maxQ!) || maxQ! <= 0)) {
        rowErrors.push({
          row: rowNumber,
          field: "Max Order Quantity",
          error: "Max Order Quantity must be a positive whole number.",
          skuLabel,
          skuCode,
          skuName,
          value: row.maximumOrderQty,
        });
      }
      if (
        minQ !== undefined &&
        maxQ !== undefined &&
        Number.isFinite(minQ) &&
        Number.isFinite(maxQ) &&
        minQ > maxQ
      ) {
        rowErrors.push({
          row: rowNumber,
          field: "Min Order Quantity",
          error: "Min Order Quantity can't be greater than Max Order Quantity.",
          skuLabel,
          skuCode,
          skuName,
          value: `Min ${row.minimumOrderQty} > Max ${row.maximumOrderQty}`,
        });
      }

      // Customer Care
      if (row.consumerCareContactName && !/^[A-Za-z .'-]+$/.test(row.consumerCareContactName)) {
        rowErrors.push({
          row: rowNumber,
          field: "Customer Care Name",
          error: "Customer Care Name can only contain letters.",
          skuLabel,
          skuCode,
          skuName,
          value: row.consumerCareContactName,
        });
      }
      if (
        row.consumerCareContactEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.consumerCareContactEmail)
      ) {
        rowErrors.push({
          row: rowNumber,
          field: "Customer Care Email",
          error: "Customer Care Email must be a valid email address.",
          skuLabel,
          skuCode,
          skuName,
          value: row.consumerCareContactEmail,
        });
      }
      if (
        row.consumerCareContactPhone &&
        !/^\d{10}$/.test(row.consumerCareContactPhone)
      ) {
        rowErrors.push({
          row: rowNumber,
          field: "Customer Care Phone",
          error: "Customer Care Phone must be exactly 10 digits.",
          skuLabel,
          skuCode,
          skuName,
          value: row.consumerCareContactPhone,
        });
      }
      if (
        row.manufacturerAddress &&
        (row.manufacturerAddress.length < 10 ||
          row.manufacturerAddress.length > 250)
      ) {
        rowErrors.push({
          row: rowNumber,
          field: "Manufacturer Address",
          error: "Manufacturer Address must be 10–250 characters.",
          skuLabel,
          skuCode,
          skuName,
          value: row.manufacturerAddress,
        });
      }

      if (skuCode) seenCodes.add(skuCode);
      if (rowErrors.length === 0) {
        validCount++;
        validData.push({ ...row });
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      totalRows: parsed.rows.length,
      validRows: validCount,
      invalidRows: parsed.rows.length - validCount,
      errors,
      validData,
    };
  };

  // Apply validated Add-SKU rows into the catalog. When a row carries
  // _psSkuId (set during PS cross-check), Category 1 fields are merged
  // from the Product Store; Category 2 fields (pricing, stock) come
  // from the sheet.
  const importAddSkuRows = (rows: unknown[]) => {
    const valid = rows as ParsedSkuRow[];
    const today = new Date().toISOString().split("T")[0];
    const newSkus: SKUData[] = valid.map((row, idx) => {
      const psSku = row._psSkuId ? psSkus.find((s) => s.id === row._psSkuId) : undefined;
      const status =
        (row.itemStatus ?? "").toLowerCase() === "inactive" ? "Inactive" : "Active";
      if (psSku) {
        // Merge: Category 1 from PS, Category 2 from sheet
        const brand = getBrandById(psSku.brandId);
        const category = getCategoryById(psSku.categoryId);
        return {
          id: String(skus.length + idx + 1),
          name: psSku.name,
          category: category?.name ?? psSku.categoryId,
          brand: brand?.name ?? psSku.brandId,
          source: "PS + Excel Import",
          status,
          lastUpdated: today,
          sku: psSku.skuCode,
          ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
        };
      }
      return {
        id: String(skus.length + idx + 1),
        name: row.skuName ?? "",
        category: row.categoryId || "Imported",
        brand: row.brandAttribute || "—",
        source: "Excel Import",
        status,
        lastUpdated: today,
        sku: row.skuCode ?? "",
        ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
      };
    });
    setSkus((prev) => [...newSkus, ...prev]);
  };

  // ---- Price & Stock update (Story 19128) ----
  // The seller downloads a sheet pre-filled with their existing catalog
  // (every SKU + its current MRP / Selling Price / Available Stock /
  // Infinite Stock), edits only those four columns offline, and
  // re-uploads. Rows are matched by SKU Code; unknown codes are
  // REJECTED (not silently skipped — the story is explicit on that).
  // Unchanged rows are skipped silently. The cap is 500 rows per
  // upload. Apply is atomic — either every valid row's update saves
  // or none.

  /** Columns on the downloaded template — read-only identifier columns
   *  first, then the three editable columns. The header is locked by
   *  spec; the validator below rejects files with a different header.
   *  Available Stock is a Yes/No availability flag (the earlier numeric
   *  Available Stock + separate Infinite Stock column have been merged
   *  into a single Yes/No availability toggle). */
  const PS_TEMPLATE_HEADERS = [
    "SKU Code",
    "SKU Name",
    "Brand",
    "Category",
    "MRP",
    "Selling Price",
    "Available Stock",
  ] as const;

  /** Max number of data rows in one upload (BR-8 of the story). */
  const PS_MAX_ROWS = 500;

  /** Derive the current Yes/No availability of an existing SKU. A SKU is
   *  available when it's flagged as infinite stock OR has at least one
   *  unit on hand. */
  const psCurrentAvailability = (s: SKUData): "Yes" | "No" =>
    s.isInfiniteStock || (s.availableStock ?? 0) > 0 ? "Yes" : "No";

  /** Build the per-row data for the Price & Stock template (every
   *  existing SKU in the seller's catalog with its current values).
   *  Both the CSV and XLSX paths share this. */
  const buildPsTemplateRows = () =>
    skus.map((s) => [
      s.sku,
      s.name,
      s.brand,
      s.category,
      s.mrp ?? "",
      s.sellingPrice ?? "",
      psCurrentAvailability(s),
    ]);

  const triggerBrowserDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPsAsCsv = () => {
    const toCell = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = buildPsTemplateRows();
    const csv = [
      PS_TEMPLATE_HEADERS.map(toCell).join(","),
      ...rows.map((r) => r.map(toCell).join(",")),
    ].join("\r\n");
    // UTF-8 BOM so Excel opens the file with the correct encoding for
    // Indian-language SKU names.
    triggerBrowserDownload(
      new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }),
      "price_stock_update_template.csv",
    );
    return rows.length;
  };

  const downloadPsAsXlsx = async () => {
    // ExcelJS is a ~900 KB chunk — dynamic-imported so it doesn't ship
    // on the initial bundle. Matches the pattern already used by
    // `downloadSkuTemplate` for the Add SKU flow.
    const ExcelJS = (await import("exceljs")).default;
    const rows = buildPsTemplateRows();
    const wb = new ExcelJS.Workbook();
    wb.creator = "Qwipo Seller Store";
    wb.created = new Date();
    const ws = wb.addWorksheet("Price & Stock");
    ws.addRow([...PS_TEMPLATE_HEADERS]);
    rows.forEach((r) => ws.addRow(r));
    // Header styling — bold + blue background matches the Add SKU
    // template's chrome so the two downloads feel like siblings.
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };
    headerRow.height = 22;
    // Column widths sized to the typical content. Tweak if SKU names
    // get longer.
    [16, 60, 18, 18, 12, 14, 18].forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
    ws.views = [{ state: "frozen", ySplit: 1 }];
    const buffer = await wb.xlsx.writeBuffer();
    triggerBrowserDownload(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "price_stock_update_template.xlsx",
    );
    return rows.length;
  };

  const handleDownloadPsSample = async (format?: string) => {
    // Default to CSV when the picker isn't enabled (legacy path).
    const chosen = format ?? "csv";
    try {
      const count =
        chosen === "xlsx" ? await downloadPsAsXlsx() : downloadPsAsCsv();
      toast.success(
        `Sheet downloaded with ${count} SKU${count === 1 ? "" : "s"} pre-filled.`,
      );
    } catch (err) {
      console.error("[my-sku] price/stock template download failed", err);
      toast.error("Couldn't generate the template. Please try again.");
    }
  };

  /** Payload handed off to importPriceStockRows — the validated price
   *  values + a Yes/No availability flag. Read-only columns (SKU Name,
   *  Brand, Category) are intentionally not carried over; the importer
   *  reads them from the existing catalog. */
  type PsValidatedRow = {
    skuCode: string;
    mrp: number;
    sellingPrice: number;
    availability: "Yes" | "No";
  };

  const validatePriceStockFile = async (
    file: File,
  ): Promise<BulkImportValidationResult> => {
    const text = await readFileText(file);
    const rows = parseCsv(text);

    // File-level checks — these short-circuit the row pass.
    if (rows.length === 0) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          {
            row: 1,
            field: "File",
            error:
              "The file is empty. Please add SKU updates and re-upload.",
          },
        ],
        validData: [],
      };
    }
    const header = rows[0].map((h) => h.trim());
    const expected = [...PS_TEMPLATE_HEADERS];
    const headerMismatch =
      header.length !== expected.length ||
      header.some((h, i) => h !== expected[i]);
    if (headerMismatch) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          {
            row: 1,
            field: "File",
            error:
              "This file doesn't match the template. Please download the latest sheet and try again.",
          },
        ],
        validData: [],
      };
    }
    const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ""));
    if (dataRows.length === 0) {
      return {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          {
            row: 1,
            field: "File",
            error:
              "The file is empty. Please add SKU updates and re-upload.",
          },
        ],
        validData: [],
      };
    }
    if (dataRows.length > PS_MAX_ROWS) {
      return {
        totalRows: dataRows.length,
        validRows: 0,
        invalidRows: dataRows.length,
        errors: [
          {
            row: 1,
            field: "File",
            error: `This file has more than ${PS_MAX_ROWS} rows. Please split it into smaller files and upload again.`,
          },
        ],
        validData: [],
      };
    }

    // Index the catalog by SKU Code so the row pass is O(1) per row.
    const byCode = new Map(skus.map((s) => [s.sku, s]));

    const errors: BulkImportErrorRow[] = [];
    const validData: PsValidatedRow[] = [];
    let noChangeRows = 0;

    dataRows.forEach((cols, idx) => {
      const rowNumber = idx + 2; // header was row 1
      const skuCode = (cols[0] ?? "").trim();
      const skuName = (cols[1] ?? "").trim();
      const mrpRaw = (cols[4] ?? "").trim();
      const spRaw = (cols[5] ?? "").trim();
      const availabilityRaw = (cols[6] ?? "").trim();

      // VAL-2 — SKU Code must exist in the catalog.
      const existing = byCode.get(skuCode);
      if (!skuCode) {
        errors.push({
          row: rowNumber,
          field: "SKU Code",
          error: "SKU Code is required.",
          skuCode,
          skuName,
          value: skuCode,
        });
        return;
      }
      if (!existing) {
        errors.push({
          row: rowNumber,
          field: "SKU Code",
          error: "SKU Code not found in your catalog.",
          skuCode,
          skuName,
          value: skuCode,
        });
        return;
      }

      const rowErrors: BulkImportErrorRow[] = [];

      // VAL-3 — MRP > 0.
      const mrp = Number(mrpRaw);
      if (mrpRaw === "" || !Number.isFinite(mrp) || mrp <= 0) {
        rowErrors.push({
          row: rowNumber,
          field: "MRP",
          error: "MRP must be a number greater than zero.",
          skuCode,
          skuName,
          value: mrpRaw,
        });
      }

      // VAL-4 — Selling Price > 0 and ≤ MRP.
      const sp = Number(spRaw);
      if (spRaw === "" || !Number.isFinite(sp) || sp <= 0) {
        rowErrors.push({
          row: rowNumber,
          field: "Selling Price",
          error: "Selling Price must be a number greater than zero.",
          skuCode,
          skuName,
          value: spRaw,
        });
      } else if (Number.isFinite(mrp) && mrp > 0 && sp > mrp) {
        rowErrors.push({
          row: rowNumber,
          field: "Selling Price",
          error: "Selling Price cannot be greater than MRP.",
          skuCode,
          skuName,
          value: spRaw,
        });
      }

      // VAL-5 — Available Stock must be Yes or No (case-insensitive
      // after trim).
      let availability: "Yes" | "No" | null = null;
      const a = availabilityRaw.toLowerCase();
      if (a === "yes") availability = "Yes";
      else if (a === "no") availability = "No";
      else {
        rowErrors.push({
          row: rowNumber,
          field: "Available Stock",
          error: "Available Stock must be Yes or No.",
          skuCode,
          skuName,
          value: availabilityRaw,
        });
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        return;
      }
      if (availability === null) return; // safety — caught above

      // VAL-9 — silent-skip unchanged rows.
      const unchanged =
        existing.mrp === mrp &&
        existing.sellingPrice === sp &&
        psCurrentAvailability(existing) === availability;
      if (unchanged) {
        noChangeRows += 1;
        return;
      }

      validData.push({
        skuCode,
        mrp,
        sellingPrice: sp,
        availability,
      });
    });

    const validRows = validData.length;
    const invalidRows = dataRows.length - validRows - noChangeRows;

    return {
      totalRows: dataRows.length,
      validRows,
      invalidRows,
      errors,
      validData,
    };
  };

  const importPriceStockRows = (rows: unknown[]) => {
    const valid = rows as PsValidatedRow[];
    if (valid.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    const byCode = new Map(valid.map((r) => [r.skuCode, r]));
    setSkus((prev) =>
      prev.map((s) => {
        const r = byCode.get(s.sku);
        if (!r) return s;
        // Available Stock = Yes → SKU is available (flag the record
        // as infinite stock so the storefront shows it as in stock).
        // Available Stock = No → SKU is out of stock (clear infinite
        // flag and zero out the count). Story 19128 BR-3: only the
        // price + availability fields change — every other field is
        // left untouched.
        const isYes = r.availability === "Yes";
        return {
          ...s,
          mrp: r.mrp,
          sellingPrice: r.sellingPrice,
          isInfiniteStock: isYes,
          availableStock: isYes ? (s.availableStock ?? 0) : 0,
          lastUpdated: today,
        };
      }),
    );
  };

  // ---- Product Store panel handlers ----
  const onPsReqChange = (key: keyof SkuFormState, value: string) =>
    setPsReqForm((prev) => ({ ...prev, [key]: value }));

  const handlePsImportToMySku = (sku: PSSku) => {
    addFromProductStore(sku);
    setAddedPsSkuIds((prev) => new Set([...prev, sku.id]));
    // Also refresh the main SKU list so the imported SKU appears immediately
    setSkus((prev) => {
      const alreadyExists = prev.some((s) => s.sku === sku.skuCode);
      if (alreadyExists) return prev;
      const brand = getBrandById(sku.brandId);
      const category = getCategoryById(sku.categoryId);
      const today = new Date().toISOString().split("T")[0];
      return [
        {
          id: sku.id,
          name: sku.name,
          category: category?.name ?? sku.categoryId,
          brand: brand?.name ?? sku.brandId,
          source: "Product Store",
          status: "Inactive",
          lastUpdated: today,
          sku: sku.skuCode,
          shortName: sku.shortName,
          productStoreId: sku.id,
          ondcCompliance: { isCompliant: false, missingFields: ["MRP", "Selling Price"], ondcData: {} },
        },
        ...prev,
      ];
    });
    toast.success(
      `"${sku.name}" added to My SKU as Inactive. Set MRP and selling price to activate it.`,
      { duration: 4000 }
    );
    setPsImportSku(null);
  };

  const handlePsBulkImport = () => {
    if (!psBulkImport) return;
    const newSkus = psBulkImport.skus.filter((s) => !addedPsSkuIds.has(s.id));
    newSkus.forEach((s) => addFromProductStore(s));
    setAddedPsSkuIds((prev) => new Set([...prev, ...newSkus.map((s) => s.id)]));
    const today = new Date().toISOString().split("T")[0];
    setSkus((prev) => {
      const existingCodes = new Set(prev.map((s) => s.sku));
      const toAdd = newSkus
        .filter((s) => !existingCodes.has(s.skuCode))
        .map((s) => {
          const brand = getBrandById(s.brandId);
          const category = getCategoryById(s.categoryId);
          return {
            id: s.id,
            name: s.name,
            category: category?.name ?? s.categoryId,
            brand: brand?.name ?? s.brandId,
            source: "Product Store",
            status: "Inactive" as const,
            lastUpdated: today,
            sku: s.skuCode,
            shortName: s.shortName,
            productStoreId: s.id,
            ondcCompliance: { isCompliant: false, missingFields: ["MRP", "Selling Price"], ondcData: {} },
          };
        });
      return [...toAdd, ...prev];
    });
    toast.success(
      `${newSkus.length} SKU${newSkus.length !== 1 ? "s" : ""} from ${psBulkImport.label} added to My SKU as Inactive.`,
      { duration: 4000 }
    );
    setPsBulkImport(null);
  };

  const openPsBulkImportForCompany = (company: PSCompany, e: React.MouseEvent) => {
    e.stopPropagation();
    const compSkus = psSkus.filter((s) => s.companyId === company.id && s.status === "active");
    setPsBulkImport({ label: company.name, skus: compSkus });
  };

  const openPsBulkImportForBrand = (brand: PSBrand, e: React.MouseEvent) => {
    e.stopPropagation();
    const brandSkus = psSkus.filter((s) => s.brandId === brand.id && s.status === "active");
    setPsBulkImport({ label: brand.name, skus: brandSkus });
  };

  const openPSRequestDialog = (_company?: PSCompany | null, brand?: PSBrand | null) => {
    setPsReqForm({
      ...emptySkuForm,
      brandId: brand?.id ?? "",
      brandAttribute: brand?.name ?? "",
    });
    setPsReqImages([]);
    setShowPSRequestDialog(true);
  };

  const openCompanyRequestDialog = () => {
    setCompanyReqName("");
    setCompanyReqMessage("");
    setShowCompanyRequestDialog(true);
  };

  const handleSubmitCompanyRequest = () => {
    const req = addPsRequest({
      type: "request_company",
      skuName: "—",
      brandId: "",
      brandName: "—",
      companyName: companyReqName.trim(),
      requestedBy: "You (Seller)",
      requestedByType: "seller",
      notes: companyReqMessage.trim() || undefined,
    });
    toast.success(`Company request ${req.id} submitted. Track it in Catalog Admin Requests.`, { duration: 4000 });
    setShowCompanyRequestDialog(false);
  };

  const openBrandRequestDialog = (company?: PSCompany | null) => {
    setBrandReqName("");
    setBrandReqMessage("");
    setBrandReqCompanyName(company?.name ?? "");
    setShowBrandRequestDialog(true);
  };

  const handleSubmitBrandRequest = () => {
    const req = addPsRequest({
      type: "request_brand",
      skuName: "—",
      brandId: "",
      brandName: brandReqName.trim(),
      companyName: brandReqCompanyName.trim() || "—",
      requestedBy: "You (Seller)",
      requestedByType: "seller",
      notes: brandReqMessage.trim() || undefined,
    });
    toast.success(`Brand request ${req.id} submitted. Track it in Catalog Admin Requests.`, { duration: 4000 });
    setShowBrandRequestDialog(false);
  };

  const isPSReqValid =
    psReqForm.itemName.trim() !== "" &&
    psReqForm.shortName.trim() !== "" &&
    psReqForm.groupName.trim() !== "" &&
    (psReqForm.brandId !== "" || psReqForm.brandOther.trim() !== "") &&
    psReqForm.brandAttribute.trim() !== "" &&
    psReqForm.shortDesc.trim() !== "" &&
    psReqForm.longDesc.trim() !== "" &&
    psReqForm.measureUnit !== "" &&
    psReqForm.measureValue.trim() !== "" &&
    psReqForm.weightMeasure !== "" &&
    psReqForm.skuWeight.trim() !== "" &&
    psReqForm.unitizedCount.trim() !== "" &&
    psReqForm.packageType.trim() !== "" &&
    psReqForm.packageTypeValue.trim() !== "" &&
    psReqForm.categoryId !== "" &&
    psReqForm.hsnCode.trim() !== "" &&
    psReqForm.countryOfOrigin.trim() !== "" &&
    psReqForm.gstTax !== "" &&
    psReqForm.manufacturerName.trim() !== "";

  const handleSubmitPSRequest = () => {
    if (!isPSReqValid) return;
    const req = addSkuRequest({
      itemName: psReqForm.itemName,
      shortName: psReqForm.shortName,
      groupName: psReqForm.groupName,
      brandId: psReqForm.brandId,
      brandOther: psReqForm.brandOther,
      brandAttribute: psReqForm.brandAttribute,
      shortDesc: psReqForm.shortDesc,
      longDesc: psReqForm.longDesc,
      measureUnit: psReqForm.measureUnit,
      measureValue: psReqForm.measureValue,
      weightMeasure: psReqForm.weightMeasure,
      skuWeight: psReqForm.skuWeight,
      unitizedCount: psReqForm.unitizedCount,
      upc: psReqForm.upc,
      packageType: psReqForm.packageType,
      packageTypeValue: psReqForm.packageTypeValue,
      productLength: psReqForm.productLength,
      productWidth: psReqForm.productWidth,
      productHeight: psReqForm.productHeight,
      categoryId: psReqForm.categoryId,
      hsnCode: psReqForm.hsnCode,
      countryOfOrigin: psReqForm.countryOfOrigin,
      gstTax: psReqForm.gstTax,
      gstCess: psReqForm.gstCess,
      manufacturerName: psReqForm.manufacturerName,
      notes: psReqForm.notes,
    });
    toast.success(`Request ${req.id} submitted. Track it in My Requests.`, { duration: 4000 });
    setShowPSRequestDialog(false);
    setPsReqForm(emptySkuForm);
    setPsReqImages([]);
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

  // Inception-day: when the seller has no SKUs at all, hide the
  // toolbar chrome (search, filters, bulk-import) and the pagination
  // footer so the table area surfaces only the EmptyState illustration
  // — but keep the same full-height Card container so the layout reads
  // identically to the populated state.
  const isEmpty = skus.length === 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Product Store inline view — replaces card when open, sidebar stays visible */}
      {isProductStoreOpen && (
        <div className="flex flex-col flex-1 min-h-0 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProductStoreOpen(false)}
                className="gap-1.5 text-gray-600 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="w-px h-5 bg-gray-200" />
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-base font-semibold text-gray-900 leading-none">Product Store</p>
                <p className="text-xs text-gray-500 mt-0.5">Browse the Qwipo Master Catalog and import SKUs into My SKU.</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products/my-requests")}
              className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Send className="h-4 w-4" />
              My Requests
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductStoreBrowse
              mode="seller"
              addedSkuIds={addedPsSkuIds}
              onAddSku={setPsImportSku}
              onBulkImportCompany={openPsBulkImportForCompany}
              onBulkImportBrand={openPsBulkImportForBrand}
              onRequestCompany={openCompanyRequestDialog}
              onRequestBrand={openBrandRequestDialog}
              onRequestSku={openPSRequestDialog}
            />
          </div>
        </div>
      )}

      {/* Page area — Card fills the available height; only the table
          rows scroll, the search/filter header and pagination stay
          pinned to the top and bottom of the Card. */}
      {!isProductStoreOpen && <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header with Search and Actions — search + Bulk Import stay
              visible on the empty state so the seller can immediately
              start adding SKUs; only the Filters button (which has
              nothing to filter) is hidden. */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by SKU Code, SKU Name, or Brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {!isEmpty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setIsProductStoreOpen(true)}
                  className="gap-2 flex-1 sm:flex-initial bg-purple-900 hover:bg-purple-800 text-white"
                >
                  <Database className="h-4 w-4" />
                  Add from Product Store
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2 flex-1 sm:flex-initial"
                    >
                      <Upload className="h-4 w-4" />
                      Bulk Import
                      <MoreVertical className="h-3.5 w-3.5 opacity-80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {/* "Update Price & Stock" needs an existing catalog
                        to update — when the seller has no SKUs yet
                        (empty inception state) the option is disabled
                        and visually greyed out so it's clear they need
                        to add SKUs first. */}
                    <DropdownMenuItem
                      disabled={isEmpty}
                      onClick={
                        isEmpty
                          ? undefined
                          : () => setIsPriceStockBulkOpen(true)
                      }
                      className="gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed cursor-pointer"
                      title={
                        isEmpty
                          ? "Add SKUs first — there's no catalog to update yet"
                          : undefined
                      }
                    >
                      <Database className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Update Price & Stock</p>
                        <p className="text-[11px] text-gray-500">
                          Download existing → edit offline → re-upload
                        </p>
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
                    Compliance: {ondcFilter === "compliant" ? "Compliant" : "Non-compliant"}
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

          {/* SKU Table — flex-1 so it claims all the remaining height
              inside the Card; only this region scrolls. When the
              catalog is empty, the EmptyState fills the entire region
              (no table headers) so the illustration sits centered in
              the Card. */}
          <div className="flex-1 overflow-auto">
            {isEmpty ? (
              <EmptyState
                icon={PackageSearch}
                title="No SKUs in your catalog yet"
                description="No SKUs in your catalog yet — click Add from Product Store to import SKUs, or use Bulk Import to update price & stock."
              />
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    SKU Code <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Short Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    SKU Name <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    MRP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                    ONDC Compliance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSKUs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-3">
                      <EmptyState
                        icon={PackageSearch}
                        title="No matches"
                        description="No SKUs match your current filters — try clearing them to see everything."
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedSKUs.map((sku) => (
                    <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <CopyOnHover value={sku.sku} label="SKU code">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {sku.sku}
                          </span>
                        </CopyOnHover>
                      </td>
                      <td className="px-4 py-3">
                        {sku.shortName ? (
                          <CopyOnHover value={sku.shortName} label="Short name">
                            <span className="font-mono text-sm font-medium text-gray-900">
                              {sku.shortName}
                            </span>
                          </CopyOnHover>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CopyOnHover value={sku.name} label="SKU name">
                          <p className="font-medium text-gray-900 text-sm">{sku.name}</p>
                        </CopyOnHover>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{sku.brand}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{sku.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-gray-900">
                          {sku.mrp != null
                            ? `₹${sku.mrp.toLocaleString("en-IN")}`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-gray-900">
                          {sku.sellingPrice != null
                            ? `₹${sku.sellingPrice.toLocaleString("en-IN")}`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={
                            sku.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {sku.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sku.ondcCompliance.isCompliant ? (
                          <Badge
                            className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1"
                            title="All ONDC fields are filled in correctly."
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Compliant
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-red-100 text-red-700 border-red-300"
                            title={`Missing / invalid fields: ${sku.ondcCompliance.missingFields.join(", ") || "—"}`}
                          >
                            Non-compliant
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{sku.lastUpdated}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Details"
                          onClick={() => handleViewDetails(sku)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>

          {!isEmpty && (
          <ListPagination
            page={currentPage}
            total={filteredSKUs.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="SKU"
          />
          )}
        </Card>
      </div>}

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
                        {/* "All" rather than "All Status" so the option
                            isn't mistaken for the field label and the
                            phrasing matches the ONDC Compliance picker
                            below. */}
                        <SelectItem value="all">All</SelectItem>
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
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non-compliant">Non-compliant</SelectItem>
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
                  Clear
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


      {/* ── PS Bulk Import Dialog ── */}
      <Dialog open={!!psBulkImport} onOpenChange={() => setPsBulkImport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Import All SKUs — {psBulkImport?.label}
            </DialogTitle>
            <DialogDescription>
              All SKUs from {psBulkImport?.label} will be added to your My SKU list as Inactive.
            </DialogDescription>
          </DialogHeader>
          {psBulkImport &&
            (() => {
              const newSkus = psBulkImport.skus.filter((s) => !addedPsSkuIds.has(s.id));
              const alreadyAdded = psBulkImport.skus.length - newSkus.length;
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xl font-bold text-green-700">{newSkus.length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Will be added</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xl font-bold text-gray-500">{alreadyAdded}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Already in My SKU</p>
                    </div>
                  </div>
                  {newSkus.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-lg border divide-y text-sm">
                      {newSkus.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 px-3 py-2">
                          <span className="text-base">{s.image}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-xs truncate">{s.name}</p>
                            <code className="text-[10px] text-gray-400 font-mono">{s.skuCode}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-purple-900 space-y-1">
                    <p className="font-medium flex items-center gap-1 text-xs">
                      <Info className="h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
                      What gets imported (Read-only fields)
                    </p>
                    <ul className="text-xs space-y-0.5 ml-5 list-disc text-purple-800">
                      <li>SKU name, short name, SKU code, group name</li>
                      <li>Brand, company, category</li>
                      <li>Short &amp; long description</li>
                      <li>Measure unit, packaging size, UPC, package type</li>
                      <li>SKU weight &amp; dimensions</li>
                      <li>Manufacturer name, country of origin</li>
                      <li>HSN code, GST tax %, GST cess %</li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                    <strong>You fill in after import:</strong> MRP, selling price, fulfillment ID, location, order limits, and consumer care details.
                  </div>
                </div>
              );
            })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPsBulkImport(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePsBulkImport}
              disabled={psBulkImport?.skus.filter((s) => !addedPsSkuIds.has(s.id)).length === 0}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Import {psBulkImport?.skus.filter((s) => !addedPsSkuIds.has(s.id)).length ?? 0} SKUs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PS Import Confirm Dialog (single SKU) ── */}
      <Dialog open={!!psImportSku} onOpenChange={() => setPsImportSku(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Add to My SKU
            </DialogTitle>
            <DialogDescription>
              This will import the SKU's catalog details into your My SKU list.
            </DialogDescription>
          </DialogHeader>
          {psImportSku && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <span className="text-3xl">{psImportSku.image}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{psImportSku.name}</p>
                  <code className="text-[11px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                    {psImportSku.skuCode}
                  </code>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-purple-900 space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  What gets imported (Read-only fields)
                </p>
                <ul className="text-xs space-y-0.5 ml-5 list-disc text-purple-800">
                  <li>SKU name, short name, SKU code, group name</li>
                  <li>Brand, company, category</li>
                  <li>Short &amp; long description</li>
                  <li>Measure unit, packaging size, UPC, package type</li>
                  <li>SKU weight &amp; dimensions</li>
                  <li>Manufacturer name, country of origin</li>
                  <li>HSN code, GST tax %, GST cess %</li>
                </ul>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                <strong>You fill in after import:</strong> MRP, selling price, fulfillment ID, location, order limits, and consumer care details.
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPsImportSku(null)} className="sm:mr-auto">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => { if (psImportSku) handlePsImportToMySku(psImportSku); setIsProductStoreOpen(false); }}
              className="gap-2 text-purple-700 border-purple-300 hover:bg-purple-50"
            >
              Add &amp; Close →
            </Button>
            <Button onClick={() => psImportSku && handlePsImportToMySku(psImportSku)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add to My SKU
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PS Request a Company Dialog ── */}
      <Dialog open={showCompanyRequestDialog} onOpenChange={setShowCompanyRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Request a New Company
            </DialogTitle>
            <DialogDescription>
              Tell us which company you'd like added to the Product Store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="company-req-name">Company Name *</Label>
              <Input
                id="company-req-name"
                placeholder="e.g. Godrej Consumer Products"
                value={companyReqName}
                onChange={(e) => setCompanyReqName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-req-msg">Message (optional)</Label>
              <textarea
                id="company-req-msg"
                rows={3}
                placeholder="Any additional context — why this company is needed, which SKUs you expect, etc."
                value={companyReqMessage}
                onChange={(e) => setCompanyReqMessage(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setShowCompanyRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCompanyRequest}
              disabled={!companyReqName.trim()}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PS Request a Brand Dialog ── */}
      <Dialog open={showBrandRequestDialog} onOpenChange={setShowBrandRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Request a New Brand
            </DialogTitle>
            <DialogDescription>
              Tell us which brand you'd like added to the Product Store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {brandReqCompanyName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-xs text-purple-600 font-medium">Company</span>
                <span className="text-sm font-semibold text-purple-900">{brandReqCompanyName}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="brand-req-name">Brand Name *</Label>
              <Input
                id="brand-req-name"
                placeholder="e.g. Haldiram's"
                value={brandReqName}
                onChange={(e) => setBrandReqName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-req-msg">Message (optional)</Label>
              <textarea
                id="brand-req-msg"
                rows={3}
                placeholder="Any additional context — category, specific SKUs you need, etc."
                value={brandReqMessage}
                onChange={(e) => setBrandReqMessage(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setShowBrandRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBrandRequest}
              disabled={!brandReqName.trim()}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PS Request a SKU Dialog ── */}
      <Dialog open={showPSRequestDialog} onOpenChange={setShowPSRequestDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Request a New SKU
            </DialogTitle>
          </DialogHeader>
          <div className="py-1">
            <SkuFormFields
              mode="seller"
              form={psReqForm}
              onChange={onPsReqChange}
              productImages={psReqImages}
              onProductImagesChange={setPsReqImages}
            />
          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setShowPSRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPSRequest}
              disabled={!isPSReqValid}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SKU — Bulk Import. Drives the standardized
          BulkImportDialog flow: upload → validating → results →
          import. Module-specific copy / sample / validator only. */}
      <BulkImportDialog
        open={isAddSkuBulkOpen}
        onOpenChange={setIsAddSkuBulkOpen}
        config={{
          title: "Add SKU — Bulk Import",
          description:
            "Upload the SKU import template (CSV or XLSX). Mandatory columns are starred — Weight in KG is auto-calculated from Weight Measure × SKU Weight and ignored if typed.",
          instructions: (
            <>
              Download the template below — every mandatory column is starred and
              dropdown columns (<b>Measure Unit</b>, <b>Weight Measure</b>,{" "}
              <b>Category</b>, <b>Time to Ship</b>, etc.) enforce the allowed
              values. <b>Weight in KG</b> is auto-calculated from{" "}
              <b>Weight Measure</b> × <b>SKU Weight</b> — leave it blank.
            </>
          ),
          sample: {
            onDownload: handleDownloadAddSkuSample,
            fileName: "sku_import_template.xlsx",
          },
          accept: ".csv,.xlsx,.xls",
          validate: validateAddSkuFile,
          onImport: importAddSkuRows,
        }}
      />

      {/* Price & Stock — Bulk Import (Story 19128). The downloaded
          sheet is pre-filled with every SKU in the seller's catalog
          and its current values; the seller edits only MRP / Selling
          Price / Available Stock (Yes/No) offline and re-uploads.
          Rows whose SKU Code isn't in the catalog are REJECTED with a
          row-level error (not silently skipped). */}
      <BulkImportDialog
        open={isPriceStockBulkOpen}
        onOpenChange={setIsPriceStockBulkOpen}
        config={{
          title: "Update Price & Stock — Bulk Import",
          description:
            "Download a sheet pre-filled with your existing SKUs, edit only MRP / Selling Price / Available Stock (Yes/No) offline, then re-upload to apply the changes in bulk.",
          instructions: (
            <>
              Use this to update price and stock on SKUs that already exist in
              your catalog. Download the sheet — it comes pre-filled with your
              existing SKUs and current values — edit only the MRP, Selling
              Price, and Available Stock (Yes/No) columns, then re-upload. To
              add brand-new SKUs, use <b>Add new SKU</b> instead.
            </>
          ),
          sample: {
            // Multi-format download: the picker dialog opens on Download
            // and the chosen format ("csv" | "xlsx") is forwarded to
            // handleDownloadPsSample. Filename is omitted on purpose —
            // there's no single fixed filename when the seller picks
            // the format at download time.
            onDownload: handleDownloadPsSample,
            formats: [
              {
                value: "csv",
                label: "CSV (.csv)",
                description: "Plain text — opens in Excel, Google Sheets, or any text editor.",
              },
              {
                value: "xlsx",
                label: "Excel Workbook (.xlsx)",
                description: "Native Excel format with styled headers and frozen first row.",
              },
            ],
          },
          accept: ".csv,.xlsx,.xls",
          validate: validatePriceStockFile,
          onImport: importPriceStockRows,
          successToast: (result) =>
            `${result.validRows} SKU${result.validRows === 1 ? "" : "s"} updated.` +
            (result.invalidRows > 0
              ? ` ${result.invalidRows} row${result.invalidRows === 1 ? "" : "s"} had errors and were skipped.`
              : ""),
        }}
      />

    </div>
  );
}