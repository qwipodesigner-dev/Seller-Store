import { Card, CardContent } from "../components/ui/card";
import { Phone, Mail, Clock, HelpCircle } from "lucide-react";

// Static support page — every seller sees the same content. Phone
// numbers, email and hours are hard-coded per the Phase 1 spec; there
// is no admin surface configuring them. The phone-line cards are
// rendered as <a tel:…> deep links so a tap from a mobile device
// places a call directly. Email card is a mailto: deep link.
export function Support() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar — matches the wording in the spec */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-sm text-gray-600">
          Get help and reach our support team
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Phone Lines (top row) — entire card is a tel: deep link
              so the seller can tap anywhere on the card to dial. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="tel:12345"
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            >
              <Card className="border border-gray-200 group-hover:shadow-md group-hover:border-blue-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Support Line 1</p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        12345
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    General queries and order support
                  </p>
                </CardContent>
              </Card>
            </a>

            <a
              href="tel:23456"
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg"
            >
              <Card className="border border-gray-200 group-hover:shadow-md group-hover:border-green-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 text-green-600 p-2.5 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Support Line 2</p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        23456
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Technical support and integrations
                  </p>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Email + Working Hours (second row). Email is a mailto:
              deep link wrapping the whole card; Working Hours is
              read-only. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:support@qwipo.com"
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
            >
              <Card className="border border-gray-200 group-hover:shadow-md group-hover:border-amber-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        Email Support
                      </p>
                      <p className="text-sm text-blue-600 group-hover:underline truncate">
                        support@qwipo.com
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>

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
                    <p className="text-sm text-gray-700">Monday to Friday</p>
                    <p className="text-xs text-gray-500 mt-1">
                      9:00 AM – 6:00 PM IST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ — informational only; no link out (BR-6). */}
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
