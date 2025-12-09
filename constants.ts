import { Student, AttendanceRecord } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    studentId: 'CS-2024-001',
    department: 'Computer Science',
    email: 'alice.j@uni.edu',
    photoUrl: 'https://picsum.photos/200/200?random=1',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    studentId: 'ENG-2024-042',
    department: 'Engineering',
    email: 'bob.s@uni.edu',
    photoUrl: 'https://picsum.photos/200/200?random=2',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    studentId: 'ART-2024-103',
    department: 'Arts & Humanities',
    email: 'charlie.b@uni.edu',
    photoUrl: 'https://picsum.photos/200/200?random=3',
    status: 'Inactive',
  },
  {
    id: '4',
    name: 'Diana Prince',
    studentId: 'CS-2024-004',
    department: 'Computer Science',
    email: 'diana.p@uni.edu',
    photoUrl: 'https://picsum.photos/200/200?random=4',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Evan Wright',
    studentId: 'PHY-2024-088',
    department: 'Physics',
    email: 'evan.w@uni.edu',
    photoUrl: 'https://picsum.photos/200/200?random=5',
    status: 'Active',
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'a1',
    studentId: '1',
    studentName: 'Alice Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: 'Present',
    confidence: 98.5,
  },
  {
    id: 'a2',
    studentId: '2',
    studentName: 'Bob Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    status: 'Late',
    confidence: 92.1,
  },
  {
    id: 'a3',
    studentId: '4',
    studentName: 'Diana Prince',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    status: 'Present',
    confidence: 99.0,
  },
];

export const CHART_DATA = [
  { name: 'Mon', present: 40, absent: 10 },
  { name: 'Tue', present: 45, absent: 5 },
  { name: 'Wed', present: 38, absent: 12 },
  { name: 'Thu', present: 48, absent: 2 },
  { name: 'Fri', present: 42, absent: 8 },
];
