import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar } from "lucide-react";

export default function ReorderNeedsTable({ recommendations }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sản phẩm</TableHead>
          <TableHead>Kho</TableHead>
          <TableHead className="text-right">Tồn hiện tại</TableHead>
          <TableHead className="text-right">Điểm đặt lại</TableHead>
          <TableHead className="text-right">SL đề xuất</TableHead>
          <TableHead>Ngày đặt hàng</TableHead>
          <TableHead>Ngày giao dự kiến</TableHead>
          <TableHead>Mức độ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recommendations.map((rec, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{rec.productName}</TableCell>
            <TableCell>{rec.warehouseName}</TableCell>
            <TableCell className="text-right">
              <span className={rec.urgency === "Critical" ? "text-red-600 font-semibold" : "text-orange-600"}>
                {rec.currentStock}
              </span>
            </TableCell>
            <TableCell className="text-right">{rec.reorderPoint}</TableCell>
            <TableCell className="text-right">
              <span className="font-semibold text-blue-600">
                {rec.recommendedQuantity}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(rec.suggestedOrderDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {new Date(rec.expectedDeliveryDate).toLocaleDateString('vi-VN')}
              </span>
            </TableCell>
            <TableCell>
              <Badge
                variant={rec.urgency === "Critical" ? "destructive" : "default"}
                className={
                  rec.urgency === "Normal"
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-100"
                    : ""
                }
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {rec.urgency === "Critical" ? "Khẩn cấp" : "Bình thường"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
