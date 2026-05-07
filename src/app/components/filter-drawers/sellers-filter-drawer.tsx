import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type SellerStatusFilter = "all" | "active" | "inactive";

interface SellersFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: SellerStatusFilter;
  onStatusChange: (value: SellerStatusFilter) => void;
  onClearFilters: () => void;
}

/**
 * Right-hand drawer of filters for the Admin → Sellers list page.
 * Mirrors the seller-module filter drawers (My SKU, Orders, Offers,
 * etc.) so the Super Admin learns the pattern once: chip filters chosen
 * here, Apply / Clear at the bottom, slides in from the right.
 *
 * Phase 1 ships a single Status filter (Active / Inactive). Add more
 * controls (Seller Type, Created date range, etc.) by dropping more
 * `<Select>` blocks into the content area — every block reuses the
 * same `<Label>` + `<Select>` pattern below.
 */
export function SellersFilterDrawer({
  isOpen,
  onClose,
  status,
  onStatusChange,
  onClearFilters,
}: SellersFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — clicking outside closes the drawer. */}
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
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      onStatusChange(v as SellerStatusFilter)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500">
                    Filter the list to active or deactivated sellers only.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
