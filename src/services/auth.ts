/**
 * Real Supabase-backed auth/user services (Client Component side).
 * Replaces the mock authService/userService from src/services/index.ts.
 */
import { createClient } from "@/lib/supabase/client";
import { setRememberMe } from "@/lib/supabase/remember";
import type { Database } from "@/types/database";
import type { User } from "@/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function profileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    city: profile.city ?? undefined,
    state: profile.state ?? undefined,
    goal: profile.goal ?? undefined,
    targetExam: profile.target_exam ?? undefined,
    role: profile.role,
    dailyGoalHours: Number(profile.daily_goal_hours),
    createdAt: profile.created_at,
  };
}

async function fetchProfile(userId: string): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) {
    throw new Error(error?.message ?? "Perfil não encontrado.");
  }
  return profileToUser(data);
}

export const authService = {
  async signUp(params: { name: string; email: string; password: string; phone?: string }): Promise<{ needsEmailConfirmation: boolean }> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: { name: params.name, phone: params.phone },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });
    if (error) throw error;
    // When email confirmations are enabled, Supabase returns a user with no
    // session until the confirmation link is clicked.
    return { needsEmailConfirmation: !data.session };
  },

  async login(email: string, password: string, remember: boolean): Promise<User> {
    setRememberMe(remember);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return fetchProfile(data.user.id);
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordReset(email: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/redefinir-senha`,
    });
    if (error) throw error;
  },

  /** Called from /redefinir-senha once the recovery link has produced a session. */
  async updatePassword(newPassword: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return fetchProfile(user.id);
  },

  async updateUser(data: Partial<User>): Promise<User> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        phone: data.phone,
        avatar_url: data.avatarUrl,
        city: data.city,
        state: data.state,
        goal: data.goal,
        target_exam: data.targetExam,
        daily_goal_hours: data.dailyGoalHours,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error || !updated) throw new Error(error?.message ?? "Não foi possível atualizar o perfil.");
    return profileToUser(updated);
  },
};
