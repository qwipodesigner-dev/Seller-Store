import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Company, getCompanies, revokeImage, subscribeToCompanies } from "../../lib/admin-catalog";
import { addSeller } from "../../lib/mock-store";
import { ImageUploader } from "../../components/ui/image-uploader";

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
  // Phase 1 only allows "distributor". Wholesaler is rendered as disabled
  // so the operator can see it's coming, but defaults / persists as
  // distributor.
  const [sellerType, setSellerType] = useState<"distributor" | "wholesaler">(
    "distributor",
  );
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

  // ---- Inline field-level errors ----
  // Replaces the popup-toast validation pattern: every required field has
  // a dedicated red helper line under the input, and the Save Seller button
  // stays disabled until all mandatory fields look valid up-front.
  type FieldErrors = Partial<Record<
    | "fullName"
    | "phone"
    | "businessName"
    | "pinCode"
    | "latitude"
    | "longitude"
    | "addressLine"
    | "companies",
    string
  >>;
  const [errors, setErrors] = useState<FieldErrors>({});
  const clearError = (k: keyof FieldErrors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  // Used to gate the Create Seller button. Mirrors the cheap-and-fast
  // checks in handleSave — the handler still runs full validation.
  const isFormShapeValid = () => {
    if (!fullName.trim()) return false;
    if (!phone.trim()) return false;
    if (!businessName.trim()) return false;
    if (!/^\d{6}$/.test(pinCode.trim())) return false;
    if (!city.trim() || !state.trim()) return false;
    const lat = parseFloat(latitude);
    if (!latitude.trim() || isNaN(lat) || lat < -90 || lat > 90) return false;
    const lng = parseFloat(longitude);
    if (!longitude.trim() || isNaN(lng) || lng < -180 || lng > 180) return false;
    if (!addressLine.trim()) return false;
    // At least one company picked + that company has brands available.
    const completeRows = selections.filter((s) => s.companyId !== "");
    if (completeRows.length === 0) return false;
    return true;
  };

  const handleImageChange = (file: File | null) => {
    revokeImage(imageUrl);
    setImageUrl(file ? URL.createObjectURL(file) : null);
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
    clearError("companies");
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
    // Validate everything up-front and surface the issues inline. The Save
    // button is also disabled until the basic shape of the form looks
    // valid, but we keep this run-through as the source of truth for the
    // exact error messages.
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "Full Name is required";
    if (!phone.trim()) next.phone = "Mobile Number is required";
    if (!businessName.trim()) next.businessName = "Business Name is required";

    if (!pinCode.trim()) {
      next.pinCode = "PIN Code is required";
    } else if (!/^\d{6}$/.test(pinCode.trim())) {
      next.pinCode = "PIN Code must be a 6-digit number";
    } else if (!city.trim() || !state.trim()) {
      next.pinCode = "Couldn't resolve city / state — please use a valid PIN";
    }

    if (!latitude.trim()) {
      next.latitude = "Latitude is required";
    } else {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90)
        next.latitude = "Latitude must be a number between -90 and 90";
    }

    if (!longitude.trim()) {
      next.longitude = "Longitude is required";
    } else {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180)
        next.longitude = "Longitude must be a number between -180 and 180";
    }

    if (!addressLine.trim()) next.addressLine = "Full Address is required";

    const completeRows = selections.filter((s) => s.companyId !== "");
    if (completeRows.length === 0) {
      next.companies = "Select at least one company the seller works with";
    } else {
      // Each completed row must either pick brands explicitly or use
      // "all brands" (empty-brandIds shortcut). Both valid as long as
      // the company has at least one brand.
      const empty = completeRows
        .map((r) => companies.find((c) => c.id === r.companyId)!)
        .find((c) => c && c.brands.length === 0);
      if (empty) next.companies = `"${empty.name}" has no brands. Add brands first.`;
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    setIsSaving(true);
    setTimeout(() => {
      // Persist to the mock store so Manage Seller picks the new record up.
      addSeller({
        name: fullName.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
        sellerType,
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        fullAddress: addressLine.trim(),
        imageUrl,
        companyBrandSelections: completeRows.map((r) => ({
          companyId: r.companyId,
          brandIds: r.brandIds,
        })),
      });
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
              {/* Business photo — optional. Uses the shared ImageUploader
                  so it looks identical to every other image upload in
                  the admin module. */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <ImageUploader
                  value={imageUrl}
                  onChange={handleImageChange}
                  aspect="circle"
                  size="md"
                  alt="Business photo"
                  placeholder="Upload photo"
                  helper={null}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Business Photo{" "}
                    <span className="text-xs font-normal text-gray-500">
                      (optional)
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    A photo helps the seller's business show up correctly in
                    the seller picker. PNG, JPG, JPEG, or WEBP — under 2 MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("fullName");
                    }}
                    placeholder="Enter full name"
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError("phone");
                    }}
                    placeholder="+91 98765 43210"
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      clearError("businessName");
                    }}
                    placeholder="Enter business name (e.g. ABC Distributors)"
                    aria-invalid={!!errors.businessName}
                  />
                  {errors.businessName && (
                    <p className="text-[11px] text-red-600">{errors.businessName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Seller Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={sellerType}
                    onValueChange={(v) =>
                      setSellerType(v as "distributor" | "wholesaler")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="wholesaler" disabled>
                        Wholesaler (coming in Phase 2)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500">
                    Phase 1 supports distributors only. Wholesaler is reserved
                    for a later phase.
                  </p>
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
                      clearError("pinCode");
                    }}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    aria-invalid={!!errors.pinCode}
                  />
                  {errors.pinCode ? (
                    <p className="text-[11px] text-red-600">{errors.pinCode}</p>
                  ) : (
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
                  )}
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
                    onChange={(e) => {
                      setLatitude(e.target.value);
                      clearError("latitude");
                    }}
                    placeholder="e.g. 12.9716"
                    inputMode="decimal"
                    aria-invalid={!!errors.latitude}
                  />
                  {errors.latitude && (
                    <p className="text-[11px] text-red-600">{errors.latitude}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      clearError("longitude");
                    }}
                    placeholder="e.g. 77.5946"
                    inputMode="decimal"
                    aria-invalid={!!errors.longitude}
                  />
                  {errors.longitude && (
                    <p className="text-[11px] text-red-600">{errors.longitude}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={addressLine}
                    onChange={(e) => {
                      setAddressLine(e.target.value);
                      clearError("addressLine");
                    }}
                    placeholder="Shop No., Street, Area, Landmark…"
                    rows={3}
                    aria-invalid={!!errors.addressLine}
                  />
                  {errors.addressLine ? (
                    <p className="text-[11px] text-red-600">{errors.addressLine}</p>
                  ) : (
                    <p className="text-[11px] text-gray-500">
                      Free-form description for invoices and dispatch — kept
                      alongside the PIN / lat-long / city / state above.
                    </p>
                  )}
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

              {errors.companies && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.companies}
                </p>
              )}

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
            {/* CTA stays enabled when the form has missing data —
                clicking runs handleSave which surfaces every problem as
                an inline field-level error. `isSaving` keeps the
                in-flight guard so the user can't double-submit. */}
            <Button
              className="gap-2"
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
