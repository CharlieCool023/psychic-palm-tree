import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { RoleLabels } from "@contracts/constants";
import {
  Shield,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Printer,
  Download,
  UserPlus,
  Layers,
  MessageSquare,
  Home,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  super_admin: [
    { label: "Dashboard", path: "/dashboard/super-admin", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Commandants", path: "/dashboard/super-admin/commandants", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Batches", path: "/dashboard/super-admin/batches", icon: <Layers className="w-5 h-5" /> },
    { label: "All Users", path: "/dashboard/super-admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "Settings", path: "/dashboard/super-admin/settings", icon: <Settings className="w-5 h-5" /> },
  ],
  state_commandant: [
    { label: "Dashboard", path: "/dashboard/state-commandant", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Corps Members", path: "/dashboard/state-commandant/members", icon: <Users className="w-5 h-5" /> },
    { label: "Batches", path: "/dashboard/state-commandant/batches", icon: <Layers className="w-5 h-5" /> },
    { label: "Print Reports", path: "/dashboard/state-commandant/reports", icon: <Printer className="w-5 h-5" /> },
  ],
  camp_commandant: [
    { label: "Dashboard", path: "/dashboard/commandant", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Corps Members", path: "/dashboard/commandant/members", icon: <Users className="w-5 h-5" /> },
    { label: "Staff Management", path: "/dashboard/commandant/staff", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Batches", path: "/dashboard/commandant/batches", icon: <Layers className="w-5 h-5" /> },
    { label: "Print Reports", path: "/dashboard/commandant/reports", icon: <Printer className="w-5 h-5" /> },
    { label: "Export CSV", path: "/dashboard/commandant/export", icon: <Download className="w-5 h-5" /> },
  ],
  platoon_instructor: [
    { label: "Dashboard", path: "/dashboard/instructor", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "My Platoon", path: "/dashboard/instructor/platoon", icon: <Users className="w-5 h-5" /> },
    { label: "Evaluations", path: "/dashboard/instructor/evaluations", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Print", path: "/dashboard/instructor/print", icon: <Printer className="w-5 h-5" /> },
  ],
  man_o_war_instructor: [
    { label: "Dashboard", path: "/dashboard/man-o-war", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "My Platoon", path: "/dashboard/man-o-war/platoon", icon: <Users className="w-5 h-5" /> },
    { label: "Evaluations", path: "/dashboard/man-o-war/evaluations", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Print", path: "/dashboard/man-o-war/print", icon: <Printer className="w-5 h-5" /> },
  ],
  soldier: [
    { label: "Dashboard", path: "/dashboard/soldier", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "My Platoon", path: "/dashboard/soldier/platoon", icon: <Users className="w-5 h-5" /> },
    { label: "Comments", path: "/dashboard/soldier/comments", icon: <MessageSquare className="w-5 h-5" /> },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#004d00] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = roleNavItems[user.role] || [];
  const roleLabel = RoleLabels[user.role] || "User";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b border-white/10 ${collapsed ? "text-center" : ""}`}>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-white flex-shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">NYSC</h1>
              <p className="text-white/60 text-xs">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-b border-white/10 ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <div>
            <p className="text-white/80 text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-white/50 text-xs">@{user.username}</p>
          </div>
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">{user.fullName?.[0]}</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Home className="w-5 h-5" />
          {!collapsed && <span>Home</span>}
        </button>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col bg-[#004d00] text-white flex-shrink-0"
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3 }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white shadow-md">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-[#004d00] text-white p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="lg:hidden h-14" />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
