import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { Message, Schedule } from '../types';

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 복원: location.state에서 메시지와 일정을 불러옴 (상세 페이지에서 뒤로가기 시 복원)
  const getInitialMessages = () => {
    if (location.state?.messages) return location.state.messages;
    return [];
  };

  const getInitialSchedules = () => {
    if (location.state?.schedules) return location.state.schedules;
    return [];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [schedules, setSchedules] = useState<Schedule[]>(getInitialSchedules);
  const [lastSchedules, setLastSchedules] = useState<Schedule[]>(getInitialSchedules);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAgent = id === 'agent';

  useEffect(() => {
    if (isAgent) {
      // 컴포넌트 마운트 시 항상 DB에서 최신 일정을 로드하여 동기화
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      fetch(`${baseUrl}/schedules`)
        .then(res => res.json())
        .then(data => {
          setSchedules(data);
          setLastSchedules(data);
          setMessages(prev => prev.map(msg => 
            msg.type === 'calendar' ? { ...msg, schedules: data } : msg
          ));
        })
        .catch(err => console.error(err));

      // 저장된 메시지가 없을 때만 초기 환영 메시지 로드
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          text: '안녕하세요! 일정 관리를 도와드리는 AI 에이전트입니다. "오늘 저녁 7시에 강남역에서 약속 잡아줘"와 같이 말씀해보세요.',
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
          type: 'text'
        }]);
      }
    }
  }, [id, isAgent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    if (isAgent) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        const response = await fetch(`${baseUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        console.log('API response data:', data);

        if (data.type === 'schedule_created' || data.type === 'view_calendar' || data.type === 'schedule_list' || data.type === 'calendar' || data.type === 'duplicate' || data.weeklySchedules) {
          const updatedSchedules = data.weeklySchedules || schedules;
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.message || (data.type === 'text' ? '' : '일정 정보를 불러왔습니다.'),
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
            type: 'calendar',
            schedules: updatedSchedules
          };
          
          setMessages(prev => {
            const updatedPrev = prev.map(msg => 
              msg.type === 'calendar' ? { ...msg, schedules: updatedSchedules } : msg
            );
            return [...updatedPrev, agentMessage];
          });
          
          if (data.weeklySchedules) {
            setSchedules(data.weeklySchedules);
            setLastSchedules(data.weeklySchedules);
          }
        } else {
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.message || '요청을 이해하지 못했습니다.',
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
            type: 'text'
          };
          setMessages(prev => [...prev, agentMessage]);
        }
      } catch (error) {
        console.error(error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleDateClick = (scheduleId: string) => {
    // 상세 페이지로 이동할 때 현재 상태를 state에 담아 보냅니다.
    navigate(`/schedule/${scheduleId}`, { 
      state: { 
        messages, 
        schedules 
      } 
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('대화 내용을 모두 지우시겠습니까?')) {
      const initialMessage: Message = {
        id: 'welcome',
        text: '안녕하세요! 일정 관리를 도와드리는 AI 에이전트입니다. "오늘 저녁 7시에 강남역에서 약속 잡아줘"와 같이 말씀해보세요.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'text'
      };
      setMessages([initialMessage]);
      navigate(location.pathname, { replace: true, state: { messages: [initialMessage], schedules } });
    }
  };

  const lastCalendarId = [...messages].reverse().find(m => m.type === 'calendar')?.id;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        title={isAgent ? "일정관리 에이전트" : `채팅방 ${id}`} 
        showBack 
        avatar={isAgent ? 'https://api.dicebear.com/7.x/bottts/svg?seed=agent' : `https://i.pravatar.cc/150?u=${id}`} 
        onClearHistory={isAgent ? handleClearHistory : undefined}
      />
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col"
      >
        {messages.map((msg) => {
          console.log('Rendering message:', msg);
          return (
            <div key={msg.id}>
              <ChatBubble message={msg} />
              {msg.type === 'calendar' && (
                <div className="ml-12 mt-2 mb-4">
                  <WeeklyCalendar 
                    schedules={msg.id === lastCalendarId ? lastSchedules : (msg.schedules || [])} 
                    onDateClick={handleDateClick} 
                  />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
