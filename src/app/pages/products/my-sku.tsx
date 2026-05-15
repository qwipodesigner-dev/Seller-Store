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
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  importBizomCsv,
  BIZOM_REQUIRED_HEADERS,
  AggregatedSKU,
} from "../../lib/bizom-validation";
import { Layers, PackageSearch } from "lucide-react";
import { isEmptyMode } from "../../lib/data-mode";
import { EmptyState } from "../../components/empty-state";
import { CopyOnHover } from "../../components/copy-on-hover";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  BulkImportDialog,
  type BulkImportValidationResult,
  type BulkImportError as BulkImportErrorRow,
} from "../../components/bulk-import-dialog";
import {
  downloadSkuTemplate,
  parseSkuImportFile,
  SKU_FIELDS,
  type ParsedSkuRow,
} from "../../lib/sku-import-template";

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
  // Demo SKU — fully ONDC-compliant Aashirvaad Atta 10 kg (ITC Limited).
  // Showcases what a complete, ready-to-publish SKU looks like.
  {
    id: "190000001",
    name: "Aashirvaad Whole Wheat Atta 10 kg",
    category: "Cooking and Baking Needs",
    brand: "Aashirvaad",
    source: "DMS",
    status: "Active",
    lastUpdated: "2026-04-25",
    sku: "190000001",
    mrp: 565,
    sellingPrice: 525,
    availableStock: 320,
    isInfiniteStock: false,
    thresholdLevel: 30,
    reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
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
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // -------------------------------------------------------------------
  // Extended catalog — 50 additional SKUs across ITC, Britannia, Nestle,
  // HUL, Tata, Marico, Mondelez, P&G, beverage majors, and dairy. Mix of
  // ONDC-compliant + non-compliant so the My SKU list paints all three
  // statuses against the 25-per-page pagination.
  // -------------------------------------------------------------------

  // ITC — Aashirvaad
  {
    id: "190000002", name: "Aashirvaad Multigrain Atta 5 kg",
    category: "Atta, Flours and Sooji", brand: "Aashirvaad", source: "DMS",
    status: "Active", lastUpdated: "2026-04-25", sku: "190000002",
    mrp: 320, sellingPrice: 298, availableStock: 184, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "190000003", name: "Aashirvaad Salt 1 kg",
    category: "Salt, Sugar and Jaggery", brand: "Aashirvaad", source: "DMS",
    status: "Active", lastUpdated: "2026-04-24", sku: "190000003",
    mrp: 28, sellingPrice: 26, availableStock: 412, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "190000004", name: "Aashirvaad Turmeric Powder 200 g",
    category: "Masala & Seasoning", brand: "Aashirvaad", source: "DMS",
    status: "Active", lastUpdated: "2026-04-22", sku: "190000004",
    mrp: 105, sellingPrice: 96, availableStock: 0, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "190000005", name: "Aashirvaad Chilli Powder 200 g",
    category: "Masala & Seasoning", brand: "Aashirvaad", source: "DMS",
    status: "Active", lastUpdated: "2026-04-20", sku: "190000005",
    mrp: 135, sellingPrice: 124, availableStock: 78, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // ITC — Sunfeast
  {
    id: "200000001", name: "Sunfeast Marie Light 200 g",
    category: "Chocolates and Biscuits", brand: "Sunfeast", source: "DMS",
    status: "Active", lastUpdated: "2026-04-18", sku: "200000001",
    mrp: 30, sellingPrice: 27, availableStock: 540, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "200000002", name: "Sunfeast Dark Fantasy Choco Fills 75 g",
    category: "Chocolates and Biscuits", brand: "Sunfeast", source: "DMS",
    status: "Active", lastUpdated: "2026-04-17", sku: "200000002",
    mrp: 50, sellingPrice: 45, availableStock: 320, isInfiniteStock: false, thresholdLevel: 60, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "200000003", name: "Sunfeast Mom's Magic Cashew & Almond 200 g",
    category: "Chocolates and Biscuits", brand: "Sunfeast", source: "DMS",
    status: "Active", lastUpdated: "2026-04-12", sku: "200000003",
    mrp: 55, sellingPrice: 50, availableStock: 210, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // ITC — Bingo
  {
    id: "210000001", name: "Bingo Mad Angles Achaari Masti 80 g",
    category: "Snacks and Namkeen", brand: "Bingo", source: "DMS",
    status: "Active", lastUpdated: "2026-04-15", sku: "210000001",
    mrp: 30, sellingPrice: 27, availableStock: 480, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "210000002", name: "Bingo Tedhe Medhe Tomato Twist 80 g",
    category: "Snacks and Namkeen", brand: "Bingo", source: "DMS",
    status: "Inactive", lastUpdated: "2026-04-10", sku: "210000002",
    mrp: 30, sellingPrice: 27, availableStock: 12, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // ITC — Yippee
  {
    id: "220000001", name: "Yippee Magic Masala Noodles 4-pack 280 g",
    category: "Pasta, Soup and Noodles", brand: "Yippee", source: "DMS",
    status: "Active", lastUpdated: "2026-04-19", sku: "220000001",
    mrp: 60, sellingPrice: 54, availableStock: 360, isInfiniteStock: false, thresholdLevel: 60, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "220000002", name: "Yippee Mood Masala Noodles 8-pack 560 g",
    category: "Pasta, Soup and Noodles", brand: "Yippee", source: "DMS",
    status: "Active", lastUpdated: "2026-04-14", sku: "220000002",
    mrp: 120, sellingPrice: 108, availableStock: 144, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // Britannia
  {
    id: "230000001", name: "Britannia Marie Gold 250 g",
    category: "Chocolates and Biscuits", brand: "Britannia", source: "DMS",
    status: "Active", lastUpdated: "2026-04-23", sku: "230000001",
    mrp: 45, sellingPrice: 41, availableStock: 600, isInfiniteStock: false, thresholdLevel: 100, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "230000002", name: "Britannia Good Day Cashew 200 g",
    category: "Chocolates and Biscuits", brand: "Britannia", source: "DMS",
    status: "Active", lastUpdated: "2026-04-21", sku: "230000002",
    mrp: 50, sellingPrice: 46, availableStock: 320, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "230000003", name: "Britannia 50-50 Maska Chaska 100 g",
    category: "Chocolates and Biscuits", brand: "Britannia", source: "DMS",
    status: "Active", lastUpdated: "2026-04-16", sku: "230000003",
    mrp: 20, sellingPrice: 18, availableStock: 480, isInfiniteStock: false, thresholdLevel: 100, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "230000004", name: "Britannia NutriChoice Digestive 200 g",
    category: "Chocolates and Biscuits", brand: "Britannia", source: "DMS",
    status: "Active", lastUpdated: "2026-04-11", sku: "230000004",
    mrp: 60, sellingPrice: 55, availableStock: 240, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // Nestle
  {
    id: "240000001", name: "Nestle Maggi 2-Minute Noodles 280 g (4-pack)",
    category: "Pasta, Soup and Noodles", brand: "Nestle", source: "DMS",
    status: "Active", lastUpdated: "2026-04-26", sku: "240000001",
    mrp: 64, sellingPrice: 58, availableStock: 800, isInfiniteStock: false, thresholdLevel: 120, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "240000002", name: "Nestle Maggi Hot & Sweet Tomato Sauce 1 kg",
    category: "Sauces, Spreads and Dips", brand: "Nestle", source: "DMS",
    status: "Active", lastUpdated: "2026-04-13", sku: "240000002",
    mrp: 175, sellingPrice: 160, availableStock: 95, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "240000003", name: "Nestle Kit Kat 4-Finger 38 g",
    category: "Chocolates and Biscuits", brand: "Nestle", source: "DMS",
    status: "Active", lastUpdated: "2026-04-09", sku: "240000003",
    mrp: 40, sellingPrice: 36, availableStock: 540, isInfiniteStock: false, thresholdLevel: 100, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "240000004", name: "Nestle Munch Chocolate 10 g (Pack of 30)",
    category: "Chocolates and Biscuits", brand: "Nestle", source: "DMS",
    status: "Active", lastUpdated: "2026-04-05", sku: "240000004",
    mrp: 150, sellingPrice: 138, availableStock: 60, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // HUL
  {
    id: "250000001", name: "Surf Excel Easy Wash 1 kg",
    category: "Detergents and Dishwash", brand: "Surf Excel", source: "DMS",
    status: "Active", lastUpdated: "2026-04-27", sku: "250000001",
    mrp: 140, sellingPrice: 128, availableStock: 220, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "250000002", name: "Wheel Active 2-in-1 Lemon & Jasmine 4 kg",
    category: "Detergents and Dishwash", brand: "Wheel", source: "DMS",
    status: "Active", lastUpdated: "2026-04-24", sku: "250000002",
    mrp: 240, sellingPrice: 220, availableStock: 88, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "250000003", name: "Lifebuoy Total 10 Soap 100 g (Pack of 4)",
    category: "Beauty & Hygiene", brand: "Lifebuoy", source: "DMS",
    status: "Active", lastUpdated: "2026-04-19", sku: "250000003",
    mrp: 100, sellingPrice: 92, availableStock: 360, isInfiniteStock: false, thresholdLevel: 60, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "250000004", name: "Dove Cream Beauty Bar 100 g",
    category: "Beauty & Hygiene", brand: "Dove", source: "DMS",
    status: "Active", lastUpdated: "2026-04-16", sku: "250000004",
    mrp: 80, sellingPrice: 73, availableStock: 450, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "250000005", name: "Lux Soft Touch Soap 150 g (Pack of 3)",
    category: "Beauty & Hygiene", brand: "Lux", source: "DMS",
    status: "Inactive", lastUpdated: "2026-04-02", sku: "250000005",
    mrp: 90, sellingPrice: 82, availableStock: 26, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // Tata Consumer Products
  {
    id: "260000001", name: "Tata Salt 1 kg",
    category: "Salt, Sugar and Jaggery", brand: "Tata", source: "DMS",
    status: "Active", lastUpdated: "2026-04-28", sku: "260000001",
    mrp: 28, sellingPrice: 26, availableStock: 800, isInfiniteStock: false, thresholdLevel: 100, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "260000002", name: "Tata Sampann Toor Dal Unpolished 1 kg",
    category: "Dals and Pulses", brand: "Tata Sampann", source: "DMS",
    status: "Active", lastUpdated: "2026-04-22", sku: "260000002",
    mrp: 180, sellingPrice: 165, availableStock: 250, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "260000003", name: "Tata Tea Premium 500 g",
    category: "Tea and Coffee", brand: "Tata Tea", source: "DMS",
    status: "Active", lastUpdated: "2026-04-18", sku: "260000003",
    mrp: 280, sellingPrice: 255, availableStock: 140, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "260000004", name: "Tata Tea Gold 250 g",
    category: "Tea and Coffee", brand: "Tata Tea", source: "DMS",
    status: "Active", lastUpdated: "2026-04-14", sku: "260000004",
    mrp: 175, sellingPrice: 160, availableStock: 0, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // Marico
  {
    id: "270000001", name: "Saffola Gold Refined Oil 1 L",
    category: "Oil & Ghee", brand: "Saffola", source: "DMS",
    status: "Active", lastUpdated: "2026-04-26", sku: "270000001",
    mrp: 210, sellingPrice: 192, availableStock: 360, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "270000002", name: "Saffola Tasty Refined Oil 1 L",
    category: "Oil & Ghee", brand: "Saffola", source: "DMS",
    status: "Active", lastUpdated: "2026-04-23", sku: "270000002",
    mrp: 195, sellingPrice: 178, availableStock: 280, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "270000003", name: "Parachute Coconut Oil 200 ml",
    category: "Beauty & Hygiene", brand: "Parachute", source: "DMS",
    status: "Active", lastUpdated: "2026-04-20", sku: "270000003",
    mrp: 110, sellingPrice: 100, availableStock: 540, isInfiniteStock: false, thresholdLevel: 80, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "270000004", name: "Hair & Care Almond Hair Oil 100 ml",
    category: "Beauty & Hygiene", brand: "Hair & Care", source: "DMS",
    status: "Active", lastUpdated: "2026-04-12", sku: "270000004",
    mrp: 75, sellingPrice: 68, availableStock: 320, isInfiniteStock: false, thresholdLevel: 60, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // Mondelez
  {
    id: "280000001", name: "Cadbury Dairy Milk Silk 60 g",
    category: "Chocolates and Biscuits", brand: "Cadbury", source: "DMS",
    status: "Active", lastUpdated: "2026-04-27", sku: "280000001",
    mrp: 85, sellingPrice: 78, availableStock: 720, isInfiniteStock: false, thresholdLevel: 120, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "280000002", name: "Cadbury 5 Star Chocolate 25 g (Pack of 12)",
    category: "Chocolates and Biscuits", brand: "Cadbury", source: "DMS",
    status: "Active", lastUpdated: "2026-04-21", sku: "280000002",
    mrp: 120, sellingPrice: 110, availableStock: 240, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "280000003", name: "Cadbury Bournvita Health Drink 500 g",
    category: "Beverages", brand: "Bournvita", source: "DMS",
    status: "Active", lastUpdated: "2026-04-15", sku: "280000003",
    mrp: 245, sellingPrice: 225, availableStock: 168, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // P&G
  {
    id: "290000001", name: "Tide Plus Extra Power 1 kg",
    category: "Detergents and Dishwash", brand: "Tide", source: "DMS",
    status: "Active", lastUpdated: "2026-04-25", sku: "290000001",
    mrp: 145, sellingPrice: 132, availableStock: 280, isInfiniteStock: false, thresholdLevel: 50, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "290000002", name: "Ariel Matic Front Load Detergent 1 kg",
    category: "Detergents and Dishwash", brand: "Ariel", source: "DMS",
    status: "Active", lastUpdated: "2026-04-22", sku: "290000002",
    mrp: 235, sellingPrice: 215, availableStock: 160, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "290000003", name: "Pantene Pro-V Total Damage Care Shampoo 180 ml",
    category: "Beauty & Hygiene", brand: "Pantene", source: "DMS",
    status: "Active", lastUpdated: "2026-04-17", sku: "290000003",
    mrp: 165, sellingPrice: 150, availableStock: 220, isInfiniteStock: false, thresholdLevel: 40, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "290000004", name: "Whisper Ultra Choice 7-pack XL",
    category: "Beauty & Hygiene", brand: "Whisper", source: "DMS",
    status: "Active", lastUpdated: "2026-04-13", sku: "290000004",
    mrp: 145, sellingPrice: 132, availableStock: 390, isInfiniteStock: false, thresholdLevel: 60, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // Beverage majors
  {
    id: "300000001", name: "Coca-Cola PET 600 ml (Case of 24)",
    category: "Beverages", brand: "Coca-Cola", source: "DMS",
    status: "Active", lastUpdated: "2026-04-28", sku: "300000001",
    mrp: 960, sellingPrice: 880, availableStock: 64, isInfiniteStock: false, thresholdLevel: 15, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "300000002", name: "Pepsi PET 600 ml (Case of 24)",
    category: "Beverages", brand: "Pepsi", source: "DMS",
    status: "Active", lastUpdated: "2026-04-26", sku: "300000002",
    mrp: 960, sellingPrice: 880, availableStock: 56, isInfiniteStock: false, thresholdLevel: 15, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "300000003", name: "Sprite PET 600 ml (Case of 24)",
    category: "Beverages", brand: "Sprite", source: "DMS",
    status: "Active", lastUpdated: "2026-04-24", sku: "300000003",
    mrp: 960, sellingPrice: 880, availableStock: 48, isInfiniteStock: false, thresholdLevel: 15, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "300000004", name: "Thumbs Up PET 600 ml (Case of 24)",
    category: "Beverages", brand: "Thumbs Up", source: "DMS",
    status: "Active", lastUpdated: "2026-04-19", sku: "300000004",
    mrp: 960, sellingPrice: 880, availableStock: 40, isInfiniteStock: false, thresholdLevel: 15, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },

  // Dairy & breakfast
  {
    id: "310000001", name: "Amul Toned Milk 1 L (Case of 12)",
    category: "Dairy and Cheese", brand: "Amul", source: "DMS",
    status: "Active", lastUpdated: "2026-04-27", sku: "310000001",
    mrp: 720, sellingPrice: 660, availableStock: 35, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "310000002", name: "Mother Dairy Paneer 200 g",
    category: "Dairy and Cheese", brand: "Mother Dairy", source: "DMS",
    status: "Active", lastUpdated: "2026-04-25", sku: "310000002",
    mrp: 95, sellingPrice: 86, availableStock: 168, isInfiniteStock: false, thresholdLevel: 30, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
  {
    id: "310000003", name: "Amul Butter 500 g",
    category: "Dairy and Cheese", brand: "Amul", source: "DMS",
    status: "Active", lastUpdated: "2026-04-22", sku: "310000003",
    mrp: 285, sellingPrice: 262, availableStock: 144, isInfiniteStock: false, thresholdLevel: 25, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "310000004", name: "Kellogg's Corn Flakes Original 475 g",
    category: "Cereals and Breakfast", brand: "Kellogg's", source: "DMS",
    status: "Active", lastUpdated: "2026-04-18", sku: "310000004",
    mrp: 235, sellingPrice: 215, availableStock: 120, isInfiniteStock: false, thresholdLevel: 25, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "310000005", name: "Bagrry's White Oats 1 kg",
    category: "Cereals and Breakfast", brand: "Bagrry's", source: "DMS",
    status: "Active", lastUpdated: "2026-04-14", sku: "310000005",
    mrp: 280, sellingPrice: 255, availableStock: 88, isInfiniteStock: false, thresholdLevel: 20, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },

  // Pet care
  {
    id: "320000001", name: "Pedigree Chicken & Vegetables 1.2 kg",
    category: "Pet Care", brand: "Pedigree", source: "DMS",
    status: "Active", lastUpdated: "2026-04-15", sku: "320000001",
    mrp: 460, sellingPrice: 420, availableStock: 56, isInfiniteStock: false, thresholdLevel: 12, reservedStock: 0,
    ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
  },
  {
    id: "320000002", name: "Whiskas Cat Food Tuna 480 g",
    category: "Pet Care", brand: "Whiskas", source: "DMS",
    status: "Active", lastUpdated: "2026-04-08", sku: "320000002",
    mrp: 320, sellingPrice: 295, availableStock: 32, isInfiniteStock: false, thresholdLevel: 10, reservedStock: 0,
    ondcCompliance: { isCompliant: false, missingFields: ["Short Description", "Long Description", "Measure Unit", "SKU Weight", "Min Order Qty", "Max Order Qty", "Category ID", "Fulfillment ID", "Location ID", "Time to Ship", "Consumer Care Contact", "Country of Origin", "Brand Attribute"], ondcData: {} },
  },
];


// Bulk-import columns — Phase-change:
// The import file now carries ONLY the SKU Code and SKU Name. All other ONDC fields
// are filled in per-SKU via the SKU Detail page and validated on save there.
const ONDC_REQUIRED_COLUMNS = ["SKU Code", "SKU Name"];
const ONDC_OPTIONAL_COLUMNS: string[] = [];

export function MySKU() {
  const navigate = useNavigate();
  const [skus, setSkus] = useState<SKUData[]>(() =>
    isEmptyMode() ? [] : sampleSKUs,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add SKU + Price/Stock bulk import are both driven through the
  // shared <BulkImportDialog>. Each owns only its open flag; the
  // dialog handles upload, validation, results, and import flow.
  const [isAddSkuBulkOpen, setIsAddSkuBulkOpen] = useState(false);
  const [isPriceStockBulkOpen, setIsPriceStockBulkOpen] = useState(false);

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

  // ---- Add SKU bulk import ----
  // Both flows (Add SKU + Price/Stock) drive the shared
  // <BulkImportDialog>. The validate / onImport closures below adapt
  // the existing parsing logic to the standardized
  // BulkImportValidationResult shape so the dialog renders the same
  // summary card + Row/Field/Error table for every module.
  const handleDownloadAddSkuSample = async () => {
    // Phase 2 spec: download a 3-tab .xlsx (Main SKU Upload /
    // Validation / Master Data) with cell-level dropdowns on every
    // master-backed column. The generator (ExcelJS-based, so the
    // dropdowns actually persist on save) lives in
    // lib/sku-import-template.ts so this page stays focused on the
    // table UX.
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

  // Apply validated Add-SKU rows into the catalog. Phase 2: rows now
  // arrive with every SKU field, so we hydrate the catalog record
  // with category, brand, status, etc. — no more "Imported / —"
  // placeholders.
  const importAddSkuRows = (rows: unknown[]) => {
    const valid = rows as ParsedSkuRow[];
    const newSkus: SKUData[] = valid.map((row, idx) => {
      const status =
        (row.itemStatus ?? "").toLowerCase() === "inactive"
          ? "Inactive"
          : "Active";
      return {
        id: String(skus.length + idx + 1),
        name: row.skuName ?? "",
        category: row.categoryId || "Imported",
        brand: row.brandAttribute || "—",
        source: "Excel Import",
        status,
        lastUpdated: new Date().toISOString().split("T")[0],
        sku: row.skuCode ?? "",
        ondcCompliance: { isCompliant: true, missingFields: [], ondcData: {} },
      };
    });
    setSkus((prev) => [...newSkus, ...prev]);
  };

  // ---- Price & Stock update (Bizom DMS bulk import) ----
  // Business rule: SKU Codes from the file that don't exist in the
  // catalog are silently skipped; only existing SKUs are updated.
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

  // Validate uploaded Price/Stock file → standardized result for the
  // shared dialog. Wraps importBizomCsv() and rejects rows whose SKU
  // Code is not present in the catalog (we don't auto-create on a
  // price update — that's the Add SKU flow).
  const validatePriceStockFile = async (
    file: File,
  ): Promise<BulkImportValidationResult> => {
    const text = await readFileText(file);
    const result = importBizomCsv(text);
    const errors: BulkImportErrorRow[] = [];

    // File-level errors (header missing, completely empty, etc.) — fold
    // each into a single Row 1 entry so the standardized table renders.
    for (const fe of result.fileLevelErrors) {
      errors.push({ row: 1, field: fe.field || "File", error: fe.message });
    }

    // Per-batch-row validation errors from the Bizom validator.
    for (const br of result.batchRows) {
      for (const e of br.errors) {
        errors.push({ row: br.raw.rowNumber, field: e.field, error: e.message });
      }
    }

    // Silent-skip rule for unknown SKU Codes — these aren't validation
    // errors, they're just rows we ignore. We still expose them in the
    // error table so the seller can see what was skipped and why.
    const catalog = new Set(skus.map((s) => s.sku));
    const matched: AggregatedSKU[] = [];
    for (const agg of result.aggregated) {
      if (catalog.has(agg.skuCode)) {
        matched.push(agg);
      } else {
        errors.push({
          row: 0,
          field: "SKU Code",
          error: "SKU Code not found in your catalog.",
        });
      }
    }

    return {
      totalRows: result.totalRows,
      validRows: matched.length,
      invalidRows: result.totalRows - matched.length,
      errors,
      validData: matched,
    };
  };

  // Apply validated price/stock rows to the catalog.
  const importPriceStockRows = (rows: unknown[]) => {
    const matched = rows as AggregatedSKU[];
    if (matched.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    const byCode = new Map(matched.map((s) => [s.skuCode, s]));
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
      {/* Page area — Card fills the available height; only the table
          rows scroll, the search/filter header and pagination stay
          pinned to the top and bottom of the Card. */}
      <div className="flex-1 overflow-hidden p-6">
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
                    <DropdownMenuItem
                      onClick={() => setIsAddSkuBulkOpen(true)}
                      className="gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Add New SKUs</p>
                        <p className="text-[11px] text-gray-500">Upload the full SKU template (all fields)</p>
                      </div>
                    </DropdownMenuItem>
                    {/* "Update Price & Stock" needs an existing catalog
                        to update — when the seller has no SKUs yet
                        (empty inception state) the option is disabled
                        and visually greyed out so it's clear they need
                        to add SKUs first via the row above. */}
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
                description="No SKUs in your catalog yet — click Bulk Import → Add new SKU to bring in your first products."
              />
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    SKU Code <span className="text-red-500">*</span>
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
                    <td colSpan={8} className="px-4 py-3">
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
            fileName: "SKU_Import_Template.xlsx",
            onDownload: handleDownloadAddSkuSample,
          },
          accept: ".csv,.xlsx,.xls",
          validate: validateAddSkuFile,
          onImport: importAddSkuRows,
        }}
      />

      {/* Price & Stock — Bulk Import. Same standardized flow as Add
          SKU; differs only in copy, sample template, and validator
          (Bizom DMS export, silent-skip for unknown SKU Codes). */}
      <BulkImportDialog
        open={isPriceStockBulkOpen}
        onOpenChange={setIsPriceStockBulkOpen}
        config={{
          title: "Update Price & Stock — Bulk Import",
          description:
            "Upload a Bizom DMS export. Existing SKUs get their MRP, Selling Price, and Stock refreshed; rows whose SKU Code is not in the catalog are skipped.",
          instructions: (
            <>
              Use this to update price and stock on SKUs that already exist in
              your catalog. Download the sheet — it comes pre-filled with your
              existing SKUs and current values — edit only the price and stock
              columns, then re-upload. To add brand-new SKUs, use{" "}
              <b>Add new SKU</b> instead.
            </>
          ),
          sample: {
            fileName: "Bizom_Price_Stock_Template.csv",
            onDownload: handleDownloadPsSample,
          },
          accept: ".csv,.xlsx,.xls",
          validate: validatePriceStockFile,
          onImport: importPriceStockRows,
        }}
      />
    </div>
  );
}