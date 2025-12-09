import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LiveAttendance from './components/LiveAttendance';
import StudentRegistry from './components/StudentRegistry';
import Reports from './components/Reports';
import Home from './components/Home';
import Settings from './components/Settings';
import { AppProvider } from './context/AppContext';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <Home onNavigate={setCurrentView} />;
      case 'dashboard': return <Dashboard />;
      case 'live': return <LiveAttendance />;
      case 'students': return <StudentRegistry />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-gray-500">
          <p>© 2024 FaceAttend Pro System. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => setCurrentView('home')} className="hover:text-gray-900">Privacy Policy</button>
            <button onClick={() => setCurrentView('home')} className="hover:text-gray-900">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
