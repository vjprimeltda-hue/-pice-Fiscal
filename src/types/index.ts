export type Theme = "light" | "dark";

export type AppRole = "aluno" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  goal?: string;
  targetExam?: string;
  role: AppRole;
  dailyGoalHours: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  professor: string;
  durationMinutes: number;
  thumbnailUrl: string;
  order: number;
  completed: boolean;
  favorited: boolean;
}

export type MaterialType = "pdf" | "mapa-mental" | "resumo" | "lei" | "exercicios";

export interface Material {
  id: string;
  subjectId: string;
  name: string;
  type: MaterialType;
  sizeKb: number;
  favorited: boolean;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  subjectIds: string[];
  progressPercent: number;
  lastLessonTitle: string;
  totalLessons: number;
  completedLessons: number;
}

export interface Question {
  id: string;
  subjectId: string;
  statement: string;
  options: string[];
  correctIndex: number;
  difficulty: "facil" | "medio" | "dificil";
  favorited: boolean;
  answeredCorrectly?: boolean;
}

export type EventType = "estudo" | "revisao" | "simulado" | "prova" | "outro";

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // ISO date (yyyy-mm-dd)
  startTime: string; // HH:mm
  endTime?: string;
  type: EventType;
  completed: boolean;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Progress {
  userId: string;
  hoursStudiedToday: number;
  dailyGoalHours: number;
  streakDays: number;
  contentsCompleted: number;
  questionsAnswered: number;
  weekly: { day: string; hours: number }[];
  monthly: { week: string; hours: number }[];
  bySubject: { subject: string; percent: number }[];
}

export interface RecentActivity {
  id: string;
  type: "video" | "pdf" | "simulado" | "questoes";
  title: string;
  subtitle: string;
  date: string;
}

export interface Favorite {
  id: string;
  contentId: string;
  contentType: "video" | "pdf" | "exercicio" | "mapa-mental";
  title: string;
  subtitle: string;
  addedAt: string;
}
