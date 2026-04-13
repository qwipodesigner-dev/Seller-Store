import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  MoreVertical,
  Package,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

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

// Sample SKU data with ONDC compliance status
const sampleSKUs: SKUData[] = [
  {
    id: "1",
    name: "Fortune Sunlite Refined Sunflower Oil",
    category: "Edible Oil",
    brand: "Fortune",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-25",
    sku: "FOR-SUN-1L-001",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Fortune Sunlite Refined Sunflower Oil",
        mrp: "185.00",
        hsnCode: "15121900",
        countryOfOrigin: "India",
        manufacturerName: "Adani Wilmar Limited",
        manufacturerAddress: "Fortune House, Nr. Navrangpura Railway Crossing, Ahmedabad - 380009",
        importerPackerName: "Adani Wilmar Limited",
        importerPackerAddress: "Fortune House, Ahmedabad",
        productLength: "8.5",
        productWidth: "8.5",
        productHeight: "22.0",
        productWeight: "1000",
        returnPolicy: "No return on edible items once opened",
        supportName: "Fortune Customer Care",
        supportEmail: "care@adaniwilmar.com",
        supportPhone: "1800-123-4567",
      },
    },
  },
  {
    id: "2",
    name: "Maggi 2-Minute Noodles Masala",
    category: "Instant Food",
    brand: "Maggi",
    source: "Manual",
    status: "Active",
    lastUpdated: "2024-03-24",
    sku: "MAG-NOO-70G-002",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "HSN Code",
        "Manufacturer Address",
        "Product Dimensions (Length, Width, Height)",
        "Return Policy",
        "Customer Support Email",
      ],
      ondcData: {
        productName: "Maggi 2-Minute Noodles Masala",
        mrp: "14.00",
        hsnCode: "",
        countryOfOrigin: "India",
        manufacturerName: "Nestle India Limited",
        manufacturerAddress: "",
        importerPackerName: "Nestle India Limited",
        importerPackerAddress: "Nestle House, Jacaranda Marg, New Delhi",
        productLength: "",
        productWidth: "",
        productHeight: "",
        productWeight: "70",
        returnPolicy: "",
        supportName: "Maggi Consumer Care",
        supportEmail: "",
        supportPhone: "1800-102-4455",
      },
    },
  },
  {
    id: "3",
    name: "Britannia Good Day Butter Cookies",
    category: "Biscuits",
    brand: "Britannia",
    source: "Excel Import",
    status: "Inactive",
    lastUpdated: "2024-03-23",
    sku: "BRI-COO-100G-003",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "MRP",
        "Country of Origin",
        "Importer/Packer Name",
        "Importer/Packer Address",
        "Product Weight",
        "Customer Support Details (Name, Email, Phone)",
      ],
      ondcData: {
        productName: "Britannia Good Day Butter Cookies",
        mrp: "",
        hsnCode: "19053100",
        countryOfOrigin: "",
        manufacturerName: "Britannia Industries Ltd",
        manufacturerAddress: "Britannia House, Mumbai - 400001",
        importerPackerName: "",
        importerPackerAddress: "",
        productLength: "12.5",
        productWidth: "8.0",
        productHeight: "3.5",
        productWeight: "",
        returnPolicy: "7 days return policy if product is damaged",
        supportName: "",
        supportEmail: "",
        supportPhone: "",
      },
    },
  },
  {
    id: "4",
    name: "Tata Tea Gold Premium",
    category: "Tea",
    brand: "Tata Tea",
    source: "DMS",
    status: "Active",
    lastUpdated: "2024-03-22",
    sku: "TAT-TEA-250G-004",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Tata Tea Gold Premium",
        mrp: "165.00",
        hsnCode: "09021090",
        countryOfOrigin: "India",
        manufacturerName: "Tata Consumer Products Limited",
        manufacturerAddress: "1 Bishop Lefroy Road, Kolkata - 700020",
        importerPackerName: "Tata Consumer Products Limited",
        importerPackerAddress: "Kolkata, West Bengal",
        productLength: "10.0",
        productWidth: "6.5",
        productHeight: "15.0",
        productWeight: "250",
        returnPolicy: "No return on food items once opened",
        supportName: "Tata Tea Customer Care",
        supportEmail: "contact@tatateas.com",
        supportPhone: "1800-209-2121",
      },
    },
  },
  {
    id: "5",
    name: "Parle-G Gold Biscuits",
    category: "Biscuits",
    brand: "Parle",
    source: "Brand Sync",
    status: "Active",
    lastUpdated: "2024-03-21",
    sku: "PAR-BIS-1KG-005",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "HSN Code",
        "Manufacturer Address",
        "Product Weight",
      ],
      ondcData: {
        productName: "Parle-G Gold Biscuits",
        mrp: "150.00",
        hsnCode: "",
        countryOfOrigin: "India",
        manufacturerName: "Parle Products Pvt Ltd",
        manufacturerAddress: "",
        importerPackerName: "Parle Products Pvt Ltd",
        importerPackerAddress: "Vile Parle, Mumbai - 400056",
        productLength: "20.0",
        productWidth: "15.0",
        productHeight: "8.0",
        productWeight: "",
        returnPolicy: "7 days return if pack is sealed and unopened",
        supportName: "Parle Customer Care",
        supportEmail: "customercare@parle.com",
        supportPhone: "1800-300-6700",
      },
    },
  },
  {
    id: "6",
    name: "Amul Fresh Milk Full Cream",
    category: "Dairy",
    brand: "Amul",
    source: "Manual",
    status: "Draft",
    lastUpdated: "2024-03-20",
    sku: "AMU-MLK-1L-006",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "MRP",
        "HSN Code",
        "Manufacturer Name",
        "Manufacturer Address",
        "Importer/Packer Name",
        "Importer/Packer Address",
        "Product Dimensions (Length, Width, Height)",
        "Product Weight",
        "Return Policy",
        "Customer Support Details (Name, Email, Phone)",
      ],
      ondcData: {
        productName: "Amul Fresh Milk Full Cream",
        mrp: "",
        hsnCode: "",
        countryOfOrigin: "India",
        manufacturerName: "",
        manufacturerAddress: "",
        importerPackerName: "",
        importerPackerAddress: "",
        productLength: "",
        productWidth: "",
        productHeight: "",
        productWeight: "",
        returnPolicy: "",
        supportName: "",
        supportEmail: "",
        supportPhone: "",
      },
    },
  },
  {
    id: "7",
    name: "Lays Classic Salted Potato Chips",
    category: "Snacks",
    brand: "Lays",
    source: "Excel Import",
    status: "Active",
    lastUpdated: "2024-03-19",
    sku: "LAY-CHI-52G-007",
    ondcCompliance: {
      isCompliant: true,
      missingFields: [],
      ondcData: {
        productName: "Lays Classic Salted Potato Chips",
        mrp: "20.00",
        hsnCode: "20052000",
        countryOfOrigin: "India",
        manufacturerName: "PepsiCo India Holdings Pvt Ltd",
        manufacturerAddress: "Gurugram, Haryana - 122002",
        importerPackerName: "PepsiCo India Holdings Pvt Ltd",
        importerPackerAddress: "Gurugram, Haryana",
        productLength: "18.0",
        productWidth: "12.0",
        productHeight: "4.0",
        productWeight: "52",
        returnPolicy: "No return on food items once opened",
        supportName: "Lays Customer Service",
        supportEmail: "contact.india@pepsico.com",
        supportPhone: "1800-180-0772",
      },
    },
  },
  {
    id: "8",
    name: "Colgate MaxFresh Toothpaste",
    category: "Personal Care",
    brand: "Colgate",
    source: "DMS",
    status: "Inactive",
    lastUpdated: "2024-03-18",
    sku: "COL-TOP-150G-008",
    ondcCompliance: {
      isCompliant: false,
      missingFields: [
        "Country of Origin",
        "Product Dimensions (Length, Width, Height)",
      ],
      ondcData: {
        productName: "Colgate MaxFresh Toothpaste",
        mrp: "165.00",
        hsnCode: "33061010",
        countryOfOrigin: "",
        manufacturerName: "Colgate-Palmolive (India) Limited",
        manufacturerAddress: "Mumbai, Maharashtra - 400021",
        importerPackerName: "Colgate-Palmolive (India) Limited",
        importerPackerAddress: "Mumbai, Maharashtra",
        productLength: "",
        productWidth: "",
        productHeight: "",
        productWeight: "150",
        returnPolicy: "15 days return if pack is sealed and unopened",
        supportName: "Colgate Care Line",
        supportEmail: "consumercare@colpal.com",
        supportPhone: "1800-225-9999",
      },
    },
  },
];

