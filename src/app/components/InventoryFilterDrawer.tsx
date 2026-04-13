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

interface InventoryFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterBrand: string;
  setFilterBrand: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
}

export function InventoryFilterDrawer({
  isOpen,
  onClose,
  filterCategory,
  setFilterCategory,
  filterBrand,
  setFilterBrand,
  filterStatus,
  setFilterStatus,
  onClearFilters,
  categories,
  brands,
}: InventoryFilterDrawerProps) {
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
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Brand
                  </Label>
                  <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand === "all" ? "All Brands" : brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Stock Status
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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