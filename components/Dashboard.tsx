import React from 'react';
import { Users, UserCheck, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_DATA } from '../constants';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend >= 0 ? '+' : ''}{trend}% from yesterday
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: Just now</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value="1,248" 
          icon={Users} 
          color="bg-blue-500"
          trend={2.5}
        />
        <StatCard 
          title="Present Today" 
          value="1,102" 
          icon={UserCheck} 
          color="bg-green-500"
          trend={4.2}
        />
        <StatCard 
          title="Late Arrivals" 
          value="45" 
          icon={Clock} 
          color="bg-yellow-500"
          trend={-1.5}
        />
        <StatCard 
          title="Avg Attendance" 
          value="92%" 
          icon={Activity} 
          color="bg-indigo-500"
          trend={0.8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-4">
            {[
              { label: 'Computer Science', value: 96, color: 'bg-green-500' },
              { label: 'Engineering', value: 88, color: 'bg-blue-500' },
              { label: 'Physics', value: 92, color: 'bg-indigo-500' },
              { label: 'Arts', value: 85, color: 'bg-yellow-500' },
              { label: 'Business', value: 90, color: 'bg-purple-500' },
            ].map((dept) => (
              <div key={dept.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{dept.label}</span>
                  <span className="text-gray-500">{dept.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dept.color}`} 
                    style={{ width: `${dept.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
