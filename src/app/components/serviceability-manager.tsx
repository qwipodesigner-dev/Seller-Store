import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Save,
  MapPin,
  Plus,
  Upload,
  Download,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import {
  getCompanies as getAdminCatalogCompanies,
  subscribeToCompanies,
  type Company as AdminCatalogCompany,
} from "../lib/admin-catalog";

// One row in the list view: one entry per company linked to this seller
// that has had its polygon uploaded.
interface CompanyServiceabilityRow {
  companyId: string;
  companyName: string;
  polygonFileName?: string;
}

// Mock pre-existing polygon for one of the seeded companies so the
// Manage Seller tab has something to look at on first load. The
// polygon JSON is kept alongside the filename so the Edit dialog
// can offer a Download CTA — the admin grabs the file, edits it
// offline, and re-uploads through the same dialog.
const SAMPLE_FREEDOM_POLYGON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Freedom Zone — Mumbai metropolitan region" },
      geometry: {
        type: "Polygon" as const,
        // Rough bounding polygon around greater Mumbai. Real
        // installations replace this with the actual delivery polygon.
        coordinates: [
          [
            [72.7, 18.9],
            [73.05, 18.9],
            [73.05, 19.3],
            [72.7, 19.3],
            [72.7, 18.9],
          ],
        ],
      },
    },
  ],
};

const initialConfigured: Record<string, { fileName: string; data: any }> = {
  "co-freedom": {
    fileName: "freedom-zone.geojson",
    data: SAMPLE_FREEDOM_POLYGON,
  },
};

/**
 * Serviceability manager — drop-in component for the Manage Seller >
 * Serviceability tab. Mirrors the Connectors tab's UI:
 *   - Same flex justify-between header (h3 + subtitle on left,
 *     Plus-icon CTA on right)
 *   - Same dashed-border empty state with inline CTA
 *   - Same icon+name+subtitle+badge+description+Edit ConnectorCard
 *     shape for each configured company
 *   - Same Dialog-based add / edit flow (no in-tab page swap)
 *
 * The previous list↔configure page-state machine was replaced with
 * a single dialog: the host stays on the Serviceability tab, and the
 * dialog opens for both "add new" and "edit existing" with the same
 * upload UI inside.
 */
