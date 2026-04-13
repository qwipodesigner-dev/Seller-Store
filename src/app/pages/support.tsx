import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Phone, Mail, HelpCircle } from "lucide-react";

export function Support() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header Card */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <HelpCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Support</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  We're here to help you
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Message */}
            <div className="text-center py-4">
              <p className="text-lg text-gray-700 font-medium">
                For further information, please contact support team.
              </p>
            </div>

            {/* Contact Numbers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Contact Numbers</h3>
              </div>
              
              <div className="grid gap-3">
                {/* Contact Number 1 */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Support Line 1</p>
                    <a 
                      href="tel:12345" 
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      12345
                    </a>
                  </div>
                </div>

                {/* Contact Number 2 */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Support Line 2</p>
                    <a 
                      href="tel:23456" 
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      23456
                    </a>
                  </div>
                </div>

                {/* Contact Number 3 */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Support Line 3</p>
                    <a 
                      href="tel:34567" 
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      34567
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    Our support team is available Monday to Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
