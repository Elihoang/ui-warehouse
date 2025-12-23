import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lightbulb } from "lucide-react";

export default function ReorderSettingDialog({
  open,
  onOpenChange,
  products,
  warehouses,
  editData,
  onSubmit,
  onSuggest,
}) {
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    minStockLevel: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    maxStockLevel: 0,
    leadTimeDays: 7,
    isAutoReorderEnabled: true,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        productId: editData.productId,
        warehouseId: editData.warehouseId,
        minStockLevel: editData.minStockLevel,
        reorderPoint: editData.reorderPoint,
        reorderQuantity: editData.reorderQuantity,
        maxStockLevel: editData.maxStockLevel,
        leadTimeDays: editData.leadTimeDays,
        isAutoReorderEnabled: editData.isAutoReorderEnabled,
      });
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSuggest = async () => {
    if (!formData.productId || !formData.warehouseId) {
      return;
    }
    const suggested = await onSuggest(formData.productId, formData.warehouseId);
    if (suggested) {
      setFormData({ ...formData, ...suggested });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      productId: "",
      warehouseId: "",
      minStockLevel: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      maxStockLevel: 0,
      leadTimeDays: 7,
      isAutoReorderEnabled: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Cập nhật cấu hình" : "Thêm cấu hình tự động đặt hàng"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Sản phẩm *</Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={!!editData}
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
                  required
                  disabled={!!editData}
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.warehouseId} value={wh.warehouseId}>
                      {wh.warehouseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!editData && formData.productId && formData.warehouseId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggest}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Đề xuất cấu hình từ AI (dựa trên 90 ngày)
              </Button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Tồn tối thiểu *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minStockLevel: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Điểm đặt lại *</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderPoint: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderQuantity">Số lượng đặt lại *</Label>
                <Input
                  id="reorderQuantity"
                  type="number"
                  min="0"
                  value={formData.reorderQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStockLevel">Tồn tối đa *</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  min="0"
                  value={formData.maxStockLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStockLevel: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">Lead time (ngày) *</Label>
                <Input
                  id="leadTimeDays"
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leadTimeDays: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAutoReorderEnabled"
                    checked={formData.isAutoReorderEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isAutoReorderEnabled: checked })
                    }
                  />
                  <Label htmlFor="isAutoReorderEnabled" className="cursor-pointer">
                    Kích hoạt tự động
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit">
              {editData ? "Cập nhật" : "Tạo cấu hình"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
