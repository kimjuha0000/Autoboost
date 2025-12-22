const fs = require('fs').promises;
const path = require('path');

// dataFilePath는 프로젝트 루트의 data/events.json을 가리킵니다.
// Netlify Functions 환경에서는 `process.cwd()`가 함수 코드 위치를 기준으로 하므로,
// Netlify Functions에서 이 모듈을 import할 때를 대비하여 경로를 잘 설정해야 합니다.
// 여기서는 `backend/src/data.js`에서 실행되는 것으로 가정하고,
// Netlify Function 래퍼가 이 모듈을 require할 때, 루트 기준으로 data 폴더를 찾아야 합니다.
const dataFilePath = path.resolve(process.cwd(), 'data', 'events.json');

// LogEntry 인터페이스 (타입스크립트가 아니므로 주석 처리 또는 제거 가능)
/*
export interface LogEntry {
  id: string;
  qrId: string;
  timestamp: string;
  ip: string | undefined;
  userAgent: string | undefined;
}
*/

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // 파일이 없으면 빈 배열 반환
    }
    console.error('Error reading data file:', error);
    throw error; // 다른 에러는 다시 던짐
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

async function getEvents() {
  return await readData();
}

async function addEvent(qrId, ip, userAgent) {
  const events = await readData();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 어뷰징 방지 체크: 동일 IP, 동일 QR ID, 24시간 이내
  const hasRecentEvent = events.some(event => 
    event.ip === ip && 
    event.qrId === qrId &&
    new Date(event.timestamp) > twentyFourHoursAgo
  );

  if (hasRecentEvent) {
    console.log(`Duplicate event blocked for IP: ${ip} and QR ID: ${qrId}`);
    return; // 이벤트 추가 차단
  }

  const newEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 고유 ID 생성
    qrId,
    timestamp: now.toISOString(),
    ip,
    userAgent,
  };
  events.unshift(newEntry); // 배열 맨 앞에 추가
  await writeData(events);
}

module.exports = {
  getEvents,
  addEvent,
};
