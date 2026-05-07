import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ---------- Demo "current state" dataset ----------
// In a real build this would come from the SKU store; for the demo we ship
// a representative slice the seller can download → edit → re-upload.
interface SkuRow {
  skuCode: string;
  skuName: string;
  brand: string;
  company: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  stockAvailable: boolean;
}

const CURRENT_SKUS: SkuRow[] = [
  { skuCode: "200000001", skuName: "Zuri Royal XXXL Basmati Rice -26 Kg, 1 Bag", brand: "Zuri", company: "Shree Ganesh Agencies", category: "Basmati Rice", mrp: 2194, sellingPrice: 2184, stockAvailable: true },
  { skuCode: "200000002", skuName: "Zuri Premium XXXL Basmati Rice -26 Kg, Bag", brand: "Zuri", company: "Shree Ganesh Agencies", category: "Basmati Rice", mrp: 2402, sellingPrice: 2392, stockAvailable: false },
  { skuCode: "200000003", skuName: "Zuri Classic XXXL Basmati Rice -26 Kg, Bag", brand: "Zuri", company: "Shree Ganesh Agencies", category: "Basmati Rice", mrp: 2428, sellingPrice: 2418, stockAvailable: true },
  { skuCode: "200000004", skuName: "Zinda Tilismath -1 Pc, 5 Ml", brand: "Farooky", company: "Karkhana Zinda Tilismath Hyd", category: "Otc", mrp: 70, sellingPrice: 60, stockAvailable: false },
  { skuCode: "200000005", skuName: "Zeeba XXXL Basmati Rice 30 Kg Bag", brand: "Zeeba", company: "Supple Tek", category: "Basmati Rice", mrp: 2800, sellingPrice: 2790, stockAvailable: true },
  { skuCode: "200000006", skuName: "Zeeba 1121 Premium Basmathi Rice -1 Kg, 1 Pack", brand: "Zeeba", company: "Supple Tek", category: "Basmati Rice", mrp: 125, sellingPrice: 115, stockAvailable: false },
  { skuCode: "200000007", skuName: "Zeeba 1121 Premium Basmathi Rice -1 Bag, 30 Kg", brand: "Zeeba", company: "Supple Tek", category: "Basmati Rice", mrp: 3190, sellingPrice: 3180, stockAvailable: true },
  { skuCode: "200000008", skuName: "Zed Black Luxury Pineapple Premium Incense Sticks -95 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Incense Sticks", mrp: 52, sellingPrice: 42, stockAvailable: false },
  { skuCode: "200000009", skuName: "Zed Black Chandan Agarbatti -110 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Other Pooja Needs", mrp: 52, sellingPrice: 42, stockAvailable: true },
  { skuCode: "200000010", skuName: "Zed Black Chakra Sandalwood -85 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Incense Sticks", mrp: 50, sellingPrice: 40, stockAvailable: false },
  { skuCode: "200000011", skuName: "Zed Black Chakra Holy Flora Premium Flora Batti  -85 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Incense Sticks", mrp: 50, sellingPrice: 40, stockAvailable: true },
  { skuCode: "200000012", skuName: "Zed Black Arij Agarbatti  -105 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Incense Sticks", mrp: 52, sellingPrice: 42, stockAvailable: false },
  { skuCode: "200000013", skuName: "Zed Black 3 In 1 Agarbathi -100 Gm, 1 Box", brand: "Zed Black", company: "Mysore Deep Perfume Private Limited", category: "Incense Sticks", mrp: 49, sellingPrice: 39, stockAvailable: true },
  { skuCode: "200000014", skuName: "Zayqa Elite Basmati Rice -30 Kg, 1 Bag", brand: "Open Brand", company: "Local Company", category: "Other Rice", mrp: 2470, sellingPrice: 2460, stockAvailable: false },
  { skuCode: "200000015", skuName: "Zaynah XXXL Basmati Rice  -30 Kg, 1 Bag", brand: "Open Brand", company: "Local Company", category: "Other Rice", mrp: 2710, sellingPrice: 2700, stockAvailable: true },
  { skuCode: "200000016", skuName: "Zandu Ultra Power Balm,4 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 10, sellingPrice: 0, stockAvailable: false },
  { skuCode: "200000017", skuName: "Zandu Ultra Power Balm,1 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 11.75, sellingPrice: 1.75, stockAvailable: true },
  { skuCode: "200000018", skuName: "Zandu Ultra Power Balm -1 Pc, 20 Gm", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 53, sellingPrice: 43, stockAvailable: false },
  { skuCode: "200000019", skuName: "Zandu Fast Relief Ultra Srong -5 Ml, Pack", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 22, sellingPrice: 12, stockAvailable: true },
  { skuCode: "200000020", skuName: "Zandu Balm,8 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 47, sellingPrice: 37, stockAvailable: false },
  { skuCode: "200000021", skuName: "Zandu Balm,50 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 155, sellingPrice: 145, stockAvailable: true },
  { skuCode: "200000022", skuName: "Zandu Balm,40 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 10, sellingPrice: 0, stockAvailable: false },
  { skuCode: "200000023", skuName: "Zandu Balm,4 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 22.8, sellingPrice: 12.8, stockAvailable: true },
  { skuCode: "200000024", skuName: "Zandu Balm,30 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 10, sellingPrice: 0, stockAvailable: false },
  { skuCode: "200000025", skuName: "Zandu Balm,25 ml Pet Jar", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 10, sellingPrice: 0, stockAvailable: true },
  { skuCode: "200000026", skuName: "Zandu Balm,25 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 107, sellingPrice: 97, stockAvailable: false },
  { skuCode: "200000027", skuName: "Zandu Balm Ultra,8 ml PC", brand: "Zandu", company: "Emami Limited", category: "Otc", mrp: 51, sellingPrice: 41, stockAvailable: true },
  { skuCode: "200000028", skuName: "Z Classic Talcum Powder -1 Pc, 50 Gm", brand: "Z. Magnetism", company: "Argus Cosmetics Ltd", category: "Talcum Powder", mrp: 75, sellingPrice: 65, stockAvailable: false },
  { skuCode: "200000029", skuName: "Z Classic Talcum Powder -1 Pc, 100 Gm", brand: "Z. Magnetism", company: "Argus Cosmetics Ltd", category: "Talcum Powder", mrp: 126, sellingPrice: 116, stockAvailable: true },
  { skuCode: "200000030", skuName: "Yardley London Floral Essence Shower Gel Iris & Voilet,250 gm Pc", brand: "Yardley London", company: "Wipro Enterprises Limited", category: "Shower Gels", mrp: 10, sellingPrice: 0, stockAvailable: false },
  { skuCode: "200000031", skuName: "XXX Detergent Powder Silver Foam  -1 Pc, 500 Gm", brand: "Xxx", company: "Bharathi Consumer Care Products", category: "Detergent Powder", mrp: 37.15, sellingPrice: 27.15, stockAvailable: true },
  { skuCode: "200000032", skuName: "Xinng Schezwan Sauce -1 Jar, 250 Gm", brand: "Xinng", company: "Nature Rich Foods", category: "Sauce", mrp: 75, sellingPrice: 65, stockAvailable: false },
  { skuCode: "200000033", skuName: "Xinng Schezwan Mix Chutney -1 Jar, 1 Kg", brand: "Xinng", company: "Nature Rich Foods", category: "Sauce", mrp: 155, sellingPrice: 145, stockAvailable: true },
];

const CSV_HEADER = [
  "SKUCode",
  "SKUName",
  "Brand",
  "Company",
  "Category",
  "MRP",
  "Selling price",
  "Stock Available",
];

// ---------- CSV utilities ----------
function escapeCsv(value: string | number | boolean): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows: SkuRow[]): string {
  const lines = [CSV_HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.skuCode,
        r.skuName,
        r.brand,
        r.company,
        r.category,
        r.mrp,
        r.sellingPrice,
        r.stockAvailable ? "Yes" : "No",
      ]
        .map(escapeCsv)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

// Minimal CSV parser that respects quoted commas/newlines.
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\r") {
        // skip — handled with \n
      } else if (ch === "\n") {
        row.push(cell);
        out.push(row);
        row = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
  }
  // tail
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    out.push(row);
  }
  return out.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""));
}

interface RowDiff {
  skuCode: string;
  skuName: string;
  changes: { field: string; before: string; after: string }[];
  errors: string[];
}

interface UploadResult {
  totalRows: number;
  unchanged: number;
  updated: RowDiff[];
  unknown: { skuCode: string; skuName: string }[];
  errored: RowDiff[];
}

function processUpload(text: string): UploadResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { totalRows: 0, unchanged: 0, updated: [], unknown: [], errored: [] };
  }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  // Accept either the new "SKUCode" header or the legacy "SKUID" so
  // older CSVs the seller may have downloaded before this change still
  // re-import cleanly.
  const idIdx = idx("SKUCode") !== -1 ? idx("SKUCode") : idx("SKUID");
  const nameIdx = idx("SKUName");
  const mrpIdx = idx("MRP");
  const spIdx = idx("Selling price");
  const stockIdx = idx("Stock Available");

  const known = new Map(CURRENT_SKUS.map((s) => [s.skuCode, s]));
  const updated: RowDiff[] = [];
  const errored: RowDiff[] = [];
  const unknown: { skuCode: string; skuName: string }[] = [];
  let unchanged = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const skuCode = (r[idIdx] || "").trim();
    const skuName = (r[nameIdx] || "").trim();
    if (!skuCode) continue;
    const orig = known.get(skuCode);
    if (!orig) {
      unknown.push({ skuCode, skuName });
      continue;
    }
    const errors: string[] = [];
    const changes: { field: string; before: string; after: string }[] = [];

    const newMrpRaw = (r[mrpIdx] || "").trim();
    const newSpRaw = (r[spIdx] || "").trim();
    const newStockRaw = (r[stockIdx] || "").trim().toLowerCase();

    const newMrp = parseFloat(newMrpRaw);
    if (isNaN(newMrp)) errors.push("MRP is not a number.");
    const newSp = parseFloat(newSpRaw);
    if (isNaN(newSp)) errors.push("Selling price is not a number.");
    if (!isNaN(newMrp) && !isNaN(newSp) && newMrp > 0 && newSp > 0 && newMrp < newSp) {
      errors.push("MRP cannot be less than Selling price.");
    }
    let newStock: boolean | null = null;
    if (newStockRaw === "yes" || newStockRaw === "true" || newStockRaw === "1") newStock = true;
    else if (newStockRaw === "no" || newStockRaw === "false" || newStockRaw === "0") newStock = false;
    else errors.push(`Stock Available must be Yes or No (got "${newStockRaw}").`);

    if (!isNaN(newMrp) && newMrp !== orig.mrp) {
      changes.push({ field: "MRP", before: String(orig.mrp), after: String(newMrp) });
    }
    if (!isNaN(newSp) && newSp !== orig.sellingPrice) {
      changes.push({ field: "Selling price", before: String(orig.sellingPrice), after: String(newSp) });
    }
    if (newStock !== null && newStock !== orig.stockAvailable) {
      changes.push({
        field: "Stock Available",
        before: orig.stockAvailable ? "Yes" : "No",
        after: newStock ? "Yes" : "No",
      });
    }

    const diff: RowDiff = { skuCode, skuName: orig.skuName, changes, errors };
    if (errors.length > 0) errored.push(diff);
    else if (changes.length === 0) unchanged++;
    else updated.push(diff);
  }
  return { totalRows: rows.length - 1, unchanged, updated, unknown, errored };
}

