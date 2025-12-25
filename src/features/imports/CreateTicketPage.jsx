import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Upload,
  Plus,
  Trash2,
  History,
  Search,
  ArrowLeft,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  productService,
  warehouseService,
  importService,
  exportService,
  categoryService,
} from "@/services";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState("import");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data lists
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Form data
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [transactionList, setTransactionList] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter((p) => {
        const matchSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
        return matchSearch && matchCategory;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products, selectedCategory]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes, categoriesRes] = await Promise.all([
        productService.getAll(),
        warehouseService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      setCategories(categoriesRes.data);
      if (warehousesRes.data.length > 0) {
        setSelectedWarehouse(warehousesRes.data[0].warehouseId);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setFilteredProducts([]);
    // Auto-generate batch number suggestion
    if (mode === "import") {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(1000 + Math.random() * 9000);
      setBatchNumber(`LOT${today}${random}`);
    }
  };

  const handleAddToList = () => {
    if (!selectedProduct) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }
    if (mode === "import" && (!price || parseFloat(price) <= 0)) {
      toast.error("Vui lòng nhập giá nhập hợp lệ");
      return;
    }
    // Validate batch information only if any field is filled
    if (mode === "import") {
      const hasBatchInfo = batchNumber.trim() || manufacturingDate || expiryDate;
      
      if (hasBatchInfo) {
        // If user started filling batch info, validate all required batch fields
        if (!batchNumber.trim()) {
          toast.error("Vui lòng nhập số lô");
          return;
        }
        if (!manufacturingDate) {
          toast.error("Vui lòng chọn ngày sản xuất");
          return;
        }
        if (!expiryDate) {
          toast.error("Vui lòng chọn ngày hết hạn");
          return;
        }
        if (new Date(expiryDate) <= new Date(manufacturingDate)) {
          toast.error("Ngày hết hạn phải sau ngày sản xuất");
          return;
        }
      }
    }

    const newItem = {
      id: Date.now(),
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      image: selectedProduct.image,
      unit: selectedProduct.unit,
      quantity: parseInt(quantity),
      price: mode === "import" ? parseFloat(price) : 0,
    };

    // Only include batch information if provided
    if (mode === "import" && batchNumber.trim() && manufacturingDate && expiryDate) {
      newItem.batchNumber = batchNumber.trim();
      newItem.manufacturingDate = manufacturingDate;
      newItem.expiryDate = expiryDate;
    }

    setTransactionList([...transactionList, newItem]);
    setSelectedProduct(null);
    setQuantity("");
    setPrice("");
    setBatchNumber("");
    setManufacturingDate("");
    setExpiryDate("");
    toast.success("Đã thêm sản phẩm vào danh sách");
  };

  const handleRemoveItem = (id) => {
    setTransactionList(transactionList.filter((item) => item.id !== id));
    toast.success("Đã xóa sản phẩm");
  };

  const handleClearAll = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) {
      setTransactionList([]);
      toast.success("Đã xóa tất cả");
    }
  };

  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.error("Vui lòng chọn kho");
      return;
    }
    if (transactionList.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }
    if (!user?.userId) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "import") {
        // Import format
        const importData = {
          warehouseId: selectedWarehouse,
          userId: user.userId,
          importDate: new Date().toISOString(),
          details: transactionList.map((item) => {
            const detail = {
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            };
            
            // Only include batch information if it exists
            if (item.batchNumber && item.manufacturingDate && item.expiryDate) {
              detail.batchNumber = item.batchNumber;
              detail.manufacturingDate = new Date(item.manufacturingDate).toISOString();
              detail.expiryDate = new Date(item.expiryDate).toISOString();
            }
            
            return detail;
          }),
        };
        await importService.create(importData);
        toast.success("Tạo phiếu nhập kho thành công");

      } else {
        // Export format
        const exportData = {
          warehouseId: selectedWarehouse,
          userId: user.userId,
          exportDate: new Date().toISOString(),
          customerName: customerName.trim() || null,
          customerAddress: customerAddress.trim() || null,
          details: transactionList.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };
        await exportService.create(exportData);
        toast.success("Tạo phiếu xuất kho thành công");
      }

      // Reset form
      setTransactionList([]);
      setSelectedProduct(null);
      setQuantity("");
      setPrice("");
      setBatchNumber("");
      setManufacturingDate("");
      setExpiryDate("");
      setCustomerName("");
      setCustomerAddress("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Tạo phiếu {mode === "import" ? "Nhập" : "Xuất"} kho</h1>
            <p className="text-muted-foreground">
              Thêm sản phẩm và tạo phiếu {mode === "import" ? "nhập" : "xuất"} kho
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <History className="h-4 w-4" />
            Lịch sử giao dịch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Switcher */}
          <Card>
            <CardContent className="p-2">
              <div className="flex h-10 w-full items-center justify-center rounded-lg bg-muted p-1">
                <button
                  onClick={() => setMode("import")}
                  className={`flex-1 h-full flex items-center justify-center rounded-md transition-all text-sm font-bold gap-2 ${
                    mode === "import"
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Nhập kho</span>
                </button>
                <button
                  onClick={() => setMode("export")}
                  className={`flex-1 h-full flex items-center justify-center rounded-md transition-all text-sm font-bold gap-2 ${
                    mode === "export"
                      ? "bg-background shadow-sm text-orange-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Xuất kho</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Input Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Thông tin sản phẩm</CardTitle>
                <Badge variant="secondary">
                  {mode === "import" ? "Nhập kho" : "Xuất kho"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>Kho *</Label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.warehouseId} value={wh.warehouseId}>
                      {wh.warehouseName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Information - Only for Export */}
              {mode === "export" && (
                <div className="space-y-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <Label className="font-semibold text-blue-900 dark:text-blue-100">Thông tin khách hàng (không bắt buộc)</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tên khách hàng</Label>
                    <Input
                      placeholder="VD: Công ty ABC..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Địa chỉ khách hàng</Label>
                    <Input
                      placeholder="VD: 123 Đường XYZ, Quận 1, TP.HCM"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Product */}
              <div className="space-y-2">
                <Label>Tìm kiếm sản phẩm *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Nhập tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.productId}
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-3"
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Đơn vị: {product.unit}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Product */}
              {selectedProduct && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border">
                  <div className="flex gap-3">
                    {selectedProduct.image && (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.productName}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">{selectedProduct.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Đơn vị: {selectedProduct.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Giá: {formatCurrency(selectedProduct.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số lượng *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                {mode === "import" && (
                  <div className="space-y-2">
                    <Label>Giá nhập *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Batch Information - Only for Import */}
              {mode === "import" && (
                <div className="space-y-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-600" />
                    <Label className="font-semibold text-amber-900 dark:text-amber-100">Thông tin lô hàng</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Số lô (không bắt buộc)</Label>
                    <Input
                      placeholder="VD: LOT202412240001 - Để trống nếu nhập sỉ"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày sản xuất</Label>
                      <Input
                        type="date"
                        value={manufacturingDate}
                        onChange={(e) => setManufacturingDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ngày hết hạn</Label>
                      <Input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        min={manufacturingDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <Button
                className="w-full gap-2"
                onClick={handleAddToList}
                disabled={!selectedProduct}
              >
                <Plus className="h-4 w-4" />
                Thêm vào danh sách
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List & Summary */}
        <div className="lg:col-span-7">
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CardTitle>Danh sách sản phẩm</CardTitle>
                  <Badge variant="secondary">{transactionList.length}</Badge>
                </div>
                {transactionList.length > 0 && (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={handleClearAll}
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
                </div>
              ) : transactionList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Package className="h-16 w-16 mb-4 opacity-50" />
                  <p>Chưa có sản phẩm nào</p>
                  <p className="text-sm">Thêm sản phẩm để tạo phiếu</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-muted/50 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left w-[35%]">Sản phẩm</th>
                          <th className="px-4 py-3 text-left w-[10%]">Số lượng</th>
                          {mode === "import" && (
                            <>
                              <th className="px-4 py-3 text-left w-[15%]">Giá nhập</th>
                              <th className="px-4 py-3 text-left w-[25%]">Thông tin lô</th>
                            </>
                          )}
                          <th className="px-4 py-3 text-right w-[15%]">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {transactionList.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold line-clamp-2" title={item.productName}>
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Đơn vị: {item.unit}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-base">
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            {mode === "import" && (
                              <>
                                <td className="px-4 py-3">
                                  <span className="font-semibold">
                                    {formatCurrency(item.price)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {item.batchNumber ? (
                                    <div className="space-y-1">
                                      <p className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
                                        {item.batchNumber}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        NSX: {new Date(item.manufacturingDate).toLocaleDateString('vi-VN')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        HSD: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                      Không có thông tin lô
                                    </span>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-4 border-t mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Tổng số lượng:
                      </span>
                      <span className="text-lg font-bold">
                        {transactionList.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                      </span>
                    </div>
                    {mode === "import" && (
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          Tổng giá trị:
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(
                            transactionList.reduce(
                              (sum, item) => sum + item.quantity * item.price,
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting || transactionList.length === 0}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          {mode === "import" ? (
                            <Download className="h-4 w-4" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Xác nhận {mode === "import" ? "Nhập" : "Xuất"} kho
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
