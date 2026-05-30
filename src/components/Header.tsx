import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  avatar?: string;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, avatar }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-[44px] px-4 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="-ml-1 text-primary">
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
      <button className="text-primary">
        <MoreHorizontal size={24} />
      </button>
    </header>
  );
};

export default Header;
