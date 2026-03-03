
import React from 'react';
import { BookOpen, Clock, Target, Award, BarChart2, Users, LogOut, PlusCircle } from 'lucide-react';

export const SUBJECTS = [
  "Matemática",
  "Português",
  "Direito Constitucional",
  "Direito Administrativo",
  "Informática",
  "Raciocínio Lógico",
  "História",
  "Geografia"
];

export const MOCK_STUDENTS = [
  { id: 's1', name: 'Ana Silva', email: 'ana@estudante.com', role: 'STUDENT' as const },
  { id: 's2', name: 'Bruno Costa', email: 'bruno@estudante.com', role: 'STUDENT' as const },
  { id: 's3', name: 'Carla Souza', email: 'carla@estudante.com', role: 'STUDENT' as const },
];

export const MOCK_ADMIN = {
  id: 'a1',
  name: 'Mentor Jackson',
  email: 'admin@mentor.com',
  role: 'ADMIN' as const
};

export const ICONS = {
  BookOpen: <BookOpen size={20} />,
  Clock: <Clock size={20} />,
  Target: <Target size={20} />,
  Award: <Award size={20} />,
  BarChart: <BarChart2 size={20} />,
  Users: <Users size={20} />,
  LogOut: <LogOut size={20} />,
  Plus: <PlusCircle size={20} />
};
