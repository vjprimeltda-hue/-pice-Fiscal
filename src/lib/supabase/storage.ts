"use client";

import { createClient } from "@/lib/supabase/client";

function safeFileName(name: string) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Uploads a lesson thumbnail to the public `lesson-thumbnails` bucket and returns its public URL. */
export async function uploadLessonThumbnail(file: File): Promise<string> {
  const supabase = createClient();
  const path = `${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from("lesson-thumbnails").upload(path, file, { upsert: false });
  if (error) throw error;
  return supabase.storage.from("lesson-thumbnails").getPublicUrl(path).data.publicUrl;
}

/** Uploads a PDF/mapa mental to the private `materials` bucket and returns its storage path. */
export async function uploadMaterialFile(file: File, subjectId: string): Promise<{ path: string; sizeKb: number }> {
  const supabase = createClient();
  const path = `${subjectId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from("materials").upload(path, file, { upsert: false });
  if (error) throw error;
  return { path, sizeKb: Math.max(1, Math.round(file.size / 1024)) };
}

/** Uploads a user avatar to the public `avatars` bucket, scoped to the user's own folder. */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

/** Short-lived signed URL to download/preview a private material file. */
export async function getMaterialSignedUrl(path: string, expiresInSeconds = 120): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("materials").createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw error ?? new Error("Não foi possível gerar o link de download.");
  return data.signedUrl;
}

export async function deleteMaterialFile(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from("materials").remove([path]);
  if (error) throw error;
}

export async function deleteLessonThumbnail(publicUrl: string): Promise<void> {
  const supabase = createClient();
  const path = publicUrl.split("/lesson-thumbnails/")[1];
  if (!path) return;
  const { error } = await supabase.storage.from("lesson-thumbnails").remove([decodeURIComponent(path)]);
  if (error) throw error;
}
