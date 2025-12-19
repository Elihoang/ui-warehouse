import { useState, useEffect } from "react";
import { categoryService } from "@/services";
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
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";

import { permissions } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";

export default function CategoryPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryName: "" });

  useEffect(() => {
    if (permissions.canViewCategories(user?.role)) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryService.create(formData);
        toast.success("Thêm danh mục thành công");
      }
      fetchCategories();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      await categoryService.delete(id);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch {
      toast.error("Không thể xóa danh mục");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ categoryName: category.categoryName });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({ categoryName: "" });
  };

  // ❌ Không có quyền xem
  if (!permissions.canViewCategories(user?.role)) {
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
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục sản phẩm trong kho
          </p>
        </div>

        {/* Add button */}
        {permissions.canAddCategory(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
              Chưa có danh mục nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Số sản phẩm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.categoryId}>
                    <TableCell className="font-medium">
                      {category.categoryName}
                    </TableCell>
                    <TableCell>{category.productCount}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {permissions.canEditCategory(user?.role) && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {permissions.canDeleteCategory(user?.role) && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(category.categoryId)}
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
              {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4 space-y-2">
              <Label>Tên danh mục</Label>
              <Input
                value={formData.categoryName}
                onChange={(e) => setFormData({ categoryName: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
