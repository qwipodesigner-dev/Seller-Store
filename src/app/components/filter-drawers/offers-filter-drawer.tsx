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

/**
 * Right-side filter drawer for the Offers & Schemes list page.
 * Mirrors the pattern used by inventory-filter-drawer / price-list-
 * filter-drawer / sellers-filter-drawer so the seller's mental model
 * (Filters button → slide-out panel → Status / Offer Type / etc.)
 * stays identical across every list page in the app.
 */

export interface OfferTypeOption {
  /** Slug used in state (e.g. "qps", "value-slab"). */
  value: string;
  /** Human-readable label rendered in the dropdown. */
  label: string;
}

interface OffersFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterOfferType: string;
  setFilterOfferType: (value: string) => void;
  /** The Offer Type options the page wants to expose in the dropdown.
   *  Lets the host page surface only the types that make sense for
   *  its dataset (e.g. only "QPS" on the live page; all 10 on the
   *  empty-mode demo page). */
  offerTypeOptions: OfferTypeOption[];
  onClearFilters: () => void;
}

export function OffersFilterDrawer({
  isOpen,
  onClose,
  filterStatus,
  setFilterStatus,
  filterOfferType,
  setFilterOfferType,
  offerTypeOptions,
  onClearFilters,
}: OffersFilterDrawerProps) {
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
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
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

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Offer Type
                  </Label>
                  <Select
                    value={filterOfferType}
                    onValueChange={setFilterOfferType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Offer Types</SelectItem>
                      {offerTypeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex gap-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button onClick={onClose} className="flex-1">
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
