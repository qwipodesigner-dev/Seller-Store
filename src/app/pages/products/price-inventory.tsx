import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { MultiSelect } from "../../components/ui/multi-select";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Edit,
  Eye,
  MoreVertical,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Filter,
  Database,
  Infinity,
  ShieldCheck,
  AlertCircle as AlertCircleIcon,
  X,
  Search,
  Info,
  Upload,
  Download,
  FileSpreadsheet,
  FileCheck,
  FileWarning,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  importBizomCsv,
  BizomValidationResult,
  BIZOM_REQUIRED_HEADERS,
} from "../../lib/bizom-validation";

interface Product {
  id: string;
  skuName: string;
  skuCode: string;
  brand: string;
  category: string;
  source: "DMS Sync" | "Manual" | "Brand Sync";
  mrp: number;
  sellingPrice: number;
  availableStock: number;
  reservedStock: number;
  thresholdLevel: number;
  isInfiniteStock: boolean;
  status: "Active" | "Inactive";
  lastUpdated: string;
  ondcCompliant: boolean;
  missingOndcFields: string[];
}

// Price & Inventory data — aggregated from the Bizom DMS export.
// Stock = sum of saleable stock across batches. Prices = max across batches (business rule).
// MRP is derived at +10% over DMS Price/Pcs for display, since the Bizom file reports MRP as 0.00.
const mockProducts: Product[] = [
  {
    id: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    skuCode: "180000005",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 3091,
    sellingPrice: 2810,
    availableStock: 1,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-22",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000006",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN",
    skuCode: "180000006",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 2838,
    sellingPrice: 2580,
    availableStock: 252,
    reservedStock: 0,
    thresholdLevel: 20,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-22",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    skuCode: "180000008",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 188,
    sellingPrice: 171,
    availableStock: 642,
    reservedStock: 0,
    thresholdLevel: 50,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-22",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000076",
    skuName: "FREEDOM REF.SUNFLOWER OIL 1 LTR X 12PET",
    skuCode: "180000076",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 191,
    sellingPrice: 174,
    availableStock: 27,
    reservedStock: 0,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-14",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000179",
    skuName: "FREEDOM REF.SUNFLOWER OIL 2 LTR X 6 PET",
    skuCode: "180000179",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 388,
    sellingPrice: 353,
    availableStock: 1,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-08",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000248",
    skuName: "FREEDOM FILTE. GROUNDNUT OIL 1 LTRX10NOS",
    skuCode: "180000248",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 190,
    sellingPrice: 173,
    availableStock: 0,
    reservedStock: 0,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-03-20",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    skuCode: "180000249",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 963,
    sellingPrice: 875,
    availableStock: 138,
    reservedStock: 0,
    thresholdLevel: 20,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-14",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000260",
    skuName: "FREEDOM K.GHANI MUSTARD OIL 1LTRX12 PET",
    skuCode: "180000260",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 194,
    sellingPrice: 176,
    availableStock: 12,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-06",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000377",
    skuName: "Sri Krupa 1Ltr X 12 Pet",
    skuCode: "180000377",
    brand: "Sri Krupa",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 172,
    sellingPrice: 156,
    availableStock: 9,
    reservedStock: 0,
    thresholdLevel: 5,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-03-20",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000419",
    skuName: "FREEDOM FILTE. GROUNDNUT OIL 1 LTRX10NOS-OFFER",
    skuCode: "180000419",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 190,
    sellingPrice: 173,
    availableStock: 28,
    reservedStock: 0,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-08",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000437",
    skuName: "FREEDOM REF. RICE BRAN OIL 1 LTR.X16 NOS",
    skuCode: "180000437",
    brand: "Freedom",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 179,
    sellingPrice: 163,
    availableStock: 50,
    reservedStock: 0,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-04-08",
    ondcCompliant: true,
    missingOndcFields: [],
  },
  {
    id: "180000490",
    skuName: "FIRST KLASS REF PALMOLEIN 750G X 15 NOS",
    skuCode: "180000490",
    brand: "First Klass",
    category: "Edible Oil",
    source: "DMS Sync",
    mrp: 129,
    sellingPrice: 117.4,
    availableStock: 19,
    reservedStock: 0,
    thresholdLevel: 10,
    isInfiniteStock: false,
    status: "Active",
    lastUpdated: "2026-03-16",
    ondcCompliant: true,
    missingOndcFields: [],
  },
];

