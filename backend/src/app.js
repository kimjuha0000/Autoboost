const express = require('express');
const cors = require('cors');
const {
  getEvents,
  addEvent,
  getCampaigns,
  drawWinner,
  getDashboardSnapshot,
} = require('./data');

const app = express();

// CORS 미들웨어 설정
app.use(cors({
  origin: '*', // 모든 출처 허용, 실제 배포 시에는 특정 도메인으로 제한하는 것이 좋습니다.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // JSON 요청 본문 파싱

// QR 스캔 기록 및 리다이렉트 API
// 예: GET /api/qr?id=table-1
app.get('/api/qr', async (req, res) => {
  const qrId = req.query.id;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!qrId) {
    return res.status(400).send('QR ID is required');
  }

  try {
    await addEvent({ action: 'qr', qrId, ip, userAgent });
    // 네이버로 리다이렉트
    return res.redirect(302, 'https://www.naver.com');
  } catch (error) {
    console.error('Error in /api/qr:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// 고객 행동 기록 (쿠폰 클릭 / 리뷰 작성)
app.post('/api/track', async (req, res) => {
  const { action, qrId, userName, phone, userId } = req.body || {};
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!action || !['coupon', 'review', 'qr'].includes(action)) {
    return res.status(400).json({ error: 'action must be one of coupon, review, qr' });
  }

  try {
    const event = await addEvent({ action, qrId, ip, userAgent, userName, phone, userId });
    return res.json({ ok: true, event });
  } catch (error) {
    console.error('Error in /api/track:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 대시보드 스냅샷 (KPI/차트/이벤트/참여자)
app.get('/api/dashboard', async (_req, res) => {
  try {
    const snapshot = await getDashboardSnapshot();
    return res.json(snapshot);
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 모든 스캔 이벤트 조회 API
// 예: GET /api/events
app.get('/api/events', async (_req, res) => {
  try {
    const events = await getEvents();
    return res.json(events);
  } catch (error) {
    console.error('Error in /api/events:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// 캠페인 목록
app.get('/api/campaigns', async (_req, res) => {
  try {
    const campaigns = await getCampaigns();
    return res.json(campaigns);
  } catch (error) {
    console.error('Error in /api/campaigns:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 캠페인 추첨
app.post('/api/campaigns/:id/draw', async (req, res) => {
  try {
    const { campaign, winner } = await drawWinner(req.params.id);
    return res.json({ campaign, winner });
  } catch (error) {
    console.error('Error in /api/campaigns/:id/draw:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 테스트용 루트 경로 (선택 사항)
app.get('/', (_req, res) => {
  res.send('Backend API is running.');
});

module.exports = app;
