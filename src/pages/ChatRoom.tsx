import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { Message } from '../types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: '안녕하세요!',
    sender: 'other',
    timestamp: '오후 2:00',
  },
  {
    id: '2',
    text: '네 안녕하세요! 사진 잘 받았습니다.',
    sender: 'me',
    timestamp: '오후 2:01',
  },
  {
    id: '3',
    text: '네 다행이네요. 다음에 또 연락 드릴게요!',
    sender: 'other',
    timestamp: '오후 2:02',
  },
];

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
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
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        title={`채팅방 ${id}`} 
        showBack 
        avatar={`https://i.pravatar.cc/150?u=${id}`} 
      />
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
