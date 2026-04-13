import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Upload, 
  X, 
  Image as ImageIcon,
  Package,
  IndianRupee,
  Truck,
  RotateCcw,
  CreditCard,
  FileText,
  Headphones,
  Globe,
  Tag
} from "lucide-react";
import { toast } from "sonner";

const categories = [
  "Beverages",
  "Food & Groceries",
  "Personal Care",
  "Home Care",
  "Health & Wellness",
  "Electronics",
  "Fashion & Apparel",
];

const brands = [
  "Cafe Delight",
  "TeaTime",
  "HealthyEats",
  "PureOil",
  "BeeNatural",
  "Fresh & Pure",
  "Nature's Best",
];

const unitTypes = ["piece", "kg", "gram", "litre", "ml", "meter", "cm", "dozen", "pack"];
const packagingTypes = ["Single Unit", "Case", "Bundle", "Multi-pack"];
const countries = ["India", "USA", "China", "Germany", "Japan", "UK", "Australia"];

export function AddManually() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Basic Details
    productName: "",
    category: "",
    brand: "",
    skuCode: "",
    shortDescription: "",
    longDescription: "",
    
    // Pricing
    sellingPrice: "",
    mrp: "",
    currency: "INR",
    
    // Inventory & Packaging
    availableQuantity: "",
    maxOrderQuantity: "",
    unitType: "",
    packSize: "",
    packagingType: "",
    
    // Fulfillment
    fulfillmentDelivery: true,
    fulfillmentSelfPickup: false,
    storeWarehouse: "",
    
    // Shipping & SLA
    timeToShip: "",
    timeToShipUnit: "hours",
    
    // Return & Cancellation
    returnable: true,
    cancellable: true,
    returnPickupAvailable: false,
    
    // Payment
    codAvailable: true,
    
    // Compliance
    manufacturerName: "",
    manufacturerAddress: "",
    genericProductName: "",
    manufactureDate: "",
    
    // Customer Support
    supportName: "",
    supportEmail: "",
    supportPhone: "",
    
    // Origin
    countryOfOrigin: "",
    
    // Additional Details
    weight: "",
    volume: "",
    variant: "",
    tags: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    toast.success("SKU saved as draft successfully!");
    navigate("/products/price-list");
  };

  const handlePublish = () => {
    toast.success("SKU published successfully!");
    navigate("/products/price-list");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/products/add-sku"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Add SKU
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New SKU</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to create a new product listing
          </p>
        </div>

        {/* 1. Basic Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Basic Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Premium Coffee Beans 500g"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">
                  Brand Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand: value })
                  }
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skuCode">
                  SKU Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="skuCode"
                  placeholder="e.g., PCB-500-001"
                  value={formData.skuCode}
                  onChange={(e) =>
                    setFormData({ ...formData, skuCode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                placeholder="Brief description for listings (max 100 characters)"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                placeholder="Detailed product description for customers"
                rows={4}
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Product Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB (Max 10 images)
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-600" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">
                  Selling Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp">
                  MRP (Maximum Retail Price) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mrp"
                  type="number"
                  placeholder="0.00"
                  value={formData.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Inventory & Packaging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Inventory & Packaging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableQuantity">
                  Available Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="availableQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.availableQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, availableQuantity: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOrderQuantity">Maximum Order Quantity</Label>
                <Input
                  id="maxOrderQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.maxOrderQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, maxOrderQuantity: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitType">
                  Unit Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unitType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unitType: value })
                  }
                >
                  <SelectTrigger id="unitType">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Input
                  id="packSize"
                  placeholder="e.g., 1L x 12 or 5kg x 4"
                  value={formData.packSize}
                  onChange={(e) =>
                    setFormData({ ...formData, packSize: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packagingType">Packaging Type</Label>
                <Select
                  value={formData.packagingType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, packagingType: value })
                  }
                >
                  <SelectTrigger id="packagingType">
                    <SelectValue placeholder="Select packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    {packagingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Fulfillment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Fulfillment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-600">Ship to customer address</p>
                </div>
                <Switch
                  checked={formData.fulfillmentDelivery}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, fulfillmentDelivery: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Self Pickup</p>
                  <p className="text-sm text-gray-600">Customer picks up from store</p>
                </div>
                <Switch
                  checked={formData.fulfillmentSelfPickup}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, fulfillmentSelfPickup: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeWarehouse">Store / Warehouse Selection</Label>
              <Select
                value={formData.storeWarehouse}
                onValueChange={(value) =>
                  setFormData({ ...formData, storeWarehouse: value })
                }
              >
                <SelectTrigger id="storeWarehouse">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse-mumbai">Mumbai Warehouse</SelectItem>
                  <SelectItem value="warehouse-delhi">Delhi Warehouse</SelectItem>
                  <SelectItem value="warehouse-bangalore">Bangalore Warehouse</SelectItem>
                  <SelectItem value="store-main">Main Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 6. Shipping & SLA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Shipping & SLA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeToShip">Time to Ship</Label>
                <Input
                  id="timeToShip"
                  type="number"
                  placeholder="0"
                  value={formData.timeToShip}
                  onChange={(e) =>
                    setFormData({ ...formData, timeToShip: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeToShipUnit">Unit</Label>
                <Select
                  value={formData.timeToShipUnit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timeToShipUnit: value })
                  }
                >
                  <SelectTrigger id="timeToShipUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Return & Cancellation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              Return & Cancellation Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Returnable</p>
                <p className="text-sm text-gray-600">Allow product returns</p>
              </div>
              <Switch
                checked={formData.returnable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, returnable: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Cancellable</p>
                <p className="text-sm text-gray-600">Allow order cancellation</p>
              </div>
              <Switch
                checked={formData.cancellable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, cancellable: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Return Pickup Available</p>
                <p className="text-sm text-gray-600">Pickup returned items</p>
              </div>
              <Switch
                checked={formData.returnPickupAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, returnPickupAvailable: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 8. Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-sm text-gray-600">Accept cash payment on delivery</p>
              </div>
              <Switch
                checked={formData.codAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, codAvailable: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 9. Compliance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Compliance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturerName">Manufacturer / Packer Name</Label>
                <Input
                  id="manufacturerName"
                  placeholder="e.g., ABC Foods Pvt Ltd"
                  value={formData.manufacturerName}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturerName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genericProductName">Generic Product Name</Label>
                <Input
                  id="genericProductName"
                  placeholder="e.g., Coffee Beans"
                  value={formData.genericProductName}
                  onChange={(e) =>
                    setFormData({ ...formData, genericProductName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="manufacturerAddress">Manufacturer Address</Label>
                <Textarea
                  id="manufacturerAddress"
                  placeholder="Complete manufacturer address"
                  rows={2}
                  value={formData.manufacturerAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturerAddress: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufactureDate">Month & Year of Manufacture/Packing</Label>
                <Input
                  id="manufactureDate"
                  type="month"
                  value={formData.manufactureDate}
                  onChange={(e) =>
                    setFormData({ ...formData, manufactureDate: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 10. Customer Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-600" />
              Customer Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="supportName">Support Name / Organization</Label>
                <Input
                  id="supportName"
                  placeholder="e.g., Customer Care Team"
                  value={formData.supportName}
                  onChange={(e) =>
                    setFormData({ ...formData, supportName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email ID</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Phone Number</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.supportPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, supportPhone: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 11. Origin Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Origin Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="countryOfOrigin">Country of Origin</Label>
              <Select
                value={formData.countryOfOrigin}
                onValueChange={(value) =>
                  setFormData({ ...formData, countryOfOrigin: value })
                }
              >
                <SelectTrigger id="countryOfOrigin">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 12. Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Additional Details (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 500g or 2kg"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  placeholder="e.g., 1L or 500ml"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant">Variant (size / type / flavor)</Label>
                <Input
                  id="variant"
                  placeholder="e.g., Large, Vanilla, Red"
                  value={formData.variant}
                  onChange={(e) =>
                    setFormData({ ...formData, variant: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g., organic, premium, bestseller"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleSaveDraft}
          >
            <Save className="h-5 w-5 mr-2" />
            Save Draft
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handlePublish}
          >
            <Send className="h-5 w-5 mr-2" />
            Publish SKU
          </Button>
        </div>

        {/* Helper Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
              <li>SKU codes must be unique across your entire catalog</li>
              <li>Upload high-quality images with white background for better visibility</li>
              <li>Fill in compliance information to meet marketplace requirements</li>
              <li>Set accurate shipping times to improve customer satisfaction</li>
              <li>Save as draft to review later, or publish to make it live immediately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
