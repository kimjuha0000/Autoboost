import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MousePointerClick, Star, Coins, Users, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DailyMonthlyData } from "@/types/dashboard";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  trend: number;
  variant: "primary" | "accent" | "success" | "warning";
}

const variantStyles = {
  primary: { iconBg: "bg-primary/10", iconColor: "text-primary" },
  accent: { iconBg: "bg-accent/10", iconColor: "text-accent" },
  success: { iconBg: "bg-success/10", iconColor: "text-success" },
  warning: { iconBg: "bg-warning/10", iconColor: "text-warning" },
};

function MetricCard({ title, value, prefix = "", suffix = "", icon: Icon, trend, variant }: MetricCardProps) {
  const styles = variantStyles[variant];
  const isPositive = trend > 0;

  return (
    <div className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", isPositive ? "text-success" : "text-destructive")}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold">
        {prefix}
        <AnimatedCounter value={value} />
        {suffix}
      </p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 border border-border shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">
              {entry.name === "리워드" ? `₩${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface DailyMonthlyMetricsProps {
  data?: DailyMonthlyData;
  loading?: boolean;
}

export function DailyMonthlyMetrics({ data, loading }: DailyMonthlyMetricsProps) {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const emptyMetrics = {
    couponClicks: 0,
    reviews: 0,
    reward: 0,
    participants: 0,
    trends: { coupon: 0, reviews: 0, reward: 0, participants: 0 },
  };
  const metrics = period === "daily" ? data?.daily ?? emptyMetrics : data?.monthly ?? emptyMetrics;
  const chartData = data?.chartData ?? [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">메트릭 현황</h3>
          <p className="text-sm text-muted-foreground">일일 및 월간 성과를 확인하세요</p>
        </div>
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          {[
            { id: "daily", label: "오늘", icon: Calendar },
            { id: "monthly", label: "이번 달", icon: Calendar },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as "daily" | "monthly")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === p.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="쿠폰 클릭"
          value={metrics.couponClicks}
          suffix="회"
          icon={MousePointerClick}
          trend={metrics.trends.coupon}
          variant="primary"
        />
        <MetricCard
          title="리뷰 작성"
          value={metrics.reviews}
          suffix="건"
          icon={Star}
          trend={metrics.trends.reviews}
          variant="accent"
        />
        <MetricCard
          title="리워드 비용"
          value={metrics.reward}
          prefix="₩"
          icon={Coins}
          trend={metrics.trends.reward}
          variant="success"
        />
        <MetricCard
          title="참여자"
          value={metrics.participants}
          suffix="명"
          icon={Users}
          trend={metrics.trends.participants}
          variant="warning"
        />
      </div>

      {/* Monthly Bar Chart */}
      {period === "monthly" && (
        <div className="glass rounded-xl p-6">
          <h4 className="text-lg font-semibold mb-4">주간 추이</h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "16px" }}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Bar dataKey="쿠폰클릭" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="리뷰" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {loading && <p className="text-sm text-muted-foreground">메트릭을 불러오는 중...</p>}
    </div>
  );
}
