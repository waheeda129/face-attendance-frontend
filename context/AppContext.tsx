import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student, AttendanceRecord, AppSettings } from '../types';
import { MOCK_STUDENTS, MOCK_ATTENDANCE } from '../constants';

interface AppContextType {
  students: Student[];
  addStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [settings, setSettings] = useState<AppSettings>({
    cameraDeviceId: '',
    minConfidenceThreshold: 85,
    apiUrl: 'http://localhost:5000/api',
    theme: 'light'
  });

  const addStudent = (student: Student) => {
    setStudents(prev => [student, ...prev]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{
      students,
      addStudent,
      removeStudent,
      attendance,
      addAttendance,
      settings,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
