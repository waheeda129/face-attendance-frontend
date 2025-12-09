import React from 'react';
import { MonitorPlay, Users, FileBarChart, LayoutDashboard, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const widgets = [
    {
      id: 'live',
      title: 'Live Attendance',
      description: 'Real-time face recognition and automated logging via webcam.',
      icon: MonitorPlay,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', // Data/Security tech
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'students',
      title: 'Student Information',
      description: 'Manage profiles, biometrics, and academic details.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop', // Students group
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'reports',
      title: 'Reports & Logs',
      description: 'Export attendance history and generate analytics.',
      icon: FileBarChart,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop', // Analytics/Paperwork
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Visual statistics, charts, and system overview.',
      icon: LayoutDashboard,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', // Dashboard screen
      color: 'from-purple-600 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
          Welcome to <span className="text-indigo-600">FaceAttend Pro</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Smart, secure, and seamless attendance management for the modern university.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <div
              key={widget.id}
              onClick={() => onNavigate(widget.id)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={widget.image} 
                  alt={widget.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${widget.color} opacity-80 group-hover:opacity-75 transition-opacity`} />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div>
                  <div className="bg-white/20 w-fit p-3 rounded-xl backdrop-blur-sm mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{widget.title}</h3>
                  <p className="text-white/90 font-medium leading-relaxed max-w-sm">
                    {widget.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Access Module <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12 text-sm text-gray-400">
        System Status: <span className="text-green-500 font-medium">● Online</span> | v1.0.0
      </div>
    </div>
  );
};

export default Home;
