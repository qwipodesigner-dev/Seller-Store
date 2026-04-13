import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import {
  Inbox,
  Users,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  getRequests,
  getSellers,
  type SellerRequest,
  type Seller,
} from "../../lib/mock-store";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    setRequests(getRequests());
    setSellers(getSellers());
  }, []);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const activeCount = sellers.length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const metrics = [
    {
      label: "Pending Requests",
      value: String(pendingCount),
      icon: Inbox,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-l-amber-500",
      link: "/admin/users",
    },
    {
      label: "Active Sellers",
      value: String(activeCount),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-500",
      link: "/admin/users",
    },
    {
      label: "Approved",
      value: String(approvedCount),
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      borderColor: "border-l-green-500",
      link: "/admin/users",
    },
    {
      label: "Rejected",
      value: String(rejectedCount),
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      borderColor: "border-l-red-500",
      link: "/admin/users",
    },
  ];

  const recentRequests = requests
    .filter((r) => r.status === "pending")
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className={`border-l-4 ${metric.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => navigate(metric.link)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {metric.value}
                      </p>
                    </div>
                    <div
                      className={`${metric.iconBg} ${metric.iconColor} p-3 rounded-xl`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Pending Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Pending Requests
            </h2>
            <button
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              onClick={() => navigate("/admin/users")}
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Card>
            <CardContent className="p-0">
              {recentRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No pending requests. You're all caught up.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentRequests.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate("/admin/users")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {r.businessName} • {r.city}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 flex-shrink-0">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
