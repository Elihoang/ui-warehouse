import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export default function GenerateForecastDialog({ 
  open, 
  onOpenChange, 
  products, 
  warehouses, 
  algorithms,
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    forecastPeriod: "",
    algorithm: "MovingAverage",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      productId: "",
      warehouseId: "",
      forecastPeriod: "",
      algorithm: "MovingAverage",
    });
  };

  const selectedAlgo = algorithms.find(a => a.name === formData.algorithm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo dự báo nhu cầu</DialogTitle>
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

            <div className="space-y-2">
              <Label htmlFor="forecastPeriod">Kỳ dự báo (tháng/năm) *</Label>
              <Input
                id="forecastPeriod"
                type="month"
                value={formData.forecastPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, forecastPeriod: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Thuật toán dự báo *</Label>
              <div className="space-y-2">
                {algorithms.map((algo) => (
                  <label
                    key={algo.name}
                    className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="radio"
                      name="algorithm"
                      value={algo.name}
                      checked={formData.algorithm === algo.name}
                      onChange={(e) =>
                        setFormData({ ...formData, algorithm: e.target.value })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{algo.displayName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {algo.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {algo.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedAlgo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Công thức:</p>
                    <code className="text-xs">{selectedAlgo.formula}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit">Tạo dự báo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
