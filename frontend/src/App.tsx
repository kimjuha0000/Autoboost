import { useState, useEffect } from 'react';
import EventTable, { LogEntry } from './components/EventTable';

function App() {
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // The /api/events endpoint is provided by our Netlify Function
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        const data: LogEntry[] = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means this runs once on component mount

  const totalScans = events.length;
  const monthlyScans = events.filter(e => new Date(e.timestamp).getMonth() === new Date().getMonth()).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            사장님 대시보드 (React)
          </h1>
        </div>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* KPI Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">실시간 KPI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-600">총 QR 스캔 수</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : totalScans}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-600">이번 달 스캔 수</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : monthlyScans}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-600">예상 리워드 비용</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">₩ N/A</p>
              </div>
            </div>
          </div>
          
          {/* Event Log Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">QR 스캔 기록</h3>
            {loading && <p>데이터를 불러오는 중...</p>}
            {error && <p className="text-red-500">오류: {error}</p>}
            {!loading && !error && <EventTable events={events} />}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;