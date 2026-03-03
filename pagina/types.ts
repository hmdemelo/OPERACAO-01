
export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface StudyLog {
  id: string;
  studentId: string;
  date: string;
  hours: number;
  subject: string;
  content: string;
  questionsTotal: number;
  questionsCorrect: number;
}

export interface StudentStats {
  studentId: string;
  studentName: string;
  totalHours: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'milestone' | 'info';
  date: string;
  isRead: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
