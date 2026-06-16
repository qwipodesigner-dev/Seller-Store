import { useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Plus,
  Tag,
  Inbox,
  Calendar,
  Building2,
  PowerOff,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  psRequests as initialRequests,
  type PSRequest,
  type PSRequestType,
  type PSRequestStatus,
} from "../../lib/product-store-data";
import {
  SkuFormFields,
  SkuFormState,
  emptySkuForm,
} from "../../components/sku-form-fields";
type FilterStatus = PSRequestStatus | "all";
type FilterType = PSRequestType | "all";

export function BrandManagerRequests() {
  const requests = useMemo(
    () => initialRequests.filter((r) => r.requestedByType === "brand_manager"),
    []
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [viewRequest, setViewRequest] = useState<PSRequest | null>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.skuName.toLowerCase().includes(q) ||
          r.brandName.toLowerCase().includes(q) ||
          r.companyName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, search]);

  const pendingCount = requests.filter(
    (r) => r.status === "submitted" || r.status === "in_progress"
  ).length;

  const getTypeBadge = (type: PSRequest["type"]) => {
    if (type === "create_sku")
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Create SKU
        </Badge>
      );
    if (type === "edit_sku")
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs">
          <Tag className="h-3 w-3" />
          Edit SKU
        </Badge>
      );
    if (type === "inactivate_sku")
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 gap-1 text-xs">
          <PowerOff className="h-3 w-3" />
          Make Inactive
        </Badge>
      );
    if (type === "activate_sku")
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs">
          <Zap className="h-3 w-3" />
          Activate SKU
        </Badge>
      );
    if (type === "request_company")
      return (
        <Badge className="bg-violet-50 text-violet-700 border-violet-200 gap-1 text-xs">
          <Building2 className="h-3 w-3" />
          New Company
        </Badge>
      );
    return (
      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 text-xs">
        <Tag className="h-3 w-3" />
        New Brand
      </Badge>
    );
  };

  const getStatusBadge = (status: PSRequest["status"]) => {
    if (status === "submitted")
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs">
          <Clock className="h-3 w-3" />
          Submitted
        </Badge>
      );
    if (status === "in_progress")
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs">
          <RefreshCw className="h-3 w-3" />
          In Review
        </Badge>
      );
    if (status === "approved")
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200 gap-1 text-xs">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          My Requests
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white rounded-full text-xs px-2">
              {pendingCount}
            </Badge>
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track the status of SKU requests you've submitted to Catalog Admin.
          Requests are processed by the Qwipo catalog team.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by SKU or brand..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as FilterType)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="create_sku">Create SKU</SelectItem>
            <SelectItem value="edit_sku">Edit SKU</SelectItem>
            <SelectItem value="inactivate_sku">Make Inactive</SelectItem>
            <SelectItem value="activate_sku">Activate SKU</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as FilterStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_progress">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm">
                Your submitted requests will appear here once you create, edit,
                or inactivate a SKU.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    SKU / Brand
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">
                        {req.type === "request_company"
                          ? req.companyName
                          : req.skuName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {req.brandName} · {req.companyName}
                      </p>
                      {req.skuCode && (
                        <code className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded font-mono">
                          {req.skuCode}
                        </code>
                      )}
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(req.type)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {req.createdAt}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => setViewRequest(req)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* View dialog — read-only for BM */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">
                {viewRequest?.skuName || viewRequest?.companyName || "—"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <code className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                  {viewRequest?.id}
                </code>
                {viewRequest && getTypeBadge(viewRequest.type)}
                {viewRequest && getStatusBadge(viewRequest.status)}
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Submitted {viewRequest?.createdAt}
              </p>
            </div>

            {viewRequest?.status === "in_progress" && (
              <div className="flex items-start gap-2 mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <RefreshCw className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-500" />
                <p>Catalog Admin is currently reviewing your request.</p>
              </div>
            )}
            {viewRequest?.status === "approved" && (
              <div className="flex items-start gap-2 mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-green-600" />
                <p>Request approved and applied to the Product Store.</p>
              </div>
            )}
            {viewRequest?.reason && (
              <div className="flex items-start gap-2 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-medium">Rejection reason</p>
                  <p className="mt-0.5">{viewRequest.reason}</p>
                </div>
              </div>
            )}
          </DialogHeader>

          {viewRequest && (
            <div className="space-y-5 pt-2">
              {viewRequest.form && (
                <SkuFormFields
                  mode="seller"
                  readOnly
                  form={{ ...emptySkuForm, ...(viewRequest.form as Partial<SkuFormState>) }}
                  productImages={[]}
                  onProductImagesChange={() => {}}
                />
              )}

              {viewRequest.changes && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 border-b">
                    Proposed Changes
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500">Field</th>
                        <th className="text-left px-3 py-2 text-gray-500">Current</th>
                        <th className="text-left px-3 py-2 text-gray-500">Proposed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(viewRequest.changes).map(([field, { old: oldVal, new: newVal }]) => (
                        <tr key={field} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium text-gray-700">{field}</td>
                          <td className="px-3 py-2 text-red-600 line-through">{oldVal}</td>
                          <td className="px-3 py-2 text-green-700 font-medium">{newVal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!viewRequest.form && !viewRequest.changes && viewRequest.notes && (
                <div className="p-3 bg-gray-50 rounded border text-xs">
                  <p className="text-gray-500 mb-1 font-medium">Notes</p>
                  <p className="text-gray-800">{viewRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
