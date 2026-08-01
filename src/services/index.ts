/**
 * Service layer — mock implementations backed by src/data/mock.ts.
 * Swap the function bodies for real API/DB calls (REST, GraphQL, Prisma, etc.)
 * without changing the calling components, since the return shapes already
 * match the domain types in src/types/index.ts.
 */
import { agendaEvents, lessons, materials, notifications, questions, subjects } from "@/data/mock";
import type { AgendaEvent } from "@/types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// authService / userService now talk to Supabase directly — see src/services/auth.ts.
export { authService, userService } from "@/services/auth";

// progressService / activityService / coursesService power the student
// dashboard and now talk to Supabase directly — see src/services/dashboard.ts.
export { progressService, activityService, coursesService } from "@/services/dashboard";

// The remaining services below are still mock-backed and will be migrated in
// upcoming phases (biblioteca de videoaulas/materiais/questões com dados reais).
export const subjectsService = {
  async list() {
    await delay();
    return subjects;
  },
};

export const lessonsService = {
  async list() {
    await delay();
    return lessons;
  },
};

export const materialsService = {
  async list() {
    await delay();
    return materials;
  },
};

export const questionsService = {
  async list() {
    await delay();
    return questions;
  },
};

export const notificationsService = {
  async list() {
    await delay();
    return notifications;
  },
};

export const agendaService = {
  async list(): Promise<AgendaEvent[]> {
    await delay();
    return agendaEvents;
  },
};
