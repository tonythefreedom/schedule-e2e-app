import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Chat } from '../types';

const DUMMY_CHATS: Chat[] = [
  {
    id: '1',
    name: '김철수',
    lastMessage: '오늘 점심 뭐 먹을래?',
    time: '오후 2:30',
    unreadCount: 2,
    avatar: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: '2',
    name: '이영희',
    lastMessage: '사진 보냈어 확인해봐!',
    time: '오전 11:20',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: '3',
    name: 'React 공부방',
    lastMessage: '다음 주 세미나 일정입니다.',
    time: '어제',
    avatar: 'https://i.pravatar.cc/150?u=3',
  },
];

const ChatList: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header title="채팅" />
      <div className="flex-1 overflow-y-auto">
        {DUMMY_CHATS.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-3 px-4 py-3 active:bg-background transition-colors border-b border-gray-50"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gray-200 overflow-hidden shrink-0">
              <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="font-semibold text-[16px] truncate">{chat.name}</h3>
                <span className="text-[12px] text-text-secondary">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[14px] text-text-secondary truncate">{chat.lastMessage}</p>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
