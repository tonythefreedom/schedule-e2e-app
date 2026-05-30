import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { Message, Schedule } from '../types';

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAgent = id === 'agent';

  useEffect(() => {
    if (isAgent) {
      fetch('http://127.0.0.1:3001/api/schedules')
        .then(res => res.json())
        .then(data => setSchedules(data))
        .catch(err => console.error(err));
      
      setMessages([{
        id: 'welcome',
        text: '안녕하세요! 일정 관리를 도와드리는 AI 에이전트입니다. "오늘 저녁 7시에 강남역에서 약속 잡아줘"와 같이 말씀해보세요.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'text'
      }]);
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

    if (isAgent) {
      try {
        const response = await fetch('http://127.0.0.1:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        if (data.type === 'schedule_created' || data.type === 'view_calendar') {
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.message,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }),
            type: 'calendar',
            schedules: data.weeklySchedules
          };
          setMessages(prev => [...prev, agentMessage]);
          if (data.weeklySchedules) setSchedules(data.weeklySchedules);
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
      }
    }
  };

  const handleDateClick = (date: string, msgSchedules: Schedule[]) => {
    const daySchedule = msgSchedules.find(s => s.date === date);
    if (daySchedule) {
      navigate(`/schedule/${daySchedule.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        title={isAgent ? "일정관리 에이전트" : `채팅방 ${id}`} 
        showBack 
        avatar={isAgent ? 'https://api.dicebear.com/7.x/bottts/svg?seed=agent' : `https://i.pravatar.cc/150?u=${id}`} 
      />
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatBubble message={msg} />
            {msg.type === 'calendar' && msg.schedules && (
              <div className="ml-12 mt-2 mb-4">
                <WeeklyCalendar 
                  schedules={msg.schedules} 
                  onDateClick={(date) => handleDateClick(date, msg.schedules!)} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
