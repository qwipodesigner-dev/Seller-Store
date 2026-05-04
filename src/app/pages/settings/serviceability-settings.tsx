import { useEffect, useRef, useState } from "react";
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

// One row in the list view: one entry per company linked to this distributor
// that has had its polygon uploaded.
interface CompanyServiceabilityRow {
  companyId: string;
  companyName: string;
  hasPolygon: boolean;
  polygonFileName?: string;
}

type ViewMode = "list" | "configure";

// Mock pre-existing polygon for one of the seeded companies so the screen has
// something to look at on first load.
const initialConfigured: Record<string, { fileName: string }> = {
  "co-freedom": { fileName: "freedom-zone.geojson" },
};

export function ServiceabilitySettings() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Admin-catalog companies (the master list available to this distributor)
  const [adminCompanies, setAdminCompanies] = useState<AdminCatalogCompany[]>(
    () => getAdminCatalogCompanies(),
  );
  useEffect(() => {
    const unsub = subscribeToCompanies(() => {
      setAdminCompanies(getAdminCatalogCompanies());
    });
    return unsub;
  }, []);

  // Per-company configuration map (companyId -> file info). Mock-persisted in component state.
  const [configured, setConfigured] = useState<Record<string, { fileName: string }>>(
    initialConfigured,
  );

  // Configure-view state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [uploadedPolygonFile, setUploadedPolygonFile] = useState<File | null>(null);
  const [polygonData, setPolygonData] = useState<any>(null);
  const [isValidPolygon, setIsValidPolygon] = useState<boolean | null>(null);
  const polygonInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditRow = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(configured[companyId] ? true : null);
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
    if (polygonInputRef.current) polygonInputRef.current.value = "";
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
    const company = adminCompanies.find((c) => c.id === selectedCompanyId);
    toast.success(`Serviceability saved for ${company?.name ?? "company"}.`);
    handleBackToList();
  };

  const selectedCompany = adminCompanies.find((c) => c.id === selectedCompanyId);

  // Companies that haven't been configured yet — used when adding a brand-new entry.
  const availableForNew = adminCompanies.filter((c) => !configured[c.id]);
  // For edit mode (selecting an already-configured company), allow the current selection too.
  const selectableCompanies =
    selectedCompanyId && configured[selectedCompanyId] ? adminCompanies : availableForNew;

  // ===================================================================
  // List View — only companies that already have a polygon configured.
  // The "Add Company Serviceability" button (blue) starts the workflow
  // for a new (un-configured) company.
  // ===================================================================
  if (viewMode === "list") {
    const rows: CompanyServiceabilityRow[] = adminCompanies
      .filter((c) => Boolean(configured[c.id]))
      .map((c) => ({
        companyId: c.id,
        companyName: c.name,
        hasPolygon: true,
        polygonFileName: configured[c.id]?.fileName,
      }));
    const hasUnconfigured = adminCompanies.some((c) => !configured[c.id]);

    return (
      <div className="p-4 space-y-3 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/settings")}
            className="hover:bg-gray-100 h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-green-600" />
              Serviceability Settings
            </h1>
            <p className="text-gray-600 text-sm">
              Define the delivery zone polygon for each company you carry.
            </p>
          </div>
          <Button
            onClick={handleAddNewCompany}
            className="gap-2 text-white"
            disabled={!hasUnconfigured && adminCompanies.length > 0}
            title={
              !hasUnconfigured && adminCompanies.length > 0
                ? "All linked companies already have a polygon"
                : undefined
            }
          >
            <Plus className="h-4 w-4" />
            Add Company Serviceability
          </Button>
        </div>

        <div className="max-w-6xl space-y-3">
          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-900">
                  <p className="font-medium mb-0.5">Polygon Upload</p>
                  <p className="text-blue-800">
                    Pick a company you carry and upload a GeoJSON polygon file
                    describing the geographic area you can serve for that company.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies List — only those with a polygon configured */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">
                Configured Companies ({rows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {adminCompanies.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No companies are linked to your account yet. Contact your administrator.
                </p>
              ) : rows.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">
                    No serviceability configured yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Click <b>Add Company Serviceability</b> to pick a company and
                    upload its delivery polygon.
                  </p>
                  <Button
                    onClick={handleAddNewCompany}
                    className="gap-2 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Company Serviceability
                  </Button>
                </div>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.companyId}
                    className="group p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-white transition-all cursor-pointer"
                    onClick={() => handleEditRow(row.companyId)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">
                            {row.companyName}
                          </h3>
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Configured
                          </Badge>
                        </div>
                        {row.polygonFileName && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 ml-6 mt-1">
                            <FileJson className="h-3 w-3 text-indigo-600" />
                            <span>{row.polygonFileName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRow(row.companyId);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all" />
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

  // ===================================================================
  // Configure View — pick a company, upload its polygon, save.
  // ===================================================================
  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackToList}
          className="hover:bg-gray-100 h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
            <MapPin className="h-5 w-5 text-green-600" />
            {selectedCompany
              ? `Configure: ${selectedCompany.name}`
              : "Add Company Serviceability"}
          </h1>
          <p className="text-gray-600 text-xs">
            Upload a GeoJSON polygon describing your delivery area for this company.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-3">
        {/* Company Selection */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b py-2.5 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-600" />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Label htmlFor="company-select" className="text-xs">
              Select Company <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCompanyId}
              onValueChange={(v) => setSelectedCompanyId(v)}
            >
              <SelectTrigger id="company-select" className="text-sm">
                <SelectValue placeholder="Choose a company linked to your account" />
              </SelectTrigger>
              <SelectContent>
                {selectableCompanies.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">
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
            <p className="text-[11px] text-gray-500">
              Only companies linked to your distributor account by an
              administrator are shown here.
            </p>
          </CardContent>
        </Card>

        {/* Polygon Upload Section */}
        <Card className="border-2 border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b py-2.5 px-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded">
                <FileJson className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm">Polygon-based Service Area</CardTitle>
                <p className="text-[11px] text-gray-600">
                  Upload a GeoJSON polygon file to define your delivery zone
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Info box */}
            <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-[11px]">
                <p className="font-medium text-blue-900 mb-0.5">
                  What is a Polygon File?
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                  <li>GeoJSON or JSON file format (.json, .geojson)</li>
                  <li>Defines precise geographic boundaries for your delivery area</li>
                  <li>More accurate than PIN code-based coverage</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
              </div>
            </div>

            {/* Existing polygon banner — when editing a configured company */}
            {!uploadedPolygonFile && selectedCompanyId && configured[selectedCompanyId] && (
              <div className="p-3 bg-green-50 rounded border-2 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-green-900">
                      Existing polygon on file
                    </p>
                    <p className="text-xs text-green-800 mt-0.5">
                      <FileJson className="h-3.5 w-3.5 inline mr-1" />
                      {configured[selectedCompanyId].fileName}
                    </p>
                    <p className="text-[10px] text-green-700 mt-1">
                      Upload a new file below to replace it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload area */}
            {!uploadedPolygonFile ? (
              <div>
                <Label htmlFor="polygon-upload" className="mb-2 block text-xs">
                  Upload Polygon File
                </Label>
                <input
                  ref={polygonInputRef}
                  id="polygon-upload"
                  type="file"
                  accept=".json,.geojson"
                  onChange={handlePolygonUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => polygonInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50"
                >
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-600">
                    GeoJSON or JSON files (Max 5MB)
                  </span>
                </button>
              </div>
            ) : (
              <>
                {/* Uploaded file display */}
                <div
                  className={`p-3 rounded border-2 ${
                    isValidPolygon
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div
                        className={`p-1.5 rounded ${
                          isValidPolygon ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {isValidPolygon ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileJson className="h-3.5 w-3.5 text-gray-600" />
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {uploadedPolygonFile.name}
                          </p>
                          {isValidPolygon && (
                            <Badge className="bg-green-600 text-white text-[10px]">
                              Valid
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {(uploadedPolygonFile.size / 1024).toFixed(2)} KB
                          {polygonData?.type ? ` · ${polygonData.type}` : ""}
                          {polygonData?.features
                            ? ` · ${polygonData.features.length} feature(s)`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePolygon}
                      className="border-red-300 text-red-600 hover:bg-red-50 h-7"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                {isValidPolygon && (
                  <div className="p-2.5 bg-indigo-50 rounded border border-indigo-200">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                      <p className="text-indigo-900">
                        <b>Polygon validated.</b> Your delivery zone is defined —
                        click <b>Save Configuration</b> to apply.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Action bar */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={handleBackToList}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            className="gap-2 text-white"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
