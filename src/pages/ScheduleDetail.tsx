import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.state) {
      // 이전 상태(메시지, 일정)를 유지하며 채팅방으로 복귀
      navigate('/chat/agent', { state: location.state });
    } else {
      navigate(-1);
    }
  };

  // 실제 환경에서는 ID를 이용해 서버에서 데이터를 가져와야 합니다.
  const dummySchedule = {
    id,
    title: '샘플 일정',
    start: '2024-05-20T10:00:00',
    end: '2024-05-20T11:00:00',
    description: '상세 일정 설명입니다. 이 일정은 테스트용 더미 데이터입니다.',
    location: '회의실 A'
  };

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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">제목</label>
            <p className="text-lg">{dummySchedule.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">시간</label>
            <p>{new Date(dummySchedule.start).toLocaleString()} - {new Date(dummySchedule.end).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">장소</label>
            <p>{dummySchedule.location}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">설명</label>
            <p className="text-gray-700">{dummySchedule.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
