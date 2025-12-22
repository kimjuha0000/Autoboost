import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  QrCode,
  Gift,
  Users,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  badge?: number;
}

function NavItem({ icon: Icon, label, active, collapsed, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        "hover:bg-secondary group relative",
        active && "bg-primary/10 text-primary"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors",
        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      {!collapsed && (
        <>
          <span className={cn(
            "font-medium text-sm transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {label}
          </span>
          {badge && badge > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "대시보드" },
    { id: "qr", icon: QrCode, label: "QR 관리" },
    { id: "events", icon: Gift, label: "이벤트 관리", badge: 2 },
    { id: "customers", icon: Users, label: "참여자 현황" },
    { id: "analytics", icon: BarChart3, label: "분석" },
    { id: "notifications", icon: Bell, label: "알림", badge: 5 },
    { id: "settings", icon: Settings, label: "설정" },
  ];

  return (
    <aside
      className={cn(
        "h-screen glass-strong fixed left-0 top-0 z-50 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg gradient-text">AutoBoost</h1>
            <p className="text-xs text-muted-foreground">사장님 대시보드</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            collapsed={collapsed}
            badge={item.badge}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>
    </aside>
  );
}
