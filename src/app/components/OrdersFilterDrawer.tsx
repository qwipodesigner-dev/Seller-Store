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
import { toast } from "sonner";

interface OrdersFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrands: string;
  setSelectedBrands: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  approvalSource: string;
  setApprovalSource: (value: string) => void;
  dmsStatus: string;
  setDmsStatus: (value: string) => void;
  conflict: string;
  setConflict: (value: string) => void;
  onClearFilters: () => void;
}

export function OrdersFilterDrawer({
  isOpen,
  onClose,
  selectedBrands,
  setSelectedBrands,
  orderStatus,
  setOrderStatus,
  approvalSource,
  setApprovalSource,
  dmsStatus,
  setDmsStatus,
  conflict,
  setConflict,
  onClearFilters,
}: OrdersFilterDrawerProps) {
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
              <div className="space-y-6">
                {/* Brand Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Brand
                  </Label>
                  <Select value={selectedBrands} onValueChange={setSelectedBrands}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      <SelectItem value="ITC">ITC</SelectItem>
                      <SelectItem value="HUL">HUL</SelectItem>
                      <SelectItem value="Parle">Parle</SelectItem>
                      <SelectItem value="Britannia">Britannia</SelectItem>
                      <SelectItem value="Nestle">Nestle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Order Status
                  </Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Approval Source Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Approval Source
                  </Label>
                  <Select value={approvalSource} onValueChange={setApprovalSource}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Seller">Seller</SelectItem>
                      <SelectItem value="DMS">DMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DMS Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    DMS Status
                  </Label>
                  <Select value={dmsStatus} onValueChange={setDmsStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All DMS Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All DMS</SelectItem>
                      <SelectItem value="Synced">Synced</SelectItem>
                      <SelectItem value="Not Synced">Not Synced</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conflict Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Conflict Status
                  </Label>
                  <Select value={conflict} onValueChange={setConflict}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Yes">Conflict</SelectItem>
                      <SelectItem value="No">No Conflict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
