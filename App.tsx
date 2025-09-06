import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Header from './components/Header';
import BookingDashboard from './components/BookingDashboard';
import RoomManagement from './components/RoomManagement';
import Settings from './components/Settings';
import Notification from './components/Notification';
import CalendarPage from './components/CalendarPage';
import ProfilePage from './components/ProfilePage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated, notification, language } = useApp();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {notification && <Notification />}
        <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <BookingDashboard />}
            {activeTab === 'calendar' && <CalendarPage />}
            {(activeTab === 'profile' || activeTab === 'my-bookings') && <ProfilePage activeTab={activeTab} />}
            {activeTab === 'rooms' && <RoomManagement />}
            {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
};

export default App;