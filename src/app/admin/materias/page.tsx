"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { adminSubjectsService } from "@/services/admin";
import type { Database } from "@/types/database";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];

const emptyForm = { name: "", icon: "", color: "#3b82f6", order: 0 };

export default function AdminSubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => adminSubjectsService.list().then(setSubjects).catch(() => showToast("Erro ao carregar matérias.", "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setForm({ name: subject.name, icon: subject.icon ?? "", color: subject.color ?? "#3b82f6", order: subject.order });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await adminSubjectsService.update(editing.id, form);
        showToast("Matéria atualizada.", "success");
      } else {
        await adminSubjectsService.create(form);
        showToast("Matéria criada.", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Excluir a matéria "${subject.name}"? Isso remove também aulas/materiais/questões vinculados.`)) return;
    try {
      await adminSubjectsService.remove(subject.id);
      showToast("Matéria excluída.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível excluir.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Matérias"
        description="Catálogo de matérias usado por cursos, aulas, materiais e questões."
        action={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            Nova matéria
          </Button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Cor</th>
              <th className="px-4 py-3 font-medium">Ordem</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!subjects &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {subjects?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhuma matéria cadastrada ainda.
                </td>
              </tr>
            )}
            {subjects?.map((subject) => (
              <tr key={subject.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium text-foreground">{subject.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded-full border border-border" style={{ backgroundColor: subject.color ?? undefined }} />
                    {subject.color}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{subject.order}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(subject)} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground" aria-label="Editar">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(subject)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500" aria-label="Excluir">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar matéria" : "Nova matéria"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Ícone (nome lucide, opcional)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="scale" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cor</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-11 rounded-xl border border-border bg-surface cursor-pointer"
              />
            </div>
            <Input
              label="Ordem"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
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
