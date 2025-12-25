import { useState, useEffect } from "react";
import { importService, warehouseService, productService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
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
import { Plus, Trash2, FileInput, Download, Upload, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { permissions } from "@/lib/permissions";

export default function ImportPage() {
  const { user } = useAuth();
  const [imports, setImports] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);

  const [formData, setFormData] = useState({
    warehouseId: "",
    userId: user?.userId || "",
    details: [{ productId: "", quantity: 0, price: 0 }],
  });

  useEffect(() => {
    fetchImports();
    fetchWarehouses();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, userId: user.userId }));
    }
  }, [user]);

  const fetchImports = async () => {
    setLoading(true);
    try {
      const response = await importService.getAll();

      let data = response.data;
      console.log("Fetched imports:", data);

      // Staff chỉ xem phiếu của mình
      if (!permissions.canViewAllImports(user?.role)) {
        data = data.filter((imp) => imp.userName === user?.userName);
      }

      setImports(data);
    } catch (error) {
      toast.error("Không thể tải phiếu nhập");
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

  const addDetailRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { productId: "", quantity: 0, price: 0 }],
    });
  };

  const removeDetailRow = (index) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: newDetails });
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index][field] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      toast.error("Vui lòng chọn kho");
      return;
    }

    if (formData.details.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    for (let i = 0; i < formData.details.length; i++) {
      const detail = formData.details[i];
      if (!detail.productId) {
        toast.error(`Vui lòng chọn sản phẩm cho dòng ${i + 1}`);
        return;
      }
      if (detail.quantity <= 0) {
        toast.error(`Số lượng phải > 0 cho dòng ${i + 1}`);
        return;
      }
      if (detail.price < 0) {
        toast.error(`Giá phải >= 0 cho dòng ${i + 1}`);
        return;
      }
    }

    try {
      await importService.create(formData);
      toast.success("Tạo phiếu nhập thành công");
      fetchImports();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa phiếu nhập này? Tồn kho sẽ được điều chỉnh lại."
      )
    )
      return;

    try {
      if (!permissions.canDeleteImport(user?.role)) {
        toast.error("Bạn không có quyền xóa phiếu nhập");
        return;
      }
      await importService.delete(id);
      toast.success("Xóa phiếu nhập thành công");
      fetchImports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa phiếu nhập");
    }
  };

  const handleViewDetail = async (importId) => {
    try {
      const response = await importService.getById(importId);
      setSelectedImport(response.data);
      setViewOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết phiếu nhập");
    }
  };

  const handleExportPdf = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5154/api';
      const url = `${baseURL}/import/${id}/export-html`;
      
      // Open in new window with authorization
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // For authenticated requests, use fetch
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.download = `PhieuNhap_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("Tải xuống PDF thành công");
    } catch (error) {
      toast.error("Không thể tải xuống PDF");
    }
  };

  const handleExportExcel = async (id) => {
    try {
      const response = await importService.exportExcel(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PhieuNhap_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Xuất Excel thành công");
    } catch (error) {
      toast.error("Không thể xuất Excel");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      warehouseId: "",
      userId: user?.userId || "",
      details: [{ productId: "", quantity: 0, price: 0 }],
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const calculateTotal = () => {
    return formData.details.reduce(
      (sum, detail) => sum + detail.quantity * detail.price,
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý phiếu nhập kho</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý phiếu nhập hàng vào kho
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu nhập
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu nhập</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : imports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileInput className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Chưa có phiếu nhập nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Kho</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead className="text-right">Tổng SL</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((imp) => (
                  <TableRow key={imp.importId}>
                    <TableCell>{formatDate(imp.importDate)}</TableCell>
                    <TableCell>{imp.warehouseName}</TableCell>
                    <TableCell>{imp.userName}</TableCell>
                    <TableCell className="text-right">
                      {imp.totalItems}
                    </TableCell>
                    <TableCell className="text-right">
                      {imp.totalQuantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(imp.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleViewDetail(imp.importId)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {permissions.canExportImportPDF(user?.role) && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleExportPdf(imp.importId)}
                          title="Xuất PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {permissions.canDeleteImport(user?.role) && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(imp.importId)}
                          title="Xóa"
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

      {/* Create Import Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiếu nhập kho mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Kho nhập *</Label>
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
                  <Label>Người tạo</Label>
                  <Input value={user?.userName || ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Danh sách sản phẩm *</Label>
                  <Button type="button" size="sm" onClick={addDetailRow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm sản phẩm
                  </Button>
                </div>

                <div className="border rounded-md p-4 space-y-3">
                  {formData.details.map((detail, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-5">
                        <Label className="text-xs">Sản phẩm</Label>
                        <select
                          value={detail.productId}
                          onChange={(e) =>
                            updateDetail(index, "productId", e.target.value)
                          }
                          className="w-full h-9 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">-- Chọn SP --</option>
                          {products.map((prod) => (
                            <option key={prod.productId} value={prod.productId}>
                              {prod.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Số lượng</Label>
                        <Input
                          type="number"
                          min="0"
                          value={detail.quantity}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Giá nhập</Label>
                        <Input
                          type="number"
                          min="0"
                          value={detail.price}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.details.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => removeDetailRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Tạo phiếu nhập</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
          </DialogHeader>
          {selectedImport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày nhập:</p>
                  <p className="font-medium">
                    {formatDate(selectedImport.importDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kho:</p>
                  <p className="font-medium">{selectedImport.warehouseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Người tạo:</p>
                  <p className="font-medium">{selectedImport.userName}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Danh sách sản phẩm:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedImport.details?.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.productName}</TableCell>
                        <TableCell>{detail.unit}</TableCell>
                        <TableCell className="text-right">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detail.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(detail.quantity * detail.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tổng cộng:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedImport.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
