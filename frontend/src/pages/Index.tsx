import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentParticipants } from "@/components/dashboard/RecentParticipants";
import { MonthlyRewardSummary } from "@/components/dashboard/MonthlyRewardSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { QRPreview } from "@/components/dashboard/QRPreview";
import { EventManagement } from "@/components/dashboard/EventManagement";
import { ParticipantsTable } from "@/components/dashboard/ParticipantsTable";
import { DailyMonthlyMetrics } from "@/components/dashboard/DailyMonthlyMetrics";
import { DashboardSnapshot, StatsData, MonthlySummary } from "@/types/dashboard";
import { toast } from "sonner";

const emptyStats: StatsData = {
  todayCouponClicks: 0,
  todayReviews: 0,
  todayReward: 0,
  totalParticipants: 0,
  trends: { coupon: 0, reviews: 0, reward: 0, participants: 0 },
};

const emptyMonthly: MonthlySummary = {
  totalReward: 0,
  couponCost: 0,
  reviewCost: 0,
  eventCost: 0,
  previousMonth: 0,
};

async function fetchDashboard(): Promise<DashboardSnapshot> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("대시보드 데이터를 불러오지 못했습니다");
  return res.json();
}

async function drawWinner(campaignId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/draw`, { method: "POST" });
  if (!res.ok) throw new Error("추첨에 실패했습니다");
  return res.json();
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const statsData = data?.stats ?? emptyStats;
  const chartData = data?.chartData ?? [];
  const events = data?.events ?? [];
  const participants = data?.recentParticipants ?? [];
  const monthlyData = data?.monthlySummary ?? emptyMonthly;
  const participantTable = data?.participantTable ?? [];
  const dailyMonthly = data?.dailyMonthly;

  const handleDrawWinner = async (id: string) => {
    try {
      await drawWinner(id);
      toast.success("추첨이 완료되었습니다.");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "추첨 중 오류가 발생했습니다.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "events":
        return <EventManagement events={events} loading={isLoading} onDrawWinner={handleDrawWinner} />;
      case "customers":
        return <ParticipantsTable participants={participantTable} loading={isLoading} />;
      case "analytics":
        return <DailyMonthlyMetrics data={dailyMonthly} loading={isLoading} />;
      default:
        return (
          <>
            {/* Stats Overview */}
            <section className="mb-8">
              <StatsOverview data={statsData} />
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Charts & Events */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <ActivityChart data={chartData} />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">진행중인 이벤트</h3>
                    <button 
                      onClick={() => setActiveTab("events")}
                      className="text-sm text-primary hover:underline"
                    >
                      모두 보기
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                    {!events.length && (
                      <p className="text-sm text-muted-foreground">진행중인 이벤트가 없습니다.</p>
                    )}
                  </div>
                </div>

                <RecentParticipants participants={participants} />
              </div>

              {/* Right Column - Summary & Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <MonthlyRewardSummary data={monthlyData} />
                <QuickActions />
                <QRPreview 
                  storeName="맛있는 카페 강남점" 
                  naverPlaceUrl="https://naver.me/example" 
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pl-64 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <Header />
          {isError && (
            <div className="mb-4 text-sm text-destructive">데이터를 불러오는 중 문제가 발생했습니다.</div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
