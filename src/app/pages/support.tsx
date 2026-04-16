import { Card, CardContent } from "../components/ui/card";
import { Phone, Mail, Clock, HelpCircle, MessageCircle } from "lucide-react";

export function Support() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar — matches other pages */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-sm text-gray-600">
          Get help and reach our support team
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Support Line 1 */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Support Line 1</p>
                    <a
                      href="tel:12345"
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      12345
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  General queries and order support
                </p>
              </CardContent>
            </Card>

            {/* Support Line 2 */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-green-600 p-2.5 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Support Line 2</p>
                    <a
                      href="tel:23456"
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      23456
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Technical support and integrations
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <Card className="border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Email Support
                    </p>
                    <a
                      href="mailto:support@qwipo.com"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      support@qwipo.com
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-100 text-teal-600 p-2.5 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Working Hours
                    </p>
                    <p className="text-sm text-gray-700">
                      Monday to Friday
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      9:00 AM – 6:00 PM IST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help info */}
          <Card className="border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Frequently Asked Questions
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    For common queries about catalog sync, order management,
                    connector setup, and ONDC publishing, check our knowledge
                    base or reach out to the support team above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
