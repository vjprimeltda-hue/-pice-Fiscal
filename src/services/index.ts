/**
 * Service layer — mock implementations backed by src/data/mock.ts.
 * Swap the function bodies for real API/DB calls (REST, GraphQL, Prisma, etc.)
 * without changing the calling components, since the return shapes already
 * match the domain types in src/types/index.ts.
 */
import {
  agendaEvents,
  courses,
  lessons,
  materials,
  notifications,
  progress,
  questions,
  recentActivities,
  subjects,
} from "@/data/mock";
import type { AgendaEvent } from "@/types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// authService / userService now talk to Supabase directly — see src/services/auth.ts.
// The remaining services below are still mock-backed and will be migrated in
// upcoming phases (painel administrativo / conteúdo real).
export { authService, userService } from "@/services/auth";

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

export const coursesService = {
  async list() {
    await delay();
    return courses;
  },
};

export const questionsService = {
  async list() {
    await delay();
    return questions;
  },
};

export const progressService = {
  async get() {
    await delay();
    return progress;
  },
};

export const activityService = {
  async list() {
    await delay();
    return recentActivities;
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
