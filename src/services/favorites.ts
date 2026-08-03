/**
 * Real Supabase-backed favorites — replaces the mock-seeded local state in
 * FavoritesContext. Rows are fully owner-managed (RLS: user_id = auth.uid()).
 */
import { createClient } from "@/lib/supabase/client";
import type { FavoriteContentType } from "@/types/database";

export type FavoriteKind = "lesson" | "material" | "question";

export function contentTypeFor(kind: FavoriteKind, materialType?: string): FavoriteContentType {
  if (kind === "lesson") return "video";
  if (kind === "question") return "exercicio";
  return materialType === "mapa-mental" ? "mapa-mental" : "pdf";
}

export const favoritesService = {
  async list(): Promise<{ lessonIds: string[]; materialIds: string[]; questionIds: string[] }> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { lessonIds: [], materialIds: [], questionIds: [] };

    const { data, error } = await supabase.from("favorites").select("content_id, content_type").eq("user_id", user.id);
    if (error) throw error;

    const lessonIds: string[] = [];
    const materialIds: string[] = [];
    const questionIds: string[] = [];
    for (const row of data ?? []) {
      if (row.content_type === "video") lessonIds.push(row.content_id);
      else if (row.content_type === "exercicio") questionIds.push(row.content_id);
      else materialIds.push(row.content_id);
    }
    return { lessonIds, materialIds, questionIds };
  },

  async add(contentId: string, contentType: FavoriteContentType): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, content_id: contentId, content_type: contentType });
    if (error) throw error;
  },

  async remove(contentId: string): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("content_id", contentId);
    if (error) throw error;
  },
};
