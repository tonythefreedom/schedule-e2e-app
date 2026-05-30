import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import ScheduleDetail from './pages/ScheduleDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatListPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/schedule/:id" element={<ScheduleDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
