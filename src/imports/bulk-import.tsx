import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export function BulkImport() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        toast.success(`Successfully uploaded "${file.name}"! Processing 150 products...`);
      }, 2000);
    }
  };

  const handleDownloadTemplate = () => {
    toast.success("Downloading Excel template...");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/products/add-sku"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Add SKU
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Import Products</h1>
        <p className="text-gray-600 mt-1">
          Upload your product catalog using our Excel template
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Step 1 - Download Template */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <CardTitle>Download Template</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Download our pre-formatted Excel template with all required fields
              and sample data.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    SKU_Import_Template.xlsx
                  </p>
                  <p className="text-sm text-gray-600">12 KB</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Template includes:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Product name, SKU, brand</li>
                <li>Category, price, MRP</li>
                <li>Stock quantity, HSN code</li>
                <li>Weight, dimensions, description</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 - Upload File */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <CardTitle>Upload Your File</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Fill in the template with your product data and upload it here.
            </p>

            {/* Upload Area */}
            <label
              htmlFor="file-upload"
              className="block cursor-pointer"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadedFile ? uploadedFile.name : "Click to upload"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Excel (.xlsx, .xls) or CSV files
                    </p>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      Processing...
                    </div>
                  )}
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {uploadedFile && !isProcessing && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                File uploaded successfully
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-900 mb-2">
                File requirements:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Maximum file size: 10 MB</li>
                <li>Supported: .xlsx, .xls, .csv</li>
                <li>Up to 5,000 products per file</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Import Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-amber-900 mb-2">
                ✓ Best Practices
              </h4>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Use the provided template format</li>
                <li>Fill all mandatory fields (marked with *)</li>
                <li>Ensure SKU codes are unique</li>
                <li>Use proper number formats for prices</li>
                <li>Double-check brand and category names</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-amber-900 mb-2">
                ✗ Common Mistakes
              </h4>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Duplicate SKU codes</li>
                <li>Missing required fields</li>
                <li>Invalid number formats</li>
                <li>Special characters in SKU codes</li>
                <li>Exceeding character limits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <CardTitle>Sample Data Format</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-900">SKU*</th>
                  <th className="text-left p-3 font-medium text-gray-900">Product Name*</th>
                  <th className="text-left p-3 font-medium text-gray-900">Brand*</th>
                  <th className="text-left p-3 font-medium text-gray-900">Category*</th>
                  <th className="text-left p-3 font-medium text-gray-900">Price*</th>
                  <th className="text-left p-3 font-medium text-gray-900">Stock*</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-gray-600">PCB-500</td>
                  <td className="p-3 text-gray-600">Premium Coffee Beans 500g</td>
                  <td className="p-3 text-gray-600">Cafe Delight</td>
                  <td className="p-3 text-gray-600">Beverages</td>
                  <td className="p-3 text-gray-600">450</td>
                  <td className="p-3 text-gray-600">120</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-600">OGT-100</td>
                  <td className="p-3 text-gray-600">Organic Green Tea Box</td>
                  <td className="p-3 text-gray-600">TeaTime</td>
                  <td className="p-3 text-gray-600">Beverages</td>
                  <td className="p-3 text-gray-600">280</td>
                  <td className="p-3 text-gray-600">85</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-600">WWP-1000</td>
                  <td className="p-3 text-gray-600">Whole Wheat Pasta 1kg</td>
                  <td className="p-3 text-gray-600">HealthyEats</td>
                  <td className="p-3 text-gray-600">Food</td>
                  <td className="p-3 text-gray-600">180</td>
                  <td className="p-3 text-gray-600">200</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Required fields
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
