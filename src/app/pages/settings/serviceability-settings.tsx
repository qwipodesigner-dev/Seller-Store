import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
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
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Edit,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import {
  getCompanies as getAdminCatalogCompanies,
  subscribeToCompanies,
  type Company as AdminCatalogCompany,
} from "../../lib/admin-catalog";

// A row shown in the list view: one entry per company linked to this distributor.
interface CompanyServiceabilityRow {
  companyId: string;
  companyName: string;
  hasPolygon: boolean;
  polygonFileName?: string;
}

type ViewMode = "list" | "configure";

// Mock: which company IDs are already configured (have a polygon uploaded).
// Keyed by admin-catalog company id.
const initialConfigured: Record<string, { fileName: string }> = {
  "co-freedom": { fileName: "freedom-zone.geojson" },
};

export function ServiceabilitySettings() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Admin-catalog companies (the master list available to this distributor)
  const [adminCompanies, setAdminCompanies] = useState<AdminCatalogCompany[]>(
    () => getAdminCatalogCompanies()
  );
  useEffect(() => {
    const unsub = subscribeToCompanies(() => {
      setAdminCompanies(getAdminCatalogCompanies());
    });
    return unsub;
  }, []);

  // Per-company configuration map (companyId -> file info). Mock-persisted in component state.
  const [configured, setConfigured] = useState<Record<string, { fileName: string }>>(
    initialConfigured
  );

  // Configure-view state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [uploadedPolygonFile, setUploadedPolygonFile] = useState<File | null>(null);
  const [polygonData, setPolygonData] = useState<any>(null);
  const [isValidPolygon, setIsValidPolygon] = useState<boolean | null>(null);

  const rows: CompanyServiceabilityRow[] = adminCompanies.map((c) => ({
    companyId: c.id,
    companyName: c.name,
    hasPolygon: Boolean(configured[c.id]),
    polygonFileName: configured[c.id]?.fileName,
  }));

  const handleEditRow = (row: CompanyServiceabilityRow) => {
    setSelectedCompanyId(row.companyId);
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(row.hasPolygon ? true : null);
    setViewMode("configure");
  };

  const handleAddNewCompany = () => {
    setSelectedCompanyId("");
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
    setViewMode("configure");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCompanyId("");
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
  };

  const handlePolygonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
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

        if (
          json.type === "FeatureCollection" ||
          json.type === "Feature" ||
          json.type === "Polygon"
        ) {
          setUploadedPolygonFile(file);
          setPolygonData(json);
          setIsValidPolygon(true);
          toast.success(`Polygon file "${file.name}" uploaded successfully!`);
        } else {
          setIsValidPolygon(false);
          toast.error("Invalid polygon format. Please upload a valid GeoJSON file.");
        }
      } catch {
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
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }
    const isAlreadyConfigured = Boolean(configured[selectedCompanyId]);
    if (!uploadedPolygonFile && !isAlreadyConfigured) {
      toast.error("Please upload a polygon (GeoJSON) file");
      return;
    }
    if (uploadedPolygonFile) {
      setConfigured((prev) => ({
        ...prev,
        [selectedCompanyId]: { fileName: uploadedPolygonFile.name },
      }));
    }
    toast.success("Serviceability configuration saved successfully!");
    handleBackToList();
  };

  const selectedCompany = adminCompanies.find((c) => c.id === selectedCompanyId);

  // Companies that haven't been configured yet — used when adding a brand-new entry.
  const availableForNew = adminCompanies.filter((c) => !configured[c.id]);
  // For edit mode (selecting an already-configured company), allow the current selection too.
  const selectableCompanies = selectedCompanyId && configured[selectedCompanyId]
    ? adminCompanies
    : availableForNew;

  // List View — one row per linked company
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
              Define the delivery zone polygon for each company you carry
            </p>
          </div>
          <Button onClick={handleAddNewCompany} className="gap-2" disabled={availableForNew.length === 0}>
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
                  <p className="font-medium mb-1">Phase 1 — Polygon Upload Only</p>
                  <p className="text-blue-800">
                    Pick a company you carry and upload a GeoJSON polygon file describing
                    the geographic area you can serve for that company.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <Card>
            <CardHeader>
              <CardTitle>Companies ({rows.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No companies are linked to your account yet. Contact your administrator.
                </p>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.companyId}
                    className="group p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-white transition-all cursor-pointer"
                    onClick={() => handleEditRow(row)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Building2 className="h-5 w-5 text-gray-600" />
                          <h3 className="font-semibold text-lg text-gray-900">
                            {row.companyName}
                          </h3>
                          {row.hasPolygon ? (
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
                        </div>
                        {row.hasPolygon && row.polygonFileName ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 ml-8">
                            <FileJson className="h-4 w-4 text-indigo-600" />
                            <span>{row.polygonFileName}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 ml-8">
                            Click to upload a delivery polygon for this company
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {row.hasPolygon && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRow(row);
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Configure View
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
            {selectedCompany ? `Configure: ${selectedCompany.name}` : "Add Company Serviceability"}
          </h1>
          <p className="text-gray-600 mt-1">
            Upload a GeoJSON polygon describing your delivery area for this company
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Company Selection */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-600" />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="company-select" className="text-base">
                Select Company <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedCompanyId}
                onValueChange={(v) => setSelectedCompanyId(v)}
              >
                <SelectTrigger id="company-select" className="text-base">
                  <SelectValue placeholder="Choose a company linked to your account" />
                </SelectTrigger>
                <SelectContent>
                  {selectableCompanies.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No companies available
                    </div>
                  ) : (
                    selectableCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Only companies that an administrator has linked to your distributor account are shown here.
              </p>
            </div>
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
                  Upload a GeoJSON polygon file to define your delivery zone
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

            {/* Existing-config indicator (when editing) */}
            {!uploadedPolygonFile && selectedCompanyId && configured[selectedCompanyId] && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">
                      Existing polygon on file
                    </p>
                    <p className="text-sm text-green-800 mt-0.5">
                      <FileJson className="h-4 w-4 inline mr-1" />
                      {configured[selectedCompanyId].fileName}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Upload a new file below to replace it.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                <div
                  className={`p-4 rounded-lg border-2 ${
                    isValidPolygon
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          isValidPolygon ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
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
                            <Badge className="bg-green-600 text-white">Valid</Badge>
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
                          Your custom delivery zone has been defined. Click "Save
                          Configuration" to apply this polygon to your serviceability
                          settings.
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
