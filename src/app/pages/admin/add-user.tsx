import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ArrowLeft,
  UserPlus,
  Building2,
  Tag,
  Plus,
  X,
  AlertCircle,
  Upload,
  Camera,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Company, getCompanies, revokeImage, subscribeToCompanies } from "../../lib/admin-catalog";

interface SellerCompanySelection {
  companyId: string;
  brandIds: string[]; // empty array means "all brands of this company"
}

export function AdminAddUser() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  // Structured address — captured during creation so serviceability and other
  // location-aware modules can reuse the seller's coordinates and pin.
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  // Free-text full address (street, area, landmarks). Not used for routing
  // logic — purely informational.
  const [addressLine, setAddressLine] = useState("");
  const [pinLookupStatus, setPinLookupStatus] = useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");

  // Lookup PIN → city, state. Phase 1 ships an offline lookup table
  // covering the common Indian PIN prefixes we use in demo data; production
  // would hit api.postalpincode.in or equivalent.
  const PIN_LOOKUP: Record<string, { city: string; state: string }> = {
    // Bangalore
    "560001": { city: "Bangalore", state: "Karnataka" },
    "560034": { city: "Bangalore", state: "Karnataka" },
    "560038": { city: "Bangalore", state: "Karnataka" },
    "560066": { city: "Bangalore", state: "Karnataka" },
    // Mumbai
    "400001": { city: "Mumbai", state: "Maharashtra" },
    "400050": { city: "Mumbai", state: "Maharashtra" },
    "400058": { city: "Mumbai", state: "Maharashtra" },
    "400705": { city: "Navi Mumbai", state: "Maharashtra" },
    // Delhi
    "110001": { city: "Delhi", state: "Delhi" },
    // Pune
    "411014": { city: "Pune", state: "Maharashtra" },
    "411038": { city: "Pune", state: "Maharashtra" },
    // Hyderabad
    "500003": { city: "Hyderabad", state: "Telangana" },
    "500032": { city: "Hyderabad", state: "Telangana" },
    "500081": { city: "Hyderabad", state: "Telangana" },
    // Chennai
    "600017": { city: "Chennai", state: "Tamil Nadu" },
    "600090": { city: "Chennai", state: "Tamil Nadu" },
    // Kochi
    "682011": { city: "Kochi", state: "Kerala" },
    // Ahmedabad
    "380009": { city: "Ahmedabad", state: "Gujarat" },
  };

  const lookupPin = (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setCity("");
      setState("");
      setPinLookupStatus("idle");
      return;
    }
    setPinLookupStatus("loading");
    // Simulate a brief network delay so the UX feels real.
    window.setTimeout(() => {
      const hit = PIN_LOOKUP[pin];
      if (hit) {
        setCity(hit.city);
        setState(hit.state);
        setPinLookupStatus("found");
      } else {
        setCity("");
        setState("");
        setPinLookupStatus("not-found");
      }
    }, 250);
  };
  // Optional avatar — not mandatory at creation
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    revokeImage(imageUrl);
    setImageUrl(URL.createObjectURL(f));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleClearImage = () => {
    revokeImage(imageUrl);
    setImageUrl(null);
  };

  // Companies / brands the seller works with
  const [companies, setCompanies] = useState<Company[]>(getCompanies());
  useEffect(() => subscribeToCompanies(() => setCompanies([...getCompanies()])), []);
  const [selections, setSelections] = useState<SellerCompanySelection[]>([
    { companyId: "", brandIds: [] },
  ]);

  // ---- Selection helpers ----
  const usedCompanyIds = useMemo(
    () => new Set(selections.map((s) => s.companyId).filter(Boolean)),
    [selections],
  );

  const addCompanyRow = () => {
    setSelections((prev) => [...prev, { companyId: "", brandIds: [] }]);
  };

  const removeCompanyRow = (idx: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== idx));
  };

  const setCompanyForRow = (idx: number, companyId: string) => {
    setSelections((prev) =>
      prev.map((s, i) => (i === idx ? { companyId, brandIds: [] } : s)),
    );
  };

  const toggleBrandForRow = (idx: number, brandId: string) => {
    setSelections((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const has = s.brandIds.includes(brandId);
        return {
          ...s,
          brandIds: has
            ? s.brandIds.filter((b) => b !== brandId)
            : [...s.brandIds, brandId],
        };
      }),
    );
  };

  const toggleAllBrandsForRow = (idx: number) => {
    setSelections((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const company = companies.find((c) => c.id === s.companyId);
        if (!company) return s;
        // Empty array represents "all brands" (auto-includes new ones); the
        // explicit-list path lets the seller pick a subset. Toggle between the two.
        const allSelected = s.brandIds.length === 0;
        return {
          ...s,
          brandIds: allSelected ? company.brands.map((b) => b.id) : [],
        };
      }),
    );
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Mobile Number is required");
      return;
    }
    if (!businessName.trim()) {
      toast.error("Company / Business Name is required");
      return;
    }
    // PIN code is mandatory — used by serviceability + downstream modules.
    if (!pinCode.trim()) {
      toast.error("PIN Code is required");
      return;
    }
    if (!/^\d{6}$/.test(pinCode.trim())) {
      toast.error("PIN Code must be a 6-digit number");
      return;
    }
    if (!city.trim() || !state.trim()) {
      toast.error("City / State could not be resolved from PIN — please use a valid PIN code");
      return;
    }
    // Latitude is mandatory.
    if (!latitude.trim()) {
      toast.error("Latitude is required");
      return;
    }
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be a number between -90 and 90");
      return;
    }
    // Longitude is mandatory.
    if (!longitude.trim()) {
      toast.error("Longitude is required");
      return;
    }
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be a number between -180 and 180");
      return;
    }
    if (!addressLine.trim()) {
      toast.error("Full Address is required");
      return;
    }
    const completeRows = selections.filter((s) => s.companyId !== "");
    if (completeRows.length === 0) {
      toast.error("Please select at least one company the seller works with");
      return;
    }
    // Each completed row must either pick brands explicitly or use "all brands"
    // (which is the empty-brandIds shortcut). Both are valid as long as the
    // company has at least one brand.
    for (const r of completeRows) {
      const company = companies.find((c) => c.id === r.companyId)!;
      if (company.brands.length === 0) {
        toast.error(`"${company.name}" has no brands. Add brands first.`);
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`Seller "${fullName}" created successfully`);
      navigate("/admin/users");
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add Seller
            </h2>
            <p className="text-sm text-gray-500">Create a new seller account</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile photo — optional */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 overflow-hidden group transition-colors"
                  title="Upload photo"
                >
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Seller photo" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </span>
                    </>
                  ) : (
                    // Empty-state placeholder: portrait icon with upload chip.
                    <div className="relative flex items-center justify-center w-full h-full text-gray-300">
                      <UserIcon className="h-9 w-9" />
                      <span className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white rounded-full p-1">
                        <Upload className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Profile Photo{" "}
                    <span className="text-xs font-normal text-gray-500">
                      (optional)
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    A photo helps the seller show up correctly in the seller
                    picker. PNG, JPG, JPEG, or WEBP — under 2 MB.
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1 h-7 text-xs"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3" />
                      {imageUrl ? "Change" : "Upload"}
                    </Button>
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-7 text-xs"
                        onClick={handleClearImage}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name (e.g. ABC Distributors)"
                  />
                </div>
                {/* Structured address — PIN drives city/state lookup so the
                    seller record stays consistent with the actual postcode. */}
                <div className="space-y-2">
                  <Label>
                    PIN Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={pinCode}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setPinCode(next);
                      lookupPin(next);
                    }}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                  />
                  <p className="text-[11px]">
                    {pinLookupStatus === "loading" && (
                      <span className="text-gray-500">Looking up city / state…</span>
                    )}
                    {pinLookupStatus === "found" && (
                      <span className="text-emerald-700">
                        ✓ Resolved to {city}, {state}
                      </span>
                    )}
                    {pinLookupStatus === "not-found" && (
                      <span className="text-amber-700">
                        Couldn't resolve this PIN — please double-check.
                      </span>
                    )}
                    {pinLookupStatus === "idle" && (
                      <span className="text-gray-500">
                        City and state are auto-filled from PIN.
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={city}
                    readOnly
                    disabled
                    placeholder="Auto-filled from PIN"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={state}
                    readOnly
                    disabled
                    placeholder="Auto-filled from PIN"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>
                    Latitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 12.9716"
                    inputMode="decimal"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 77.5946"
                    inputMode="decimal"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Shop No., Street, Area, Landmark…"
                    rows={3}
                  />
                  <p className="text-[11px] text-gray-500">
                    Free-form description for invoices and dispatch — kept
                    alongside the PIN / lat-long / city / state above.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Companies & Brands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Companies & Brands the Seller Works With
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Select at least one company. For each company you can either pick
                specific brands or use <b>All brands</b> to auto-include any future
                brands added to that company.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {selections.map((sel, idx) => {
                const company = companies.find((c) => c.id === sel.companyId);
                const allSelected = company && sel.brandIds.length === 0;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50"
                  >
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-[240px] space-y-1">
                        <Label className="text-xs">
                          Company <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={sel.companyId}
                          onValueChange={(v) => setCompanyForRow(idx, v)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select a company..." />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((c) => {
                              const taken =
                                usedCompanyIds.has(c.id) && c.id !== sel.companyId;
                              return (
                                <SelectItem
                                  key={c.id}
                                  value={c.id}
                                  disabled={taken}
                                >
                                  {c.name}
                                  {taken ? " (already added)" : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => removeCompanyRow(idx)}
                          disabled={selections.length === 1}
                          title={
                            selections.length === 1
                              ? "At least one company is required"
                              : "Remove company"
                          }
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Brand picker — appears once a company is chosen */}
                    {company && (
                      <div className="space-y-2 bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-purple-600" />
                            Brands
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 ml-1">
                              {allSelected
                                ? `All (${company.brands.length})`
                                : `${sel.brandIds.length} of ${company.brands.length}`}
                            </Badge>
                          </Label>
                          <button
                            type="button"
                            onClick={() => toggleAllBrandsForRow(idx)}
                            className="text-[11px] text-blue-700 hover:text-blue-800 underline"
                          >
                            {allSelected ? "Pick specific brands" : "Use all brands"}
                          </button>
                        </div>
                        {allSelected ? (
                          <div className="text-xs text-gray-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-1.5 flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>
                              The seller will get access to <b>all {company.brands.length} brands</b>
                              {" "}of {company.name}, including any new brands added later.
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {company.brands.map((b) => {
                              const checked = sel.brandIds.includes(b.id);
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => toggleBrandForRow(idx, b.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 text-xs border transition-colors ${
                                    checked
                                      ? "bg-blue-50 text-blue-800 border-blue-300"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {b.imageUrl ? (
                                      <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Tag className="h-2.5 w-2.5 text-gray-400" />
                                    )}
                                  </div>
                                  <span>{b.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                variant="outline"
                onClick={addCompanyRow}
                className="w-full gap-2"
                disabled={usedCompanyIds.size >= companies.length}
              >
                <Plus className="h-4 w-4" />
                Add another company
              </Button>

              {companies.length === 0 && (
                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2 flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  No companies exist yet.{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/admin/companies")}
                    className="underline font-medium"
                  >
                    Create one in Companies & Brands
                  </button>{" "}
                  before adding sellers.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="outline" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <UserPlus className="h-4 w-4" />
              {isSaving ? "Creating..." : "Create Seller"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
