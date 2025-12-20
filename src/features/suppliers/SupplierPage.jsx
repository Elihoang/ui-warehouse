import { useState, useEffect, useMemo } from "react";
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
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Client-side filtering and pagination
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        supplier.supplierName?.toLowerCase().includes(searchLower) ||
        supplier.phone?.toLowerCase().includes(searchLower) ||
        supplier.address?.toLowerCase().includes(searchLower)
      );
    });
  }, [suppliers, searchQuery]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSuppliers.slice(startIndex, endIndex);
  }, [filteredSuppliers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhà cung cấp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                {searchQuery ? (
                  <p>Không tìm thấy nhà cung cấp nào phù hợp</p>
                ) : (
                  <p>Chưa có nhà cung cấp nào</p>
                )}
              </div>
            ) : (
              <>
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
                    {paginatedSuppliers.map((supplier) => (
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

                {/* Pagination */}
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredSuppliers.length}</span> mục
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* First page */}
                      {totalPages > 0 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(1)}
                            isActive={currentPage === 1}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Ellipsis before current page */}
                      {currentPage > 3 && totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Pages around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 5) return page > 1 && page < totalPages;
                          if (page === 1 || page === totalPages) return false;
                          return Math.abs(currentPage - page) <= 1;
                        })
                        .map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {/* Ellipsis after current page */}
                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last page */}
                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
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
