import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MousePointerClick, Star, Trophy, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParticipantRow } from "@/types/dashboard";

interface ParticipantsTableProps {
  participants?: ParticipantRow[];
  loading?: boolean;
}

export function ParticipantsTable({ participants = [], loading }: ParticipantsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterWinner, setFilterWinner] = useState<"all" | "winner" | "notWinner">("all");
  const itemsPerPage = 5;

  const filteredParticipants = participants
    .filter((p) => {
      const matchesSearch = p.name.includes(searchQuery) || p.phone.includes(searchQuery);
      const matchesFilter =
        filterWinner === "all" ||
        (filterWinner === "winner" && p.isWinner) ||
        (filterWinner === "notWinner" && !p.isWinner);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / itemsPerPage));
  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalStats = {
    participants: participants.length,
    winners: participants.filter((p) => p.isWinner).length,
    totalClicks: participants.reduce((sum, p) => sum + p.couponClicks, 0),
    totalReviews: participants.reduce((sum, p) => sum + p.reviews, 0),
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">참여자 현황</h3>
          <p className="text-sm text-muted-foreground">이벤트 참여자 및 당첨자 관리</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all font-medium">
          <Download className="w-5 h-5" />
          내보내기
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalStats.participants}</p>
          <p className="text-sm text-muted-foreground">총 참여자</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{totalStats.winners}</p>
          <p className="text-sm text-muted-foreground">당첨자</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{totalStats.totalClicks}</p>
          <p className="text-sm text-muted-foreground">총 쿠폰 클릭</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">{totalStats.totalReviews}</p>
          <p className="text-sm text-muted-foreground">총 리뷰</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="이름 또는 전화번호 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: "all", label: "전체" },
            { id: "winner", label: "당첨자" },
            { id: "notWinner", label: "미당첨" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterWinner(f.id as typeof filterWinner)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filterWinner === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">순위</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">참여자</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">포인트</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">쿠폰 클릭</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">리뷰</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">당첨</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">마지막 활동</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            )}
            {!loading && paginatedParticipants.map((participant, index) => {
              const rank = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr
                  key={participant.id}
                  className="border-t border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        rank === 1 && "bg-warning/20 text-warning",
                        rank === 2 && "bg-muted text-muted-foreground",
                        rank === 3 && "bg-warning/10 text-warning/70",
                        rank > 3 && "bg-secondary text-muted-foreground"
                      )}
                    >
                      {rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-border">
                        <AvatarImage src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.id}`} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-primary">{participant.totalPoints.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick className="w-4 h-4 text-success" />
                      <span>{participant.couponClicks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-accent" />
                      <span>{participant.reviews}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {participant.isWinner ? (
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4 text-warning" />
                        <span className="font-medium text-warning">{participant.winCount}회</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {participant.lastActivity}
                  </td>
                </tr>
              );
            })}
            {!loading && paginatedParticipants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                  표시할 참여자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {filteredParticipants.length}명 중 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredParticipants.length)}명 표시
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
