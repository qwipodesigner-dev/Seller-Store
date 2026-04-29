import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Rocket,
  Clock,
  ChevronRight,
  Store,
  Building2,
  Plug,
} from "lucide-react";

// Phase 1 placeholder — the full Super Admin dashboard (KPIs, request feeds,
// charts, etc.) is not part of Phase 1 scope. We surface a clean "Coming
// Soon" screen and route the admin to the modules that ARE shipping in
// this phase. Mirrors the seller-side Dashboard placeholder.
export function AdminDashboard() {
  const navigate = useNavigate();

  const phase1Modules = [
    {
      label: "Sellers",
      description: "Approve new requests, manage sellers and their company links",
      href: "/admin/users",
      icon: Store,
    },
    {
      label: "Companies & Brands",
      description: "Master catalog with per-company brands and ONDC categories",
      href: "/admin/companies",
      icon: Building2,
    },
    {
      label: "Connectors",
      description: "DMS / ONDC connector configuration",
      href: "/admin/connectors",
      icon: Plug,
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-xl mb-5">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 mb-3">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Admin Dashboard is on the way
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Network-level KPIs, seller activity, request analytics and other
            dashboard visualisations are <b>not part of Phase 1</b>. They will
            be released in a later phase. In the meantime, jump straight into
            the modules below.
          </p>
        </div>

        <Card className="border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              Available now in Phase 1
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phase1Modules.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => navigate(m.href)}
                    className="group flex items-center gap-3 text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-600 truncate">{m.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          Need a metric urgently or have feedback?{" "}
          <a href="mailto:support@qwipo.com" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
