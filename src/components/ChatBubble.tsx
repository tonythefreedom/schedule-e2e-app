import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';

  const avatarUrl = isAgent 
    ? 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex flex-col items-start">
          <div className="text-[10px] text-gray-500 mb-1 ml-10">{isAgent ? '일정관리 에이전트' : '상대방'}</div>
          <div className="flex">
            <div className="w-8 h-8 rounded-full bg-gray-100 mr-2 flex-shrink-0 border border-gray-200">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full rounded-full"
              />
            </div>
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}
      {isUser && (
        <div className="flex flex-col items-end">
          <div
            className="max-w-[80%] p-3 rounded-2xl bg-primary text-white rounded-tr-none"
          >
            <p className="text-sm">{message.text}</p>
            <span className="text-[10px] opacity-70 mt-1 block">
              {message.timestamp}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
