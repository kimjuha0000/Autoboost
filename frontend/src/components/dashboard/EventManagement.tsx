import { useMemo, useState } from "react";
import { Gift, Plus, Calendar, Users, Trophy, Coins, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Campaign } from "@/types/dashboard";

const statusStyles = {
  active: { badge: "bg-success/10 text-success border-success/20", label: "진행중" },
  upcoming: { badge: "bg-warning/10 text-warning border-warning/20", label: "예정" },
  ended: { badge: "bg-muted text-muted-foreground border-border", label: "종료" },
};

const rewardTypeIcons = {
  coupon: Gift,
  giftcard: Coins,
  product: Trophy,
};

interface EventCardProps {
  event: Campaign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDrawWinner: (id: string) => void;
}

function EventCard({ event, onEdit, onDelete, onDrawWinner }: EventCardProps) {
  const status = statusStyles[event.status];
  const progress = Math.min(100, (event.currentWinners / Math.max(1, event.maxWinners)) * 100);
  const RewardIcon = rewardTypeIcons[event.rewardType] || Gift;

  return (
    <div className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <RewardIcon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{event.name}</h4>
            <p className="text-sm text-muted-foreground">{event.reward}</p>
          </div>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", status?.badge)}>
          {status?.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold">{event.participants}</p>
          <p className="text-xs text-muted-foreground">참여자</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Trophy className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-xl font-bold">{event.currentWinners}/{event.maxWinners}</p>
          <p className="text-xs text-muted-foreground">당첨자</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Coins className="w-4 h-4 mx-auto mb-1 text-success" />
          <p className="text-xl font-bold">₩{(event.rewardValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground">보상가치</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Calendar className="w-4 h-4 mx-auto mb-1 text-warning" />
          <p className="text-xl font-bold">{event.endDate?.split("-")[2]}</p>
          <p className="text-xs text-muted-foreground">종료일</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">당첨 진행률</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          클릭 {event.pointsPerClick}P / 리뷰 {event.pointsPerReview}P
        </div>
        <div className="flex gap-2">
          {event.status === "active" && (
            <button
              onClick={() => onDrawWinner(event.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-sm font-medium"
            >
              <Trophy className="w-4 h-4" />
              추첨
            </button>
          )}
          <button
            onClick={() => onEdit(event.id)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EventManagementProps {
  events?: Campaign[];
  loading?: boolean;
  onDrawWinner?: (id: string) => Promise<void> | void;
}

export function EventManagement({ events = [], loading, onDrawWinner }: EventManagementProps) {
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "ended">("all");

  const filteredEvents = useMemo(
    () => (events || []).filter((e) => filter === "all" || e.status === filter),
    [events, filter]
  );

  const handleDrawWinner = async (id: string) => {
    if (onDrawWinner) {
      await onDrawWinner(id);
    } else {
      toast.info("추첨 API가 연결되지 않았습니다.");
    }
  };

  const handleDelete = () => {
    toast.info("이벤트 삭제는 추후 제공됩니다.");
  };

  const handleEdit = () => {
    toast.info("이벤트 편집 기능은 준비중입니다.");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">이벤트 관리</h3>
          <p className="text-sm text-muted-foreground">포인트 추첨 이벤트를 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium">
          <Plus className="w-5 h-5" />
          새 이벤트
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "전체" },
          { id: "active", label: "진행중" },
          { id: "upcoming", label: "예정" },
          { id: "ended", label: "종료" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">이벤트 데이터를 불러오는 중...</p>}

      {/* Event Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDrawWinner={handleDrawWinner}
          />
        ))}
        {!loading && filteredEvents.length === 0 && (
          <div className="col-span-2 text-center text-muted-foreground py-12 glass rounded-2xl">
            표시할 이벤트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
