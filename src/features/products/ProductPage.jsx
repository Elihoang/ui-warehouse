import { useState, useEffect, useMemo } from "react";
import { productService, categoryService, supplierService } from "@/services";
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
import { Plus, Pencil, Trash2, Package, Search, Eye } from "lucide-react";
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

export default function ProductPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    image: "",
    categoryId: "",
    supplierId: "",
    unit: "Cái",
    price: 0,
  });

  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    if (!formData.supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }

    try {
      if (editing) {
        await productService.update(editing.productId, formData);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await productService.create(formData);
        toast.success("Thêm sản phẩm thành công");
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await productService.delete(id);
      toast.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData({
      productName: product.productName,
      description: product.description || "",
      image: product.image || "",
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      unit: product.unit || "Cái",
      price: product.price,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      productName: "",
      description: "",
      image: "",
      categoryId: "",
      supplierId: "",
      unit: "Cái",
      price: 0,
    });
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setViewDetailOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Client-side filtering and pagination
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory
        ? product.categoryId === selectedCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage]);

  if (!permissions.canViewSuppliers(user?.role)) {
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
          <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin sản phẩm trong kho
          </p>
        </div>
        {permissions.canAddProduct(user?.role) && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                {searchQuery || selectedCategory ? (
                  <p>Không tìm thấy sản phẩm nào phù hợp</p>
                ) : (
                  <p>Chưa có sản phẩm nào</p>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Hình ảnh</TableHead>
                      <TableHead className="w-[200px]">Tên sản phẩm</TableHead>
                      <TableHead className="w-[250px]">Mô tả</TableHead>
                      <TableHead className="w-[150px]">Danh mục</TableHead>
                      <TableHead className="w-[150px]">Nhà cung cấp</TableHead>
                      <TableHead className="w-20">Đơn vị</TableHead>
                      <TableHead className="w-[120px]">Giá</TableHead>
                      <TableHead className="text-right w-[160px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="w-20">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="h-12 w-12 object-cover rounded-md"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/48?text=No+Image")
                              }
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium w-[200px]">
                          <div className="line-clamp-2" title={product.productName}>
                            {product.productName}
                          </div>
                        </TableCell>
                        <TableCell className="w-[250px]">
                          <div className="line-clamp-2" title={product.description || "-"}>
                            {product.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px]">{product.categoryName || "-"}</TableCell>
                        <TableCell className="w-[150px]">{product.supplierName || "-"}</TableCell>
                        <TableCell className="w-20">{product.unit}</TableCell>
                        <TableCell className="w-[120px]">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right space-x-2 w-[160px]">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleViewDetail(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {permissions.canEditProduct(user?.role) && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                          {permissions.canDeleteProduct(user?.role) && (
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => handleDelete(product.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{filteredProducts.length}</span> mục
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Tên sản phẩm - Full width */}
              <div className="space-y-2">
                <Label htmlFor="productName">Tên sản phẩm *</Label>
                <Input
                  id="productName"
                  placeholder="Nhập tên sản phẩm"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                />
              </div>

              {/* 2 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Danh mục *</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierId">Nhà cung cấp *</Label>
                    <select
                      id="supplierId"
                      value={formData.supplierId}
                      onChange={(e) =>
                        setFormData({ ...formData, supplierId: e.target.value })
                      }
                      className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {suppliers.map((sup) => (
                        <option key={sup.supplierId} value={sup.supplierId}>
                          {sup.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Đơn vị</Label>
                      <Input
                        id="unit"
                        placeholder="Cái, Kg, Hộp..."
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <textarea
                      id="description"
                      placeholder="Nhập mô tả sản phẩm"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">URL Hình ảnh</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="h-24 w-24 object-cover rounded-md border"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
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

      {/* View Detail Dialog */}
      <Dialog open={viewDetailOpen} onOpenChange={setViewDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Image & Product Info */}
                <div className="space-y-4">
                  {/* Product Image */}
                  {selectedProduct.image && (
                    <div className="flex justify-center">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.productName}
                        className="max-h-48 w-auto object-contain rounded-lg border"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}

                  {/* Product Information */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Tên sản phẩm</Label>
                      <p className="font-medium text-lg">{selectedProduct.productName}</p>
                    </div>
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-1">
    <Label className="text-muted-foreground">Danh mục</Label>
    <p className="font-medium">{selectedProduct.categoryName || "-"}</p>
  </div>

  <div className="space-y-1">
    <Label className="text-muted-foreground">Nhà cung cấp</Label>
    <p className="font-medium">{selectedProduct.supplierName || "-"}</p>
  </div>

  <div className="space-y-1">
    <Label className="text-muted-foreground">Đơn vị</Label>
    <p className="font-medium">{selectedProduct.unit || "-"}</p>
  </div>

  <div className="space-y-1">
    <Label className="text-muted-foreground">Giá</Label>
    <p className="font-semibold text-lg text-primary">
      {formatCurrency(selectedProduct.price)}
    </p>
  </div>
</div>


                
                  </div>
                </div>

                {/* Right Column - Scrollable Description */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <div className="max-h-96 overflow-y-auto pr-2 border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description || "Không có mô tả"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
