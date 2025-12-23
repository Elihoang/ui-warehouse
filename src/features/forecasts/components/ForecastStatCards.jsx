import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3, CheckCircle } from "lucide-react";

export default function ForecastStatCards({ forecasts }) {
  const totalForecasts = forecasts.length;
  const avgPredictedDemand = forecasts.length > 0
    ? Math.round(forecasts.reduce((sum, f) => sum + f.predictedDemand, 0) / forecasts.length)
    : 0;
  const forecastsWithActual = forecasts.filter(f => f.actualDemand !== null).length;
  const avgAccuracy = forecastsWithActual > 0
    ? Math.round(
        forecasts
          .filter(f => f.accuracy !== null)
          .reduce((sum, f) => sum + f.accuracy, 0) / forecastsWithActual
      )
    : 0;

  const stats = [
    {
      title: "Tổng dự báo",
      value: totalForecasts,
      icon: BarChart3,
      color: "blue",
    },
    {
      title: "TB dự báo",
      value: avgPredictedDemand,
      icon: TrendingUp,
      color: "green",
    },
    {
      title: "Có thực tế",
      value: forecastsWithActual,
      icon: CheckCircle,
      color: "purple",
    },
    {
      title: "Độ chính xác TB",
      value: `${avgAccuracy}%`,
      icon: Target,
      color: "orange",
    },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorMap[stat.color];
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${colors.bg} rounded-full`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
