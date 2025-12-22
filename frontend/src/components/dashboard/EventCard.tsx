import { Gift, Users, Calendar, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@/types/dashboard";

interface EventCardProps {
  event: Campaign;
}

const statusStyles = {
  active: {
    badge: "bg-success/20 text-success",
    label: "진행중",
  },
  upcoming: {
    badge: "bg-warning/20 text-warning",
    label: "예정",
  },
  ended: {
    badge: "bg-muted text-muted-foreground",
    label: "종료",
  },
};

export function EventCard({ event }: EventCardProps) {
  const status = statusStyles[event.status];
  const progress = Math.min(100, (event.currentWinners / Math.max(1, event.maxWinners)) * 100);
  const endDateLabel = event.endDate?.includes("-")
    ? event.endDate.split("-").slice(1).join("/")
    : event.endDate;

  return (
    <div className="glass rounded-xl p-5 hover:scale-[1.01] transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/20">
            <Gift className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold">{event.name}</h4>
            <p className="text-sm text-muted-foreground">{event.reward}</p>
          </div>
        </div>
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", status.badge)}>
          {status.label}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{event.participants}</p>
            <p className="text-xs text-muted-foreground">참여자</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{event.currentWinners}/{event.maxWinners}</p>
            <p className="text-xs text-muted-foreground">당첨자</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{endDateLabel}</p>
            <p className="text-xs text-muted-foreground">종료일</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">당첨 진행률</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            보상 가치: <span className="text-foreground font-semibold">₩{event.rewardValue.toLocaleString()}</span>
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
