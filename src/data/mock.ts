import type {
  AgendaEvent,
  Course,
  Lesson,
  Material,
  Notification,
  Progress,
  Question,
  RecentActivity,
  Subject,
  User,
} from "@/types";

export const mockUser: User = {
  id: "u1",
  name: "Marina Souza",
  email: "marina.souza@example.com",
  phone: "(11) 98765-4321",
  avatarUrl: "",
  city: "São Paulo",
  state: "SP",
  goal: "Aprovação em concurso de Auditor Fiscal",
  targetExam: "Auditor Fiscal da Receita Federal",
  role: "aluno",
  dailyGoalHours: 2,
  createdAt: "2025-02-10",
};

export const subjects: Subject[] = [
  { id: "const", name: "Direito Constitucional", color: "#3b82f6" },
  { id: "adm", name: "Direito Administrativo", color: "#0b1f3a" },
  { id: "port", name: "Português", color: "#60a5fa" },
  { id: "rlm", name: "Raciocínio Lógico", color: "#14315c" },
  { id: "info", name: "Informática", color: "#2563eb" },
];

export const lessons: Lesson[] = [
  { id: "l1", subjectId: "const", title: "Princípios Fundamentais", professor: "Prof. Ricardo Lima", durationMinutes: 52, thumbnailUrl: "", order: 1, completed: true, favorited: true },
  { id: "l2", subjectId: "const", title: "Direitos e Garantias Fundamentais", professor: "Prof. Ricardo Lima", durationMinutes: 48, thumbnailUrl: "", order: 2, completed: true, favorited: false },
  { id: "l3", subjectId: "const", title: "Organização do Estado", professor: "Prof. Ricardo Lima", durationMinutes: 55, thumbnailUrl: "", order: 3, completed: false, favorited: false },
  { id: "l4", subjectId: "adm", title: "Princípios da Administração Pública", professor: "Profa. Camila Duarte", durationMinutes: 44, thumbnailUrl: "", order: 1, completed: true, favorited: false },
  { id: "l5", subjectId: "adm", title: "Atos Administrativos", professor: "Profa. Camila Duarte", durationMinutes: 50, thumbnailUrl: "", order: 2, completed: false, favorited: true },
  { id: "l6", subjectId: "adm", title: "Poderes Administrativos", professor: "Profa. Camila Duarte", durationMinutes: 39, thumbnailUrl: "", order: 3, completed: false, favorited: false },
  { id: "l7", subjectId: "port", title: "Interpretação de Texto", professor: "Prof. Diego Alves", durationMinutes: 41, thumbnailUrl: "", order: 1, completed: true, favorited: false },
  { id: "l8", subjectId: "port", title: "Concordância Verbal e Nominal", professor: "Prof. Diego Alves", durationMinutes: 47, thumbnailUrl: "", order: 2, completed: false, favorited: false },
  { id: "l9", subjectId: "port", title: "Crase e Regência", professor: "Prof. Diego Alves", durationMinutes: 36, thumbnailUrl: "", order: 3, completed: false, favorited: false },
  { id: "l10", subjectId: "rlm", title: "Proposições e Conectivos", professor: "Prof. Henrique Sá", durationMinutes: 45, thumbnailUrl: "", order: 1, completed: false, favorited: false },
  { id: "l11", subjectId: "rlm", title: "Análise Combinatória", professor: "Prof. Henrique Sá", durationMinutes: 53, thumbnailUrl: "", order: 2, completed: false, favorited: false },
  { id: "l12", subjectId: "info", title: "Conceitos de Hardware e Software", professor: "Profa. Bianca Rocha", durationMinutes: 33, thumbnailUrl: "", order: 1, completed: true, favorited: false },
  { id: "l13", subjectId: "info", title: "Segurança da Informação", professor: "Profa. Bianca Rocha", durationMinutes: 38, thumbnailUrl: "", order: 2, completed: false, favorited: true },
];

export const materials: Material[] = [
  { id: "m1", subjectId: "port", name: "Resumo — Interpretação de Texto", type: "resumo", sizeKb: 820, favorited: true, updatedAt: "2026-07-20" },
  { id: "m2", subjectId: "port", name: "Mapa Mental — Concordância", type: "mapa-mental", sizeKb: 410, favorited: false, updatedAt: "2026-07-18" },
  { id: "m3", subjectId: "port", name: "PDF Completo — Português para Fiscal", type: "pdf", sizeKb: 3200, favorited: false, updatedAt: "2026-07-10" },
  { id: "m4", subjectId: "const", name: "PDF — Constituição Federal Comentada", type: "pdf", sizeKb: 5400, favorited: true, updatedAt: "2026-07-25" },
  { id: "m5", subjectId: "const", name: "Resumo — Direitos Fundamentais", type: "resumo", sizeKb: 690, favorited: false, updatedAt: "2026-07-22" },
  { id: "m6", subjectId: "const", name: "Lei Seca — CF/88 Atualizada", type: "lei", sizeKb: 1200, favorited: false, updatedAt: "2026-07-15" },
  { id: "m7", subjectId: "adm", name: "PDF — Atos e Poderes Administrativos", type: "pdf", sizeKb: 2800, favorited: false, updatedAt: "2026-07-12" },
  { id: "m8", subjectId: "adm", name: "Exercícios — Administrativo Comentado", type: "exercicios", sizeKb: 950, favorited: true, updatedAt: "2026-07-08" },
];

