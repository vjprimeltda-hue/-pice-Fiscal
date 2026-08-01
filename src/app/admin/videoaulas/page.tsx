"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminLessonsService, adminSubjectsService, adminCoursesService } from "@/services/admin";
import { uploadLessonThumbnail } from "@/lib/supabase/storage";
import { formatMinutes } from "@/utils/format";
import type { Database } from "@/types/database";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"] & {
  subjects: { name: string } | null;
  courses: { name: string } | null;
};

const emptyForm = {
  subjectId: "",
  courseId: "",
  title: "",
  description: "",
  professor: "",
  videoUrl: "",
  videoProvider: "youtube" as Lesson["video_provider"],
  thumbnailUrl: "",
  durationMinutes: 0,
  order: 0,
  published: true,
};

export default function AdminLessonsPage() {
  const { showToast } = useToast();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    adminLessonsService
      .list()
      .then((data) => setLessons(data as unknown as Lesson[]))
      .catch(() => showToast("Erro ao carregar videoaulas.", "error"));
    adminSubjectsService.list().then(setSubjects).catch(() => {});
    adminCoursesService.list().then((data) => setCourses(data as unknown as Course[])).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    if (subjects.length === 0) {
      showToast("Cadastre uma matéria antes de criar uma videoaula.", "error");
      return;
    }
    setEditing(null);
    setForm({ ...emptyForm, subjectId: subjects[0].id });
    setModalOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setForm({
      subjectId: lesson.subject_id,
      courseId: lesson.course_id ?? "",
      title: lesson.title,
      description: lesson.description ?? "",
      professor: lesson.professor,
      videoUrl: lesson.video_url,
      videoProvider: lesson.video_provider,
      thumbnailUrl: lesson.thumbnail_url ?? "",
      durationMinutes: lesson.duration_minutes,
      order: lesson.order,
      published: lesson.published,
    });
    setModalOpen(true);
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadLessonThumbnail(file);
      setForm((f) => ({ ...f, thumbnailUrl: url }));
      showToast("Thumbnail enviada.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Falha no upload.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.professor.trim() || !form.videoUrl.trim() || !form.subjectId) return;
    setSaving(true);
    try {
      const payload = {
        subject_id: form.subjectId,
        course_id: form.courseId || null,
        title: form.title,
        description: form.description || null,
        professor: form.professor,
        video_url: form.videoUrl,
        video_provider: form.videoProvider,
        thumbnail_url: form.thumbnailUrl || null,
        duration_minutes: form.durationMinutes,
        order: form.order,
        published: form.published,
      };
      if (editing) {
        await adminLessonsService.update(editing.id, payload);
        showToast("Videoaula atualizada.", "success");
      } else {
        await adminLessonsService.create(payload);
        showToast("Videoaula criada.", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Excluir a videoaula "${lesson.title}"?`)) return;
    try {
      await adminLessonsService.remove(lesson.id);
      showToast("Videoaula excluída.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível excluir.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Videoaulas"
        description="Biblioteca de videoaulas por matéria e curso."
        action={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            Nova videoaula
          </Button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Matéria</th>
              <th className="px-4 py-3 font-medium">Professor</th>
              <th className="px-4 py-3 font-medium">Duração</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!lessons &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {lessons?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Nenhuma videoaula cadastrada ainda.
                </td>
              </tr>
            )}
            {lessons?.map((lesson) => (
              <tr key={lesson.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium text-foreground max-w-64 truncate">{lesson.title}</td>
                <td className="px-4 py-3 text-muted">{lesson.subjects?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{lesson.professor}</td>
                <td className="px-4 py-3 text-muted">{formatMinutes(lesson.duration_minutes)}</td>
                <td className="px-4 py-3">
                  <Badge tone={lesson.published ? "success" : "neutral"}>{lesson.published ? "Publicada" : "Rascunho"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(lesson)} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground" aria-label="Editar">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(lesson)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500" aria-label="Excluir">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar videoaula" : "Nova videoaula"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid sm:grid-cols-2 gap-3">
            <Select label="Matéria" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select label="Curso (opcional)" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">— Nenhum —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <Input label="Professor" value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} required />

          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <Input label="URL do vídeo" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." required />
            <Select label="Provedor" value={form.videoProvider} onChange={(e) => setForm({ ...form, videoProvider: e.target.value as Lesson["video_provider"] })}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="mux">Mux</option>
              <option value="storage">Storage</option>
              <option value="external">Externo</option>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Duração (minutos)"
              type="number"
              min={0}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
            <Input label="Ordem" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Thumbnail</label>
            <div className="flex items-center gap-3">
              <div className="size-16 rounded-xl bg-surface-2 border border-border grid place-items-center overflow-hidden shrink-0">
                {form.thumbnailUrl ? (
                  <Image src={form.thumbnailUrl} alt="" width={64} height={64} className="object-cover size-full" unoptimized />
                ) : (
                  <ImageIcon className="size-5 text-muted" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
              />
              <Button type="button" variant="ghost" size="sm" icon={<Upload className="size-4" />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
                Enviar imagem
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="size-4 rounded border-border accent-[--color-accent]"
            />
            <span className="text-sm text-muted">Publicada (visível para alunos)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
