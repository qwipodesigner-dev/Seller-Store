import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Search,
  Upload,
  Download,
  Building2,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  marketplaces: string[];
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Premium Coffee Beans 500g",
    sku: "PCB-500",
    brand: "Cafe Delight",
    category: "Beverages",
    price: 450,
    stock: 120,
    status: "active",
    marketplaces: ["ONDC", "Amazon"],
  },
  {
    id: "2",
    name: "Organic Green Tea Box",
    sku: "OGT-100",
    brand: "TeaTime",
    category: "Beverages",
    price: 280,
    stock: 85,
    status: "active",
    marketplaces: ["ONDC", "Flipkart"],
  },
  {
    id: "3",
    name: "Whole Wheat Pasta 1kg",
    sku: "WWP-1000",
    brand: "HealthyEats",
    category: "Food",
    price: 180,
    stock: 200,
    status: "active",
    marketplaces: ["ONDC"],
  },
  {
    id: "4",
    name: "Extra Virgin Olive Oil",
    sku: "EVOO-500",
    brand: "PureOil",
    category: "Food",
    price: 650,
    stock: 45,
    status: "active",
    marketplaces: ["Amazon", "Flipkart"],
  },
  {
    id: "5",
    name: "Organic Honey 250g",
    sku: "OH-250",
    brand: "BeeNatural",
    category: "Food",
    price: 320,
    stock: 8,
    status: "active",
    marketplaces: ["ONDC", "Amazon", "Flipkart"],
  },
];

const brands = [
  "Cafe Delight",
  "TeaTime",
  "HealthyEats",
  "PureOil",
  "BeeNatural",
];
const categories = ["Beverages", "Food", "Personal Care", "Home Care"];

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBrandSyncOpen, setIsBrandSyncOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    sku: "",
    brand: "",
    category: "",
    price: 0,
    stock: 0,
    status: "active",
    marketplaces: [],
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    const product: Product = {
      id: String(products.length + 1),
      name: newProduct.name || "",
      sku: newProduct.sku || "",
      brand: newProduct.brand || "",
      category: newProduct.category || "",
      price: newProduct.price || 0,
      stock: newProduct.stock || 0,
      status: "active",
      marketplaces: newProduct.marketplaces || [],
    };
    setProducts([...products, product]);
    setIsAddDialogOpen(false);
    setNewProduct({
      name: "",
      sku: "",
      brand: "",
      category: "",
      price: 0,
      stock: 0,
      status: "active",
      marketplaces: [],
    });
    toast.success("Product added successfully!");
  };

  const handleBrandSync = (brandName: string) => {
    const mockProducts = [
      { name: `${brandName} Premium Product`, category: "Beverages", count: 15 },
      { name: `${brandName} Classic Range`, category: "Food", count: 22 },
      { name: `${brandName} Deluxe Series`, category: "Personal Care", count: 8 },
    ];

    toast.success(
      `Synced ${mockProducts.reduce((a, b) => a + b.count, 0)} products from ${brandName}`
    );
    setIsBrandSyncOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" uploaded successfully! Processing...`);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory across all channels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Exporting...")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter product details to add to your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      placeholder="Enter product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      placeholder="Enter SKU"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select
                      value={newProduct.brand}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, brand: value })
                      }
                    >
                      <SelectTrigger>
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
                    <Label>Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newProduct.price || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newProduct.stock || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Enter product description" rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Onboarding Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Product Onboarding Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
              <TabsTrigger value="brand">Brand Sync</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="space-y-4">
              <p className="text-sm text-gray-600">
                Add products individually using the form above. Best for small
                catalogs or specific items.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product Manually
              </Button>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload Excel/CSV files to bulk import products. Download our
                template to get started.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <label htmlFor="file-upload">
                  <Button variant="default" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </TabsContent>
            <TabsContent value="brand" className="space-y-4">
              <p className="text-sm text-gray-600">
                Sync entire brand catalogs from ONDC or other sources. Select a
                brand to auto-import all products.
              </p>
              <Dialog open={isBrandSyncOpen} onOpenChange={setIsBrandSyncOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Sync Brand Catalog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Brand-Based Bulk Sync</DialogTitle>
                    <DialogDescription>
                      Select a brand to automatically import their full product
                      catalog
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Brand</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a brand" />
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
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>Preview:</strong> This will sync approximately
                        45 products from the selected brand's catalog via ONDC
                        Product Store.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsBrandSyncOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handleBrandSync("Selected Brand")}>
                      Sync Catalog
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({filteredProducts.length} of {products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        SKU: {product.sku} • Brand: {product.brand}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{product.category}</Badge>
                    {product.marketplaces.map((marketplace) => (
                      <Badge key={marketplace} variant="secondary">
                        {marketplace}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">
                      ₹{product.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Stock</p>
                    <p
                      className={`font-semibold ${
                        product.stock < 20
                          ? "text-red-600"
                          : product.stock < 50
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toast.info("Edit functionality coming soon")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}