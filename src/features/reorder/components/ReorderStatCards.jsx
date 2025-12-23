import { Card, CardContent } from "@/components/ui/card";
import { Settings, AlertTriangle, CheckCircle2, Package } from "lucide-react";

export default function ReorderStatCards({ settings, reorderNeeds }) {
  const totalSettings = settings.length;
  const enabledSettings = settings.filter(s => s.isAutoReorderEnabled).length;
  const totalReorderNeeds = reorderNeeds?.totalProducts || 0;
  const criticalNeeds = reorderNeeds?.recommendations?.filter(r => r.urgency === "Critical").length || 0;

  const stats = [
    {
      title: "Tổng cấu hình",
      value: totalSettings,
      icon: Settings,
      color: "blue",
    },
    {
      title: "Đang bật",
      value: enabledSettings,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Cần đặt hàng",
      value: totalReorderNeeds,
      icon: Package,
      color: "orange",
    },
    {
      title: "Khẩn cấp",
      value: criticalNeeds,
      icon: AlertTriangle,
      color: "red",
    },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
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
