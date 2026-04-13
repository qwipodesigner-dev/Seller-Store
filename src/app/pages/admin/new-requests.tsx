import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRequests,
  approveRequest,
  rejectRequest,
  type SellerRequest,
} from "../../lib/mock-store";

type Filter = "pending" | "approved" | "rejected" | "all";

export function AdminNewRequests() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [viewRequest, setViewRequest] = useState<SellerRequest | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    request: SellerRequest;
  } | null>(null);

  const refresh = () => setRequests(getRequests());

  useEffect(() => {
    refresh();
  }, []);

  const filtered = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.businessName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: SellerRequest["status"]) => {
    if (status === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
          Pending
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300">Rejected</Badge>
    );
  };

  const handleApprove = () => {
    if (!confirmAction) return;
    const seller = approveRequest(confirmAction.request.id);
    if (seller) {
      toast.success(`Approved ${confirmAction.request.name}`);
      refresh();
    } else {
      toast.error("Unable to approve request");
    }
    setConfirmAction(null);
  };

  const handleReject = () => {
    if (!confirmAction) return;
    const ok = rejectRequest(confirmAction.request.id);
    if (ok) {
      toast.success(`Rejected ${confirmAction.request.name}`);
      refresh();
    } else {
      toast.error("Unable to reject request");
    }
    setConfirmAction(null);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filter / Search Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex gap-1">
              {(["pending", "approved", "rejected", "all"] as Filter[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                      filter === f
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                {pendingCount} pending
              </Badge>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, business, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No requests found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "New seller signup requests will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{r.name}</p>
                          <p className="text-xs text-gray-500">{r.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {r.businessName}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {r.phone}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {r.city}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {new Date(r.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(r.status)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View details"
                              onClick={() => setViewRequest(r)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {r.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white gap-1"
                                  onClick={() =>
                                    setConfirmAction({ type: "approve", request: r })
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={() =>
                                    setConfirmAction({ type: "reject", request: r })
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details dialog */}
      <Dialog open={viewRequest !== null} onOpenChange={(o) => !o && setViewRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {viewRequest
                ? new Date(viewRequest.submittedAt).toLocaleString()
                : ""}
            </DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="font-medium">{viewRequest.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="font-medium">{viewRequest.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium">{viewRequest.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Business</p>
                  <p className="font-medium">{viewRequest.businessName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">City</p>
                  <p className="font-medium">{viewRequest.city}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Status</p>
                  {getStatusBadge(viewRequest.status)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject confirm dialog */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "approve"
                ? "Approve Request"
                : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "approve" ? (
                <>
                  Approve <b>{confirmAction?.request.name}</b> from{" "}
                  <b>{confirmAction?.request.businessName}</b>? An active seller
                  account will be created.
                </>
              ) : (
                <>
                  Reject <b>{confirmAction?.request.name}</b>'s request? This
                  cannot be undone from the UI.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            {confirmAction?.type === "approve" ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
              >
                Approve
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
