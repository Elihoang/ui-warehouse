import { useState, useEffect, useMemo } from "react";
import { productBatchService, productService, warehouseService } from "@/services";
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
  Package,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { permissions } from "@/lib/permissions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ProductBatchPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    batchNumber: "",
    productId: "",
    warehouseId: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: 0,
    costPrice: 0,
    note: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBatches();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await productBatchService.getAll();
      setBatches(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách lô hàng");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batchNumber || !formData.productId || !formData.warehouseId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      await productBatchService.create(formData);
      toast.success("Tạo lô hàng thành công");
      fetchBatches();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      batchNumber: "",
      productId: "",
      warehouseId: "",
      manufactureDate: "",
      expiryDate: "",
      quantity: 0,
      costPrice: 0,
      note: "",
    });
  };

  const handleView = (batch) => {
    setSelectedBatch(batch);
    setViewOpen(true);
  };

  const handleDelete = async (batch) => {
    if (!confirm(`Bạn có chắc muốn xóa lô hàng "${batch.batchNumber}"?`)) return;
    
    try {
      await productBatchService.delete(batch.batchId);
      toast.success("Xóa lô hàng thành công");
      fetchBatches();
    } catch (error) {
      toast.error("Không thể xóa lô hàng");
    }
  };

  const getStatusBadge = (batch) => {
    if (batch.isExpired) {
      return { label: "Hết hạn", variant: "destructive", color: "text-red-600" };
    }
    if (batch.isExpiring) {
      return { label: `Sắp hết hạn (${batch.daysUntilExpiry} ngày)`, variant: "default", color: "text-orange-600", bgColor: "bg-orange-100" };
    }
    if (batch.status === "Available") {
      return { label: "Còn hàng", variant: "default", color: "text-green-600", bgColor: "bg-green-100" };
    }
    if (batch.status === "Sold") {
      return { label: "Đã bán", variant: "secondary", color: "text-gray-600" };
    }
    if (batch.status === "Recalled") {
      return { label: "Thu hồi", variant: "destructive", color: "text-red-600" };
    }
    return { label: batch.status, variant: "default", color: "text-gray-600" };
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchWarehouse = selectedWarehouse
        ? batch.warehouseId === selectedWarehouse
        : true;
      const matchStatus = statusFilter
        ? batch.status === statusFilter
        : true;
      const matchSearch =
        batch.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWarehouse && matchStatus && matchSearch;
    });
  }, [batches, selectedWarehouse, statusFilter, searchQuery]);

  const paginatedBatches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBatches.slice(startIndex, endIndex);
  }, [filteredBatches, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWarehouse, statusFilter]);

  const totalBatches = filteredBatches.length;
  const expiringBatches = filteredBatches.filter((b) => b.isExpiring).length;
  const expiredBatches = filteredBatches.filter((b) => b.isExpired).length;
  const totalQuantity = filteredBatches.reduce((sum, b) => sum + b.quantity, 0);

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
          <h1 className="text-3xl font-bold">Quản lý lô hàng</h1>
          <p className="text-muted-foreground">
            Theo dõi lô hàng, hạn sử dụng và FIFO
          </p>
        </div>
        {permissions.canUpdateStock(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm lô hàng
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng lô hàng</p>
                <p className="text-2xl font-bold">{totalBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số lượng</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hạn</p>
                <p className="text-2xl font-bold">{expiringBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã hết hạn</p>
                <p className="text-2xl font-bold">{expiredBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách lô hàng</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tất cả kho</option>
                {warehouses.map((wh) => (
                  <option key={wh.warehouseId} value={wh.warehouseId}>
                    {wh.warehouseName}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Available">Còn hàng</option>
                <option value="Expired">Hết hạn</option>
                <option value="Sold">Đã bán</option>
                <option value="Recalled">Thu hồi</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm lô hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Không tìm thấy lô hàng nào</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Mã lô</TableHead>
                      <TableHead className="w-[200px]">Sản phẩm</TableHead>
                      <TableHead className="w-[120px]">Kho</TableHead>
                      <TableHead className="text-right w-[80px]">SL</TableHead>
                      <TableHead className="w-[100px]">NSX</TableHead>
                      <TableHead className="w-[100px]">HSD</TableHead>
                      <TableHead className="text-right w-[110px]">Giá</TableHead>
                      <TableHead className="w-[140px]">Trạng thái</TableHead>
                      <TableHead className="w-[120px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBatches.map((batch) => {
                      const status = getStatusBadge(batch);
                      return (
                        <TableRow key={batch.batchId}>
                          <TableCell className="font-medium">
                            {batch.batchNumber}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="truncate" title={batch.productName}>
                              {batch.productName}
                            </div>
                          </TableCell>
                          <TableCell>{batch.warehouseName}</TableCell>
                          <TableCell className="text-right">
                            {batch.quantity}
                          </TableCell>
                          <TableCell>
                            {new Date(batch.manufactureDate).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <span className={batch.isExpiring || batch.isExpired ? status.color : ""}>
                              {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {batch.costPrice?.toLocaleString('vi-VN')} đ
                          </TableCell>
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
                                variant="ghost"
                                onClick={() => handleView(batch)}
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {permissions.canUpdateStock(user?.role) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(batch)}
                                  title="Xóa"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                      {Math.min(currentPage * itemsPerPage, filteredBatches.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredBatches.length}</span> mục
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

                      {currentPage > 3 && totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

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

                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

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

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm lô hàng mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Mã lô *</Label>
                <Input
                  id="batchNumber"
                  placeholder="BATCH001"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">Sản phẩm *</Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((prod) => (
                    <option key={prod.productId} value={prod.productId}>
                      {prod.productName}
                    </option>
                  ))}
                </select>
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
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufactureDate">Ngày sản xuất</Label>
                <Input
                  id="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) =>
                    setFormData({ ...formData, manufactureDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Hạn sử dụng</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Giá nhập</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
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
              <Button type="submit">Tạo lô hàng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết lô hàng - {selectedBatch?.batchNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Mã lô</Label>
                <p className="font-semibold">{selectedBatch?.batchNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Trạng thái</Label>
                <div className="mt-1">
                  <Badge
                    variant={getStatusBadge(selectedBatch || {}).variant}
                    className={getStatusBadge(selectedBatch || {}).bgColor ? `${getStatusBadge(selectedBatch || {}).bgColor} ${getStatusBadge(selectedBatch || {}).color}` : ""}
                  >
                    {getStatusBadge(selectedBatch || {}).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Sản phẩm</Label>
                <p className="font-semibold">{selectedBatch?.productName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Kho</Label>
                <p className="font-semibold">{selectedBatch?.warehouseName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Số lượng</Label>
                <p className="font-semibold text-blue-600">{selectedBatch?.quantity}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Giá nhập</Label>
                <p className="font-semibold">{selectedBatch?.costPrice?.toLocaleString('vi-VN')} đ</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ngày sản xuất</Label>
                <p className="font-semibold">
                  {selectedBatch?.manufactureDate ? new Date(selectedBatch.manufactureDate).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Hạn sử dụng</Label>
                <p className={`font-semibold ${
                  selectedBatch?.isExpired ? 'text-red-600' :
                  selectedBatch?.isExpiring ? 'text-orange-600' : ''
                }`}>
                  {selectedBatch?.expiryDate ? new Date(selectedBatch.expiryDate).toLocaleDateString('vi-VN') : '-'}
                  {selectedBatch?.isExpiring && !selectedBatch?.isExpired && (
                    <span className="text-xs ml-2">({selectedBatch.daysUntilExpiry} ngày)</span>
                  )}
                </p>
              </div>
              {selectedBatch?.note && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="font-semibold">{selectedBatch.note}</p>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-muted-foreground">Ngày tạo</Label>
                <p className="text-sm">
                  {selectedBatch?.createdAt ? new Date(selectedBatch.createdAt).toLocaleString('vi-VN') : '-'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
