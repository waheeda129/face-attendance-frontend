// Lightweight API client for the FaceAttend backend.
// Uses fetch with JSON helpers and falls back to caller-provided handling on failure.
import { AttendanceRecord, Student, AppSettings } from './types';

const defaultBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const toJson = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

const request = async <T>(path: string, options: RequestInit = {}, baseUrl = defaultBaseUrl): Promise<T> => {
  const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  return toJson(res);
};

export const fetchStudents = (baseUrl?: string) => request<Student[]>('students', { method: 'GET' }, baseUrl);

export const createStudent = (student: Student, baseUrl?: string) =>
  request<Student>('students', { method: 'POST', body: JSON.stringify(student) }, baseUrl);

export const deleteStudent = (id: string, baseUrl?: string) =>
  request<{ success: boolean }>(`students/${id}`, { method: 'DELETE' }, baseUrl);

export const fetchAttendance = (baseUrl?: string) => request<AttendanceRecord[]>('attendance', { method: 'GET' }, baseUrl);

export const logAttendance = (record: AttendanceRecord, baseUrl?: string) =>
  request<AttendanceRecord>('attendance', { method: 'POST', body: JSON.stringify(record) }, baseUrl);

export const fetchSettings = (baseUrl?: string) => request<AppSettings>('settings', { method: 'GET' }, baseUrl);

export const saveSettings = (settings: AppSettings, baseUrl?: string) =>
  request<AppSettings>('settings', { method: 'PUT', body: JSON.stringify(settings) }, baseUrl);

export const getDefaultBaseUrl = () => defaultBaseUrl;
