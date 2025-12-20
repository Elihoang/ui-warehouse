import { useState, useEffect, useMemo } from "react";
import { userService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Users,
  CheckCircle2,
  UserCog,
  ShieldCheck,
  Pencil,
  Lock,
  Check,
  X,
  Warehouse,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    role: 0, // Default to Staff
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 1).length; // Status.Active
    const staff = users.filter(u => u.role === 0).length; // Role.Staff
    const admins = users.filter(u => u.role === 2).length; // Role.Admin
    
    return { total, active, staff, admins };
  }, [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && user.status === 1) || // Active
        (statusFilter === "inactive" && user.status === 3) || // Locked
        (statusFilter === "pending" && user.status === 4); // Pending
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error("Vui lòng nhập username");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      if (editing) {
        await userService.update(editing.userId, formData);
        toast.success("Cập nhật người dùng thành công");
      } else {
        await userService.create(formData);
        toast.success("Thêm người dùng thành công");
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      userName: user.userName,
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      userName: "",
      fullName: "",
      email: "",
      role: 0, // Default to Staff
    });
  };

  const getRoleInfo = (role) => {
    const roles = {
      0: { label: "Nhân viên kho", color: "bg-orange-100 text-orange-700 border-orange-200" },
      1: { label: "Quản lý", color: "bg-blue-100 text-blue-700 border-blue-200" },
      2: { label: "Quản trị viên", color: "bg-purple-100 text-purple-700 border-purple-200" },
    };
    return roles[role] || roles[0];
  };

  const getStatusInfo = (status) => {
    const statuses = {
      1: { // Active
        label: "Hoạt động", 
        color: "text-green-600", 
        bg: "bg-green-100",
        icon: <div className="h-2 w-2 rounded-full bg-green-500" />
      },
      2: { // Inactive
        label: "Ngừng hoạt động", 
        color: "text-gray-600",
        bg: "bg-gray-100", 
        icon: <div className="h-2 w-2 rounded-full bg-gray-500" />
      },
      3: { // Locked
        label: "Tạm khóa", 
        color: "text-red-600",
        bg: "bg-red-100", 
        icon: <div className="h-2 w-2 rounded-full bg-red-500" />
      },
      4: { // Pending
        label: "Chờ duyệt", 
        color: "text-orange-600",
        bg: "bg-orange-100", 
        icon: <div className="h-2 w-2 rounded-full bg-orange-500" />
      }
    };
    return statuses[status] || statuses[1];
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getInitials = (name, email) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "U";
  };

  const getAvatarColor = (str) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-red-500",
    ];
    const index = (str?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-1">
            Quản lý tài khoản, phân quyền và trạng thái hoạt động của nhân viên.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nhân viên kho</p>
                <p className="text-3xl font-bold text-gray-900">{stats.staff}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <UserCog className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Quản trị viên</p>
                <p className="text-3xl font-bold text-gray-900">{stats.admins}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Warehouse className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Chọn kho làm việc..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kho</SelectItem>
                <SelectItem value="warehouse1">Kho Hà Nội</SelectItem>
                <SelectItem value="warehouse2">Kho HCM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 items-center mb-6">
            <span className="text-sm text-gray-600 font-medium">LỌC THEO:</span>
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                statusFilter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đang hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                statusFilter === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              Tạm khóa
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                statusFilter === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <div className="h-3.5 w-3.5 rounded-full border-2 border-current" />
              Chờ duyệt
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Không tìm thấy người dùng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kho làm việc
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Lần cuối đăng nhập
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const statusInfo = getStatusInfo(user.status);
                    const initials = getInitials(user.fullName || user.userName, user.email);
                    const avatarColorClass = getAvatarColor(user.userName);

                    return (
                      <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className={cn("h-10 w-10", avatarColorClass)}>
                              <AvatarImage src={user.avatarUrl} alt={user.userName} />
                              <AvatarFallback className="text-white font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.fullName || user.userName}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn("border", roleInfo.color)}>
                            {roleInfo.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            Toàn quyền hệ thống
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium", statusInfo.bg, statusInfo.color)}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(user.lastLoginAt) || (
                              <span className="text-blue-600 font-medium">Chưa đăng nhập</span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-100"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing ? "Cập nhật người dùng" : "Thêm người dùng mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Username *</Label>
                <Input
                  id="userName"
                  placeholder="vd: john_doe123"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">Chỉ chữ không dấu, số và dấu gạch dưới</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select
                  value={String(formData.role)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nhân viên kho</SelectItem>
                    <SelectItem value="1">Quản lý</SelectItem>
                    <SelectItem value="2">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Check className="mr-2 h-4 w-4" />
                {editing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
