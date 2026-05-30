import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import ChatRoom from './pages/ChatRoom';
import ScheduleDetail from './pages/ScheduleDetail';
import MonthlyCalendar from './pages/MonthlyCalendar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<ChatListPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
          <Route path="/schedule/:id" element={<ScheduleDetail />} />
          <Route path="/calendar" element={<MonthlyCalendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
