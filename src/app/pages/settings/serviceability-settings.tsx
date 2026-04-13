import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Plus, 
  Trash2, 
  Upload, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Settings,
  ChevronRight,
  Database,
  Edit,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

// Mock company data
interface CompanyServiceability {
  id: string;
  companyName: string;
  type: "dms" | "manual" | null;
  status: "configured" | "not-configured";
  lastSynced?: string;
  stats?: {
    states?: number;
    cities?: number;
    pinCodes?: number;
  };
}

const mockCompanies: CompanyServiceability[] = [
  {
    id: "company-1",
    companyName: "Company A",
    type: "manual",
    status: "configured",
    stats: { states: 3, cities: 28, pinCodes: 1245 },
  },
  {
    id: "company-2",
    companyName: "Company B",
    type: "dms",
    status: "configured",
    lastSynced: "2026-03-28 14:30",
  },
  {
    id: "company-3",
    companyName: "Company C",
    type: null,
    status: "not-configured",
  },
  {
    id: "company-4",
    companyName: "Company D",
    type: "manual",
    status: "configured",
    stats: { states: 2, cities: 15, pinCodes: 687 },
  },
];

type ViewMode = "list" | "configure";

export function ServiceabilitySettings() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [companies, setCompanies] = useState<CompanyServiceability[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<CompanyServiceability | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [serviceabilityType, setServiceabilityType] = useState<"dms" | "manual">("manual");
  
  // Manual serviceability states
  const [uploadedPolygonFile, setUploadedPolygonFile] = useState<File | null>(null);
  const [polygonData, setPolygonData] = useState<any>(null);
  const [isValidPolygon, setIsValidPolygon] = useState<boolean | null>(null);

  const handleCompanyClick = (company: CompanyServiceability) => {
    setSelectedCompany(company);
    setCompanyName(company.companyName);
    setServiceabilityType(company.type || "manual");
    setViewMode("configure");
  };

  const handleAddNewCompany = () => {
    setSelectedCompany(null);
    setCompanyName("");
    setServiceabilityType("manual");
    setViewMode("configure");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCompany(null);
    setCompanyName("");
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
  };

  const handlePolygonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && !file.name.endsWith('.geojson')) {
      toast.error("Please upload a valid GeoJSON or JSON file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        if (json.type === 'FeatureCollection' || json.type === 'Feature' || json.type === 'Polygon') {
          setUploadedPolygonFile(file);
          setPolygonData(json);
          setIsValidPolygon(true);
          toast.success(`Polygon file "${file.name}" uploaded successfully!`);
        } else {
          setIsValidPolygon(false);
          toast.error("Invalid polygon format. Please upload a valid GeoJSON file.");
        }
      } catch (error) {
        setIsValidPolygon(false);
        toast.error("Failed to parse file. Please ensure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleRemovePolygon = () => {
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
    toast.info("Polygon file removed");
  };

  const handleSaveConfiguration = () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    toast.success("Serviceability configuration saved successfully!");
    setViewMode("list");
  };

  // List View - Company Overview
  if (viewMode === "list") {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/settings")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-600" />
              Serviceability Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure company-level serviceability for your marketplace
            </p>
          </div>
          <Button onClick={handleAddNewCompany} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Company Serviceability
          </Button>
        </div>

        <div className="max-w-6xl space-y-4">
          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Company-Level Configuration</p>
                  <p className="text-blue-800">
                    Each company can have its own serviceability settings. Configure where each company can deliver products using DMS sync or manual configuration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <Card>
            <CardHeader>
              <CardTitle>Companies ({companies.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="group p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-white transition-all cursor-pointer"
                  onClick={() => handleCompanyClick(company)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-lg text-gray-900">
                          {company.companyName}
                        </h3>
                        {company.status === "configured" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Configured
                          </Badge>
                        )}
                        {company.type === "dms" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            <Database className="h-3 w-3 mr-1" />
                            DMS Sync
                          </Badge>
                        )}
                        {company.type === "manual" && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            <Settings className="h-3 w-3 mr-1" />
                            Manual
                          </Badge>
                        )}
                      </div>

                      {/* Stats or Last Sync */}
                      {company.type === "manual" && company.stats && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                          <span>{company.stats.states} States</span>
                          <span className="text-gray-300">•</span>
                          <span>{company.stats.cities} Cities</span>
                          <span className="text-gray-300">•</span>
                          <span>{company.stats.pinCodes.toLocaleString()} PIN Codes</span>
                        </div>
                      )}
                      {company.type === "dms" && company.lastSynced && (
                        <p className="text-sm text-gray-600 ml-8">
                          Last synced: {company.lastSynced}
                        </p>
                      )}
                      {company.status === "not-configured" && (
                        <p className="text-sm text-gray-600 ml-8">
                          Click to configure serviceability for this company
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {company.status === "configured" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompanyClick(company);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Configure View - Company Configuration
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackToList}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-green-600" />
            {selectedCompany ? `Configure: ${selectedCompany.companyName}` : "Add Company Serviceability"}
          </h1>
          <p className="text-gray-600 mt-1">
            Define serviceability settings for this company
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Company Name Input */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-base">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company-name"
                placeholder="Enter company name (e.g., ABC Distributors Pvt Ltd)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                This name will be used to identify the company in serviceability settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Select Serviceability Source */}
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              Select Serviceability Source
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup value={serviceabilityType} onValueChange={(value) => setServiceabilityType(value as "dms" | "manual")}>
              <div className="space-y-4">
                {/* DMS Option */}
                <label
                  htmlFor="dms-option"
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    serviceabilityType === "dms"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="dms" id="dms-option" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Sync from DMS</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Automatically fetch and sync serviceability data from your DMS system
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-md inline-flex">
                      <CheckCircle2 className="h-3 w-3" />
                      Auto-synced • No manual input required
                    </div>
                  </div>
                </label>

                {/* Manual Option */}
                <label
                  htmlFor="manual-option"
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    serviceabilityType === "manual"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="manual" id="manual-option" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Manual Serviceability</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Manually configure serviceability using PIN codes, states/cities, or polygon maps
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-100 px-3 py-1.5 rounded-md inline-flex">
                      <Settings className="h-3 w-3" />
                      Full control • Custom configuration
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 2: Configuration based on selected type */}
        {serviceabilityType === "dms" && (
          <>
            {/* DMS Sync Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  DMS Synchronization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Database className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 mb-2">Automatic Data Sync</p>
                    <p className="text-sm text-blue-800 mb-3">
                      Serviceability data will be automatically fetched from your connected DMS system. 
                      The data includes all serviceable regions, PIN codes, and delivery zones configured in your DMS.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Real-time synchronization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Automatic updates when DMS data changes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">No manual configuration needed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sync Status */}
                {selectedCompany?.lastSynced && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Last Synced</span>
                      </div>
                      <span className="text-sm text-green-700">{selectedCompany.lastSynced}</span>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Database className="h-4 w-4" />
                      Sync Now
                    </Button>
                  </div>
                )}

                {!selectedCompany?.lastSynced && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-900">Not Synced Yet</span>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      Click the button below to perform the first sync with your DMS system.
                    </p>
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                      <Database className="h-4 w-4" />
                      Perform Initial Sync
                    </Button>
                  </div>
                )}

                {/* DMS Connection Info */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Connected DMS</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">System</p>
                      <p className="font-medium text-gray-900">Tally ERP</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Connection Status</p>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {serviceabilityType === "manual" && (
          <>
            {/* Manual Configuration Header */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Configure Serviceability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Define serviceable areas using states/cities, PIN codes, or custom polygon boundaries.
                </p>
              </CardContent>
            </Card>

            {/* Service Area Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Area Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">States Covered</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {selectedCompany?.stats?.states || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Cities</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {selectedCompany?.stats?.cities || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">PIN Codes</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {selectedCompany?.stats?.pinCodes?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add by State/City */}
            <Card>
              <CardHeader>
                <CardTitle>Add Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MH">Maharashtra</SelectItem>
                        <SelectItem value="GJ">Gujarat</SelectItem>
                        <SelectItem value="KA">Karnataka</SelectItem>
                        <SelectItem value="DL">Delhi</SelectItem>
                        <SelectItem value="UP">Uttar Pradesh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select City</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="nagpur">Nagpur</SelectItem>
                        <SelectItem value="nashik">Nashik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service Area
                </Button>
              </CardContent>
            </Card>

            {/* Add by PIN Code */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PIN Code Management</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add PIN Codes</Label>
                  <Textarea
                    placeholder="Enter PIN codes separated by commas (e.g., 400001, 400002, 400003)"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    You can add multiple PIN codes at once
                  </p>
                </div>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add PIN Codes
                </Button>
              </CardContent>
            </Card>

            {/* Polygon Upload Section */}
            <Card className="border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileJson className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Polygon-based Service Area</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload GeoJSON polygon file to define custom delivery zones
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">What is a Polygon File?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>GeoJSON or JSON file format (.json, .geojson)</li>
                      <li>Defines precise geographic boundaries for your delivery area</li>
                      <li>More accurate than PIN code-based coverage</li>
                      <li>Maximum file size: 5MB</li>
                    </ul>
                  </div>
                </div>

                {/* Upload Area */}
                {!uploadedPolygonFile ? (
                  <div>
                    <Label htmlFor="polygon-upload" className="mb-3 block">
                      Upload Polygon File
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50">
                      <input
                        id="polygon-upload"
                        type="file"
                        accept=".json,.geojson"
                        onChange={handlePolygonUpload}
                        className="hidden"
                      />
                      <label htmlFor="polygon-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-indigo-100 p-4 rounded-full">
                            <Upload className="h-8 w-8 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              GeoJSON or JSON files (Max 5MB)
                            </p>
                          </div>
                          <Button type="button" size="sm" className="mt-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Browse Files
                          </Button>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: .json, .geojson
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Uploaded File Display */}
                    <div className={`p-4 rounded-lg border-2 ${
                      isValidPolygon 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isValidPolygon ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {isValidPolygon ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileJson className="h-4 w-4 text-gray-600" />
                              <p className="font-medium text-gray-900">
                                {uploadedPolygonFile.name}
                              </p>
                              {isValidPolygon && (
                                <Badge className="bg-green-600 text-white">
                                  Valid
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {(uploadedPolygonFile.size / 1024).toFixed(2)} KB
                            </p>
                            {isValidPolygon && polygonData && (
                              <div className="mt-2 text-xs text-gray-600">
                                <p>Type: {polygonData.type}</p>
                                {polygonData.features && (
                                  <p>Features: {polygonData.features.length}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePolygon}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Polygon Details */}
                    {isValidPolygon && polygonData && (
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-indigo-900 mb-1">
                              Polygon Validated Successfully
                            </p>
                            <p className="text-sm text-indigo-800">
                              Your custom delivery zone has been defined. Click "Save Configuration" to apply this polygon to your serviceability settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Example Format Link */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Need help creating a polygon file?
                    </p>
                    <Button variant="link" size="sm" className="text-indigo-600">
                      Download Sample Format
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Service Areas - Only show if company is configured */}
            {selectedCompany?.status === "configured" && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Service Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Maharashtra */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg">Maharashtra</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">12 cities • 542 PIN codes</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      <Badge variant="secondary">Mumbai</Badge>
                      <Badge variant="secondary">Pune</Badge>
                      <Badge variant="secondary">Nagpur</Badge>
                      <Badge variant="secondary">Nashik</Badge>
                      <Badge variant="secondary">Aurangabad</Badge>
                      <Badge variant="secondary">+7 more</Badge>
                    </div>
                  </div>

                  {/* Gujarat */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg">Gujarat</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">9 cities • 398 PIN codes</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      <Badge variant="secondary">Ahmedabad</Badge>
                      <Badge variant="secondary">Surat</Badge>
                      <Badge variant="secondary">Vadodara</Badge>
                      <Badge variant="secondary">Rajkot</Badge>
                      <Badge variant="secondary">+5 more</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Excluded PIN Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Excluded PIN Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Specific PIN codes where delivery is not available for this company
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium">400078</p>
                      <p className="text-xs text-gray-600">Mumbai - Construction Zone</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Enter PIN code to exclude" />
                  <Button variant="outline">Add</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToList}>
            Cancel
          </Button>
          <Button onClick={handleSaveConfiguration} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
