import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";

interface BrandSettings {
  brandName: string;
  approvalMode: "DMS" | "Seller";
  matchCriteria: "Mobile Number" | "Customer ID";
}

interface CustomerSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandSettings: BrandSettings[];
  setBrandSettings: (settings: BrandSettings[]) => void;
}

export function CustomerSettingsDrawer({
  isOpen,
  onClose,
  brandSettings,
  setBrandSettings,
}: CustomerSettingsDrawerProps) {
  const handleSave = () => {
    toast.success("Customer settings saved successfully!");
    onClose();
  };

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
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[900px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure brand-specific approval modes and match criteria
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {brandSettings.map((setting, idx) => (
                  <Card key={idx} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_1fr] gap-6 items-start">
                        {/* Brand Name */}
                        <div className="flex items-center">
                          <h3 className="text-base font-semibold text-gray-900">
                            {setting.brandName}
                          </h3>
                        </div>

                        {/* Approval Mode */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Approval Mode
                          </Label>
                          <RadioGroup
                            value={setting.approvalMode}
                            onValueChange={(value) => {
                              const newSettings = [...brandSettings];
                              newSettings[idx].approvalMode = value as BrandSettings["approvalMode"];
                              setBrandSettings(newSettings);
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="DMS"
                                  id={`dms-${idx}`}
                                  className="w-5 h-5 border-2"
                                />
                                <Label
                                  htmlFor={`dms-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  DMS Approval
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="Seller"
                                  id={`seller-${idx}`}
                                  className="w-5 h-5 border-2"
                                />
                                <Label
                                  htmlFor={`seller-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  Seller Approval
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Match Criteria */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Match Criteria
                          </Label>
                          <RadioGroup
                            value={setting.matchCriteria}
                            onValueChange={(value) => {
                              const newSettings = [...brandSettings];
                              newSettings[idx].matchCriteria =
                                value as BrandSettings["matchCriteria"];
                              setBrandSettings(newSettings);
                            }}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="Mobile Number"
                                  id={`mobile-${idx}`}
                                  className="w-5 h-5 border-2"
                                />
                                <Label
                                  htmlFor={`mobile-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  Mobile Number
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="Customer ID"
                                  id={`customerid-${idx}`}
                                  className="w-5 h-5 border-2"
                                />
                                <Label
                                  htmlFor={`customerid-${idx}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  Customer ID
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}