// ---------- Component ----------
export function BulkImport() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const totalSkus = CURRENT_SKUS.length;
  const stockYes = useMemo(
    () => CURRENT_SKUS.filter((s) => s.stockAvailable).length,
    [],
  );

  const handleDownload = () => {
    const csv = rowsToCsv(CURRENT_SKUS);
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-price-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${CURRENT_SKUS.length} SKUs to stock-price-${stamp}.csv`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsProcessing(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const res = processUpload(text);
        setResult(res);
        const changed = res.updated.length;
        if (changed === 0 && res.errored.length === 0) {
          toast.info("No changes detected in the uploaded file.");
        } else {
          toast.success(
            `Parsed ${res.totalRows} rows: ${changed} updated, ${res.errored.length} with errors, ${res.unknown.length} unknown.`,
          );
        }
      } catch (err) {
        toast.error("Failed to parse CSV. Please check the format.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleApply = () => {
    if (!result) return;
    // In a real app this would persist to the SKU store. Demo: just confirm.
    toast.success(
      `Applied ${result.updated.length} updates. ${result.errored.length} rows skipped due to errors.`,
    );
    setResult(null);
    setUploadedFile(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/products/add-sku"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Add SKU
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Bulk Update — Stock &amp; Price
        </h1>
        <p className="text-gray-600 mt-1">
          Download your existing SKU list, edit MRP / Selling price / Stock
          availability offline, and re-upload the file to apply the changes.
        </p>
        <div className="flex gap-2 mt-3">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            {totalSkus} SKUs in catalog
          </Badge>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stockYes} in stock
          </Badge>
          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
            {totalSkus - stockYes} out of stock
          </Badge>
        </div>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Step 1 — Download */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <CardTitle className="text-base">Download Existing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Get a CSV snapshot of every SKU's current MRP, Selling price, and
              Stock Available flag.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <FileSpreadsheet className="h-7 w-7 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    stock-price-YYYY-MM-DD.csv
                  </p>
                  <p className="text-xs text-gray-600">{totalSkus} rows</p>
                </div>
              </div>
              <Button onClick={handleDownload} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 — Upload */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <CardTitle className="text-base">Upload Updated File</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              id="bulk-upload"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="block w-full"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {uploadedFile ? uploadedFile.name : "Click to upload"}
                  </p>
                  <p className="text-xs text-gray-600">
                    CSV file (UTF-8), up to 10 MB
                  </p>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Parsing…
                    </div>
                  )}
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Result panel */}
      {result && (
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Upload Preview
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                  {result.updated.length} to update
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                  {result.unchanged} unchanged
                </Badge>
                {result.errored.length > 0 && (
                  <Badge className="bg-red-50 text-red-700 border-red-200">
                    {result.errored.length} with errors
                  </Badge>
                )}
                {result.unknown.length > 0 && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                    {result.unknown.length} unknown SKU code
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Updates table */}
            {result.updated.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-900">SKU Code <span className="text-red-500">*</span> / SKU Name <span className="text-red-500">*</span></th>
                      <th className="text-left p-3 font-medium text-gray-900">Field</th>
                      <th className="text-left p-3 font-medium text-gray-900">Before</th>
                      <th className="text-left p-3 font-medium text-gray-900">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.updated.map((row) =>
                      row.changes.map((c, ci) => (
                        <tr key={`${row.skuCode}-${ci}`} className="border-b border-gray-100">
                          {ci === 0 ? (
                            <td className="p-3 align-top" rowSpan={row.changes.length}>
                              <p className="font-medium text-gray-900 line-clamp-2">
                                {row.skuName}
                              </p>
                              <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                                {row.skuCode}
                              </p>
                            </td>
                          ) : null}
                          <td className="p-3 text-gray-700">{c.field}</td>
                          <td className="p-3 text-gray-500 line-through">{c.before}</td>
                          <td className="p-3 font-medium text-emerald-700">{c.after}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {result.errored.length > 0 && (
              <div className="border-t border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Rows skipped
                </p>
                <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                  {result.errored.map((r) => (
                    <li key={r.skuCode}>
                      <span className="font-mono">{r.skuCode}</span>{" "}
                      {r.skuName} — {r.errors.join(" ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.unknown.length > 0 && (
              <div className="border-t border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> SKU codes not found in catalog
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  {result.unknown.slice(0, 10).map((r, i) => (
                    <li key={i}>
                      <span className="font-mono">{r.skuCode}</span>{" "}
                      {r.skuName || "(no name)"}
                    </li>
                  ))}
                  {result.unknown.length > 10 && (
                    <li>… and {result.unknown.length - 10} more.</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2 p-3 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" onClick={() => setResult(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={result.updated.length === 0}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply {result.updated.length} update{result.updated.length === 1 ? "" : "s"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-base">CSV Format</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {CSV_HEADER.map((h) => (
                    <th key={h} className="text-left p-2 font-semibold text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENT_SKUS.slice(0, 3).map((r) => (
                  <tr key={r.skuCode} className="border-b">
                    <td className="p-2 font-mono text-gray-500">
                      {r.skuCode}
                    </td>
                    <td className="p-2 text-gray-700">{r.skuName}</td>
                    <td className="p-2 text-gray-700">{r.brand}</td>
                    <td className="p-2 text-gray-700">{r.company}</td>
                    <td className="p-2 text-gray-700">{r.category}</td>
                    <td className="p-2 text-gray-700">{r.mrp}</td>
                    <td className="p-2 text-gray-700">{r.sellingPrice}</td>
                    <td className="p-2 text-gray-700">
                      {r.stockAvailable ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            <b>SKUCode</b>, <b>SKUName</b>, <b>Brand</b>, <b>Company</b>,{" "}
            <b>Category</b> are read-only — only edit <b>MRP</b>,{" "}
            <b>Selling price</b>, and <b>Stock Available</b>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
