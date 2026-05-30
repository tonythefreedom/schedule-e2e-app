import React, { useState } from 'react';
import { Plus, SendHorizontal } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-border p-2 safe-area-bottom">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button type="button" className="text-primary p-1">
          <Plus size={24} />
        </button>
        <div className="flex-1 bg-white border border-border rounded-[20px] px-3 py-1 flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="메시지"
            className="flex-1 bg-transparent border-none outline-none text-[15px] py-1 placeholder:text-text-secondary"
          />
        </div>
        <button 
          type="submit" 
          disabled={!text.trim()} 
          className="text-primary disabled:opacity-50 p-1"
        >
          <SendHorizontal size={24} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
