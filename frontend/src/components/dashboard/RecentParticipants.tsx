import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MousePointerClick, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  action: "coupon" | "review";
  points: number;
  time: string;
  isWinner?: boolean;
}

interface RecentParticipantsProps {
  participants: Participant[];
}

const actionStyles = {
  coupon: {
    icon: MousePointerClick,
    label: "쿠폰 클릭",
    color: "text-primary",
    bg: "bg-primary/20",
  },
  review: {
    icon: Star,
    label: "리뷰 작성",
    color: "text-accent",
    bg: "bg-accent/20",
  },
};

export function RecentParticipants({ participants }: RecentParticipantsProps) {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">최근 참여자</h3>
          <p className="text-sm text-muted-foreground">실시간 활동 현황</p>
        </div>
        <button className="text-sm text-primary hover:underline">전체 보기</button>
      </div>

      <div className="space-y-4">
        {participants.map((participant, index) => {
          const action = actionStyles[participant.action];
          const Icon = action.icon;

          return (
            <div
              key={participant.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-border">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
                {participant.isWinner && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-warning-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{participant.name}</p>
                  {participant.isWinner && (
                    <span className="px-1.5 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                      당첨
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={cn("p-1 rounded", action.bg)}>
                    <Icon className={cn("w-3 h-3", action.color)} />
                  </div>
                  <span>{action.label}</span>
                  <span>•</span>
                  <span>{participant.time}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-success">+{participant.points}</p>
                <p className="text-xs text-muted-foreground">포인트</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
