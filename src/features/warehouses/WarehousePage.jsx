import { useState, useEffect } from "react";
import { warehouseService } from "@/services";
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
import {
  Plus,
  Pencil,
  Trash2,
  Warehouse,
  Package,
  FileInput,
  FileOutput,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";

export default function WarehousePage() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    warehouseName: "",
    location: "",
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getAll();
      setWarehouses(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách kho");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseName.trim()) {
      toast.error("Vui lòng nhập tên kho");
      return;
    }

    try {
      if (editing) {
        await warehouseService.update(editing.warehouseId, formData);
        toast.success("Cập nhật kho thành công");
      } else {
        await warehouseService.create(formData);
        toast.success("Thêm kho thành công");
      }
      fetchWarehouses();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa kho này? Chỉ có thể xóa kho không có phiếu nhập/xuất và tồn kho."
      )
    )
      return;

    try {
      await warehouseService.delete(id);
      toast.success("Xóa kho thành công");
      fetchWarehouses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa kho");
    }
  };

  const handleEdit = (warehouse) => {
    setEditing(warehouse);
    setFormData({
      warehouseName: warehouse.warehouseName,
      location: warehouse.location || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      warehouseName: "",
      location: "",
    });
  };

  if (!permissions.canViewWarehouses(user?.role)) {
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
          <h1 className="text-3xl font-bold">Quản lý kho</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các kho hàng
          </p>
        </div>
        {permissions.canAddWarehouse(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm kho
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kho</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Warehouse className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Chưa có kho nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.warehouseId} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Warehouse className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="text-lg font-semibold">
                              {warehouse.warehouseName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {warehouse.location || "Chưa có địa chỉ"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Số sản phẩm
                              </p>
                              <p className="text-lg font-semibold">
                                {warehouse.productCount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Tổng tồn kho
                              </p>
                              <p className="text-lg font-semibold">
                                {warehouse.totalStockQuantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileInput className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Phiếu nhập
                              </p>
                              <p className="text-lg font-semibold">
                                {warehouse.importReceiptCount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileOutput className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Phiếu xuất
                              </p>
                              <p className="text-lg font-semibold">
                                {warehouse.exportReceiptCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {permissions.canEditWarehouse(user?.role) && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleEdit(warehouse)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                        {permissions.canDeleteWarehouse(user?.role) && (
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => handleDelete(warehouse.warehouseId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Cập nhật kho" : "Thêm kho mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseName">Tên kho *</Label>
                <Input
                  id="warehouseName"
                  placeholder="Nhập tên kho"
                  value={formData.warehouseName}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouseName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Địa chỉ</Label>
                <Input
                  id="location"
                  placeholder="Nhập địa chỉ kho"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">{editing ? "Cập nhật" : "Thêm mới"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
