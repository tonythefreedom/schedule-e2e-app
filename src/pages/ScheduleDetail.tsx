import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Schedule } from '../types';

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (location.state) {
      // 이전 상태(메시지, 일정)를 유지하며 채팅방으로 복귀
      navigate('/chat/agent', { state: location.state });
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    // 채팅방에서 넘겨준 일정 목록이 있으면 우선 사용 (네트워크 없이 즉시 표시)
    const fromState: Schedule[] | undefined = location.state?.schedules;
    const cached = fromState?.find((s) => s.id.toString() === id);
    if (cached) {
      setSchedule(cached);
      setIsLoading(false);
      return;
    }

    // 없으면 서버에서 ID로 실제 일정을 조회
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    fetch(`${baseUrl}/schedules/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('일정을 찾을 수 없습니다.');
        return res.json();
      })
      .then((data: Schedule) => setSchedule(data))
      .catch((err) => setError(err.message || '일정을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, [id, location.state]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button
        onClick={handleBack}
        className="mb-4 text-blue-500 hover:underline flex items-center"
      >
        ← 뒤로 가기
      </button>
      <div className="bg-white shadow rounded-lg p-6 border">
        <h1 className="text-2xl font-bold mb-4">일정 상세 정보</h1>

        {isLoading ? (
          <p className="text-gray-400">불러오는 중...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : schedule ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">제목</label>
              <p className="text-lg">{schedule.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">시간</label>
              <p>{schedule.date} {schedule.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">장소</label>
              <p>{schedule.location || '장소 없음'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">설명</label>
              <p className="text-gray-700">{schedule.content || '추가 설명이 없습니다.'}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ScheduleDetail;
