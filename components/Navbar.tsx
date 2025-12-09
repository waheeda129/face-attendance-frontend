import React from 'react';
import { LogOut, Home, Settings } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                FA
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">FaceAttend Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className={`p-2 rounded-md transition-colors ${
                currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onNavigate('settings')}
              className={`p-2 rounded-md transition-colors ${
                currentView === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">University Admin</p>
              </div>
              <button 
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
