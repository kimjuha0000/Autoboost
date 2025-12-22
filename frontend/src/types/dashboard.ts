export interface StatsTrends {
  coupon: number;
  reviews: number;
  reward: number;
  participants: number;
}

export interface StatsData {
  todayCouponClicks: number;
  todayReviews: number;
  todayReward: number;
  totalParticipants: number;
  trends: StatsTrends;
}

export interface ChartPoint {
  date: string;
  쿠폰클릭: number;
  리뷰: number;
}

export interface Campaign {
  id: string;
  name: string;
  reward: string;
  rewardValue: number;
  rewardType: "coupon" | "giftcard" | "product";
  participants: number;
  maxWinners: number;
  currentWinners: number;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "ended";
  pointsPerClick: number;
  pointsPerReview: number;
}

export interface RecentParticipant {
  id: string;
  name: string;
  avatar?: string;
  action: "coupon" | "review";
  points: number;
  time: string;
  isWinner?: boolean;
}

export interface MonthlySummary {
  totalReward: number;
  couponCost: number;
  reviewCost: number;
  eventCost: number;
  previousMonth: number;
}

export interface ParticipantRow {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  totalPoints: number;
  couponClicks: number;
  reviews: number;
  lastActivity: string;
  joinDate: string;
  isWinner: boolean;
  winCount: number;
}

export interface DailyMonthlyData {
  daily: {
    couponClicks: number;
    reviews: number;
    reward: number;
    participants: number;
    trends: {
      coupon: number;
      reviews: number;
      reward: number;
      participants: number;
    };
  };
  monthly: {
    couponClicks: number;
    reviews: number;
    reward: number;
    participants: number;
    trends: {
      coupon: number;
      reviews: number;
      reward: number;
      participants: number;
    };
  };
  chartData: { name: string; 쿠폰클릭: number; 리뷰: number; 리워드: number }[];
}

export interface DashboardSnapshot {
  stats: StatsData;
  chartData: ChartPoint[];
  events: Campaign[];
  recentParticipants: RecentParticipant[];
  monthlySummary: MonthlySummary;
  participantTable: ParticipantRow[];
  dailyMonthly: DailyMonthlyData;
}
