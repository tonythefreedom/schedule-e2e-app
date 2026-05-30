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
    <div className="bg-white rounded-lg p-4 shadow-md my-2 border border-gray-200">
      <h3 className="text-sm font-bold mb-3 text-primary">주간 일정</h3>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((dateStr) => {
          const daySchedules = schedules.filter(s => s.date === dateStr);
          const date = new Date(dateStr);
          const isToday = dateStr === today.toISOString().split('T')[0];

          return (
            <div 
              key={dateStr} 
              onClick={() => daySchedules.length > 0 && onDateClick(dateStr)}
              className={`text-center p-1 rounded cursor-pointer transition-colors ${isToday ? 'bg-primary/10' : 'hover:bg-gray-100'}`}
            >
              <div className="text-[10px] text-gray-500">{['일','월','화','수','목','금','토'][date.getDay()]}</div>
              <div className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : 'text-gray-700'}`}>{date.getDate()}</div>
              <div className="flex justify-center mt-1">
                {daySchedules.length > 0 && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
