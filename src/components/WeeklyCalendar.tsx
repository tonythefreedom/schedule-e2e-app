import React from 'react';
import { Schedule } from '../types';

interface CalendarProps {
  schedules: Schedule[];
  onDateClick: (date: string) => void;
}

export const WeeklyCalendar: React.FC<CalendarProps> = ({ schedules, onDateClick }) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm my-2 border border-gray-100 w-full max-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
          주간 일정 브리핑
        </h3>
        <span className="text-[10px] text-gray-400">이번 주</span>
      </div>
      
      <div className="space-y-3">
        {weekDays.map((dateStr) => {
          const daySchedules = schedules.filter(s => s.date === dateStr);
          const date = new Date(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];
          const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

          if (daySchedules.length === 0 && !isToday) return null;

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
                      onClick={() => onDateClick(dateStr)}
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
        onClick={() => onDateClick(today.toISOString().split('T')[0])}
        className="w-full mt-4 py-2 text-[11px] text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
      >
        전체 캘린더 보기
      </button>
    </div>
  );
};