export function ServiceabilityManager() {
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

  // Per-company configuration map (companyId → file info + parsed
  // polygon JSON). Mock-persisted in component state. The data field
  // backs the Download CTA inside the Edit dialog.
  const [configured, setConfigured] = useState<
    Record<string, { fileName: string; data: any }>
  >(initialConfigured);

  // Dialog state — replaces the previous viewMode "list" / "configure"
  // page-swap. editingCompanyId="" means we're in Add-new mode.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string>("");
  const [uploadedPolygonFile, setUploadedPolygonFile] = useState<File | null>(
    null,
  );
  const [polygonData, setPolygonData] = useState<any>(null);
  const [isValidPolygon, setIsValidPolygon] = useState<boolean | null>(null);
  const polygonInputRef = useRef<HTMLInputElement | null>(null);

  const resetDialogState = () => {
    setEditingCompanyId("");
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
  };

  const handleAddNew = () => {
    resetDialogState();
    setDialogOpen(true);
  };

  const handleEdit = (companyId: string) => {
    setEditingCompanyId(companyId);
    setUploadedPolygonFile(null);
    setPolygonData(null);
    // Already-configured: a polygon is on file, mark it as valid so the
    // Save button enables even without re-upload.
    setIsValidPolygon(configured[companyId] ? true : null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
    setDialogOpen(true);
  };

  // Close handler — also resets state so reopening starts clean.
  const handleDialogOpenChange = (next: boolean) => {
    setDialogOpen(next);
    if (!next) resetDialogState();
  };

  const handlePolygonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
      toast.error("Please upload a valid GeoJSON or JSON file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB.");
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
          toast.success(`Polygon "${file.name}" uploaded.`);
        } else {
          setIsValidPolygon(false);
          toast.error(
            "Invalid polygon format. Please upload a valid GeoJSON file.",
          );
        }
      } catch {
        setIsValidPolygon(false);
        toast.error(
          "Failed to parse file. Please ensure it's a valid JSON file.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleRemovePolygon = () => {
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
  };

  // Download the existing polygon for the company being edited. Lets
  // the admin grab the file, edit it offline (e.g. in QGIS / a text
  // editor), and re-upload it through the same dialog.
  const handleDownloadExisting = () => {
    const entry = configured[editingCompanyId];
    if (!entry) return;
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], {
      type: "application/geo+json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${entry.fileName}`);
  };

  const handleSave = () => {
    if (!editingCompanyId) {
      toast.error("Please select a company");
      return;
    }
    const isAlreadyConfigured = Boolean(configured[editingCompanyId]);
    if (!uploadedPolygonFile && !isAlreadyConfigured) {
      toast.error("Please upload a polygon (GeoJSON) file");
      return;
    }
    if (uploadedPolygonFile) {
      setConfigured((prev) => ({
        ...prev,
        [editingCompanyId]: {
          fileName: uploadedPolygonFile.name,
          data: polygonData,
        },
      }));
    }
    const company = adminCompanies.find((c) => c.id === editingCompanyId);
    toast.success(`Serviceability saved for ${company?.name ?? "company"}.`);
    setDialogOpen(false);
    resetDialogState();
  };

  // Derived data
  const editingCompany = adminCompanies.find((c) => c.id === editingCompanyId);
  const availableForNew = adminCompanies.filter((c) => !configured[c.id]);
  // When editing an already-configured company, allow keeping the
  // current selection visible in the dropdown. Otherwise only show
  // unconfigured companies.
  const selectableCompanies =
    editingCompanyId && configured[editingCompanyId]
      ? adminCompanies
      : availableForNew;
  const hasUnconfigured = adminCompanies.some((c) => !configured[c.id]);
  const rows: CompanyServiceabilityRow[] = adminCompanies
    .filter((c) => Boolean(configured[c.id]))
    .map((c) => ({
      companyId: c.id,
      companyName: c.name,
      polygonFileName: configured[c.id]?.fileName,
    }));

  return (
    <div>
      {/* Header — mirrors Connectors / Companies & Brands tabs:
          left-aligned title + subtitle, right-aligned single CTA. */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Serviceability
          </h3>
          <p className="text-sm text-gray-500">
            Configure delivery zone polygons for each company this seller
            carries.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleAddNew}
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

      {/* Body — three states: no companies linked, none configured, populated */}
      {adminCompanies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-gray-600">No companies linked yet</p>
          <p className="text-sm text-gray-500 mt-1">
            No companies linked yet — link Qwipo catalog companies via the
            Companies &amp; Brands tab first.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-gray-600">
            No serviceability configured yet
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click <b>Add Company Serviceability</b> to pick a company and
            upload its delivery zone polygon.
          </p>
          <Button
            variant="outline"
            onClick={handleAddNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Company Serviceability
          </Button>
        </div>
      ) : (
        // Card grid — same shape as the ConnectorCard in seller-detail.tsx
        // (icon-in-colored-bg + name + subtitle on the left, status badge
        // on the right, description, full-width Edit at the bottom).
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <Card key={row.companyId} className="border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {row.companyName}
                      </p>
                      <p className="text-xs text-gray-500">Delivery zone</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Configured
                  </Badge>
                </div>
                {/* Filename intentionally omitted on the card — it
                    surfaces inside the Edit dialog where the admin can
                    also download it for offline edits. */}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 w-full mt-4"
                  onClick={() => handleEdit(row.companyId)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit dialog — same pattern as the ONDC connector edit
          dialog: Radix Dialog with a header (icon + title + description),
          a body (company picker only in Add mode + polygon upload area),
          and a Cancel / Save footer. */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              {editingCompany
                ? editingCompany.name
                : "Add Company Serviceability"}
            </DialogTitle>
            <DialogDescription>
              Upload a GeoJSON polygon describing the delivery area for this
              company.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Company picker — shown only when adding a new entry. When
                editing, the company is fixed (the title shows its name). */}
            {!configured[editingCompanyId] && (
              <div className="space-y-1.5">
                <Label>
                  Company <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingCompanyId}
                  onValueChange={(v) => setEditingCompanyId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a company linked to this seller" />
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
              </div>
            )}

            {/* Existing polygon banner — when editing a configured
                company. Adds a Download CTA so the admin can grab the
                current file, edit it offline, and re-upload through
                the same dialog. */}
            {!uploadedPolygonFile &&
              editingCompanyId &&
              configured[editingCompanyId] && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-green-900">
                          Existing polygon on file
                        </p>
                        <p className="text-xs text-green-800 mt-0.5 truncate">
                          <FileJson className="h-3.5 w-3.5 inline mr-1" />
                          {configured[editingCompanyId].fileName}
                        </p>
                        <p className="text-[10px] text-green-700 mt-1">
                          Download to edit offline, then upload the
                          revised file below to replace it.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadExisting}
                      className="border-green-300 text-green-700 hover:bg-green-100 h-7 gap-1 shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

            {/* Upload area */}
            <input
              ref={polygonInputRef}
              type="file"
              accept=".json,.geojson"
              onChange={handlePolygonUpload}
              className="hidden"
            />
            {!uploadedPolygonFile ? (
              <div className="space-y-1.5">
                <Label>Polygon File</Label>
                <button
                  type="button"
                  onClick={() => polygonInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50"
                >
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-600">
                    GeoJSON or JSON files (Max 5MB)
                  </span>
                </button>
              </div>
            ) : (
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
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            {/* Save stays disabled until the admin actually uploads a
                valid polygon (Add) or uploads a replacement (Edit).
                Cancel always works — that's the escape hatch. */}
            <Button
              onClick={handleSave}
              disabled={
                !editingCompanyId ||
                !uploadedPolygonFile ||
                isValidPolygon !== true
              }
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
