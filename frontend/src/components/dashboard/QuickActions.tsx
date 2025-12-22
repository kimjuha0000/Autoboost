import { QrCode, Gift, Download, Share2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  variant: "primary" | "accent" | "success" | "default";
}

const actions: QuickAction[] = [
  {
    id: "generate-qr",
    icon: QrCode,
    label: "QR 코드 생성",
    description: "새 QR 코드 만들기",
    variant: "primary",
  },
  {
    id: "create-event",
    icon: Gift,
    label: "이벤트 생성",
    description: "포인트 추첨 설정",
    variant: "accent",
  },
  {
    id: "export-data",
    icon: Download,
    label: "데이터 내보내기",
    description: "리포트 다운로드",
    variant: "success",
  },
  {
    id: "share",
    icon: Share2,
    label: "공유하기",
    description: "팀과 공유",
    variant: "default",
  },
];

const variantStyles = {
  primary: "bg-primary/10 text-primary hover:bg-primary/20 hover:glow-primary",
  accent: "bg-accent/10 text-accent hover:bg-accent/20 hover:glow-accent",
  success: "bg-success/10 text-success hover:bg-success/20",
  default: "bg-secondary text-foreground hover:bg-secondary/80",
};

export function QuickActions() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">빠른 작업</h3>
          <p className="text-sm text-muted-foreground">자주 사용하는 기능</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                variantStyles[action.variant]
              )}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
