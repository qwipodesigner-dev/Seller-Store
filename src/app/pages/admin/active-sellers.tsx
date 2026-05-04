import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Search,
  Store,
  Plus,
} from "lucide-react";
import { getSellers, type Seller } from "../../lib/mock-store";
import { EmptyState } from "../../components/empty-state";

export function AdminActiveSellers() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSellers(getSellers());
  }, []);

  const filtered = sellers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    // Search restricted to seller name + business name only.
    return (
      s.name.toLowerCase().includes(q) ||
      s.businessName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {filtered.length} seller{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              className="gap-2"
              onClick={() => navigate("/admin/users/add")}
            >
              <Plus className="h-4 w-4" />
              Add Seller
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Store}
                title={
                  sellers.length === 0
                    ? "No sellers onboarded yet"
                    : "No sellers found"
                }
                description={
                  sellers.length === 0
                    ? "Add your first seller to start onboarding distributors onto the Qwipo platform."
                    : searchQuery
                      ? "No sellers match that search. Try a different name or business."
                      : "No sellers match your current filters."
                }
                action={
                  sellers.length === 0 ? (
                    <Button
                      className="gap-2"
                      onClick={() => navigate("/admin/users/add")}
                    >
                      <Plus className="h-4 w-4" />
                      Add Seller
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Seller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Business
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{s.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">
                            {s.businessName}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.phone}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/users/${s.id}`);
                              }}
                            >
                              Manage
                            </Button>
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
    </div>
  );
}
