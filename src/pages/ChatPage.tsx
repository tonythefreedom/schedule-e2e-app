import React, { useState, useEffect } from 'react';
import { Message, Chat, Schedule } from '../types';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const navigate = useNavigate();

  const agentProfile = {
    id: 'agent',
    name: '일정관리 에이전트',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=agent',
    isAgent: true
  };

  useEffect(() => {
    // Load initial schedules
    fetch('http://localhost:3001/api/schedules')
      .then(res => res.json())
      .then(data => setSchedules(data))
      .catch(err => console.error(err));
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      const data = await response.json();

      if (data.type === 'schedule_created') {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'calendar',
          schedules: data.weeklySchedules
        };
        setMessages(prev => [...prev, agentMessage]);
        setSchedules(data.weeklySchedules);
      } else {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message || '요청을 이해하지 못했습니다.',
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error(error);
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
      <Header title="일정관리 에이전트" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatBubble message={msg} />
            {msg.type === 'calendar' && msg.schedules && (
              <div className="ml-12 mt-2">
                <WeeklyCalendar 
                  schedules={msg.schedules} 
                  onDateClick={(date) => handleDateClick(date, msg.schedules!)} 
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="'{} 일정을 만들어줘' 라고 입력해보세요"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
