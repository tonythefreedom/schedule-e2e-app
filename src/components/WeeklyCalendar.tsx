import React from 'react';
import { Schedule } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onDateClick: (date: string) => void;
  onViewAll?: () => void;
}

const WeeklyCalendar: React.FC<CalendarProps> = ({ schedules, onDateClick, onViewAll }) => {
  console.log('WeeklyCalendar rendering with schedules:', schedules);
  const today = new Date();

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(today);

  // 날짜 문자열을 Date 객체로 안전하게 변환하는 함수 (로컬 시간 기준)
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // 다가오는 일정 브리핑: 오늘부터 7일간의 날짜 배열 생성
  // (주 단위로 고정하면 토요일에 등록한 '내일' 일정이 다음 주로 넘어가 누락된다)
  const displayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return getLocalDateString(d);
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm my-2 border border-gray-100 w-full max-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
          일정 브리핑
        </h3>
        <span className="text-[10px] text-gray-400">요약</span>
      </div>
      
      <div className="space-y-3">
        {displayDates.map((dateStr) => {
          const daySchedules = schedules.filter(s => s.date === dateStr);
          const date = parseDate(dateStr);
          const isToday = dateStr === todayStr;
          const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

          return (
            <div 
              key={dateStr}
              className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${isToday ? 'bg-primary/5 border border-primary/10' : ''}`}
            >
              <div className="flex flex-col items-center min-w-[32px]">
                <span className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>{dayName}</span>
                <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-gray-700'}`}>{date.getDate()}</span>
              </div>
              
              <div className="flex-1 space-y-1">
                {daySchedules.length > 0 ? (
                  daySchedules.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onDateClick(s.id.toString())}
                      className="group cursor-pointer"
                    >
                      <div className="text-xs font-medium text-gray-800 group-hover:text-primary transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span>{s.time}</span>
                        {s.location && <span className="truncate max-w-[100px]">| {s.location}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-300 italic py-1">일정 없음</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <button
        onClick={() => (onViewAll ? onViewAll() : onDateClick(getLocalDateString(today)))}
        className="w-full mt-4 py-2 text-[11px] text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
      >
        전체 캘린더 보기
      </button>
    </div>
  );
};

export default WeeklyCalendar;
