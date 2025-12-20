import { useState, useEffect, useMemo } from "react";
import { stockService, warehouseService, productService } from "@/services";
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
import { Database, AlertTriangle, TrendingUp, Package, Search } from "lucide-react";
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

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [formData, setFormData] = useState({
    warehouseId: "",
    productId: "",
    quantity: 0,
  });

  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStocks();
    fetchWarehouses();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await stockService.getAll();
      setStocks(response.data);
    } catch (error) {
      toast.error("Không thể tải tồn kho");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      toast.error("Vui lòng chọn kho");
      return;
    }

    if (!formData.productId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    if (formData.quantity < 0) {
      toast.error("Số lượng phải >= 0");
      return;
    }

    try {
      await stockService.upsert(formData);
      toast.success("Cập nhật tồn kho thành công");
      fetchStocks();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      warehouseId: "",
      productId: "",
      quantity: 0,
    });
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Hết hàng", variant: "destructive", color: "text-red-600" };
    if (quantity < 10) return { label: "Sắp hết", variant: "default", color: "text-orange-500", bgColor: "bg-orange-100" };
    return { label: "Còn hàng", variant: "default", color: "text-green-600", bgColor: "bg-green-100" };
  };

  // Client-side filtering and pagination
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchWarehouse = selectedWarehouse
        ? stock.warehouseId === selectedWarehouse
        : true;
      const matchSearch = stock.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchWarehouse && matchSearch;
    });
  }, [stocks, selectedWarehouse, searchQuery]);

  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStocks.slice(startIndex, endIndex);
  }, [filteredStocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWarehouse]);

  const totalProducts = filteredStocks.length;
  const totalQuantity = filteredStocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockItems = filteredStocks.filter(
    (s) => s.quantity < 10 && s.quantity > 0
  ).length;
  const outOfStockItems = filteredStocks.filter((s) => s.quantity === 0).length;

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
          <h1 className="text-3xl font-bold">Quản lý tồn kho</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tồn kho từng sản phẩm
          </p>
        </div>
        {permissions.canUpdateStock(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Cập nhật tồn kho
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
                <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết hàng</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách tồn kho</CardTitle>
            <div className="flex items-center gap-2">
              <Label>Lọc theo kho:</Label>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
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
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="mx-auto h-12 w-12 mb-2 opacity-50" />
                {searchQuery || selectedWarehouse ? (
                  <p>Không tìm thấy tồn kho nào phù hợp</p>
                ) : (
                  <p>Chưa có tồn kho nào</p>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kho</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStocks.map((stock, index) => {
                      const status = getStockStatus(stock.quantity);
                      return (
                        <TableRow
                          key={`${stock.warehouseId}-${stock.productId}-${index}`}
                        >
                          <TableCell className="font-medium">
                            {stock.warehouseName}
                          </TableCell>
                          <TableCell>{stock.productName}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${status.color}`}>
                              {stock.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={status.variant}
                              className={status.bgColor ? `${status.bgColor} ${status.color} hover:${status.bgColor}` : ""}
                            >
                              {status.label}
                            </Badge>
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
                      {Math.min(currentPage * itemsPerPage, filteredStocks.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredStocks.length}</span> mục
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