export function MySKU() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOndcStatus, setSelectedOndcStatus] = useState("all");
  
  // ONDC Compliance Modal
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<SKUData | null>(null);
  const [editedOndcData, setEditedOndcData] = useState<Partial<ONDCData>>({});
  const [skus, setSkus] = useState<SKUData[]>(sampleSKUs);

  // Filter SKUs based on search and filters
  const filteredSKUs = skus.filter((sku) => {
    const matchesSearch = sku.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || sku.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || sku.brand === selectedBrand;
    const matchesSource = selectedSource === "all" || sku.source === selectedSource;
    const matchesStatus = selectedStatus === "all" || sku.status === selectedStatus;
    const matchesOndcStatus = selectedOndcStatus === "all" || 
      (selectedOndcStatus === "compliant" && sku.ondcCompliance.isCompliant) ||
      (selectedOndcStatus === "non-compliant" && !sku.ondcCompliance.isCompliant);
    
    return matchesSearch && matchesCategory && matchesBrand && matchesSource && matchesStatus && matchesOndcStatus;
  });

  const handleOpenComplianceModal = (sku: SKUData) => {
    setSelectedSKU(sku);
    setEditedOndcData({ ...sku.ondcCompliance.ondcData });
    setIsComplianceModalOpen(true);
  };

  const handleCloseComplianceModal = () => {
    setIsComplianceModalOpen(false);
    setSelectedSKU(null);
    setEditedOndcData({});
  };

  const handleSaveCompliance = () => {
    if (!selectedSKU) return;

    // Validate all required fields are filled
    const requiredFields: (keyof ONDCData)[] = [
      "productName", "mrp", "hsnCode", "countryOfOrigin",
      "manufacturerName", "manufacturerAddress",
      "importerPackerName", "importerPackerAddress",
      "productLength", "productWidth", "productHeight", "productWeight",
      "returnPolicy", "supportName", "supportEmail", "supportPhone"
    ];

    const stillMissingFields: string[] = [];
    requiredFields.forEach(field => {
      if (!editedOndcData[field] || editedOndcData[field]?.trim() === "") {
        stillMissingFields.push(fieldLabels[field]);
      }
    });

    if (stillMissingFields.length > 0) {
      toast.error(`Please fill all required fields: ${stillMissingFields.slice(0, 3).join(", ")}${stillMissingFields.length > 3 ? "..." : ""}`);
      return;
    }

    // Update the SKU with new ONDC data
    setSkus(prevSkus =>
      prevSkus.map(sku =>
        sku.id === selectedSKU.id
          ? {
              ...sku,
              ondcCompliance: {
                isCompliant: true,
                missingFields: [],
                ondcData: editedOndcData as ONDCData,
              },
            }
          : sku
      )
    );

    toast.success("ONDC compliance data updated successfully! SKU is now ONDC-ready.");
    handleCloseComplianceModal();
  };

  const fieldLabels: Record<keyof ONDCData, string> = {
    productName: "Product Name",
    mrp: "MRP",
    hsnCode: "HSN Code",
    countryOfOrigin: "Country of Origin",
    manufacturerName: "Manufacturer Name",
    manufacturerAddress: "Manufacturer Address",
    importerPackerName: "Importer/Packer Name",
    importerPackerAddress: "Importer/Packer Address",
    productLength: "Length (cm)",
    productWidth: "Width (cm)",
    productHeight: "Height (cm)",
    productWeight: "Weight (grams)",
    returnPolicy: "Return Policy",
    supportName: "Support Name",
    supportEmail: "Support Email",
    supportPhone: "Support Phone",
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "Brand Sync":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300">Brand Sync</Badge>;
      case "Manual":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Manual</Badge>;
      case "Excel Import":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Excel Import</Badge>;
      case "DMS":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">DMS</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Inactive</Badge>;
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOndcBadge = (isCompliant: boolean, missingFieldsCount: number) => {
    if (isCompliant) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          ONDC Ready
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
          <AlertTriangle className="h-3 w-3" />
          {missingFieldsCount} Missing
        </Badge>
      );
    }
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 p-6 rounded-full">
          <Package className="h-16 w-16 text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No SKUs added yet</h3>
      <p className="text-gray-600 mb-6">Start building your product catalog by adding your first SKU</p>
      <Button onClick={() => navigate("/products/add-sku")}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First SKU
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My SKU</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search SKU by name or code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Edible Oil">Edible Oil</SelectItem>
                    <SelectItem value="Instant Food">Instant Food</SelectItem>
                    <SelectItem value="Biscuits">Biscuits</SelectItem>
                    <SelectItem value="Tea">Tea</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Personal Care">Personal Care</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    <SelectItem value="Fortune">Fortune</SelectItem>
                    <SelectItem value="Maggi">Maggi</SelectItem>
                    <SelectItem value="Britannia">Britannia</SelectItem>
                    <SelectItem value="Tata Tea">Tata Tea</SelectItem>
                    <SelectItem value="Parle">Parle</SelectItem>
                    <SelectItem value="Amul">Amul</SelectItem>
                    <SelectItem value="Lays">Lays</SelectItem>
                    <SelectItem value="Colgate">Colgate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Brand Sync">Brand Sync</SelectItem>
                    <SelectItem value="Excel Import">Excel Import</SelectItem>
                    <SelectItem value="DMS">DMS</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedOndcStatus} onValueChange={setSelectedOndcStatus}>
                  <SelectTrigger className="w-[180px]">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="ONDC Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ONDC Status</SelectItem>
                    <SelectItem value="compliant">ONDC Ready</SelectItem>
                    <SelectItem value="non-compliant">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right: Add SKU Button */}
            <Button onClick={() => navigate("/products/add-sku")} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SKU List Table */}
      {filteredSKUs.length === 0 && searchQuery === "" && 
       selectedCategory === "all" && selectedBrand === "all" && selectedSource === "all" && selectedStatus === "all" && selectedOndcStatus === "all" ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      ) : filteredSKUs.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <p className="text-gray-600">No SKUs found matching your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedBrand("all");
                setSelectedSource("all");
                setSelectedStatus("all");
                setSelectedOndcStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">SKU Code</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">SKU Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Brand</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Updated</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSKUs.map((sku) => (
                    <tr 
                      key={sku.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {sku.sku}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{sku.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">{sku.category}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">{sku.brand}</p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(sku.status)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">{sku.lastUpdated}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/products/sku-detail/${sku.id}`)}
                            title="View SKU"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/products/my-sku/edit/${sku.id}`)}
                            title="Edit SKU"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => console.log("Duplicate", sku.id)}>
                                Duplicate SKU
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Archive", sku.id)}>
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => console.log("Delete", sku.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredSKUs.length}</span> of{" "}
                <span className="font-semibold">{skus.length}</span> SKUs
              </p>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">
                  {skus.filter(s => s.ondcCompliance.isCompliant).length} ONDC Ready
                </span>
                {" • "}
                <span className="font-semibold text-amber-600">
                  {skus.filter(s => !s.ondcCompliance.isCompliant).length} Incomplete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ONDC Compliance Modal */}
      <Dialog open={isComplianceModalOpen} onOpenChange={setIsComplianceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  Complete ONDC Compliance
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {selectedSKU?.name} - {selectedSKU?.sku}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseComplianceModal}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedSKU && (
            <div className="space-y-6 py-4">
              {/* Missing Fields Alert */}
              {selectedSKU.ondcCompliance.missingFields.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-900 mb-2">
                          {selectedSKU.ondcCompliance.missingFields.length} Required Fields Missing
                        </p>
                        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                          {selectedSKU.ondcCompliance.missingFields.map((field, idx) => (
                            <li key={idx}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Editable ONDC Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Product Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productName"
                        value={editedOndcData.productName || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, productName: e.target.value })}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mrp">
                        MRP (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="mrp"
                        type="number"
                        value={editedOndcData.mrp || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, mrp: e.target.value })}
                        placeholder="Enter MRP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsnCode">
                        HSN Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="hsnCode"
                        value={editedOndcData.hsnCode || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, hsnCode: e.target.value })}
                        placeholder="Enter HSN code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryOfOrigin">
                        Country of Origin <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="countryOfOrigin"
                        value={editedOndcData.countryOfOrigin || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, countryOfOrigin: e.target.value })}
                        placeholder="e.g., India"
                      />
                    </div>
                  </div>
                </div>

                {/* Manufacturer Details */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Manufacturer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturerName">
                        Manufacturer Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="manufacturerName"
                        value={editedOndcData.manufacturerName || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, manufacturerName: e.target.value })}
                        placeholder="Enter manufacturer name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="manufacturerAddress">
                        Manufacturer Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="manufacturerAddress"
                        value={editedOndcData.manufacturerAddress || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, manufacturerAddress: e.target.value })}
                        placeholder="Enter complete manufacturer address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Importer/Packer Details */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Importer/Packer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="importerPackerName">
                        Importer/Packer Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="importerPackerName"
                        value={editedOndcData.importerPackerName || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, importerPackerName: e.target.value })}
                        placeholder="Enter importer/packer name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="importerPackerAddress">
                        Importer/Packer Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="importerPackerAddress"
                        value={editedOndcData.importerPackerAddress || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, importerPackerAddress: e.target.value })}
                        placeholder="Enter importer/packer address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Dimensions & Weight */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Product Dimensions & Weight
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productLength">
                        Length (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productLength"
                        type="number"
                        value={editedOndcData.productLength || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, productLength: e.target.value })}
                        placeholder="cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productWidth">
                        Width (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productWidth"
                        type="number"
                        value={editedOndcData.productWidth || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, productWidth: e.target.value })}
                        placeholder="cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productHeight">
                        Height (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productHeight"
                        type="number"
                        value={editedOndcData.productHeight || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, productHeight: e.target.value })}
                        placeholder="cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productWeight">
                        Weight (grams) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productWeight"
                        type="number"
                        value={editedOndcData.productWeight || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, productWeight: e.target.value })}
                        placeholder="grams"
                      />
                    </div>
                  </div>
                </div>

                {/* Return Policy */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Return Policy
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">
                      Return Policy <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="returnPolicy"
                      value={editedOndcData.returnPolicy || ""}
                      onChange={(e) => setEditedOndcData({ ...editedOndcData, returnPolicy: e.target.value })}
                      placeholder="Enter return policy details"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Customer Support Details */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                    Customer Support Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportName">
                        Support Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supportName"
                        value={editedOndcData.supportName || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, supportName: e.target.value })}
                        placeholder="e.g., Customer Care"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">
                        Support Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={editedOndcData.supportEmail || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, supportEmail: e.target.value })}
                        placeholder="support@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">
                        Support Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supportPhone"
                        type="tel"
                        value={editedOndcData.supportPhone || ""}
                        onChange={(e) => setEditedOndcData({ ...editedOndcData, supportPhone: e.target.value })}
                        placeholder="1800-XXX-XXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseComplianceModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveCompliance} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Save & Mark ONDC Ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}