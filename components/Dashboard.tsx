import React, { useMemo } from 'react';
import { Users, UserCheck, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

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
  const { students, attendance } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { presentToday, lateToday, chartData, avgRate, deptPerformance } = useMemo(() => {
    const byDate: Record<string, { present: number; late: number }> = {};
    const deptCounts: Record<string, { present: number; total: number }> = {};
    let presentTodayCount = 0;
    let lateTodayCount = 0;

    attendance.forEach((record) => {
      const dateKey = record.timestamp.split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = { present: 0, late: 0 };
      if (record.status === 'Present') {
        byDate[dateKey].present += 1;
      } else if (record.status === 'Late') {
        byDate[dateKey].late += 1;
      }

      if (dateKey === todayStr) {
        if (record.status === 'Present') presentTodayCount += 1;
        if (record.status === 'Late') lateTodayCount += 1;
      }

      const student = students.find((s) => s.id === record.studentId);
      if (student) {
        const key = student.department || 'General';
        if (!deptCounts[key]) deptCounts[key] = { present: 0, total: 0 };
        deptCounts[key].present += record.status === 'Present' ? 1 : 0;
      }
    });

    students.forEach((s) => {
      const key = s.department || 'General';
      if (!deptCounts[key]) deptCounts[key] = { present: 0, total: 0 };
      deptCounts[key].total += 1;
    });

    // Last 7 days chart
    const days = Array.from({ length: 7 })
      .map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - idx));
        return d;
      })
      .map((d) => {
        const key = d.toISOString().split('T')[0];
        const day = d.toLocaleDateString(undefined, { weekday: 'short' });
        const entry = byDate[key] || { present: 0, late: 0 };
        const totalDay = entry.present + entry.late;
        const absent = Math.max(students.length - totalDay, 0);
        return { name: day, present: entry.present, absent };
      });

    const attendanceRate =
      students.length > 0 ? Math.round((presentTodayCount / students.length) * 100) : 0;

    const deptPerf = Object.entries(deptCounts).map(([label, data]) => ({
      label,
      value: data.total ? Math.round((data.present / data.total) * 100) : 0,
    }));

    return {
      presentToday: presentTodayCount,
      lateToday: lateTodayCount,
      chartData: days,
      avgRate: attendanceRate,
      deptPerformance: deptPerf,
    };
  }, [attendance, students, todayStr]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Live data from backend</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={students.length} 
          icon={Users} 
          color="bg-blue-500"
          trend={students.length > 0 ? 2.5 : 0}
        />
        <StatCard 
          title="Present Today" 
          value={presentToday} 
          icon={UserCheck} 
          color="bg-green-500"
          trend={presentToday >= 0 ? 0 : 0}
        />
        <StatCard 
          title="Late Arrivals" 
          value={lateToday} 
          icon={Clock} 
          color="bg-yellow-500"
          trend={lateToday}
        />
        <StatCard 
          title="Avg Attendance" 
          value={`${avgRate}%`} 
          icon={Activity} 
          color="bg-indigo-500"
          trend={avgRate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            {deptPerformance.map((dept) => (
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
            {deptPerformance.length === 0 && (
              <p className="text-sm text-gray-500">No data yet. Add students and attendance to see performance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
