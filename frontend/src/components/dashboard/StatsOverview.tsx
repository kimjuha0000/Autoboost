import { StatCard } from "@/components/ui/stat-card";
import { MousePointerClick, Star, Coins, Users } from "lucide-react";
import { StatsData } from "@/types/dashboard";

interface StatsOverviewProps {
  data: StatsData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const stats = [
    {
      title: "오늘 쿠폰 클릭",
      value: data.todayCouponClicks,
      subtitle: "클릭당 2,000원 적립",
      icon: MousePointerClick,
      trend: { value: data.trends.coupon, isPositive: data.trends.coupon > 0 },
      variant: "primary" as const,
    },
    {
      title: "오늘 리뷰 작성",
      value: data.todayReviews,
      subtitle: "네이버 플레이스 기준",
      icon: Star,
      trend: { value: data.trends.reviews, isPositive: data.trends.reviews > 0 },
      variant: "accent" as const,
    },
    {
      title: "오늘 리워드 비용",
      value: `₩${data.todayReward.toLocaleString()}`,
      subtitle: `${data.todayCouponClicks}회 × ₩2,000`,
      icon: Coins,
      trend: { value: data.trends.reward, isPositive: data.trends.reward > 0 },
      variant: "success" as const,
    },
    {
      title: "이번 달 참여자",
      value: data.totalParticipants,
      subtitle: "추첨 대상자",
      icon: Users,
      trend: { value: data.trends.participants, isPositive: data.trends.participants > 0 },
      variant: "warning" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={stat.title}
          style={{ animationDelay: `${index * 100}ms` }}
          className="animate-slide-up"
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
