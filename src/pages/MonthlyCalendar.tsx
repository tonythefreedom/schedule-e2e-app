import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { Schedule } from '../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');
const toDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const MonthlyCalendar: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selected, setSelected] = useState<string>(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    fetch(`${baseUrl}/schedules`)
      .then((res) => res.json())
      .then((data: Schedule[]) => setSchedules(data))
      .catch((err) => console.error(err));
  }, []);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 그리드 셀: 앞쪽 빈칸 + 1..말일
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // 주(week) 단위로 분할해 각 행을 균등 높이로 펼친다 (마지막 주는 null로 패딩)
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const schedulesOn = (dateStr: string) =>
    schedules
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedSchedules = schedulesOn(selected);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header title="캘린더" showBack onBack={() => navigate('/')} />

      {/* 좌: 캘린더 / 우: 선택 날짜 일정 리스트. 본문이 브라우저 높이를 가득 채운다. */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 좌측: 캘린더 (주별 행이 균등 높이로 펼쳐져 영역을 가득 채움) */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <button onClick={prevMonth} data-testid="prev-month" className="p-2 text-primary">
              <ChevronLeft size={22} />
            </button>
            <h2 data-testid="calendar-title" className="text-lg font-bold text-gray-800">
              {year}년 {month + 1}월
            </h2>
            <button onClick={nextMonth} data-testid="next-month" className="p-2 text-primary">
              <ChevronRight size={22} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1.5 shrink-0">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-[13px] font-medium py-1 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 그리드: 각 주 행을 flex-1로 균등 분배해 높이를 최대화 */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1.5 flex-1 min-h-0">
                {week.map((d, dIdx) => {
                  if (d === null) return <div key={`empty-${wIdx}-${dIdx}`} />;
                  const dateStr = toDateStr(year, month, d);
                  const daySchedules = schedulesOn(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selected;
                  return (
                    <button
                      key={dateStr}
                      data-testid={`day-${dateStr}`}
                      onClick={() => setSelected(dateStr)}
                      className={`h-full rounded-lg p-1.5 flex flex-col items-stretch text-left transition-colors overflow-hidden ${
                        isSelected
                          ? 'bg-primary/10 ring-1 ring-primary'
                          : isToday
                          ? 'bg-primary/5'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span
                        className={`text-[14px] text-center shrink-0 ${
                          isToday || isSelected ? 'text-primary font-bold' : 'text-gray-600'
                        }`}
                      >
                        {d}
                      </span>
                      {/* 일정 제목 리스트 (넘치면 내부에서 잘림) */}
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {daySchedules.map((s) => (
                          <div
                            key={s.id}
                            title={s.title}
                            className="text-[11px] leading-tight px-1.5 py-0.5 rounded bg-primary/15 text-primary truncate"
                          >
                            {s.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 선택 날짜의 모든 일정 리스트 */}
        <aside className="w-80 shrink-0 border-l border-gray-200 flex flex-col min-h-0 bg-white/40">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-bold text-gray-800">{selected}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">일정 {selectedSchedules.length}건</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedSchedules.length > 0 ? (
              <div className="space-y-2" data-testid="selected-schedules">
                {selectedSchedules.map((s) => (
                  <div
                    key={s.id}
                    data-testid={`schedule-item-${s.id}`}
                    onClick={() => navigate(`/schedule/${s.id}`)}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{s.title}</span>
                      <span className="text-xs text-primary shrink-0 ml-2">{s.time}</span>
                    </div>
                    {s.location && (
                      <div className="text-[11px] text-gray-500 mt-1">📍 {s.location}</div>
                    )}
                    {s.content && (
                      <div className="text-[11px] text-gray-400 mt-1 line-clamp-3">{s.content}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-300 italic">선택한 날짜에 일정이 없습니다.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
