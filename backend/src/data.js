const fs = require('fs').promises;
const path = require('path');

const dataFilePath = path.resolve(process.cwd(), 'data', 'events.json');

// 기본 포인트 및 리워드 비용 설정
const POINTS_PER_ACTION = { coupon: 100, review: 200, qr: 0 };
const REWARD_COST_PER_ACTION = { coupon: 2000, review: 0, qr: 0 };

const defaultCampaigns = [
  {
    id: 'campaign-1',
    name: '12월 음료 쿠폰 이벤트',
    reward: '아메리카노 무료 쿠폰',
    rewardValue: 50000,
    rewardType: 'coupon',
    participants: 0,
    maxWinners: 10,
    currentWinners: 3,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'active',
    pointsPerClick: 100,
    pointsPerReview: 200,
    winners: [],
  },
  {
    id: 'campaign-2',
    name: '연말 특별 추첨',
    reward: '5만원 상품권',
    rewardValue: 50000,
    rewardType: 'giftcard',
    participants: 0,
    maxWinners: 5,
    currentWinners: 0,
    startDate: '2024-12-25',
    endDate: '2025-01-05',
    status: 'upcoming',
    pointsPerClick: 150,
    pointsPerReview: 300,
    winners: [],
  },
];

function buildDefaultData() {
  return {
    events: [],
    campaigns: defaultCampaigns,
  };
}

function ensureDataShape(raw) {
  if (!raw) return buildDefaultData();
  if (Array.isArray(raw)) {
    return { events: raw, campaigns: defaultCampaigns };
  }
  return {
    events: Array.isArray(raw.events) ? raw.events : [],
    campaigns: Array.isArray(raw.campaigns) && raw.campaigns.length ? raw.campaigns : defaultCampaigns,
  };
}

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return ensureDataShape(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return buildDefaultData();
    }
    console.error('Error reading data file:', error);
    throw error;
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data file:', error);
    throw error;
  }
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function timeAgoFrom(timestamp) {
  const now = Date.now();
  const diffMinutes = Math.floor((now - new Date(timestamp).getTime()) / (60 * 1000));
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

async function addEvent({ action = 'qr', qrId, ip, userAgent, userName, phone, userId }) {
  const data = await readData();
  const events = data.events || [];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 어뷰징 방지: QR 액션만 동일 IP/QR 24시간 내 중복 차단
  if (action === 'qr') {
    const hasRecentEvent = events.some(
      (event) =>
        event.action === 'qr' &&
        event.ip === ip &&
        event.qrId === qrId &&
        new Date(event.timestamp) > twentyFourHoursAgo
    );
    if (hasRecentEvent) {
      console.log(`Duplicate QR event blocked for IP: ${ip} and QR ID: ${qrId}`);
      return null;
    }
  }

  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    action,
    qrId: qrId || 'unknown',
    timestamp: now.toISOString(),
    ip,
    userAgent,
    userName: userName || undefined,
    phone: phone || undefined,
    userId: userId || phone || ip || undefined,
    points: POINTS_PER_ACTION[action] || 0,
    reward: REWARD_COST_PER_ACTION[action] || 0,
  };

  events.unshift(newEntry);
  data.events = events;
  await writeData(data);
  return newEntry;
}

async function getEvents() {
  const data = await readData();
  return data.events || [];
}

function buildCampaignStatus(campaign) {
  const today = new Date();
  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  const end = campaign.endDate ? new Date(campaign.endDate) : null;

  if (start && today < start) return 'upcoming';
  if (end && today > end) return 'ended';
  return 'active';
}

async function getCampaigns() {
  const data = await readData();
  const campaigns = data.campaigns || [];
  return campaigns.map((c) => ({
    ...c,
    status: buildCampaignStatus(c),
  }));
}

