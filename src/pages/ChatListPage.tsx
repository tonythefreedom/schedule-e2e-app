import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Chat } from '../types';

const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const chats: Chat[] = [
    {
      id: 'agent',
      name: '일정관리 에이전트',
      lastMessage: '일정 관리를 도와드릴까요?',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=agent',
      timestamp: '오전 10:00',
      isAgent: true
    },
    {
      id: '1',
      name: '김철수',
      lastMessage: '네, 알겠습니다.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      timestamp: '오후 2:30',
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header title="채팅" />
      <main className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => chat.id === 'agent' && navigate('/chat/agent')}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <img 
                  src={chat.avatar} 
                  alt={chat.name} 
                  className="w-12 h-12 rounded-full border border-gray-100"
                />
                {chat.isAgent && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] px-1 rounded-sm font-bold border border-white">
                    AI
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">{chat.name}</h3>
                  <span className="text-xs text-gray-400">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ChatListPage;
