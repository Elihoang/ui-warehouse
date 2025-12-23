import { useState, useEffect, useMemo } from "react";
import { demandForecastService, productService, warehouseService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";
import ForecastStatCards from "./components/ForecastStatCards";
import ForecastTable from "./components/ForecastTable";
import GenerateForecastDialog from "./components/GenerateForecastDialog";

export default function DemandForecastPage() {
  const { user } = useAuth();
  const [forecasts, setForecasts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchForecasts();
    fetchProducts();
    fetchWarehouses();
    fetchAlgorithms();
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const response = await demandForecastService.getAll();
      setForecasts(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách dự báo");
    } finally {
      setLoading(false);
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

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAll();
      setWarehouses(response.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchAlgorithms = async () => {
    try {
      const response = await demandForecastService.getAlgorithms();
      setAlgorithms(response.data.algorithms || []);
    } catch (error) {
      console.error("Error fetching algorithms:", error);
    }
  };

  const handleGenerate = async (formData) => {
    try {
      // Convert YYYY-MM format to date (first day of month)
      const [year, month] = formData.forecastPeriod.split('-');
      const forecastPeriod = `${year}-${month}-01`;

      const data = {
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        forecastPeriod: forecastPeriod,
        algorithm: formData.algorithm,
      };

      await demandForecastService.generate(data);
      toast.success("Tạo dự báo thành công");
      fetchForecasts();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const filteredForecasts = useMemo(() => {
    return forecasts.filter((forecast) =>
      forecast.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forecast.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [forecasts, searchQuery]);

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
          <h1 className="text-3xl font-bold">Dự báo nhu cầu</h1>
          <p className="text-muted-foreground">
            Dự báo nhu cầu sản phẩm bằng AI và các thuật toán thống kê
          </p>
        </div>
        {permissions.canUpdateStock(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo dự báo
          </Button>
        )}
      </div>

      <ForecastStatCards forecasts={filteredForecasts} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách dự báo</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredForecasts.length} dự báo
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm dự báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredForecasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Chưa có dự báo nào</p>
              </div>
            ) : (
              <ForecastTable forecasts={filteredForecasts} />
            )}
          </div>
        </CardContent>
      </Card>

      <GenerateForecastDialog
        open={open}
        onOpenChange={setOpen}
        products={products}
        warehouses={warehouses}
        algorithms={algorithms}
        onSubmit={handleGenerate}
      />
    </div>
  );
}
