import { useState, useEffect } from "react";
import { exportService, warehouseService, productService } from "@/services";
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
import { Plus, Trash2, FileOutput, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { permissions } from "@/lib/permissions";

export default function ExportPage() {
  const { user } = useAuth();
  const [exports, setExports] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);

  const [formData, setFormData] = useState({
    warehouseId: "",
    userId: user?.userId || "",
    customerName: "",
    customerAddress: "",
    details: [{ productId: "", quantity: 0 }],
  });

  useEffect(() => {
    fetchExports();
    fetchWarehouses();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, userId: user.userId }));
    }
  }, [user]);

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await exportService.getAll();

      let data = response.data;

      // Staff chỉ xem phiếu của mình
      if (!permissions.canViewAllExports(user?.role)) {
        data = data.filter((exp) => exp.userName === user?.userName);
      }

      setExports(data);
    } catch (error) {
      toast.error("Không thể tải phiếu xuất");
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
      details: [...formData.details, { productId: "", quantity: 0 }],
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
    }

    try {
      await exportService.create(formData);
      toast.success("Tạo phiếu xuất thành công");
      fetchExports();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm("Bạn có chắc muốn xóa phiếu xuất này? Tồn kho sẽ được hoàn lại.")
    )
      return;

    try {
      if (!permissions.canDeleteExport(user?.role)) {
        toast.error("Bạn không có quyền xóa phiếu xuất");
        return;
      }
      await exportService.delete(id);
      toast.success("Xóa phiếu xuất thành công");
      fetchExports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa phiếu xuất");
    }
  };

  const handleViewDetail = async (exportId) => {
    try {
      const response = await exportService.getById(exportId);
      setSelectedExport(response.data);
      setViewOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết phiếu xuất");
    }
  };

  const handleExportPdf = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5154/api';
      const url = `${baseURL}/export/${id}/export-html`;
      
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
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `PhieuXuat_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("Tải xuống PDF thành công");
    } catch (error) {
      toast.error("Không thể tải xuống PDF");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      warehouseId: "",
      userId: user?.userId || "",
      customerName: "",
      customerAddress: "",
      details: [{ productId: "", quantity: 0 }],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý phiếu xuất kho</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý phiếu xuất hàng ra khỏi kho
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu xuất
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu xuất</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileOutput className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Chưa có phiếu xuất nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày xuất</TableHead>
                  <TableHead>Kho</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead className="text-right">Tổng SL</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp) => (
                  <TableRow key={exp.exportId}>
                    <TableCell>{formatDate(exp.exportDate)}</TableCell>
                    <TableCell>{exp.warehouseName}</TableCell>
                    <TableCell>{exp.userName}</TableCell>
                    <TableCell className="text-right">
                      {exp.totalItems}
                    </TableCell>
                    <TableCell className="text-right">
                      {exp.totalQuantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(exp.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleViewDetail(exp.exportId)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {permissions.canExportExportPDF(user?.role) && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleExportPdf(exp.exportId)}
                          title="Xuất PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}

                      {permissions.canDeleteExport(user?.role) && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(exp.exportId)}
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

      {/* Create Export Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiếu xuất kho mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Kho xuất *</Label>
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

              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên khách hàng</Label>
                  <Input
                    id="customerName"
                    placeholder="VD: Công ty ABC..."
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Địa chỉ khách hàng</Label>
                  <Input
                    id="customerAddress"
                    placeholder="VD: 123 Đường XYZ, Quận 1, TP.HCM"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, customerAddress: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Danh sách sản phẩm xuất *</Label>
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
                      <div className="col-span-8">
                        <Label className="text-xs">Sản phẩm</Label>
                        <select
                          value={detail.productId}
                          onChange={(e) =>
                            updateDetail(index, "productId", e.target.value)
                          }
                          className="w-full h-9 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map((prod) => (
                            <option key={prod.productId} value={prod.productId}>
                              {prod.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Số lượng xuất</Label>
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Lưu ý:</strong> Số lượng xuất sẽ được trừ trực tiếp
                  vào tồn kho. Vui lòng kiểm tra kỹ số lượng tồn kho trước khi
                  xuất.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Tạo phiếu xuất</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu xuất</DialogTitle>
          </DialogHeader>
          {selectedExport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày xuất:</p>
                  <p className="font-medium">
                    {formatDate(selectedExport.exportDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kho:</p>
                  <p className="font-medium">{selectedExport.warehouseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Người tạo:</p>
                  <p className="font-medium">{selectedExport.userName}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Danh sách sản phẩm:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExport.details?.map((detail, index) => (
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
                    {formatCurrency(selectedExport.totalAmount)}
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
