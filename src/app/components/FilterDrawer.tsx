import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MultiSelect } from "./ui/multi-select";

const brandOptions = [
  { label: "ITC", value: "ITC" },
  { label: "HUL", value: "HUL" },
  { label: "Parle", value: "Parle" },
  { label: "Britannia", value: "Britannia" },
  { label: "Nestle", value: "Nestle" },
  { label: "Dabur", value: "Dabur" },
];

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  // Brand filter (common)
  selectedBrands: string[];
  setSelectedBrands: (value: string[]) => void;
  // Master tab filters
  masterApprovalFilter: string;
  setMasterApprovalFilter: (value: string) => void;
  masterSourceFilter: string;
  setMasterSourceFilter: (value: string) => void;
  masterSyncFilter: string;
  setMasterSyncFilter: (value: string) => void;
  // ONDC tab filters
  ondcApprovalFilter: string;
  setOndcApprovalFilter: (value: string) => void;
  ondcMatchFilter: string;
  setOndcMatchFilter: (value: string) => void;
  ondcSyncFilter: string;
  setOndcSyncFilter: (value: string) => void;
  // Clear function
  onClearFilters: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  activeTab,
  selectedBrands,
  setSelectedBrands,
  masterApprovalFilter,
  setMasterApprovalFilter,
  masterSourceFilter,
  setMasterSourceFilter,
  masterSyncFilter,
  setMasterSyncFilter,
  ondcApprovalFilter,
  setOndcApprovalFilter,
  ondcMatchFilter,
  setOndcMatchFilter,
  ondcSyncFilter,
  setOndcSyncFilter,
  onClearFilters,
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "master" && (
                <div className="space-y-6">
                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Brand
                    </Label>
                    <MultiSelect
                      options={brandOptions}
                      selected={selectedBrands}
                      onChange={setSelectedBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>

                  {/* Approval Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Approval Status
                    </Label>
                    <Select value={masterApprovalFilter} onValueChange={setMasterApprovalFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Approval Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Source
                    </Label>
                    <Select value={masterSourceFilter} onValueChange={setMasterSourceFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="DMS">DMS</SelectItem>
                        <SelectItem value="ONDC">ONDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sync Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Sync Status
                    </Label>
                    <Select value={masterSyncFilter} onValueChange={setMasterSyncFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sync Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sync Status</SelectItem>
                        <SelectItem value="Synced">Synced</SelectItem>
                        <SelectItem value="Not Synced">Not Synced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === "dms" && (
                <div className="space-y-6">
                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Brand
                    </Label>
                    <MultiSelect
                      options={brandOptions}
                      selected={selectedBrands}
                      onChange={setSelectedBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {activeTab === "ondc" && (
                <div className="space-y-6">
                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Brand
                    </Label>
                    <MultiSelect
                      options={brandOptions}
                      selected={selectedBrands}
                      onChange={setSelectedBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>

                  {/* Approval Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Approval Status
                    </Label>
                    <Select value={ondcApprovalFilter} onValueChange={setOndcApprovalFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Approval Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Match Found Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Match Found in DMS
                    </Label>
                    <Select value={ondcMatchFilter} onValueChange={setOndcMatchFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Match Found" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Matches</SelectItem>
                        <SelectItem value="yes">Match Found</SelectItem>
                        <SelectItem value="no">No Match</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sync Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Sync Status
                    </Label>
                    <Select value={ondcSyncFilter} onValueChange={setOndcSyncFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sync Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sync Status</SelectItem>
                        <SelectItem value="Synced">Synced</SelectItem>
                        <SelectItem value="Not Synced">Not Synced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClearFilters();
                }}
              >
                Clear Filters
              </Button>
              <Button
                className="flex-1"
                onClick={onClose}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
