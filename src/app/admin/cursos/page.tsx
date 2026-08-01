"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminCoursesService, adminSubjectsService } from "@/services/admin";
import type { Database } from "@/types/database";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"] & { course_subjects: { subject_id: string }[] };

const emptyForm = { name: "", description: "", subjectIds: [] as string[] };

export default function AdminCoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminCoursesService
      .list()
      .then((data) => setCourses(data as unknown as Course[]))
      .catch(() => showToast("Erro ao carregar cursos.", "error"));
    adminSubjectsService.list().then(setSubjects).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "—";

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      name: course.name,
      description: course.description ?? "",
      subjectIds: course.course_subjects.map((cs) => cs.subject_id),
    });
    setModalOpen(true);
  };

  const toggleSubject = (id: string) => {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id) ? f.subjectIds.filter((s) => s !== id) : [...f.subjectIds, id],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description || null };
      if (editing) {
        await adminCoursesService.update(editing.id, payload, form.subjectIds);
        showToast("Curso atualizado.", "success");
      } else {
        await adminCoursesService.create(payload, form.subjectIds);
        showToast("Curso criado.", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Excluir o curso "${course.name}"?`)) return;
    try {
      await adminCoursesService.remove(course.id);
      showToast("Curso excluído.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível excluir.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Cursos"
        description="Agrupamentos de matérias oferecidos aos alunos."
        action={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            Novo curso
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!courses && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        {courses?.length === 0 && <p className="text-muted col-span-full text-center py-8">Nenhum curso cadastrado ainda.</p>}
        {courses?.map((course) => (
          <div key={course.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{course.name}</h3>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(course)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {course.description && <p className="text-sm text-muted mt-1.5 line-clamp-2">{course.description}</p>}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {course.course_subjects.length === 0 && <span className="text-xs text-muted">Sem matérias vinculadas</span>}
              {course.course_subjects.map((cs) => (
                <Badge key={cs.subject_id} tone="accent">
                  {subjectName(cs.subject_id)}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar curso" : "Novo curso"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Matérias do curso</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  type="button"
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${
                    form.subjectIds.includes(subject.id)
                      ? "bg-accent text-white border-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {subject.name}
                </button>
              ))}
              {subjects.length === 0 && <p className="text-sm text-muted">Cadastre matérias primeiro.</p>}
            </div>
          </div>
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
