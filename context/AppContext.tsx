import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Student, AttendanceRecord, AppSettings } from '../types';
import { MOCK_STUDENTS, MOCK_ATTENDANCE } from '../constants';
import { 
  fetchStudents, 
  fetchAttendance, 
  createStudent, 
  deleteStudent, 
  logAttendance, 
  fetchSettings, 
  saveSettings,
  getDefaultBaseUrl
} from '../api';

interface AppContextType {
  students: Student[];
  addStudent: (student: Student) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(getDefaultBaseUrl());
  const [settings, setSettings] = useState<AppSettings>({
    cameraDeviceId: '',
    minConfidenceThreshold: 85,
    apiUrl: getDefaultBaseUrl(),
    theme: 'light'
  });

  // On mount / base URL change, attempt to hydrate from backend.
  useEffect(() => {
    const loadData = async () => {
      try {
        const [remoteSettings, remoteStudents, remoteAttendance] = await Promise.all([
          fetchSettings(apiBaseUrl),
          fetchStudents(apiBaseUrl),
          fetchAttendance(apiBaseUrl)
        ]);

        if (remoteSettings) {
          const parsedSettings: AppSettings = {
            cameraDeviceId: remoteSettings.cameraDeviceId || '',
            minConfidenceThreshold: Number(remoteSettings.minConfidenceThreshold) || settings.minConfidenceThreshold,
            apiUrl: remoteSettings.apiUrl || settings.apiUrl,
            theme: (remoteSettings.theme as 'light' | 'dark') || settings.theme
          };
          setSettings(prev => ({
            ...prev,
            ...parsedSettings
          }));
          if (parsedSettings.apiUrl && parsedSettings.apiUrl !== apiBaseUrl) {
            setApiBaseUrl(parsedSettings.apiUrl);
          }
        }

        if (remoteStudents && remoteStudents.length) {
          setStudents(remoteStudents);
        }

        if (remoteAttendance && remoteAttendance.length) {
          setAttendance(remoteAttendance);
        }
      } catch (err) {
        console.warn('API fetch failed, leaving state empty.', err);
        setStudents([]);
        setAttendance([]);
      }
    };

    loadData();
  }, [apiBaseUrl]);

  const addStudent = async (student: Student) => {
    // Optimistic update for snappy UI; reconcile with server response if available.
    setStudents(prev => [student, ...prev]);
    try {
      const created = await createStudent(student, apiBaseUrl);
      setStudents(prev => [created, ...prev.filter(s => s.id !== student.id)]);
    } catch (err) {
      console.error('Failed to persist student to API, keeping local copy.', err);
    }
  };

  const removeStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      await deleteStudent(id, apiBaseUrl);
    } catch (err) {
      console.error('Failed to delete student on API. Consider refreshing.', err);
    }
  };

  const addAttendance = async (record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
    try {
      const saved = await logAttendance(record, apiBaseUrl);
      setAttendance(prev => [saved, ...prev.filter(r => r.id !== record.id)]);
    } catch (err) {
      console.error('Failed to persist attendance to API, kept local.', err);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.apiUrl && newSettings.apiUrl !== apiBaseUrl) {
      setApiBaseUrl(newSettings.apiUrl);
    }
    try {
      const saved = await saveSettings(newSettings, apiBaseUrl);
      setSettings(saved);
      if (saved.apiUrl && saved.apiUrl !== apiBaseUrl) {
        setApiBaseUrl(saved.apiUrl);
      }
    } catch (err) {
      console.error('Failed to persist settings. Local state only.', err);
    }
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