export const courses: Course[] = [
  {
    id: "c1",
    name: "Auditor Fiscal — Trilha Completa",
    subjectIds: ["const", "adm", "port", "rlm", "info"],
    progressPercent: 62,
    lastLessonTitle: "Atos Administrativos",
    totalLessons: 48,
    completedLessons: 30,
  },
  {
    id: "c2",
    name: "Português para Concursos Fiscais",
    subjectIds: ["port"],
    progressPercent: 34,
    lastLessonTitle: "Interpretação de Texto",
    totalLessons: 18,
    completedLessons: 6,
  },
  {
    id: "c3",
    name: "Raciocínio Lógico Essencial",
    subjectIds: ["rlm"],
    progressPercent: 12,
    lastLessonTitle: "Proposições e Conectivos",
    totalLessons: 16,
    completedLessons: 2,
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    subjectId: "const",
    statement: "De acordo com a CF/88, são Poderes da União, independentes e harmônicos entre si:",
    options: ["Executivo, Legislativo e Judiciário", "Executivo e Legislativo apenas", "Federal, Estadual e Municipal", "Ministério Público e Judiciário"],
    correctIndex: 0,
    difficulty: "facil",
    favorited: false,
    answeredCorrectly: true,
  },
  {
    id: "q2",
    subjectId: "adm",
    statement: "O atributo do ato administrativo que permite sua execução imediata, independentemente de ordem judicial, denomina-se:",
    options: ["Presunção de legitimidade", "Autoexecutoriedade", "Imperatividade", "Tipicidade"],
    correctIndex: 1,
    difficulty: "medio",
    favorited: true,
    answeredCorrectly: false,
  },
  {
    id: "q3",
    subjectId: "port",
    statement: "Assinale a alternativa em que a crase foi empregada corretamente:",
    options: ["Refiro-me à ela.", "Cheguei à cidade cedo.", "Entreguei a ela o documento.", "Fui a pé à escola."],
    correctIndex: 3,
    difficulty: "medio",
    favorited: false,
  },
  {
    id: "q4",
    subjectId: "rlm",
    statement: "Se a proposição P é verdadeira e Q é falsa, o valor lógico de (P → Q) é:",
    options: ["Verdadeiro", "Falso", "Indeterminado", "Nenhuma das anteriores"],
    correctIndex: 1,
    difficulty: "dificil",
    favorited: false,
  },
];

export const agendaEvents: AgendaEvent[] = [
  { id: "e1", title: "Revisão — Direito Constitucional", date: "2026-08-01", startTime: "08:00", endTime: "09:30", type: "revisao", completed: false },
  { id: "e2", title: "Simulado Geral", date: "2026-08-02", startTime: "14:00", endTime: "18:00", type: "simulado", completed: false },
  { id: "e3", title: "Estudo — Português", date: "2026-08-01", startTime: "19:00", endTime: "20:30", type: "estudo", completed: false },
  { id: "e4", title: "Prova Objetiva — Concurso XPTO", date: "2026-08-15", startTime: "13:00", type: "prova", completed: false },
  { id: "e5", title: "Estudo — Raciocínio Lógico", date: "2026-07-31", startTime: "20:00", endTime: "21:00", type: "estudo", completed: true },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Nova aula disponível", message: "Direito Administrativo — Poderes Administrativos já está no ar.", createdAt: new Date().toISOString(), read: false },
  { id: "n2", title: "Meta diária quase concluída", message: "Faltam 25 minutos para bater sua meta de hoje!", createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), read: false },
  { id: "n3", title: "Simulado disponível", message: "O simulado geral de agosto já pode ser realizado.", createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), read: true },
];

export const recentActivities: RecentActivity[] = [
  { id: "a1", type: "video", title: "Atos Administrativos", subtitle: "Direito Administrativo · Profa. Camila Duarte", date: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: "a2", type: "pdf", title: "Constituição Federal Comentada", subtitle: "Direito Constitucional", date: new Date(Date.now() - 5 * 3600 * 1000).toISOString() },
  { id: "a3", type: "simulado", title: "Simulado Direito Administrativo", subtitle: "42 questões · 78% de acerto", date: new Date(Date.now() - 27 * 3600 * 1000).toISOString() },
  { id: "a4", type: "questoes", title: "Bloco de Questões — Português", subtitle: "20 questões · 65% de acerto", date: new Date(Date.now() - 50 * 3600 * 1000).toISOString() },
];

export const progress: Progress = {
  userId: "u1",
  hoursStudiedToday: 2.5,
  dailyGoalHours: 4,
  streakDays: 12,
  contentsCompleted: 57,
  questionsAnswered: 342,
  weekly: [
    { day: "Seg", hours: 3.2 },
    { day: "Ter", hours: 2.1 },
    { day: "Qua", hours: 4.0 },
    { day: "Qui", hours: 1.8 },
    { day: "Sex", hours: 3.6 },
    { day: "Sáb", hours: 5.1 },
    { day: "Dom", hours: 2.5 },
  ],
  monthly: [
    { week: "Sem 1", hours: 18 },
    { week: "Sem 2", hours: 22 },
    { week: "Sem 3", hours: 16 },
    { week: "Sem 4", hours: 24 },
  ],
  bySubject: [
    { subject: "Const.", percent: 72 },
    { subject: "Adm.", percent: 58 },
    { subject: "Port.", percent: 40 },
    { subject: "RLM", percent: 20 },
    { subject: "Info.", percent: 65 },
  ],
};
