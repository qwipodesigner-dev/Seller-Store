import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  MapPin,
  Plus,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronRight,
  Building2,
  CalendarDays,
  Route,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import {
  getCompanies as getAdminCatalogCompanies,
  subscribeToCompanies,
  type Company as AdminCatalogCompany,
} from "../../lib/admin-catalog";

// One polygon = one beat (delivery route). Each beat carries a friendly name
// the seller assigns plus the day of the week he plans to service it.
interface Beat {
  id: string;
  name: string;
  deliveryDay: string; // "Monday" | "Tuesday" | ... | "Sunday"
  fileName: string;
}

// "Next Day" is an express option: instead of pinning the beat to a fixed
// weekday, the seller commits to delivering the day after the order is placed.
const NEXT_DAY = "Next Day";

const DELIVERY_DAY_OPTIONS = [
  NEXT_DAY,
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const dayBadgeColor: Record<string, string> = {
  [NEXT_DAY]: "bg-orange-50 text-orange-700 border-orange-300",
  Monday: "bg-blue-50 text-blue-700 border-blue-200",
  Tuesday: "bg-purple-50 text-purple-700 border-purple-200",
  Wednesday: "bg-pink-50 text-pink-700 border-pink-200",
  Thursday: "bg-amber-50 text-amber-700 border-amber-200",
  Friday: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Saturday: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Sunday: "bg-rose-50 text-rose-700 border-rose-200",
};

// Compact label used for the day chip in the list view (e.g. "Mon", "Next Day").
const dayShortLabel = (day: string) =>
  day === NEXT_DAY ? "Next Day" : day.slice(0, 3);

type ViewMode = "list" | "configure";

// Mock pre-existing beats for one of the seeded companies, so the screen has
// something to look at on first load.
const initialBeats: Record<string, Beat[]> = {
  "co-freedom": [
    {
      id: "beat-1",
      name: "South Bangalore Beat",
      deliveryDay: "Monday",
      fileName: "south-bangalore.geojson",
    },
    {
      id: "beat-2",
      name: "North Bangalore Beat",
      deliveryDay: "Wednesday",
      fileName: "north-bangalore.geojson",
    },
  ],
};

const makeBeatId = () => `beat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export function ServiceabilitySettings() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Admin-catalog companies (the master list available to this distributor)
  const [adminCompanies, setAdminCompanies] = useState<AdminCatalogCompany[]>(
    () => getAdminCatalogCompanies(),
  );
  useEffect(() => subscribeToCompanies(() => setAdminCompanies(getAdminCatalogCompanies())), []);

  // Per-company list of beats. Mock-persisted in component state.
  const [beatsByCompany, setBeatsByCompany] = useState<Record<string, Beat[]>>(initialBeats);

  // ----- Configure view state -----
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  // The "Add Beat" form state.
  const [draftBeatName, setDraftBeatName] = useState("");
  const [draftDeliveryDay, setDraftDeliveryDay] = useState<string>("");
  const [draftPolygonFile, setDraftPolygonFile] = useState<File | null>(null);
  const [draftPolygonData, setDraftPolygonData] = useState<any>(null);
  const polygonInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    resetDraftBeat();
    setViewMode("configure");
  };

  // Enter the configure view with no company chosen — the user picks one
  // from the dropdown, then proceeds to add beats.
  const handleAddCompanyServiceability = () => {
    setSelectedCompanyId("");
    resetDraftBeat();
    setViewMode("configure");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCompanyId("");
    resetDraftBeat();
  };

  const resetDraftBeat = () => {
    setDraftBeatName("");
    setDraftDeliveryDay("");
    setDraftPolygonFile(null);
    setDraftPolygonData(null);
    if (polygonInputRef.current) polygonInputRef.current.value = "";
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
          setDraftPolygonFile(file);
          setDraftPolygonData(json);
          toast.success(`Polygon "${file.name}" attached.`);
        } else {
          toast.error("Invalid polygon format. Upload a valid GeoJSON file.");
        }
      } catch {
        toast.error("Failed to parse file. Please ensure it's valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddBeat = () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company first.");
      return;
    }
    if (!draftBeatName.trim()) {
      toast.error("Please enter a beat name.");
      return;
    }
    if (!draftDeliveryDay) {
      toast.error("Please choose a delivery day.");
      return;
    }
    if (!draftPolygonFile) {
      toast.error("Please upload a polygon (GeoJSON) file for this beat.");
      return;
    }

    const beat: Beat = {
      id: makeBeatId(),
      name: draftBeatName.trim(),
      deliveryDay: draftDeliveryDay,
      fileName: draftPolygonFile.name,
    };
    setBeatsByCompany((prev) => ({
      ...prev,
      [selectedCompanyId]: [...(prev[selectedCompanyId] ?? []), beat],
    }));
    toast.success(`Beat "${beat.name}" added.`);
    resetDraftBeat();
  };

  const handleDeleteBeat = (beatId: string) => {
    if (!selectedCompanyId) return;
    setBeatsByCompany((prev) => ({
      ...prev,
      [selectedCompanyId]: (prev[selectedCompanyId] ?? []).filter((b) => b.id !== beatId),
    }));
    toast.info("Beat removed.");
  };

  const selectedCompany = adminCompanies.find((c) => c.id === selectedCompanyId);
  const selectedBeats = selectedCompanyId ? (beatsByCompany[selectedCompanyId] ?? []) : [];

  // ===================================================================
  // List View — only companies that have at least one beat configured.
  // The "Add Company Serviceability" button starts the workflow for a new
  // (un-configured) company.
  // ===================================================================
  if (viewMode === "list") {
    const configuredCompanies = adminCompanies.filter(
      (c) => (beatsByCompany[c.id]?.length ?? 0) > 0,
    );
    const hasUnconfigured = adminCompanies.some(
      (c) => (beatsByCompany[c.id]?.length ?? 0) === 0,
    );

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
              Define delivery beats — each beat is a polygon area + the day you service it.
            </p>
          </div>
          <Button
            onClick={handleAddCompanyServiceability}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!hasUnconfigured && adminCompanies.length > 0}
            title={
              !hasUnconfigured && adminCompanies.length > 0
                ? "All linked companies already have beats configured"
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
                  <p className="font-medium mb-0.5">Beats &amp; Delivery Days</p>
                  <p className="text-blue-800">
                    Pick a company, then add one or more beats. For each beat: give it a
                    friendly name (e.g. <i>South Bangalore Beat</i>), pick the day you
                    deliver to it, and upload its polygon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies List — only those with beats configured */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">
                Configured Companies ({configuredCompanies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {adminCompanies.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No companies are linked to your account yet. Contact your administrator.
                </p>
              ) : configuredCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">
                    No serviceability configured yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Click <b>Add Company Serviceability</b> to pick a company and define
                    its first beat.
                  </p>
                  <Button
                    onClick={handleAddCompanyServiceability}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Company Serviceability
                  </Button>
                </div>
              ) : (
                configuredCompanies.map((c) => {
                  const beats = beatsByCompany[c.id] ?? [];
                  return (
                    <div
                      key={c.id}
                      className="group p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-white transition-all cursor-pointer"
                      onClick={() => handleEditCompany(c.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="h-4 w-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">{c.name}</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {beats.length} beat{beats.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
                            {beats.map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-[11px]"
                              >
                                <Route className="h-2.5 w-2.5 text-green-600" />
                                <span className="text-gray-800">{b.name}</span>
                                <span
                                  className={`text-[10px] px-1 py-0 rounded border ${
                                    dayBadgeColor[b.deliveryDay] || ""
                                  }`}
                                >
                                  {dayShortLabel(b.deliveryDay)}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===================================================================
  // Configure View — manage beats for the selected company.
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
            {selectedCompany ? `Beats — ${selectedCompany.name}` : "Beats"}
          </h1>
          <p className="text-gray-600 text-xs">
            Each beat = one polygon area + the day you deliver to it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl space-y-3">
        {/* Company picker — shown when adding a brand-new company's
            serviceability. Only un-configured companies are listed here,
            so the seller can't double-link the same one. */}
        {!selectedCompany && (
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                Select Company <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Label className="text-xs">Company</Label>
              {(() => {
                const selectable = adminCompanies.filter(
                  (c) => (beatsByCompany[c.id]?.length ?? 0) === 0,
                );
                if (selectable.length === 0) {
                  return (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                      All companies linked to your account already have beats configured.
                      Pick one from the list and add more beats there.
                    </p>
                  );
                }
                return (
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Choose a company linked to your account…" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectable.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
              <p className="text-[11px] text-gray-500">
                Pick the company first — once selected, you'll be able to add one or
                more beats below.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedCompany && (
          <>
            {/* Existing beats list */}
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-gray-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Route className="h-4 w-4 text-green-600" />
                  Beats ({selectedBeats.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedBeats.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No beats yet. Add your first one below.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {selectedBeats.map((b) => (
                      <div
                        key={b.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="bg-green-100 text-green-700 p-1.5 rounded shrink-0">
                            <Route className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {b.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                              <span className="inline-flex items-center gap-1">
                                <FileJson className="h-3 w-3" />
                                {b.fileName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] gap-1 ${
                            dayBadgeColor[b.deliveryDay] || ""
                          }`}
                        >
                          <CalendarDays className="h-3 w-3" />
                          {b.deliveryDay}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600 shrink-0"
                          onClick={() => handleDeleteBeat(b.id)}
                          title="Remove beat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Beat form */}
            <Card className="border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b py-2.5 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" />
                  Add a New Beat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="beat-name" className="text-xs">
                      Beat Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="beat-name"
                      placeholder="e.g. South Bangalore Beat"
                      value={draftBeatName}
                      onChange={(e) => setDraftBeatName(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <p className="text-[10px] text-gray-500">
                      A friendly name for this delivery route.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="beat-day" className="text-xs">
                      Delivery Day <span className="text-red-500">*</span>
                    </Label>
                    <Select value={draftDeliveryDay} onValueChange={setDraftDeliveryDay}>
                      <SelectTrigger id="beat-day" className="h-9 text-sm">
                        <SelectValue placeholder="Choose a day…" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-500">
                      The weekday you plan to service this beat.
                    </p>
                  </div>
                </div>

                {/* Polygon upload */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Polygon (GeoJSON) <span className="text-red-500">*</span>
                  </Label>
                  <input
                    ref={polygonInputRef}
                    type="file"
                    accept=".json,.geojson"
                    onChange={handlePolygonUpload}
                    className="hidden"
                    id="beat-polygon"
                  />
                  {!draftPolygonFile ? (
                    <button
                      type="button"
                      onClick={() => polygonInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg py-4 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs font-medium">Click to upload polygon file</span>
                      <span className="text-[10px] text-gray-400">.json or .geojson, max 5MB</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {draftPolygonFile.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {(draftPolygonFile.size / 1024).toFixed(1)} KB
                            {draftPolygonData?.type ? ` · ${draftPolygonData.type}` : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setDraftPolygonFile(null);
                          setDraftPolygonData(null);
                          if (polygonInputRef.current) polygonInputRef.current.value = "";
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={resetDraftBeat}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddBeat}
                    className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Beat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
