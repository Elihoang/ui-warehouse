import {
  Home,
  Package,
  Users,
  Warehouse,
  FileInput,
  FileOutput,
  Database,
  Building2,
  Tag,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";

const menuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Tag,
    label: "Danh mục",
    href: "/categories",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Building2,
    label: "Nhà cung cấp",
    href: "/suppliers",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Package,
    label: "Sản phẩm",
    href: "/products",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Warehouse,
    label: "Kho",
    href: "/warehouses",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Database,
    label: "Tồn kho",
    href: "/stocks",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: FileInput,
    label: "Phiếu nhập",
    href: "/imports",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: FileOutput,
    label: "Phiếu xuất",
    href: "/exports",
    roles: ["Staff", "Manager", "Admin"],
  },
  {
    icon: Users,
    label: "Người dùng",
    href: "/users",
    roles: ["Admin"],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Warehouse className="h-6 w-6 text-primary mr-2" />
        <span className="text-xl font-bold text-primary">BeWarehouse</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <Button
              key={item.label}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.href)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
      </nav>

      <Separator />

      {/* User */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-white">
              {getInitials(user?.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.userName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role === "Admin"
                ? "Quản trị viên"
                : user?.role === "Manager"
                ? "Quản lý"
                : "Nhân viên"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
