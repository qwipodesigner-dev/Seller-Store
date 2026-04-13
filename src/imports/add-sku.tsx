import { Link } from "react-router";
import { RefreshCw, Sparkles, Database } from "lucide-react";

export function AddSKU() {
  return (
    <div className="min-h-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Add Products to Your Catalog
          </h1>
          <p className="text-lg text-gray-600">
            Sync products from Qwipo Master Catalog
          </p>
        </div>

        {/* Single Card - Sync from Central Catalog */}
        <Link to="/products/add-sku/central-catalog" className="group block">
          <div className="relative bg-white rounded-2xl border-2 border-purple-300 p-10 transition-all duration-200 hover:border-purple-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                <Sparkles className="h-4 w-4" />
                Single Source of Truth
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-200 shadow-lg">
                <Database className="h-12 w-12 text-purple-600 group-hover:text-white transition-colors" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Sync from Central Catalog
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Import products from Qwipo Master Database - your single source of truth for verified product data
                </p>
              </div>

              {/* CTA */}
              <div className="pt-6 w-full max-w-xs">
                <div className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 transition-all shadow-lg group-hover:shadow-xl">
                  <RefreshCw className="h-5 w-5" />
                  Start Syncing
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">500+</div>
                  <p className="text-xs text-gray-600">Brands Available</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">50K+</div>
                  <p className="text-xs text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
                  <p className="text-xs text-gray-600">Verified Data</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Why Qwipo Master Catalog?
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Single Source of Truth:</strong> All product data centrally managed and verified</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>No Manual Entry:</strong> Eliminate errors with automated sync</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Always Updated:</strong> Get latest product information automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span><strong>Full or Selective Sync:</strong> Choose entire brand catalog or pick specific products</span>
            </li>
          </ul>
        </div>

        {/* Helper Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All products are pre-verified with complete details including images, specifications, and pricing
          </p>
        </div>
      </div>
    </div>
  );
}
