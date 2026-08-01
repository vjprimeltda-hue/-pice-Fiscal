"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminQuestionsService, adminSubjectsService } from "@/services/admin";
import type { Database, QuestionDifficulty } from "@/types/database";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"] & { subjects: { name: string } | null };

const difficultyLabels: Record<QuestionDifficulty, string> = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
const difficultyTone: Record<QuestionDifficulty, "success" | "warning" | "danger"> = {
  facil: "success",
  medio: "warning",
  dificil: "danger",
};

const emptyForm = {
  subjectId: "",
  statement: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
  difficulty: "medio" as QuestionDifficulty,
  published: true,
};

export default function AdminQuestionsPage() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminQuestionsService
      .list()
      .then((data) => setQuestions(data as unknown as Question[]))
      .catch(() => showToast("Erro ao carregar questões.", "error"));
    adminSubjectsService.list().then(setSubjects).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    if (subjects.length === 0) {
      showToast("Cadastre uma matéria antes de criar uma questão.", "error");
      return;
    }
    setEditing(null);
    setForm({ ...emptyForm, subjectId: subjects[0].id });
    setModalOpen(true);
  };

  const openEdit = (question: Question) => {
    setEditing(question);
    const options = [...question.options];
    while (options.length < 2) options.push("");
    setForm({
      subjectId: question.subject_id,
      statement: question.statement,
      options,
      correctIndex: question.correct_index,
      explanation: question.explanation ?? "",
      difficulty: question.difficulty,
      published: question.published,
    });
    setModalOpen(true);
  };

  const updateOption = (index: number, value: string) => {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? value : o)) }));
  };

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (index: number) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== index),
      correctIndex: f.correctIndex >= f.options.length - 1 ? Math.max(0, f.correctIndex - 1) : f.correctIndex,
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanOptions = form.options.map((o) => o.trim()).filter(Boolean);
    if (!form.statement.trim() || cleanOptions.length < 2 || !form.subjectId) {
      showToast("Preencha o enunciado e ao menos 2 alternativas.", "error");
      return;
    }
    if (form.correctIndex >= cleanOptions.length) {
      showToast("Selecione qual alternativa é a correta.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        subject_id: form.subjectId,
        statement: form.statement,
        options: cleanOptions,
        correct_index: form.correctIndex,
        explanation: form.explanation || null,
        difficulty: form.difficulty,
        published: form.published,
      };
      if (editing) {
        await adminQuestionsService.update(editing.id, payload);
        showToast("Questão atualizada.", "success");
      } else {
        await adminQuestionsService.create(payload);
        showToast("Questão criada.", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (question: Question) => {
    if (!confirm("Excluir esta questão?")) return;
    try {
      await adminQuestionsService.remove(question.id);
      showToast("Questão excluída.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível excluir.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Questões"
        description="Banco de questões usado nos simulados e exercícios."
        action={
          <Button icon={<Plus className="size-4" />} onClick={openCreate}>
            Nova questão
          </Button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Enunciado</th>
              <th className="px-4 py-3 font-medium">Matéria</th>
              <th className="px-4 py-3 font-medium">Dificuldade</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!questions &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {questions?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhuma questão cadastrada ainda.
                </td>
              </tr>
            )}
            {questions?.map((question) => (
              <tr key={question.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium text-foreground max-w-96 truncate">{question.statement}</td>
                <td className="px-4 py-3 text-muted">{question.subjects?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={difficultyTone[question.difficulty]}>{difficultyLabels[question.difficulty]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={question.published ? "success" : "neutral"}>{question.published ? "Publicada" : "Rascunho"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(question)} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground" aria-label="Editar">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(question)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500" aria-label="Excluir">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar questão" : "Nova questão"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Matéria" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Textarea label="Enunciado" value={form.statement} onChange={(e) => setForm({ ...form, statement: e.target.value })} rows={3} required />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Alternativas <span className="text-muted font-normal">(marque a correta)</span>
            </label>
            <div className="space-y-2">
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: index })}
                    className={`size-8 shrink-0 rounded-lg border grid place-items-center transition-smooth ${
                      form.correctIndex === index ? "bg-emerald-500 border-emerald-500 text-white" : "border-border text-muted hover:text-foreground"
                    }`}
                    aria-label={`Marcar alternativa ${index + 1} como correta`}
                  >
                    {form.correctIndex === index ? <Check className="size-4" /> : String.fromCharCode(65 + index)}
                  </button>
                  <input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    className="flex-1 h-10 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-smooth"
                  />
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-muted hover:text-red-500" aria-label="Remover alternativa">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={addOption}>
              + Adicionar alternativa
            </Button>
          </div>

          <Textarea label="Explicação (opcional)" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />

          <Select label="Dificuldade" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as QuestionDifficulty })}>
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
          </Select>

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
