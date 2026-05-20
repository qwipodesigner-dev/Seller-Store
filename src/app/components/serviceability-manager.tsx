import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
  Info,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import {
  getCompanies as getAdminCatalogCompanies,
  subscribeToCompanies,
  type Company as AdminCatalogCompany,
} from "../lib/admin-catalog";
import {
  DELIVERY_DAY_OPTIONS,
  type DeliveryDay,
} from "../lib/customers-data";
import {
  getServiceabilityBits,
  setServiceabilityBits,
  subscribeToServiceabilityBits,
  makeServiceabilityBitId,
  type ServiceabilityBit,
} from "../lib/serviceability-data";

/**
 * Bit-wise serviceability manager — drop-in component for the Manage
 * Seller → Serviceability tab. Replaces the previous one-polygon-per-
 * company model with a many-bits-per-company model:
 *
 *   - A company may have multiple serviceability bits, each with its
 *     own beat name and delivery day.
 *   - Customers whose location matches a bit's polygon inherit the
 *     bit's delivery day (no per-customer day override needed).
 *   - The list view is a table (Company Name | Beat Name | Delivery
 *     Day | Edit) to make the many-bits-per-company case easy to scan.
 */
export function ServiceabilityManager() {
  // Master list of companies the admin has assigned to this distributor.
  const [adminCompanies, setAdminCompanies] = useState<AdminCatalogCompany[]>(
    () => getAdminCatalogCompanies(),
  );
  useEffect(() => {
    const unsub = subscribeToCompanies(() => {
      setAdminCompanies(getAdminCatalogCompanies());
    });
    return unsub;
  }, []);

  // Bits live in the shared lib so the customer detail page (and any
  // future consumer) can react to changes. The component subscribes
  // for re-renders + writes through the lib's setter.
  const [bits, setBitsState] = useState<ServiceabilityBit[]>(() =>
    getServiceabilityBits(),
  );
  useEffect(() => {
    return subscribeToServiceabilityBits(() => {
      setBitsState([...getServiceabilityBits()]);
    });
  }, []);
  const setBits = (
    updater: ((prev: ServiceabilityBit[]) => ServiceabilityBit[]) | ServiceabilityBit[],
  ) => {
    const next =
      typeof updater === "function"
        ? updater(getServiceabilityBits())
        : updater;
    setServiceabilityBits(next);
  };

  // Dialog state. editingBitId === null → Add-new mode.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBitId, setEditingBitId] = useState<string | null>(null);
  const [draftCompanyId, setDraftCompanyId] = useState<string>("");
  const [draftBeatName, setDraftBeatName] = useState<string>("");
  const [draftDeliveryDay, setDraftDeliveryDay] = useState<DeliveryDay | "">("");
  const [uploadedPolygonFile, setUploadedPolygonFile] = useState<File | null>(
    null,
  );
  const [polygonData, setPolygonData] = useState<unknown>(null);
  const [isValidPolygon, setIsValidPolygon] = useState<boolean | null>(null);
  const polygonInputRef = useRef<HTMLInputElement | null>(null);

  const resetDialogState = () => {
    setEditingBitId(null);
    setDraftCompanyId("");
    setDraftBeatName("");
    setDraftDeliveryDay("");
    setUploadedPolygonFile(null);
    setPolygonData(null);
    setIsValidPolygon(null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
  };

  const handleAddNew = () => {
    resetDialogState();
    setDialogOpen(true);
  };

  const handleEdit = (bitId: string) => {
    const bit = bits.find((b) => b.id === bitId);
    if (!bit) return;
    setEditingBitId(bitId);
    setDraftCompanyId(bit.companyId);
    setDraftBeatName(bit.beatName);
    setDraftDeliveryDay(bit.deliveryDay);
    setUploadedPolygonFile(null);
    setPolygonData(bit.polygonData ?? null);
    setIsValidPolygon(bit.polygonFileName ? true : null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
    setDialogOpen(true);
  };

  const handleDelete = (bitId: string) => {
    const bit = bits.find((b) => b.id === bitId);
    if (!bit) return;
    setBits((prev) => prev.filter((b) => b.id !== bitId));
    toast.success(`Removed bit "${bit.beatName}"`);
  };

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
        const type = (json as { type?: string }).type;
        if (
          type === "FeatureCollection" ||
          type === "Feature" ||
          type === "Polygon"
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

  const editingBit = editingBitId
    ? bits.find((b) => b.id === editingBitId)
    : null;

  const handleDownloadExisting = () => {
    if (!editingBit?.polygonData) return;
    const blob = new Blob([JSON.stringify(editingBit.polygonData, null, 2)], {
      type: "application/geo+json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = editingBit.polygonFileName ?? `${editingBit.beatName}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${a.download}`);
  };

  const handleSave = () => {
    if (!draftCompanyId) {
      toast.error("Please select a company");
      return;
    }
    if (!draftBeatName.trim()) {
      toast.error("Please enter a beat name");
      return;
    }
    if (!draftDeliveryDay) {
      toast.error("Please pick a delivery day");
      return;
    }

    const company = adminCompanies.find((c) => c.id === draftCompanyId);
    if (!company) {
      toast.error("Selected company not found");
      return;
    }

    // Beat name uniqueness within a company — soft guard so two bits
    // for the same beat don't silently coexist.
    const collision = bits.find(
      (b) =>
        b.companyId === draftCompanyId &&
        b.beatName.trim().toLowerCase() ===
          draftBeatName.trim().toLowerCase() &&
        b.id !== editingBitId,
    );
    if (collision) {
      toast.error(
        `${company.name} already has a "${draftBeatName.trim()}" bit. Use a different beat name.`,
      );
      return;
    }

    if (editingBitId) {
      setBits((prev) =>
        prev.map((b) =>
          b.id === editingBitId
            ? {
                ...b,
                companyId: draftCompanyId,
                companyName: company.name,
                beatName: draftBeatName.trim(),
                deliveryDay: draftDeliveryDay,
                polygonFileName: uploadedPolygonFile
                  ? uploadedPolygonFile.name
                  : b.polygonFileName,
                polygonData: uploadedPolygonFile ? polygonData : b.polygonData,
              }
            : b,
        ),
      );
      toast.success(`Updated bit "${draftBeatName.trim()}" for ${company.name}`);
    } else {
      const bit: ServiceabilityBit = {
        id: makeServiceabilityBitId(),
        companyId: draftCompanyId,
        companyName: company.name,
        beatName: draftBeatName.trim(),
        deliveryDay: draftDeliveryDay,
        polygonFileName: uploadedPolygonFile?.name,
        polygonData: uploadedPolygonFile ? polygonData : undefined,
        createdAt: new Date().toISOString(),
      };
      setBits((prev) => [...prev, bit]);
      toast.success(
        `Added bit "${bit.beatName}" for ${company.name} (${bit.deliveryDay})`,
      );
    }

    setDialogOpen(false);
    resetDialogState();
  };

  // Sort bits by company name → beat name so the list scans cleanly.
  const sortedBits = useMemo(
    () =>
      [...bits].sort((a, b) => {
        if (a.companyName !== b.companyName) {
          return a.companyName.localeCompare(b.companyName);
        }
        return a.beatName.localeCompare(b.beatName);
      }),
    [bits],
  );

  return (
    <div>
      {/* Header — left title + subtitle, right primary CTA. */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Serviceability
          </h3>
          <p className="text-sm text-gray-500">
            Configure delivery bits — one polygon per beat. Customers matching
            a bit inherit its delivery day automatically.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleAddNew}
          disabled={adminCompanies.length === 0}
          title={
            adminCompanies.length === 0
              ? "Link companies via the Companies & Brands tab first"
              : undefined
          }
        >
          <Plus className="h-4 w-4" />
          Add Serviceability Bit
        </Button>
      </div>

      {/* Body — three states: no companies linked, no bits configured, populated */}
      {adminCompanies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-gray-600">No companies linked yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Link Qwipo catalog companies via the Companies &amp; Brands tab
            first, then configure their delivery bits here.
          </p>
        </div>
      ) : sortedBits.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-gray-600">
            No serviceability bits configured yet
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click <b>Add Serviceability Bit</b> to create the first beat for a
            company.
          </p>
          <Button variant="outline" onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Serviceability Bit
          </Button>
        </div>
      ) : (
        <Card className="border border-gray-200 p-0 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs uppercase tracking-wide text-gray-600">
                    Company Name
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-gray-600">
                    Beat Name
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-gray-600">
                    Delivery Day
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-gray-600">
                    Polygon
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBits.map((bit) => (
                  <TableRow key={bit.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-600 p-1.5 rounded">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        {bit.companyName}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {bit.beatName}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        {bit.deliveryDay}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bit.polygonFileName ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          Not set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8"
                          onClick={() => handleEdit(bit.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(bit.id)}
                          title="Remove this bit"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Inheritance hint — only shown when at least one bit exists. */}
      {sortedBits.length > 0 && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-md border border-blue-100 bg-blue-50/60 text-xs text-blue-900">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            Customers whose mapped location falls inside a bit&apos;s polygon
            automatically inherit that bit&apos;s delivery day. To change a
            customer&apos;s delivery day, edit the bit they belong to (or move
            them to a different bit by adjusting the polygon).
          </p>
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              {editingBitId
                ? `Edit Bit — ${editingBit?.beatName ?? ""}`
                : "Add Serviceability Bit"}
            </DialogTitle>
            <DialogDescription>
              Each bit is a single delivery polygon belonging to a company.
              Customers in the polygon inherit the bit&apos;s delivery day.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Company */}
            <div className="space-y-1.5">
              <Label>
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Select
                value={draftCompanyId}
                onValueChange={setDraftCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company linked to this seller" />
                </SelectTrigger>
                <SelectContent>
                  {adminCompanies.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      No companies linked
                    </div>
                  ) : (
                    adminCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Beat Name */}
            <div className="space-y-1.5">
              <Label>
                Beat Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={draftBeatName}
                onChange={(e) => setDraftBeatName(e.target.value)}
                placeholder="e.g. Mumbai Metro — North"
                maxLength={64}
              />
              <p className="text-[11px] text-gray-500">
                Unique per company. Use the sales route or polygon identifier.
              </p>
            </div>

            {/* Delivery Day */}
            <div className="space-y-1.5">
              <Label>
                Delivery Day <span className="text-red-500">*</span>
              </Label>
              <Select
                value={draftDeliveryDay}
                onValueChange={(v) => setDraftDeliveryDay(v as DeliveryDay)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick the day customers in this bit get delivered" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_DAY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-500">
                Every customer in this bit will be tagged with this day on
                their next order cycle.
              </p>
            </div>

            {/* Polygon (optional) */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Polygon (GeoJSON)</Label>
                <span className="text-[10px] text-gray-500">Optional</span>
              </div>

              {/* Existing-polygon banner — when editing a bit that already
                  has a polygon attached. */}
              {!uploadedPolygonFile &&
                editingBit?.polygonFileName && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-green-900 truncate">
                            {editingBit.polygonFileName}
                          </p>
                          <p className="text-[10px] text-green-700 mt-1">
                            Download to edit offline, then upload the revised
                            file below to replace it.
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

              <input
                ref={polygonInputRef}
                type="file"
                accept=".json,.geojson"
                onChange={handlePolygonUpload}
                className="hidden"
              />
              {!uploadedPolygonFile ? (
                <button
                  type="button"
                  onClick={() => polygonInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg p-4 flex flex-col items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50"
                >
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Upload className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-xs text-gray-900">
                    {editingBit?.polygonFileName
                      ? "Click to replace polygon"
                      : "Click to upload polygon"}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    GeoJSON or JSON, max 5 MB
                  </span>
                </button>
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !draftCompanyId ||
                !draftBeatName.trim() ||
                !draftDeliveryDay ||
                (uploadedPolygonFile !== null && isValidPolygon !== true)
              }
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {editingBitId ? "Save Changes" : "Create Bit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
