import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Package,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  psSkus,
  psRequests,
  psCompanies,
  psBrands,
  getPendingRequests,
} from "../../lib/product-store-data";

export function CatalogAdminDashboard() {
  const activeSkus = psSkus.filter((s) => s.status === "active").length;
  const pendingApproval = psSkus.filter((s) => s.status === "pending_approval").length;
  const inactiveSkus = psSkus.filter((s) => s.status === "inactive").length;
  const pendingRequests = getPendingRequests();
  const approvedRequests = psRequests.filter((r) => r.status === "approved").length;
  const rejectedRequests = psRequests.filter((r) => r.status === "rejected").length;

  const createRequests = pendingRequests.filter((r) => r.type === "create_sku");
  const editRequests = pendingRequests.filter((r) => r.type === "edit_sku");
  const inactivateRequests = pendingRequests.filter((r) => r.type === "inactivate_sku");

  const recentActivity = [...psRequests]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const getRequestTypeLabel = (type: string) => {
    if (type === "create_sku") return "Create SKU";
    if (type === "edit_sku") return "Edit SKU";
    return "Inactivate SKU";
  };

  const getStatusBadge = (status: string) => {
    if (status === "pending")
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 text-xs">
          <Clock className="h-3 w-3" />
          Pending
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Product Store Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of the Qwipo Master Catalog — SKU health, pending requests,
          and recent activity.
        </p>
      </div>

      {/* Pending alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              {pendingRequests.length} pending request
              {pendingRequests.length !== 1 ? "s" : ""} awaiting your review
            </p>
          </div>
          <Link to="/catalog-admin/requests">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 gap-1">
              Review Now
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Active SKUs</span>
              <Package className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeSkus}</p>
            <p className="text-xs text-gray-400 mt-1">
              {inactiveSkus} inactive · {pendingApproval} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Pending Requests</span>
              <Inbox className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {pendingRequests.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {createRequests.length} create · {editRequests.length} edit ·{" "}
              {inactivateRequests.length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Companies</span>
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {psCompanies.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {psBrands.length} brands indexed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">All-time Approved</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{approvedRequests}</p>
            <p className="text-xs text-gray-400 mt-1">
              {rejectedRequests} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Request Breakdown
              <Link
                to="/catalog-admin/requests"
                className="text-xs font-normal text-teal-600 hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/catalog-admin/requests?type=create_sku" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Create SKU
                  </span>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {createRequests.length} pending
                </Badge>
              </div>
            </Link>
            <Link to="/catalog-admin/requests?type=edit_sku" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">
                    Edit SKU
                  </span>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  {editRequests.length} pending
                </Badge>
              </div>
            </Link>
            <Link to="/catalog-admin/requests?type=inactivate_sku" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-900">
                    Inactivate SKU
                  </span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {inactivateRequests.length} pending
                </Badge>
              </div>
            </Link>
            <div className="pt-2 border-t">
              <Link to="/catalog-admin/catalog/create">
                <Button size="sm" className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4" />
                  Create New SKU
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Recent Activity
              <Link
                to="/catalog-admin/requests"
                className="text-xs font-normal text-teal-600 hover:underline flex items-center gap-1"
              >
                All requests <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Request
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs line-clamp-1">
                        {req.skuName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {req.brandName} · {req.companyName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">
                        {getRequestTypeLabel(req.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {req.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Catalog health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Catalog Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{activeSkus}</p>
              <p className="text-xs text-green-600 mt-1">
                Live on Product Store
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Pending Approval
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{pendingApproval}</p>
              <p className="text-xs text-amber-600 mt-1">
                Awaiting review
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Inactive
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{inactiveSkus}</p>
              <p className="text-xs text-gray-500 mt-1">
                Discontinued or removed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
