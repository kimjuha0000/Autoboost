import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MonthlyData {
  totalReward: number;
  couponCost: number;
  reviewCost: number;
  eventCost: number;
  previousMonth: number;
}

interface MonthlyRewardSummaryProps {
  data: MonthlyData;
}

const COLORS = ["hsl(190, 100%, 50%)", "hsl(270, 100%, 65%)", "hsl(160, 84%, 45%)"];

export function MonthlyRewardSummary({ data }: MonthlyRewardSummaryProps) {
  const chartData = [
    { name: "쿠폰 클릭 비용", value: data.couponCost },
    { name: "리뷰 보상 비용", value: data.reviewCost },
    { name: "이벤트 비용", value: data.eventCost },
  ];

  const trendBase = data.previousMonth || 1;
  const trend = ((data.totalReward - data.previousMonth) / trendBase) * 100;
  const isPositive = trend > 0;

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">이번 달 비용 분석</h3>
          <p className="text-sm text-muted-foreground">카테고리별 지출 현황</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`₩${value.toLocaleString()}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">총 리워드 비용</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">
                <AnimatedCounter value={data.totalReward} prefix="₩" />
              </p>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-destructive" : "text-success"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium">₩{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
