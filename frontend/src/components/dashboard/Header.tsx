import { Bell, Search, Calendar, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <header className="flex items-center justify-between py-6 animate-slide-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">안녕하세요, 사장님! 👋</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색..."
            className="w-64 pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
          <Avatar className="w-9 h-9 border-2 border-primary/30">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" />
            <AvatarFallback>사장</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">맛있는 카페</p>
            <p className="text-xs text-muted-foreground">프리미엄</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
        </button>
      </div>
    </header>
  );
}
