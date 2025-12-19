import { Menu, Bell, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

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
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Warehouse className="h-6 w-6 text-primary md:hidden" />
          <h1 className="text-xl font-semibold md:hidden">BeWarehouse</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary text-white">
            {getInitials(user?.userName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
