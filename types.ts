import React from 'react';

export interface Student {
  id: string;
  name: string;
  studentId: string;
  department: string;
  email: string;
  photoUrl: string;
  status: 'Active' | 'Inactive';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  status: 'Present' | 'Late' | 'Absent';
  confidence: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  image?: string;
}

export interface Stats {
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
}

export interface AppSettings {
  cameraDeviceId: string;
  minConfidenceThreshold: number;
  apiUrl: string;
  theme: 'light' | 'dark';
}