export function PriceInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Bulk Import (Bizom DMS) dialog state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImportValidating, setIsImportValidating] = useState(false);
  const [importResult, setImportResult] = useState<BizomValidationResult | null>(null);
  const [importView, setImportView] = useState<"batches" | "aggregated">("aggregated");
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Edit form state
  const [editMrp, setEditMrp] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [editIsInfiniteStock, setEditIsInfiniteStock] = useState(false);
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const outOfStock = products.filter(
    (p) => p.availableStock === 0 && !p.isInfiniteStock
  ).length;
  const lowStock = products.filter(
    (p) =>
      p.availableStock > 0 &&
      p.availableStock <= p.thresholdLevel &&
      !p.isInfiniteStock
  ).length;
  const ondcCompliantCount = products.filter((p) => p.ondcCompliant).length;

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.isInfiniteStock) return "infinite";
    if (product.availableStock === 0) return "out-of-stock";
    if (product.availableStock <= product.thresholdLevel) return "low-stock";
    return "in-stock";
  };

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesBrand
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).sort();

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditMrp(product.mrp.toString());
    setEditSellingPrice(product.sellingPrice.toString());
    setEditStock(product.availableStock.toString());
    setEditThreshold(product.thresholdLevel.toString());
    setEditIsInfiniteStock(product.isInfiniteStock);
    setEditStatus(product.status);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    // Validation
    if (!editMrp || parseFloat(editMrp) < 0) {
      toast.error("Please enter a valid MRP");
      return;
    }

    if (!editSellingPrice || parseFloat(editSellingPrice) < 0) {
      toast.error("Please enter a valid Selling Price");
      return;
    }

    if (!editIsInfiniteStock && (!editStock || parseInt(editStock) < 0)) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    if (parseFloat(editSellingPrice) > parseFloat(editMrp)) {
      toast.error("Selling Price cannot be greater than MRP");
      return;
    }

    // Update product
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              mrp: parseFloat(editMrp),
              sellingPrice: parseFloat(editSellingPrice),
              availableStock: editIsInfiniteStock ? 0 : parseInt(editStock),
              thresholdLevel: editIsInfiniteStock ? 0 : parseInt(editThreshold),
              isInfiniteStock: editIsInfiniteStock,
              status: editStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );

    toast.success(
      `${selectedProduct.skuName} updated successfully!${
        editIsInfiniteStock ? " (Infinite stock enabled)" : ""
      }`
    );
    setIsEditDialogOpen(false);
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/products/sku-detail/${product.id}`);
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

  const handleExport = () => {
    toast.success("Exporting price & inventory data...");
  };

  // ---- Bizom DMS bulk import handlers ----
  const handleOpenImport = () => {
    setImportFile(null);
    setImportResult(null);
    setImportView("aggregated");
    setIsImportOpen(true);
  };

  const handleDownloadBizomTemplate = () => {
    const headers = [
      ...BIZOM_REQUIRED_HEADERS,
      "Saleable Stock( Case ),Saleable Stock( Unit )",
      "Total Non-Saleable Stock( Case ),Total Non-Saleable Stock( Unit )",
      "In Transit Stock( Case ),In Transit Stock( Unit )",
      "Total Stock( Case ),Total Stock( Unit )",
      "Amount/Value",
      "Stock Turnover Ratio(No. of days stock will last)",
    ];
    // Example rows showing: multiple batches for the same SKU with different prices
    // (system will aggregate and take the MAX price).
    const sample = [
      ["2", "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN", "180000005", "25106628823101", "2026-03-16", "2026-06-14", "0.00000", "2810.00000", "5.00", "0,0", "0,0", "0,0", "'0,0", "0", "0", ""],
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
    a.download = "Bizom_DMS_Inventory_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample template downloaded");
  };

  const validateImportFile = (file: File) => {
    setIsImportValidating(true);
    setImportResult(null);

    const validExts = [".csv", ".xlsx", ".xls"];
    if (!validExts.some((e) => file.name.toLowerCase().endsWith(e))) {
      setIsImportValidating(false);
      toast.error("Invalid file format. Please upload .csv, .xlsx, or .xls.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const result = importBizomCsv(text);
      setImportResult(result);
      setIsImportValidating(false);
      if (result.fileLevelErrors.length > 0) {
        toast.error(result.fileLevelErrors[0].message);
      } else if (result.invalidBatchRows > 0) {
        toast.warning(
          `${result.invalidBatchRows} batch row(s) failed validation. ${result.aggregated.length} SKU(s) ready to import.`
        );
      } else {
        toast.success(
          `All ${result.validBatchRows} rows passed. Aggregated into ${result.aggregated.length} SKU(s).`
        );
      }
    };
    reader.onerror = () => {
      setIsImportValidating(false);
      toast.error("Could not read file.");
    };
    reader.readAsText(file);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImportFile(f);
      validateImportFile(f);
    }
  };

  const handleApplyImport = () => {
    if (!importResult || importResult.aggregated.length === 0) return;

    // Merge aggregated SKUs into the products list:
    //   - If a product with the same SKU Code exists, update MRP/SellingPrice/AvailableStock
    //   - Otherwise, append a new row (source: "DMS Sync")
    const byCode = new Map(products.map((p) => [p.skuCode.toLowerCase(), p]));
    const updated: Product[] = [...products];
    let added = 0;
    let merged = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const agg of importResult.aggregated) {
      const existing = byCode.get(agg.skuCode.toLowerCase());
      if (existing) {
        const idx = updated.indexOf(existing);
        updated[idx] = {
          ...existing,
          mrp: agg.mrp,
          sellingPrice: agg.sellingPrice,
          availableStock: agg.totalStock,
          source: "DMS Sync",
          lastUpdated: today,
        };
        merged++;
      } else {
        updated.push({
          id: String(Date.now() + added),
          skuName: agg.skuName,
          skuCode: agg.skuCode,
          brand: "—",
          category: "Imported",
          source: "DMS Sync",
          mrp: agg.mrp,
          sellingPrice: agg.sellingPrice,
          availableStock: agg.totalStock,
          reservedStock: 0,
          thresholdLevel: 0,
          isInfiniteStock: false,
          status: "Active",
          lastUpdated: today,
          ondcCompliant: false,
          missingOndcFields: [],
        });
        added++;
      }
    }

    setProducts(updated);
    toast.success(
      `Imported ${importResult.aggregated.length} SKU(s) — ${merged} updated, ${added} new.`
    );
    setIsImportOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  const handleImport = () => handleOpenImport();

  const handleBulkUpdate = () => {
    toast.info("Bulk update functionality coming soon");
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.isInfiniteStock) {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-300 gap-1">
          <Infinity className="h-3 w-3" />
          Infinite
        </Badge>
      );
    }

    if (product.availableStock === 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
          <XCircle className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    }

    if (product.availableStock <= product.thresholdLevel) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
        <CheckCircle className="h-3 w-3" />
        In Stock
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Header with Actions */}
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
                  onClick={handleOpenImport}
                  className="gap-2 flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
              </div>
            </div>

            {/* Applied Filter Tags */}
            {(statusFilter !== "all" ||
              selectedCategories.length > 0 ||
              selectedBrands.length > 0) && (
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

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    MRP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        getStockStatus(product) === "low-stock"
                          ? "bg-amber-50/30"
                          : getStockStatus(product) === "out-of-stock"
                          ? "bg-red-50/30"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {product.skuCode}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {product.skuName}
                          </p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{product.brand}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          ₹{Math.round(product.mrp)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-green-700">
                          ₹{Math.round(product.sellingPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {product.isInfiniteStock ? (
                          <Infinity className="h-4 w-4 text-purple-600 mx-auto" />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {product.availableStock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge
                          className={
                            product.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Price & Stock"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Price & Inventory</DialogTitle>
            <DialogDescription>
              {selectedProduct?.skuName} — DMS values are read-only reference.
              Only the ONDC column will be used for publishing.
            </DialogDescription>
          </DialogHeader>

          {/* Legend */}
          <div className="flex items-center gap-2 pb-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              DMS: Read-only reference
            </Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
              ONDC: Final source for publishing
            </Badge>
          </div>

          {/* Section 1 — Price Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Price Information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                      Field Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      DMS Value (Read-only)
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ONDC Value (Editable)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* MRP Row */}
                  <tr
                    className={
                      String(selectedProduct?.mrp ?? "") !== editMrp ? "bg-amber-50/40" : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">MRP</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      ₹{selectedProduct?.mrp?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={editMrp}
                          onChange={(e) => setEditMrp(e.target.value)}
                          className={`pl-7 ${
                            !editMrp
                              ? "border-red-400"
                              : String(selectedProduct?.mrp ?? "") !== editMrp
                                ? "border-amber-400"
                                : ""
                          }`}
                        />
                      </div>
                      {!editMrp && (
                        <p className="text-xs text-red-600 mt-1">Required</p>
                      )}
                    </td>
                  </tr>

                  {/* Selling Price Row */}
                  <tr
                    className={
                      String(selectedProduct?.sellingPrice ?? "") !== editSellingPrice
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Selling Price</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      ₹{selectedProduct?.sellingPrice?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={editSellingPrice}
                          onChange={(e) => setEditSellingPrice(e.target.value)}
                          className={`pl-7 ${
                            !editSellingPrice ||
                            (editMrp &&
                              parseFloat(editSellingPrice) > parseFloat(editMrp))
                              ? "border-red-400"
                              : String(selectedProduct?.sellingPrice ?? "") !==
                                  editSellingPrice
                                ? "border-amber-400"
                                : ""
                          }`}
                        />
                      </div>
                      {!editSellingPrice && (
                        <p className="text-xs text-red-600 mt-1">Required</p>
                      )}
                      {editSellingPrice &&
                        editMrp &&
                        parseFloat(editSellingPrice) > parseFloat(editMrp) && (
                          <p className="text-xs text-red-600 mt-1">
                            Selling Price must be ≤ MRP
                          </p>
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2 — Inventory Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Inventory Information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                      Field Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      DMS Value (Read-only)
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ONDC Value (Editable)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Available Quantity Row */}
                  <tr
                    className={
                      !editIsInfiniteStock && String(selectedProduct?.availableStock ?? "") !== editStock
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Available Quantity</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {selectedProduct?.isInfiniteStock
                        ? "∞ (Infinite)"
                        : (selectedProduct?.availableStock ?? "—")}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {editIsInfiniteStock ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-purple-200 bg-purple-50">
                          <Infinity className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Infinite Stock</span>
                        </div>
                      ) : (
                        <>
                          <Input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className={
                              !editStock || parseInt(editStock) < 0
                                ? "border-red-400"
                                : String(selectedProduct?.availableStock ?? "") !== editStock
                                  ? "border-amber-400"
                                  : ""
                            }
                          />
                          {(!editStock || parseInt(editStock) < 0) && (
                            <p className="text-xs text-red-600 mt-1">
                              Quantity must be ≥ 0
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Infinite Stock Row */}
                  <tr
                    className={
                      selectedProduct?.isInfiniteStock !== editIsInfiniteStock
                        ? "bg-amber-50/40"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-gray-700">Mark as Infinite</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {selectedProduct?.isInfiniteStock ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={editIsInfiniteStock}
                          onCheckedChange={(checked) => {
                            setEditIsInfiniteStock(checked);
                            if (checked) {
                              setEditStock("0");
                              setEditThreshold("0");
                            } else {
                              setEditStock(String(selectedProduct?.availableStock ?? 0));
                              setEditThreshold(String(selectedProduct?.thresholdLevel ?? 0));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {editIsInfiniteStock ? "Infinite stock enabled" : "Finite stock"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled, stock is always available and quantity is not tracked.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info footer */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Only ONDC values will be stored and used for catalog publishing. DMS
              values remain unchanged as the source reference.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save ONDC Values
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <h2 className="text-lg font-semibold text-gray-900">Filter Products</h2>
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
                    <Label className="text-sm font-medium text-gray-700">Product Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                      onChange={setSelectedCategories}
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
                      onChange={setSelectedBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    clearAllFilters();
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

      {/* Bulk Import (Bizom DMS) Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="!max-w-[min(96vw,1280px)] w-[min(96vw,1280px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Upload className="h-5 w-5 text-blue-600" />
              Bulk Import — Price & Inventory (Bizom DMS)
            </DialogTitle>
            <DialogDescription>
              Upload the Price & Inventory export from Bizom DMS. Each SKU typically has multiple
              batch rows — the system will validate every batch, then aggregate at SKU Code level
              (sum stock, take the MAX price per SKU). Invalid batches are excluded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Steps 1 + 2 side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Download sample template</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Matches the exact column layout of the Bizom DMS export.
                    </p>
                    <div className="flex items-center gap-2 mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          Bizom_DMS_Inventory_Template.csv
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {BIZOM_REQUIRED_HEADERS.length} required columns + stock + totals
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadBizomTemplate}
                        className="gap-1 h-7 px-2 text-xs"
                      >
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Upload Bizom DMS export</p>
                    <p className="text-xs text-gray-600 mt-0.5">Supported: .csv, .xlsx, .xls</p>

                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleImportFileChange}
                      className="hidden"
                    />

                    {!importFile ? (
                      <button
                        type="button"
                        onClick={() => importFileInputRef.current?.click()}
                        className="mt-2 w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-xs font-medium">Click to browse file</span>
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{importFile.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setImportFile(null);
                            setImportResult(null);
                            if (importFileInputRef.current) importFileInputRef.current.value = "";
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

            {/* Step 3 — validation + preview */}
            {(isImportValidating || importResult) && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Validation & preview</p>
                  </div>
                  {importResult && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        Batch rows <b>{importResult.totalRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        <FileCheck className="h-3 w-3" /> Valid <b>{importResult.validBatchRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        <FileWarning className="h-3 w-3" /> Invalid <b>{importResult.invalidBatchRows}</b>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <Layers className="h-3 w-3" /> SKUs <b>{importResult.aggregated.length}</b>
                      </span>
                    </div>
                  )}
                </div>

                {isImportValidating && (
                  <p className="text-sm text-gray-600 py-4 text-center">
                    Parsing and validating file…
                  </p>
                )}

                {importResult && (
                  <>
                    {/* File-level errors */}
                    {importResult.fileLevelErrors.length > 0 && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        {importResult.fileLevelErrors.map((err, i) => (
                          <p key={i} className="text-xs text-red-700">
                            <span className="font-mono font-semibold">[{err.code}]</span> {err.message}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Toggle between aggregated SKUs (what will be imported) vs batch rows (per-row errors) */}
                    <div className="mb-2 inline-flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setImportView("aggregated")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          importView === "aggregated" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
                        }`}
                      >
                        Aggregated SKUs ({importResult.aggregated.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportView("batches")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          importView === "batches" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
                        }`}
                      >
                        Batch Rows ({importResult.totalRows})
                      </button>
                    </div>

                    {importView === "aggregated" ? (
                      <div className="max-h-[45vh] overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-left">
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">SKU Code</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Name</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">
                                Batches
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">
                                MRP (max)
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">
                                Selling Price (max)
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">
                                GST %
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">
                                Total Stock
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {importResult.aggregated.map((agg) => (
                              <tr key={agg.skuCode} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-xs text-gray-700">{agg.skuCode}</td>
                                <td className="px-3 py-2 text-gray-900">{agg.skuName}</td>
                                <td className="px-3 py-2 text-center">
                                  <Badge
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                    title={agg.batches.join(", ")}
                                  >
                                    {agg.batchCount}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                  ₹{agg.mrp.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-green-700">
                                  ₹{agg.sellingPrice.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-700">{agg.gst}%</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                  {agg.totalStock}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {agg.hasPriceDivergence && (
                                      <Badge
                                        className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                                        title="Batches had different prices — system took the maximum."
                                      >
                                        Price varied
                                      </Badge>
                                    )}
                                    {agg.hasDateIssue && (
                                      <Badge
                                        className="bg-red-50 text-red-700 border-red-200 text-[10px]"
                                        title="One or more batches have already expired."
                                      >
                                        Expired
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {importResult.aggregated.length === 0 && (
                              <tr>
                                <td colSpan={8} className="px-3 py-6 text-center text-sm text-gray-500">
                                  No valid SKUs to import.
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
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">
                                Price
                              </th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600 w-28">Status</th>
                              <th className="px-3 py-2 text-xs font-semibold text-gray-600">Errors</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {importResult.batchRows.map((b) => (
                              <tr
                                key={b.raw.rowNumber}
                                className={b.status === "invalid" ? "bg-red-50/50" : ""}
                              >
                                <td className="px-3 py-2 text-gray-700 align-top">{b.raw.rowNumber}</td>
                                <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">
                                  {b.raw.skuCode || "—"}
                                </td>
                                <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">
                                  {b.raw.batch || "—"}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-900 align-top">
                                  ₹{b.parsed.mrp.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-green-700 align-top">
                                  ₹{b.parsed.sellingPrice.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  {b.status === "valid" ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                                      <CheckCircle className="h-3 w-3" /> Valid
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                                      <AlertCircleIcon className="h-3 w-3" /> {b.errors.length} error
                                      {b.errors.length !== 1 ? "s" : ""}
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
                  </>
                )}
              </div>
            )}

            {/* Validation rule reference */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-semibold mb-1">
                Validation rules (Bizom DMS Price & Inventory import):
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  <span className="font-mono">PV-001</span> SKU Code — required, alphanumeric.
                </li>
                <li>
                  <span className="font-mono">PV-002</span> Batch — required on every DMS row.
                </li>
                <li>
                  <span className="font-mono">PV-003</span> MRP — numeric, ≥ 0. Negative values are rejected.
                </li>
                <li>
                  <span className="font-mono">PV-004</span> Selling Price — numeric, &gt; 0. Negative or zero values are rejected.
                </li>
                <li>
                  <span className="font-mono">PV-005</span> Selling Price ≤ MRP (when MRP &gt; 0).
                </li>
                <li>
                  <span className="font-mono">PV-006</span> GST — numeric between 0 and 28.
                </li>
                <li>
                  <span className="font-mono">PV-007/008</span> Manufacture / Expiry Date — valid YYYY-MM-DD.
                </li>
                <li>
                  <span className="font-mono">PV-009</span> Expiry Date must be after Manufacture Date.
                </li>
                <li>
                  <span className="font-mono">PV-010</span> Stock (case / unit / in-transit) — non-negative integers.
                </li>
                <li>
                  <span className="font-mono">PV-011</span> Edit form — stock quantity cannot be negative.
                </li>
                <li>
                  <span className="font-mono">PV-013</span> File must have all required Bizom columns.
                </li>
                <li>
                  <span className="font-mono">PV-014</span> Duplicate (SKU Code + Batch) rejected.
                </li>
              </ul>
              <p className="mt-2">
                <span className="font-semibold">Aggregation rules:</span> Batches of the same SKU
                Code are clubbed — stock is summed (saleable only), and when prices differ across
                batches, the <b>maximum</b> MRP and <b>maximum</b> selling price are taken for the SKU.
                Invalid batch rows are excluded from both totals and aggregation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyImport}
              disabled={!importResult || importResult.aggregated.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import {importResult?.aggregated.length ?? 0} SKU
              {(importResult?.aggregated.length ?? 0) !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}