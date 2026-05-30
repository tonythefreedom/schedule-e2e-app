import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import ScheduleDetail from './pages/ScheduleDetail';
import WeeklyCalendar from './components/WeeklyCalendar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<ChatListPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/schedule/:id" element={<ScheduleDetail />} />
          <Route path="/calendar" element={<WeeklyCalendar schedules={[]} onDateClick={() => {}} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
