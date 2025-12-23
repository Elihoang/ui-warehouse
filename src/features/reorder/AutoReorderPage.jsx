import { useState, useEffect, useMemo } from "react";
import { autoReorderService, productService, warehouseService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, RefreshCw, AlertTriangle ,ArrowRight,ArrowLeft,Package} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";
import ReorderStatCards from "./components/ReorderStatCards";
import ReorderSettingsTable from "./components/ReorderSettingsTable";
import ReorderNeedsTable from "./components/ReorderNeedsTable";
import ReorderSettingDialog from "./components/ReorderSettingDialog";

export default function AutoReorderPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [reorderNeeds, setReorderNeeds] = useState(null);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSettings();
    fetchReorderNeeds();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await autoReorderService.getAll();
      setSettings(response.data);
    } catch (error) {
      toast.error("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const fetchReorderNeeds = async () => {
    try {
      const response = await autoReorderService.checkReorderNeeds();
      setReorderNeeds(response.data);
    } catch (error) {
      console.error("Error fetching reorder needs:", error);
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

  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        await autoReorderService.update(editData.settingId, formData);
        toast.success("Cập nhật cấu hình thành công");
      } else {
        await autoReorderService.create(formData);
        toast.success("Tạo cấu hình thành công");
      }
      fetchSettings();
      fetchReorderNeeds();
      setOpen(false);
      setEditData(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleSuggest = async (productId, warehouseId) => {
    try {
      const response = await autoReorderService.suggest(productId, warehouseId);
      toast.success("Đã tạo đề xuất từ AI");
      return response.data.settings;
    } catch (error) {
      toast.error("Không thể tạo đề xuất");
      return null;
    }
  };

  const handleEdit = (setting) => {
    setEditData(setting);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình này?")) return;
    try {
      await autoReorderService.delete(id);
      toast.success("Xóa cấu hình thành công");
      fetchSettings();
      fetchReorderNeeds();
    } catch (error) {
      toast.error("Không thể xóa cấu hình");
    }
  };

  const filteredSettings = useMemo(() => {
    return settings.filter((setting) =>
      setting.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [settings, searchQuery]);

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
          <h1 className="text-3xl font-bold">Tự động đặt hàng</h1>
          <p className="text-muted-foreground">
            Cấu hình và giám sát tự động đặt hàng khi tồn kho thấp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReorderNeeds}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Kiểm tra
          </Button>
          {permissions.canUpdateStock(user?.role) && (
            <Button onClick={() => { setEditData(null); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm cấu hình
            </Button>
          )}
        </div>
      </div>

      <ReorderStatCards settings={filteredSettings} reorderNeeds={reorderNeeds} />

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Cấu hình</TabsTrigger>
          <TabsTrigger value="needs">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Cần đặt hàng ({reorderNeeds?.totalProducts || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách cấu hình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm cấu hình..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredSettings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Chưa có cấu hình nào</p>
                  </div>
                ) : (
                  <ReorderSettingsTable
                    settings={filteredSettings}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm cần đặt hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {!reorderNeeds || reorderNeeds.recommendations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-50 text-green-600" />
                  <p className="text-green-600 font-medium">
                    Tất cả sản phẩm đều đủ tồn kho
                  </p>
                </div>
              ) : (
                <ReorderNeedsTable recommendations={reorderNeeds.recommendations} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReorderSettingDialog
        open={open}
        onOpenChange={setOpen}
        products={products}
        warehouses={warehouses}
        editData={editData}
        onSubmit={handleSubmit}
        onSuggest={handleSuggest}
      />
    </div>
  );
}
