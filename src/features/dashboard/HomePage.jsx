
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Activity
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng quay lại!</h1>
          <p className="text-muted-foreground">Đây là tổng quan hoạt động của bạn hôm nay.</p>
        </div>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Tạo đơn hàng mới
        </Button>
      </div>

      {/* 4 Cards thống kê lớn */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₫48,573,000</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+126</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-500">38</span> đang xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+42</div>
            <p className="text-xs text-muted-foreground">
              Tăng trưởng khách hàng tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.24%</div>
            <Progress value={68} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* 2 cột bên dưới */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Đơn hàng gần đây */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>Có 5 đơn hàng mới trong 24h qua</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Nguyễn Văn A', amount: '1,290,000₫', status: 'success' },
              { name: 'Trần Thị B', amount: '899,000₫', status: 'processing' },
              { name: 'Lê Văn C', amount: '2,450,000₫', status: 'success' },
              { name: 'Phạm D', amount: '567,000₫', status: 'pending' },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{order.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{order.name}</p>
                    <p className="text-xs text-muted-foreground">2 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{order.amount}</span>
                  <Badge variant={order.status === 'success' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}>
                    {order.status === 'success' ? 'Hoàn thành' : order.status === 'processing' ? 'Đang xử lý' : 'Chờ thanh toán'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hoạt động nhanh */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="w-full justify-start">
              <Package className="mr-3 h-4 w-4" />
              Xem tất cả sản phẩm
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-3 h-4 w-4" />
              Quản lý khách hàng
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-3 h-4 w-4" />
              Báo cáo doanh thu
            </Button>
            <Button className="w-full">
              <TrendingUp className="mr-3 h-4 w-4" />
              Tạo chiến dịch mới
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}