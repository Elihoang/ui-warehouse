import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  productService,
  warehouseService,
  stockService,
  importService,
  exportService,
} from "@/services";
import {
  Package,
  Warehouse,
  FileInput,
  FileOutput,
  Database,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Statistics state
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    recentImports: [],
    recentExports: [],
    stockSummary: {
      totalQuantity: 0,
      outOfStock: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [productsRes, warehousesRes, stocksRes, importsRes, exportsRes] =
        await Promise.all([
          productService.getAll(),
          warehouseService.getAll(),
          stockService.getAll(),
          importService.getAll(),
          exportService.getAll(),
        ]);

      const products = productsRes.data;
      const warehouses = warehousesRes.data;
      const stocks = stocksRes.data;
      const imports = importsRes.data;
      const exports = exportsRes.data;

      // Calculate statistics
      const totalStockValue = stocks.reduce((sum, stock) => {
        const product = products.find((p) => p.productId === stock.productId);
        return sum + stock.quantity * (product?.price || 0);
      }, 0);

      const lowStockItems = stocks.filter(
        (s) => s.quantity > 0 && s.quantity < 10
      ).length;
      const outOfStock = stocks.filter((s) => s.quantity === 0).length;
      const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);

      // Get recent imports/exports (last 5)
      const recentImports = imports
        .sort((a, b) => new Date(b.importDate) - new Date(a.importDate))
        .slice(0, 5);

      const recentExports = exports
        .sort((a, b) => new Date(b.exportDate) - new Date(a.exportDate))
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        totalStockValue,
        lowStockItems,
        recentImports,
        recentExports,
        stockSummary: {
          totalQuantity,
          outOfStock,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.userName}!
          </h1>
          <p className="text-muted-foreground">
            Đây là tổng quan hệ thống quản lý kho của bạn.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Database className="mr-1 h-3 w-3" />
              Đang quản lý trong hệ thống
            </p>
          </CardContent>
        </Card>

        {/* Total Warehouses */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/warehouses")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng kho hàng</CardTitle>
            <Warehouse className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        {/* Stock Value */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/stocks")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giá trị tồn kho
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Database className="mr-1 h-3 w-3" />
              {stats.stockSummary.totalQuantity} sản phẩm trong kho
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/stocks")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cảnh báo tồn kho
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              {stats.stockSummary.outOfStock} sản phẩm hết hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2 columns below */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities - Imports & Exports */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Phiếu nhập/xuất trong 24h qua</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-purple-50">
                  <FileInput className="h-3 w-3 mr-1 text-purple-600" />
                  {stats.recentImports.length} nhập
                </Badge>
                <Badge variant="outline" className="bg-orange-50">
                  <FileOutput className="h-3 w-3 mr-1 text-orange-600" />
                  {stats.recentExports.length} xuất
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentImports.length === 0 &&
            stats.recentExports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Chưa có hoạt động nào gần đây</p>
              </div>
            ) : (
              <>
                {/* Recent Imports */}
                {stats.recentImports.slice(0, 3).map((imp, i) => (
                  <div
                    key={`import-${i}`}
                    className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg cursor-pointer transition-colors"
                    onClick={() => navigate("/imports")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FileInput className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Phiếu nhập - {imp.warehouseName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(imp.importDate)} • {imp.userName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(imp.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {imp.totalItems} SP
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent Exports */}
                {stats.recentExports.slice(0, 2).map((exp, i) => (
                  <div
                    key={`export-${i}`}
                    className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg cursor-pointer transition-colors"
                    onClick={() => navigate("/exports")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <FileOutput className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Phiếu xuất - {exp.warehouseName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(exp.exportDate)} • {exp.userName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(exp.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.totalItems} SP
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng thường dùng</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              onClick={() => navigate("/imports")}
            >
              <FileInput className="mr-3 h-4 w-4" />
              Tạo phiếu nhập kho
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
              onClick={() => navigate("/exports")}
            >
              <FileOutput className="mr-3 h-4 w-4" />
              Tạo phiếu xuất kho
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              onClick={() => navigate("/products")}
            >
              <Package className="mr-3 h-4 w-4" />
              Quản lý sản phẩm
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              onClick={() => navigate("/stocks")}
            >
              <Database className="mr-3 h-4 w-4" />
              Xem tồn kho
            </Button>

            {/* System Info */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vai trò:</span>
                <Badge
                  variant={
                    user?.role === "Admin"
                      ? "destructive"
                      : user?.role === "Manager"
                      ? "default"
                      : "secondary"
                  }
                >
                  {user?.role === "Admin"
                    ? "Quản trị viên"
                    : user?.role === "Manager"
                    ? "Quản lý"
                    : "Nhân viên"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hệ thống:</span>
                <span className="text-xs font-medium">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Hoạt động
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning */}
      {stats.lowStockItems > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                Cảnh báo tồn kho thấp
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800">
              Có <span className="font-bold">{stats.lowStockItems}</span> sản
              phẩm sắp hết hàng và{" "}
              <span className="font-bold">{stats.stockSummary.outOfStock}</span>{" "}
              sản phẩm đã hết hàng.{" "}
              <button
                className="underline font-semibold hover:text-orange-900"
                onClick={() => navigate("/stocks")}
              >
                Xem chi tiết →
              </button>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
