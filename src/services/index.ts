/**
 * Service layer barrel. Every service here talks to Supabase directly under
 * RLS — see src/services/auth.ts, dashboard.ts, content.ts and agenda.ts for
 * the implementations.
 */

// authService / userService — see src/services/auth.ts.
export { authService, userService } from "@/services/auth";

// progressService / activityService / coursesService power the student
// dashboard — see src/services/dashboard.ts.
export { progressService, activityService, coursesService } from "@/services/dashboard";

// subjectsService / lessonsService / materialsService / questionsService /
// notificationsService — see src/services/content.ts.
export { subjectsService, lessonsService, materialsService, questionsService, notificationsService } from "@/services/content";

// agendaService — see src/services/agenda.ts.
export { agendaService } from "@/services/agenda";
