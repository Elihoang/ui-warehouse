import { useState, useEffect } from "react"
import { warehouseService } from "@/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Pencil,
  Trash2,
  Warehouse,
  Package,
  FileInput,
  FileOutput,
  MapPin,
  Search,
  Building2,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { permissions } from "@/lib/permissions"

export default function WarehousePage() {
  const { user } = useAuth()
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    warehouseName: "",
    location: "",
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const response = await warehouseService.getAll()
      setWarehouses(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách kho")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.warehouseName.trim()) {
      toast.error("Vui lòng nhập tên kho")
      return
    }

    try {
      if (editing) {
        await warehouseService.update(editing.warehouseId, formData)
        toast.success("Cập nhật kho thành công")
      } else {
        await warehouseService.create(formData)
        toast.success("Thêm kho thành công")
      }
      fetchWarehouses()
      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa kho này? Chỉ có thể xóa kho không có phiếu nhập/xuất và tồn kho.")) return

    try {
      await warehouseService.delete(id)
      toast.success("Xóa kho thành công")
      fetchWarehouses()
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa kho")
    }
  }

  const handleEdit = (warehouse) => {
    setEditing(warehouse)
    setFormData({
      warehouseName: warehouse.warehouseName,
      location: warehouse.location || "",
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setFormData({
      warehouseName: "",
      location: "",
    })
  }

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.location && w.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalStats = warehouses.reduce(
    (acc, w) => ({
      products: acc.products + (w.productCount || 0),
      stock: acc.stock + (w.totalStockQuantity || 0),
      imports: acc.imports + (w.importReceiptCount || 0),
      exports: acc.exports + (w.exportReceiptCount || 0),
    }),
    { products: 0, stock: 0, imports: 0, exports: 0 },
  )

  if (!permissions.canViewWarehouses(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Building2 className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">Bạn không có quyền truy cập trang này</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 ">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-500 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Warehouse className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý kho</h1>
              </div>
              <p className="text-emerald-100 text-lg">Quản lý thông tin và theo dõi hoạt động các kho hàng</p>
            </div>
            {permissions.canAddWarehouse(user?.role) && (
              <Button
                onClick={() => setOpen(true)}
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Thêm kho mới
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white shadow-md">
                <Warehouse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tổng kho</p>
                <p className="text-2xl font-bold text-blue-700">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500 text-white shadow-md">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tồn kho</p>
                <p className="text-2xl font-bold text-green-700">{totalStats.stock.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500 text-white shadow-md">
                <FileInput className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Phiếu nhập</p>
                <p className="text-2xl font-bold text-purple-700">{totalStats.imports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500 text-white shadow-md">
                <FileOutput className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Phiếu xuất</p>
                <p className="text-2xl font-bold text-orange-700">{totalStats.exports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl">Danh sách kho hàng</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-500"></div>
              </div>
              <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
                <Warehouse className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {searchTerm ? "Không tìm thấy kết quả" : "Chưa có kho nào"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách thêm kho hàng mới"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredWarehouses.map((warehouse) => (
                <Card
                  key={warehouse.warehouseId}
                  className="group border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Card Header */}
                    <div className="bg-emerald-500 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Warehouse className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{warehouse.warehouseName}</h3>
                            <div className="flex items-center gap-1 text-emerald-100 text-sm mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">{warehouse.location || "Chưa có địa chỉ"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                          <Package className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Sản phẩm</p>
                            <p className="text-lg font-bold text-blue-600">{warehouse.productCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                          <Package className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Tồn kho</p>
                            <p className="text-lg font-bold text-green-600">
                              {(warehouse.totalStockQuantity || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                          <FileInput className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phiếu nhập</p>
                            <p className="text-lg font-bold text-purple-600">{warehouse.importReceiptCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                          <FileOutput className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phiếu xuất</p>
                            <p className="text-lg font-bold text-orange-600">{warehouse.exportReceiptCount || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        {permissions.canEditWarehouse(user?.role) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(warehouse)}
                            className="flex-1 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        )}
                        {permissions.canDeleteWarehouse(user?.role) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(warehouse.warehouseId)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
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

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Warehouse className="h-5 w-5 text-emerald-600" />
              </div>
              <DialogTitle className="text-xl">{editing ? "Cập nhật kho" : "Thêm kho mới"}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseName" className="text-sm font-medium">
                  Tên kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="warehouseName"
                  placeholder="Nhập tên kho"
                  value={formData.warehouseName}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Địa chỉ
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Nhập địa chỉ kho"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                {editing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
