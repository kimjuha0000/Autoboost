// src/components/EventTable.tsx

// LogEntry 타입을 정의합니다. 백엔드의 데이터 구조와 일치해야 합니다.
export interface LogEntry {
  id: string;
  qrId: string;
  timestamp: string;
  ip: string | undefined;
  userAgent: string | undefined;
}

interface EventTableProps {
  events: LogEntry[];
}

export default function EventTable({ events }: EventTableProps) {
  if (events.length === 0) {
    return <p className="text-center text-gray-500">아직 스캔 기록이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              QR ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              스캔 시간
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP 주소
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              기기 정보
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.qrId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(event.timestamp).toLocaleString('ko-KR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ip}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                {event.userAgent}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
