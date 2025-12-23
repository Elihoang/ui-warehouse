import { useState, useEffect, useMemo } from "react";
import { inventoryAuditService, warehouseService } from "@/services";
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
import {
  ClipboardCheck,
  Plus,
  Search,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";

export default function InventoryAuditPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditDetails, setAuditDetails] = useState([]);
  const [formData, setFormData] = useState({
    auditCode: "",
    warehouseId: "",
    auditDate: new Date().toISOString().split('T')[0],
    note: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchAudits();
    fetchWarehouses();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await inventoryAuditService.getAll();
      setAudits(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách kiểm kê");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.auditCode || !formData.warehouseId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const data = {
        ...formData,
        createdByUserId: user?.userId,
      };
      await inventoryAuditService.create(data);
      toast.success("Tạo phiếu kiểm kê thành công");
      fetchAudits();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleViewDetails = async (audit) => {
    try {
      const response = await inventoryAuditService.getWithDetails(audit.auditId);
      setSelectedAudit(response.data.Audit || response.data.audit);
      setAuditDetails(response.data.Details || response.data.details || []);
      setDetailsOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết kiểm kê");
    }
  };

  const handleGenerateDetails = async (auditId, warehouseId) => {
    try {
      await inventoryAuditService.generateDetails(auditId, warehouseId);
      toast.success("Đã tạo chi tiết kiểm kê từ tồn kho");
      handleViewDetails({ auditId });
    } catch (error) {
      toast.error("Không thể tạo chi tiết kiểm kê");
    }
  };

  const handleDelete = async (audit) => {
    if (!confirm(`Bạn có chắc muốn xóa phiếu kiểm kê "${audit.auditCode}"?`)) return;
    
    try {
      await inventoryAuditService.cancel(audit.auditId);
      toast.success("Đã xóa phiếu kiểm kê");
      fetchAudits();
    } catch (error) {
      toast.error("Không thể xóa phiếu kiểm kê");
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Save all modified details
      for (const detail of auditDetails) {
        await inventoryAuditService.addDetail(selectedAudit.auditId, {
          productId: detail.productId,
          systemQuantity: detail.systemQuantity,
          actualQuantity: detail.actualQuantity,
          note: detail.note || "",
        });
      }
      toast.success("Đã lưu tất cả thay đổi");
      setHasUnsavedChanges(false);
      // Reload để có variance mới
      handleViewDetails(selectedAudit);
    } catch (error) {
      toast.error("Không thể lưu thay đổi");
    }
  };

  const handleCompleteAudit = async (auditId) => {
    if (hasUnsavedChanges) {
      toast.error("Vui lòng lưu thay đổi trước khi hoàn thành kiểm kê");
      return;
    }
    try {
      await inventoryAuditService.complete(auditId, true);
      toast.success("Đã hoàn thành kiểm kê và cập nhật tồn kho");
      fetchAudits();
      setDetailsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hoàn thành kiểm kê");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      auditCode: "",
      warehouseId: "",
      auditDate: new Date().toISOString().split('T')[0],
      note: "",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "Completed") {
      return { label: "Hoàn thành", variant: "default", color: "text-green-600", bgColor: "bg-green-100" };
    }
    if (status === "InProgress") {
      return { label: "Đang kiểm kê", variant: "default", color: "text-blue-600", bgColor: "bg-blue-100" };
    }
    if (status === "Cancelled") {
      return { label: "Đã hủy", variant: "destructive", color: "text-red-600" };
    }
    return { label: status, variant: "secondary", color: "text-gray-600" };
  };

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchStatus = statusFilter ? audit.status === statusFilter : true;
      const matchSearch =
        audit.auditCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [audits, statusFilter, searchQuery]);

  const totalAudits = filteredAudits.length;
  const inProgressAudits = filteredAudits.filter((a) => a.status === "InProgress").length;
  const completedAudits = filteredAudits.filter((a) => a.status === "Completed").length;
  const cancelledAudits = filteredAudits.filter((a) => a.status === "Cancelled").length;

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
          <h1 className="text-3xl font-bold">Kiểm kê tồn kho</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý phiếu kiểm kê tồn kho
          </p>
        </div>
        {permissions.canUpdateStock(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu kiểm kê
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng phiếu</p>
                <p className="text-2xl font-bold">{totalAudits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang kiểm kê</p>
                <p className="text-2xl font-bold">{inProgressAudits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl font-bold">{completedAudits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã hủy</p>
                <p className="text-2xl font-bold">{cancelledAudits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách phiếu kiểm kê</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="InProgress">Đang kiểm kê</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phiếu kiểm kê..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Không tìm thấy phiếu kiểm kê nào</p>
              </div>
            ) : (
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Mã phiếu</TableHead>
                      <TableHead className="w-[150px]">Kho</TableHead>
                      <TableHead className="w-[120px]">Ngày kiểm kê</TableHead>
                      <TableHead className="w-[140px]">Người tạo</TableHead>
                      <TableHead className="w-[150px]">Trạng thái</TableHead>
                      <TableHead className="w-[180px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudits.map((audit) => {
                    const status = getStatusBadge(audit.status);
                    return (
                      <TableRow key={audit.auditId}>
                        <TableCell className="font-medium">
                          {audit.auditCode}
                        </TableCell>
                        <TableCell>{audit.warehouseName}</TableCell>
                        <TableCell>
                          {new Date(audit.auditDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{audit.createdByUserName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className={status.bgColor ? `${status.bgColor} ${status.color} hover:${status.bgColor}` : ""}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(audit)}
                            >
                              Chi tiết
                            </Button>
                            {audit.status === "InProgress" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleGenerateDetails(audit.auditId, audit.warehouseId)}
                                >
                                  Tạo chi tiết
                                </Button>
                                {permissions.canUpdateStock(user?.role) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(audit)}
                                    title="Xóa"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phiếu kiểm kê</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="auditCode">Mã phiếu *</Label>
                <Input
                  id="auditCode"
                  placeholder="AUDIT001"
                  value={formData.auditCode}
                  onChange={(e) =>
                    setFormData({ ...formData, auditCode: e.target.value })
                  }
                />
              </div>

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
                <Label htmlFor="auditDate">Ngày kiểm kê</Label>
                <Input
                  id="auditDate"
                  type="date"
                  value={formData.auditDate}
                  onChange={(e) =>
                    setFormData({ ...formData, auditDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Tạo phiếu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Chi tiết kiểm kê - {selectedAudit?.auditCode}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {auditDetails.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Chưa có chi tiết kiểm kê
              </p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                    <TableHead className="w-[200px]">Sản phẩm</TableHead>
                    <TableHead className="text-right w-[100px]">SL Hệ thống</TableHead>
                    <TableHead className="text-right w-[120px]">SL Thực tế</TableHead>
                    <TableHead className="text-right w-[100px]">Chênh lệch</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditDetails.map((detail) => {
                    const variance = detail.actualQuantity - detail.systemQuantity;
                    return (
                      <TableRow key={detail.auditDetailId}>
                        <TableCell>{detail.productName}</TableCell>
                        <TableCell className="text-right">{detail.systemQuantity}</TableCell>
                        <TableCell className="text-right">
                          {selectedAudit?.status === "InProgress" ? (
                            <Input
                              type="number"
                              min="0"
                              value={detail.actualQuantity}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                setHasUnsavedChanges(true);
                                setAuditDetails(
                                  auditDetails.map((d) =>
                                    d.auditDetailId === detail.auditDetailId
                                      ? { ...d, actualQuantity: newValue }
                                      : d
                                  )
                                );
                              }}
                              className="w-24 text-right"
                            />
                          ) : (
                            detail.actualQuantity
                          )}
                        </TableCell>
                        <TableCell className={`text-right ${variance !== 0 ? "font-semibold" : ""}`}>
                          <span className={
                            variance > 0 ? "text-green-600" :
                            variance < 0 ? "text-red-600" :
                            "text-gray-600"
                          }>
                            {variance > 0 ? "+" : ""}{variance}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            detail.varianceStatus === "Match" ? "default" :
                            detail.varianceStatus === "Excess" ? "default" :
                            "destructive"
                          }>
                            {detail.varianceStatus === "Match" ? "Khớp" :
                             detail.varianceStatus === "Excess" ? "Thừa" : "Thiếu"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedAudit?.status === "InProgress" && (
              <>
                <Button
                  variant="default"
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges}
                >
                  Lưu thay đổi
                </Button>
                <Button
                  onClick={() => handleCompleteAudit(selectedAudit.auditId)}
                >
                  Hoàn thành kiểm kê
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
