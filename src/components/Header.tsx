import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  avatar?: string;
  onClearHistory?: () => void;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, avatar, onClearHistory, onBack }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-[44px] px-4 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => (onBack ? onBack() : navigate(-1))} className="-ml-1 text-primary">
            <ChevronLeft size={28} />
          </button>
        )}
        <div className="flex items-center gap-2">
          {avatar && (
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img src={avatar} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-[17px] font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="relative" ref={menuRef}>
        <button className="text-primary" onClick={() => setShowMenu(!showMenu)}>
          <MoreHorizontal size={24} />
        </button>
        {showMenu && onClearHistory && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
            <button
              onClick={() => {
                onClearHistory();
                setShowMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              대화 내용 지우기
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
