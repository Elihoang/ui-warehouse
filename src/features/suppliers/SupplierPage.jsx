import { useState, useEffect } from "react";
import { supplierService } from "@/services";
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
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import { permissions } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";

export default function SupplierPage() {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (permissions.canViewSuppliers(user?.role)) {
      fetchSuppliers();
    }
  }, [user]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAll();
      setSuppliers(res.data);
    } catch {
      toast.error("Không thể tải nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplierName.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    try {
      if (editing) {
        await supplierService.update(editing.supplierId, formData);
        toast.success("Cập nhật nhà cung cấp thành công");
      } else {
        await supplierService.create(formData);
        toast.success("Thêm nhà cung cấp thành công");
      }
      fetchSuppliers();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa nhà cung cấp này?")) return;

    try {
      await supplierService.delete(id);
      toast.success("Xóa nhà cung cấp thành công");
      fetchSuppliers();
    } catch {
      toast.error("Không thể xóa nhà cung cấp");
    }
  };

  const handleEdit = (supplier) => {
    setEditing(supplier);
    setFormData({
      supplierName: supplier.supplierName,
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({ supplierName: "", phone: "", address: "" });
  };

  if (!permissions.canViewSuppliers(user?.role)) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Bạn không có quyền truy cập trang này
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý nhà cung cấp</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin nhà cung cấp sản phẩm
          </p>
        </div>

        {/* Add */}
        {permissions.canAddSupplier(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
              Chưa có nhà cung cấp nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nhà cung cấp</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell className="font-medium">
                      {supplier.supplierName}
                    </TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.address || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {permissions.canEditSupplier(user?.role) && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {permissions.canDeleteSupplier(user?.role) && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(supplier.supplierId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên nhà cung cấp *</Label>
                <Input
                  value={formData.supplierName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplierName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
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
