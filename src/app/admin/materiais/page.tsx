"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Upload, FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminMaterialsService, adminSubjectsService } from "@/services/admin";
import { uploadMaterialFile, deleteMaterialFile, getMaterialSignedUrl } from "@/lib/supabase/storage";
import { formatFileSize } from "@/utils/format";
import type { Database, MaterialType } from "@/types/database";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Material = Database["public"]["Tables"]["materials"]["Row"] & { subjects: { name: string } | null };

const materialTypeLabels: Record<MaterialType, string> = {
  pdf: "PDF",
  "mapa-mental": "Mapa mental",
  resumo: "Resumo",
  lei: "Lei seca",
  exercicios: "Exercícios",
};

const emptyForm = { subjectId: "", name: "", description: "", type: "pdf" as MaterialType, published: true };

export default function AdminMaterialsPage() {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingFile, setPendingFile] = useState<{ path: string; sizeKb: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    adminMaterialsService
      .list()
      .then((data) => setMaterials(data as unknown as Material[]))
      .catch(() => showToast("Erro ao carregar materiais.", "error"));
    adminSubjectsService.list().then(setSubjects).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    if (subjects.length === 0) {
      showToast("Cadastre uma matéria antes de enviar um material.", "error");
      return;
    }
    setEditing(null);
    setForm({ ...emptyForm, subjectId: subjects[0].id });
    setPendingFile(null);
    setModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditing(material);
    setForm({
      subjectId: material.subject_id,
      name: material.name,
      description: material.description ?? "",
      type: material.type,
      published: material.published,
    });
    setPendingFile(null);
    setModalOpen(true);
  };

  const handleFileSelect = async (file: File) => {
    if (!form.subjectId) {
      showToast("Selecione a matéria antes de enviar o arquivo.", "error");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadMaterialFile(file, form.subjectId);
      setPendingFile(result);
      if (!form.name) setForm((f) => ({ ...f, name: file.name.replace(/\.[^.]+$/, "") }));
      showToast("Arquivo enviado.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Falha no upload.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subjectId) return;
    if (!editing && !pendingFile) {
      showToast("Envie um arquivo antes de salvar.", "error");
      return;
    }
    setSaving(true);
    try {
      const base = {
        subject_id: form.subjectId,
        name: form.name,
        description: form.description || null,
        type: form.type,
        published: form.published,
      };
      if (editing) {
        await adminMaterialsService.update(editing.id, {
          ...base,
          ...(pendingFile ? { file_path: pendingFile.path, size_kb: pendingFile.sizeKb } : {}),
        });
        showToast("Material atualizado.", "success");
      } else if (pendingFile) {
        await adminMaterialsService.create({ ...base, file_path: pendingFile.path, size_kb: pendingFile.sizeKb });
        showToast("Material criado.", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`Excluir o material "${material.name}"?`)) return;
    try {
      await adminMaterialsService.remove(material.id);
      await deleteMaterialFile(material.file_path).catch(() => {});
      showToast("Material excluído.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível excluir.", "error");
    }
  };

  const handlePreview = async (material: Material) => {
    try {
      const url = await getMaterialSignedUrl(material.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível abrir o arquivo.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Materiais"
        description="PDFs, mapas mentais, resumos e leis secas por matéria."
        action={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            Novo material
          </Button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Matéria</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Tamanho</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!materials &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {materials?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Nenhum material cadastrado ainda.
                </td>
              </tr>
            )}
            {materials?.map((material) => (
              <tr key={material.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium text-foreground">
                  <button onClick={() => handlePreview(material)} className="flex items-center gap-2 hover:text-accent transition-smooth">
                    <FileText className="size-4 text-muted shrink-0" />
                    <span className="truncate max-w-56">{material.name}</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-muted">{material.subjects?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone="accent">{materialTypeLabels[material.type]}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{formatFileSize(material.size_kb)}</td>
                <td className="px-4 py-3">
                  <Badge tone={material.published ? "success" : "neutral"}>{material.published ? "Publicado" : "Rascunho"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(material)} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground" aria-label="Editar">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(material)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500" aria-label="Excluir">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar material" : "Novo material"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Matéria" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MaterialType })}>
            {Object.entries(materialTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Arquivo {editing && "(opcional — só envie para substituir)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Button type="button" variant="ghost" size="sm" icon={<Upload className="size-4" />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
              {pendingFile ? "Arquivo enviado ✓" : "Selecionar arquivo"}
            </Button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="size-4 rounded border-border accent-[--color-accent]"
            />
            <span className="text-sm text-muted">Publicado (visível para alunos)</span>
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
