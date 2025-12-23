import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export default function ReorderSettingsTable({ settings, onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sản phẩm</TableHead>
          <TableHead>Kho</TableHead>
          <TableHead className="text-right">Tồn tối thiểu</TableHead>
          <TableHead className="text-right">Điểm đặt lại</TableHead>
          <TableHead className="text-right">SL đặt lại</TableHead>
          <TableHead className="text-right">Tồn tối đa</TableHead>
          <TableHead className="text-right">Lead time</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.map((setting) => (
          <TableRow key={setting.settingId}>
            <TableCell className="font-medium">{setting.productName}</TableCell>
            <TableCell>{setting.warehouseName}</TableCell>
            <TableCell className="text-right">{setting.minStockLevel}</TableCell>
            <TableCell className="text-right">
              <span className="font-semibold text-orange-600">
                {setting.reorderPoint}
              </span>
            </TableCell>
            <TableCell className="text-right">{setting.reorderQuantity}</TableCell>
            <TableCell className="text-right">{setting.maxStockLevel}</TableCell>
            <TableCell className="text-right">{setting.leadTimeDays} ngày</TableCell>
            <TableCell>
              <Badge
                variant={setting.isAutoReorderEnabled ? "default" : "secondary"}
                className={
                  setting.isAutoReorderEnabled
                    ? "bg-green-100 text-green-600 hover:bg-green-100"
                    : ""
                }
              >
                {setting.isAutoReorderEnabled ? "Bật" : "Tắt"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(setting)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(setting.settingId)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
