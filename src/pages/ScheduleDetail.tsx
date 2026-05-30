import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Schedule } from '../types';

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/schedules/${id}`)
      .then(res => res.json())
      .then(data => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (!schedule) return <div className="p-4">일정을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="0 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">일정 상세</h1>
      </header>

      <main className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="mb-6">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">제목</label>
            <h2 className="text-xl font-bold text-gray-800 mt-1">{schedule.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">날짜</label>
              <p className="text-gray-700 font-medium mt-1">{schedule.date}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">시간</label>
              <p className="text-gray-700 font-medium mt-1">{schedule.time}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">장소</label>
            <p className="text-gray-700 mt-1">{schedule.location || '정보 없음'}</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">내용</label>
            <p className="text-gray-700 mt-1 whitespace-pre-wrap">{schedule.content || '정보 없음'}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleDetail;
