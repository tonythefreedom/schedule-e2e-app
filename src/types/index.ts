export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other' | 'agent';
  timestamp: string;
  type?: 'text' | 'calendar';
  schedules?: Schedule[];
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  timestamp: string;
  isAgent?: boolean;
}

export interface Schedule {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  content: string;
}
