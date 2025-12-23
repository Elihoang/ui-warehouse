import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function ForecastTable({ forecasts }) {
  const getAlgorithmBadge = (algorithm) => {
    const map = {
      MovingAverage: { label: "TB Động", color: "bg-blue-100 text-blue-600" },
      WeightedMovingAverage: { label: "TB Có trọng số", color: "bg-purple-100 text-purple-600" },
      ExponentialSmoothing: { label: "Làm mượt mũ", color: "bg-orange-100 text-orange-600" },
    };
    return map[algorithm] || { label: algorithm, color: "bg-gray-100 text-gray-600" };
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy === null) return "text-gray-400";
    if (accuracy >= 90) return "text-green-600 font-semibold";
    if (accuracy >= 70) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Sản phẩm</TableHead>
          <TableHead className="w-[120px]">Kho</TableHead>
          <TableHead className="w-[100px]">Kỳ dự báo</TableHead>
          <TableHead className="w-[140px]">Thuật toán</TableHead>
          <TableHead className="text-right w-[90px]">Dự báo</TableHead>
          <TableHead className="text-right w-[90px]">Thực tế</TableHead>
          <TableHead className="text-right w-[110px]">Độ chính xác</TableHead>
          <TableHead className="text-right w-[100px]">ĐH đề xuất</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forecasts.map((forecast) => {
          const algoBadge = getAlgorithmBadge(forecast.algorithm);
          return (
            <TableRow key={forecast.forecastId}>
              <TableCell className="font-medium max-w-[180px]">
                <div className="truncate" title={forecast.productName}>
                  {forecast.productName}
                </div>
              </TableCell>
              <TableCell>{forecast.warehouseName}</TableCell>
              <TableCell>
                {new Date(forecast.forecastPeriod).toLocaleDateString('vi-VN', {
                  month: '2-digit',
                  year: 'numeric'
                })}
              </TableCell>
              <TableCell>
                <Badge className={`${algoBadge.color} hover:${algoBadge.color}`}>
                  {algoBadge.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="font-semibold">{forecast.predictedDemand}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {forecast.actualDemand !== null ? forecast.actualDemand : "-"}
              </TableCell>
              <TableCell className={`text-right ${getAccuracyColor(forecast.accuracy)}`}>
                {forecast.accuracy !== null ? `${forecast.accuracy}%` : "-"}
              </TableCell>
              <TableCell className="text-right">
                {forecast.recommendedOrderQuantity > 0 ? (
                  <span className="text-orange-600 font-semibold">
                    {forecast.recommendedOrderQuantity}
                  </span>
                ) : (
                  <span className="text-green-600">-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
