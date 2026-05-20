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
          {/* All four cards share the same anatomy: icon-left, content-
              right, content stack = Title → Value → Caption. `h-full`
              + a `flex` content body means cards in the same row are
              the same height regardless of caption length. */}

          {/* Row 1 — active contact channels (Phone + Email). Both wrap
              tel:/mailto: deep links so the whole card is tappable. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="tel:+919121222836"
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            >
              <Card className="h-full border border-gray-200 group-hover:shadow-md group-hover:border-blue-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Phone Support
                      </p>
                      <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        +91 91212 22836
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        General queries and order support
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>

            <a
              href="mailto:info@qwipo.com"
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
            >
              <Card className="h-full border border-gray-200 group-hover:shadow-md group-hover:border-amber-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Email Support
                      </p>
                      <p className="text-base font-semibold text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                        info@qwipo.com
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Row 2 — passive info (Working Hours + FAQ). Same anatomy
              so the four cards form an aligned 2 × 2 grid. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="h-full border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-100 text-teal-600 p-2.5 rounded-lg flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Working Hours
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      Monday – Friday
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      9:00 AM – 6:00 PM IST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg flex-shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Frequently Asked Questions
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      How-to &amp; common queries
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Catalog, orders, connectors, ONDC.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
