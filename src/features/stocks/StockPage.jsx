import { useState, useEffect } from "react";
import { stockService, warehouseService, productService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, AlertTriangle, TrendingUp, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [formData, setFormData] = useState({
    warehouseId: "",
    productId: "",
    quantity: 0,
  });

  useEffect(() => {
    fetchStocks();
    fetchWarehouses();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await stockService.getAll();
      setStocks(response.data);
    } catch (error) {
      toast.error("Không thể tải tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAll();
      setWarehouses(response.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      toast.error("Vui lòng chọn kho");
      return;
    }

    if (!formData.productId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    if (formData.quantity < 0) {
      toast.error("Số lượng phải >= 0");
      return;
    }

    try {
      await stockService.upsert(formData);
      toast.success("Cập nhật tồn kho thành công");
      fetchStocks();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      warehouseId: "",
      productId: "",
      quantity: 0,
    });
  };

  const filteredStocks = selectedWarehouse
    ? stocks.filter((s) => s.warehouseId === selectedWarehouse)
    : stocks;

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Hết hàng", variant: "destructive" };
    if (quantity < 10) return { label: "Sắp hết", variant: "outline" };
    return { label: "Còn hàng", variant: "default" };
  };

  const totalProducts = filteredStocks.length;
  const totalQuantity = filteredStocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockItems = filteredStocks.filter(
    (s) => s.quantity < 10 && s.quantity > 0
  ).length;
  const outOfStockItems = filteredStocks.filter((s) => s.quantity === 0).length;

  if (!permissions.canViewStock(user?.role)) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Bạn không có quyền truy cập trang này
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tồn kho</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tồn kho từng sản phẩm
          </p>
        </div>
        {permissions.canUpdateStock(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Cập nhật tồn kho
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết hàng</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách tồn kho</CardTitle>
            <div className="flex items-center gap-2">
              <Label>Lọc theo kho:</Label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tất cả kho</option>
                {warehouses.map((wh) => (
                  <option key={wh.warehouseId} value={wh.warehouseId}>
                    {wh.warehouseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Chưa có tồn kho nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kho</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock, index) => {
                  const status = getStockStatus(stock.quantity);
                  return (
                    <TableRow
                      key={`${stock.warehouseId}-${stock.productId}-${index}`}
                    >
                      <TableCell className="font-medium">
                        {stock.warehouseName}
                      </TableCell>
                      <TableCell>{stock.productName}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            stock.quantity === 0
                              ? "text-red-600"
                              : stock.quantity < 10
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {stock.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseId">Kho *</Label>
                <select
                  id="warehouseId"
                  value={formData.warehouseId}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouseId: e.target.value })
                  }
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

              <div className="space-y-2">
                <Label htmlFor="productId">Sản phẩm *</Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((prod) => (
                    <option key={prod.productId} value={prod.productId}>
                      {prod.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
