import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { ArrowLeft, Save, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import {
  psSkus,
  getBrandById,
} from "../../lib/product-store-data";
import {
  SkuFormFields,
  SkuFormState,
  emptySkuForm,
} from "../../components/sku-form-fields";

export function CatalogAdminSkuForm() {
  const navigate = useNavigate();
  const { skuId } = useParams();
  const isEdit = !!skuId;

  const existingSku = isEdit ? psSkus.find((s) => s.id === skuId) : null;

  const [form, setForm] = useState<SkuFormState>(() => {
    if (!existingSku) return emptySkuForm;
    const brand = getBrandById(existingSku.brandId);
    return {
      ...emptySkuForm,
      itemName: existingSku.name,
      shortName: existingSku.shortName ?? "",
      groupName: existingSku.groupName ?? "",
      itemCode: existingSku.skuCode,
      brandId: existingSku.brandId,
      companyId: existingSku.companyId,
      brandAttribute: brand?.name ?? "",
      shortDesc: existingSku.shortDescription,
      longDesc: existingSku.longDescription,
      measureUnit:
        existingSku.packagingUnit === "kg" ? "Kilogram"
        : existingSku.packagingUnit === "g" ? "Gram"
        : existingSku.packagingUnit === "L" ? "Liter"
        : existingSku.packagingUnit === "ml" ? "Milliliter" : "",
      measureValue: existingSku.packagingSize,
      weightMeasure: existingSku.productWeight >= 1 ? "Kilogram" : "Gram",
      skuWeight: String(existingSku.productWeight),
      upc: existingSku.upc ?? "",
      packageType: existingSku.packageType ?? "",
      packageTypeValue: existingSku.packageTypeValue ?? "",
      productLength: existingSku.productLength ? String(existingSku.productLength) : "",
      productWidth: existingSku.productWidth ? String(existingSku.productWidth) : "",
      productHeight: existingSku.productHeight ? String(existingSku.productHeight) : "",
      hsnCode: existingSku.hsnCode,
      countryOfOrigin: existingSku.countryOfOrigin,
      manufacturerName: existingSku.manufacturerName,
      gstTax: existingSku.gstTax ?? "",
      gstCess: existingSku.gstCess ?? "0%",
      itemStatus: existingSku.status === "active" ? "enable" : "disable",
    };
  });

  const [productImages, setProductImages] = useState<string[]>(
    existingSku ? [existingSku.image] : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onChange = (key: keyof SkuFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.itemName.trim() &&
    form.itemCode.trim() &&
    form.brandId &&
    form.shortDesc.trim() &&
    form.longDesc.trim() &&
    form.measureUnit &&
    form.measureValue.trim() &&
    form.categoryId;

  const handleSave = () => {
    if (!isValid) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      toast.success(
        isEdit
          ? `"${form.itemName}" updated. Linked sellers will be notified.`
          : `"${form.itemName}" created with status Pending Approval.`
      );
      setTimeout(() => navigate("/catalog-admin/catalog"), 900);
    }, 700);
  };

  const statusBadge = existingSku ? (
    existingSku.status === "active" ? (
      <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200">
        {existingSku.status}
      </Badge>
    )
  ) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/catalog-admin/catalog")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEdit ? "Edit SKU" : "Create New SKU"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isEdit
                ? "Editing read-only fields — changes will notify all linked sellers."
                : "New SKUs are created with 'Pending Approval' and go live after internal review."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            {isEdit && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
                <span className="text-xs text-gray-600">Item Status</span>
                <Switch
                  checked={form.itemStatus === "enable"}
                  onCheckedChange={(v) =>
                    setForm((prev) => ({ ...prev, itemStatus: v ? "enable" : "disable" }))
                  }
                />
                <span className="text-xs font-medium">
                  {form.itemStatus === "enable" ? "Active" : "Inactive"}
                </span>
              </div>
            )}
            <Button
              className="gap-2 bg-teal-600 hover:bg-teal-700"
              disabled={!isValid || isSaving || saved}
              onClick={handleSave}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Save Changes" : "Create SKU"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Read-only callout */}
      <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-900">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-teal-600" />
        <p>
          <span className="font-medium">Read-only fields</span> — These fields are managed
          by Catalog Admin and are locked for all distributors in their My SKU.
        </p>
      </div>

      <SkuFormFields
        mode="admin"
        form={form}
        onChange={onChange}
        productImages={productImages}
        onProductImagesChange={setProductImages}
        isEdit={isEdit}
      />
    </div>
  );
}