function buildParticipants(events, campaigns) {
  const participantMap = {};
  const winnerCounts = {};

  (campaigns || []).forEach((campaign) => {
    (campaign.winners || []).forEach((w) => {
      winnerCounts[w.participantId] = (winnerCounts[w.participantId] || 0) + 1;
    });
  });

  events.forEach((event) => {
    const key = event.userId || event.phone || event.ip || event.id;
    const name = event.userName || (event.phone ? `${event.phone.slice(0, 7)}**` : '익명 고객');
    if (!participantMap[key]) {
      participantMap[key] = {
        id: key,
        name,
        phone: event.phone || '미제공',
        totalPoints: 0,
        couponClicks: 0,
        reviews: 0,
        lastActivity: event.timestamp,
        joinDate: event.timestamp,
        isWinner: false,
        winCount: 0,
      };
    }
    const participant = participantMap[key];
    if (event.action === 'coupon') participant.couponClicks += 1;
    if (event.action === 'review') participant.reviews += 1;
    participant.totalPoints += event.points || 0;
    participant.lastActivity = participant.lastActivity > event.timestamp ? participant.lastActivity : event.timestamp;
    participant.joinDate = participant.joinDate < event.timestamp ? participant.joinDate : event.timestamp;
    participant.winCount = winnerCounts[key] || 0;
    participant.isWinner = participant.winCount > 0;
  });

  return Object.values(participantMap)
    .map((p) => ({
      ...p,
      lastActivity: timeAgoFrom(p.lastActivity),
      joinDate: new Date(p.joinDate).toLocaleDateString('ko-KR'),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

function buildRecentParticipants(events) {
  return events
    .filter((e) => e.action === 'coupon' || e.action === 'review')
    .slice(0, 8)
    .map((event) => ({
      id: event.id,
      name: event.userName || '익명 고객',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.userId || event.id}`,
      action: event.action === 'coupon' ? 'coupon' : 'review',
      points: event.points || 0,
      time: timeAgoFrom(event.timestamp),
      isWinner: false,
    }));
}

function aggregateCounts(events, predicate) {
  return events.filter(predicate);
}

function countByAction(events, action, predicate) {
  return aggregateCounts(events, (e) => e.action === action && predicate(e)).length;
}

function rewardSum(events, predicate) {
  return aggregateCounts(events, predicate).reduce((sum, e) => sum + (e.reward || 0), 0);
}

function buildStats(events) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const todayCoupon = countByAction(events, 'coupon', (e) => isSameDay(new Date(e.timestamp), now));
  const todayReview = countByAction(events, 'review', (e) => isSameDay(new Date(e.timestamp), now));
  const yesterdayCoupon = countByAction(events, 'coupon', (e) => isSameDay(new Date(e.timestamp), yesterday));
  const yesterdayReview = countByAction(events, 'review', (e) => isSameDay(new Date(e.timestamp), yesterday));

  const todayReward = rewardSum(events, (e) => isSameDay(new Date(e.timestamp), now));
  const yesterdayReward = rewardSum(events, (e) => isSameDay(new Date(e.timestamp), yesterday));

  const todayParticipants = new Set(
    events
      .filter((e) => isSameDay(new Date(e.timestamp), now))
      .map((e) => e.userId || e.phone || e.ip)
      .filter(Boolean)
  ).size;
  const yesterdayParticipants = new Set(
    events
      .filter((e) => isSameDay(new Date(e.timestamp), yesterday))
      .map((e) => e.userId || e.phone || e.ip)
      .filter(Boolean)
  ).size;

  return {
    todayCouponClicks: todayCoupon,
    todayReviews: todayReview,
    todayReward,
    totalParticipants: todayParticipants,
    trends: {
      coupon: yesterdayCoupon ? Math.round(((todayCoupon - yesterdayCoupon) / Math.max(1, yesterdayCoupon)) * 100) : 100,
      reviews: yesterdayReview ? Math.round(((todayReview - yesterdayReview) / Math.max(1, yesterdayReview)) * 100) : 100,
      reward: yesterdayReward ? Math.round(((todayReward - yesterdayReward) / Math.max(1, yesterdayReward)) * 100) : 100,
      participants: yesterdayParticipants
        ? Math.round(((todayParticipants - yesterdayParticipants) / Math.max(1, yesterdayParticipants)) * 100)
        : 100,
    },
  };
}

function buildChartData(events) {
  const now = new Date();
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const target = new Date(now);
    target.setDate(now.getDate() - i);
    const couponCount = countByAction(events, 'coupon', (e) => isSameDay(new Date(e.timestamp), target));
    const reviewCount = countByAction(events, 'review', (e) => isSameDay(new Date(e.timestamp), target));
    days.push({
      date: formatDateLabel(target),
      '쿠폰클릭': couponCount,
      '리뷰': reviewCount,
    });
  }

  return days;
}

function buildMonthlySummary(events, campaigns) {
  const now = new Date();
  const thisMonth = events.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const lastMonth = events.filter((e) => {
    const d = new Date(e.timestamp);
    return (
      (d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear()) ||
      (now.getMonth() === 0 && d.getFullYear() === now.getFullYear() - 1 && d.getMonth() === 11)
    );
  });

  const couponCost = thisMonth.filter((e) => e.action === 'coupon').reduce((sum, e) => sum + (e.reward || 0), 0);
  const reviewCost = thisMonth.filter((e) => e.action === 'review').reduce((sum, e) => sum + (e.reward || 0), 0);
  const eventCost = (campaigns || []).reduce((sum, c) => sum + (c.currentWinners || 0) * (c.rewardValue || 0), 0);
  const totalReward = couponCost + reviewCost + eventCost;

  const lastMonthReward =
    lastMonth.filter((e) => e.action === 'coupon').reduce((sum, e) => sum + (e.reward || 0), 0) +
    lastMonth.filter((e) => e.action === 'review').reduce((sum, e) => sum + (e.reward || 0), 0);

  return {
    totalReward,
    couponCost,
    reviewCost,
    eventCost,
    previousMonth: lastMonthReward || totalReward,
  };
}

function buildDailyMonthlyMetrics(events, campaigns) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const thisMonthEvents = events.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const prevMonthEvents = events.filter((e) => {
    const d = new Date(e.timestamp);
    return (
      (d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear()) ||
      (now.getMonth() === 0 && d.getFullYear() === now.getFullYear() - 1 && d.getMonth() === 11)
    );
  });

  const todayReward = rewardSum(events, (e) => isSameDay(new Date(e.timestamp), now));
  const yesterdayReward = rewardSum(events, (e) => isSameDay(new Date(e.timestamp), yesterday));

  const todayCoupon = countByAction(events, 'coupon', (e) => isSameDay(new Date(e.timestamp), now));
  const todayReview = countByAction(events, 'review', (e) => isSameDay(new Date(e.timestamp), now));
  const yesterdayCoupon = countByAction(events, 'coupon', (e) => isSameDay(new Date(e.timestamp), yesterday));
  const yesterdayReview = countByAction(events, 'review', (e) => isSameDay(new Date(e.timestamp), yesterday));

  const monthlyReward = rewardSum(thisMonthEvents, () => true) + (campaigns || []).reduce(
    (sum, c) => sum + (c.currentWinners || 0) * (c.rewardValue || 0),
    0,
  );
  const prevMonthlyReward = rewardSum(prevMonthEvents, () => true);

  const todayParticipants = new Set(
    events
      .filter((e) => isSameDay(new Date(e.timestamp), now))
      .map((e) => e.userId || e.phone || e.ip)
      .filter(Boolean)
  ).size;
  const yesterdayParticipants = new Set(
    events
      .filter((e) => isSameDay(new Date(e.timestamp), yesterday))
      .map((e) => e.userId || e.phone || e.ip)
      .filter(Boolean)
  ).size;

  const daily = {
    couponClicks: todayCoupon,
    reviews: todayReview,
    reward: todayReward,
    participants: todayParticipants,
    trends: {
      coupon: percentChange(todayCoupon, yesterdayCoupon),
      reviews: percentChange(todayReview, yesterdayReview),
      reward: percentChange(todayReward, yesterdayReward),
      participants: percentChange(todayParticipants, yesterdayParticipants),
    },
  };

  const monthlyCoupon = thisMonthEvents.filter((e) => e.action === 'coupon').length;
  const monthlyReview = thisMonthEvents.filter((e) => e.action === 'review').length;
  const prevMonthlyCoupon = prevMonthEvents.filter((e) => e.action === 'coupon').length;
  const prevMonthlyReview = prevMonthEvents.filter((e) => e.action === 'review').length;
  const monthlyParticipants = new Set(thisMonthEvents.map((e) => e.userId || e.phone || e.ip).filter(Boolean)).size;
  const prevMonthlyParticipants = new Set(prevMonthEvents.map((e) => e.userId || e.phone || e.ip).filter(Boolean)).size;

  const monthly = {
    couponClicks: monthlyCoupon,
    reviews: monthlyReview,
    reward: monthlyReward,
    participants: monthlyParticipants,
    trends: {
      coupon: percentChange(monthlyCoupon, prevMonthlyCoupon),
      reviews: percentChange(monthlyReview, prevMonthlyReview),
      reward: percentChange(monthlyReward, prevMonthlyReward),
      participants: percentChange(monthlyParticipants, prevMonthlyParticipants),
    },
  };

  const chartBuckets = [
    { name: '1주', 쿠폰클릭: 0, 리뷰: 0, 리워드: 0 },
    { name: '2주', 쿠폰클릭: 0, 리뷰: 0, 리워드: 0 },
    { name: '3주', 쿠폰클릭: 0, 리뷰: 0, 리워드: 0 },
    { name: '4주', 쿠폰클릭: 0, 리뷰: 0, 리워드: 0 },
  ];

  thisMonthEvents.forEach((event) => {
    const d = new Date(event.timestamp);
    const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7));
    if (event.action === 'coupon') chartBuckets[weekIndex]['쿠폰클릭'] += 1;
    if (event.action === 'review') chartBuckets[weekIndex]['리뷰'] += 1;
    chartBuckets[weekIndex]['리워드'] += event.reward || 0;
  });

  return { daily, monthly, chartData: chartBuckets };
}

async function drawWinner(campaignId) {
  const data = await readData();
  const campaigns = data.campaigns || [];
  const events = data.events || [];

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw new Error('Campaign not found');
  if (campaign.currentWinners >= campaign.maxWinners) return { campaign, winner: null };

  const participants = buildParticipants(events, campaigns).filter((p) => p.totalPoints > 0);
  if (!participants.length) return { campaign, winner: null };

  const winner = participants[Math.floor(Math.random() * participants.length)];
  campaign.currentWinners += 1;
  campaign.winners = campaign.winners || [];
  campaign.winners.push({
    participantId: winner.id,
    name: winner.name,
    timestamp: new Date().toISOString(),
  });

  await writeData({ events, campaigns });
  return { campaign, winner };
}

async function getDashboardSnapshot() {
  const data = await readData();
  const events = data.events || [];
  const campaigns = await getCampaigns();

  const stats = buildStats(events);
  const chartData = buildChartData(events);
  const recentParticipants = buildRecentParticipants(events);
  const monthlySummary = buildMonthlySummary(events, campaigns);
  const participantTable = buildParticipants(events, campaigns);
  const dailyMonthly = buildDailyMonthlyMetrics(events, campaigns);

  return {
    stats,
    chartData,
    events: campaigns,
    recentParticipants,
    monthlySummary,
    participantTable,
    dailyMonthly,
  };
}

module.exports = {
  getEvents,
  addEvent,
  getCampaigns,
  drawWinner,
  getDashboardSnapshot,
};
