"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, ArrowLeft, ArrowRight, RotateCcw, Sparkles, Clock, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { subjectsService } from "@/services";
import { cn } from "@/utils/cn";
import type { Subject } from "@/types";

const HOURS_OPTIONS = [1, 2, 3, 4, 6];
const MONTHS_OPTIONS = [
  { label: "Menos de 3 meses", value: 2 },
  { label: "3 a 6 meses", value: 4 },
  { label: "6 a 12 meses", value: 9 },
  { label: "Mais de 1 ano", value: 15 },
];

interface Answers {
  targetExam: string;
  hoursPerDay: number | null;
  weakSubjectIds: string[];
  monthsLeft: number | null;
}

const emptyAnswers: Answers = { targetExam: "", hoursPerDay: null, weakSubjectIds: [], monthsLeft: null };

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("h-1.5 rounded-full transition-smooth", i === step ? "w-6 bg-accent" : "w-1.5 bg-border")}
        />
      ))}
    </div>
  );
}

export default function PlanoDeEstudosPage() {
  const { showToast } = useToast();
  const { user, updateUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [result, setResult] = useState<{ examEta: string; weeklyHours: number; bySubject: { subject: Subject; hours: number }[] } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subjectsService.list().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  const targetExam = answers.targetExam || user?.targetExam || "";

  const totalSteps = 4;

  const canAdvance = useMemo(() => {
    if (step === 0) return targetExam.trim().length > 0;
    if (step === 1) return answers.hoursPerDay !== null;
    if (step === 2) return true; // weak subjects are optional
    if (step === 3) return answers.monthsLeft !== null;
    return true;
  }, [step, answers, targetExam]);

  const toggleWeakSubject = (id: string) => {
    setAnswers((a) => ({
      ...a,
      weakSubjectIds: a.weakSubjectIds.includes(id) ? a.weakSubjectIds.filter((s) => s !== id) : [...a.weakSubjectIds, id],
    }));
  };

  const handleFinish = async () => {
    if (!subjects || subjects.length === 0 || !answers.hoursPerDay || !answers.monthsLeft) return;

    const weeklyHours = answers.hoursPerDay * 7;
    const weakSet = new Set(answers.weakSubjectIds);
    const totalWeight = subjects.reduce((sum, s) => sum + (weakSet.has(s.id) ? 2 : 1), 0);
    const bySubject = subjects
      .map((subject) => ({
        subject,
        hours: Math.round((weeklyHours * (weakSet.has(subject.id) ? 2 : 1) * 10) / totalWeight) / 10,
      }))
      .sort((a, b) => b.hours - a.hours);

    const examDate = new Date();
    examDate.setMonth(examDate.getMonth() + answers.monthsLeft);
    const examEta = examDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    setResult({ examEta, weeklyHours, bySubject });
    setStep(4);

    setSaving(true);
    try {
      const weakNames = subjects.filter((s) => weakSet.has(s.id)).map((s) => s.name);
      await updateUser({
        targetExam,
        dailyGoalHours: answers.hoursPerDay,
        goal: weakNames.length ? `Foco em: ${weakNames.join(", ")}` : undefined,
      });
      showToast("Perfil atualizado com sua meta diária.", "success");
    } catch {
      showToast("Plano gerado, mas não foi possível salvar sua meta no perfil.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = () => {
    setAnswers(emptyAnswers);
    setResult(null);
    setStep(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="size-6 text-accent" /> Plano de Estudos
        </h1>
        <p className="text-muted text-sm mt-1">Responda 4 perguntas rápidas e receba uma sugestão de distribuição de horas por matéria.</p>
      </div>

      {subjects === null ? (
        <Skeleton className="h-72 w-full max-w-2xl" />
      ) : subjects.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center card max-w-2xl">Nenhuma matéria cadastrada ainda.</p>
      ) : step < 4 ? (
        <div className="card p-6 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Pergunta {step + 1} de {totalSteps}</span>
            <StepDots step={step} total={totalSteps} />
          </div>

          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Qual concurso ou cargo é seu objetivo?</h2>
              <Input
                value={targetExam}
                onChange={(e) => setAnswers((a) => ({ ...a, targetExam: e.target.value }))}
                placeholder="Ex: Auditor Fiscal, Receita Federal..."
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Quantas horas por dia você pode estudar?</h2>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setAnswers((a) => ({ ...a, hoursPerDay: h }))}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium border transition-smooth",
                      answers.hoursPerDay === h ? "bg-navy text-white border-navy" : "bg-surface text-foreground border-border hover:bg-surface-2"
                    )}
                  >
                    {h === 6 ? "6+ horas" : `${h} hora${h > 1 ? "s" : ""}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Quais matérias você tem mais dificuldade?</h2>
              <p className="text-xs text-muted mb-3">Selecione uma ou mais (opcional) — elas recebem mais horas no plano.</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const active = answers.weakSubjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleWeakSubject(s.id)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-smooth",
                        active ? "bg-accent-soft border-accent text-accent" : "bg-surface text-foreground border-border hover:bg-surface-2"
                      )}
                    >
                      <span className="size-2 rounded-full" style={{ background: s.color ?? "var(--color-accent)" }} />
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Quantos meses faltam para a prova?</h2>
              <div className="flex flex-wrap gap-2">
                {MONTHS_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setAnswers((a) => ({ ...a, monthsLeft: m.value }))}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium border transition-smooth",
                      answers.monthsLeft === m.value ? "bg-navy text-white border-navy" : "bg-surface text-foreground border-border hover:bg-surface-2"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" icon={<ArrowLeft className="size-4" />} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
            {step < totalSteps - 1 ? (
              <Button icon={<ArrowRight className="size-4" />} disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
                Próxima
              </Button>
            ) : (
              <Button icon={<Sparkles className="size-4" />} disabled={!canAdvance} onClick={handleFinish}>
                Gerar plano
              </Button>
            )}
          </div>
        </div>
      ) : (
        result && (
          <div className="card p-6 max-w-2xl space-y-6 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Seu plano de estudos</h2>
                <p className="text-sm text-muted mt-0.5">Objetivo: {targetExam}</p>
              </div>
              <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" />} onClick={handleRestart}>
                Refazer
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-accent-soft grid place-items-center text-accent shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted">Meta semanal</p>
                  <p className="text-sm font-semibold text-foreground">{result.weeklyHours}h ({answers.hoursPerDay}h/dia)</p>
                </div>
              </div>
              <div className="rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-accent-soft grid place-items-center text-accent shrink-0">
                  <CalendarClock className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted">Previsão da prova</p>
                  <p className="text-sm font-semibold text-foreground">{result.examEta}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Distribuição sugerida por matéria</p>
              <div className="space-y-2">
                {result.bySubject.map(({ subject, hours }) => {
                  const isWeak = answers.weakSubjectIds.includes(subject.id);
                  const percent = Math.round((hours / result.weeklyHours) * 100);
                  return (
                    <div key={subject.id} className="flex items-center gap-3">
                      <span className="size-2.5 rounded-full shrink-0" style={{ background: subject.color ?? "var(--color-accent)" }} />
                      <span className="text-sm text-foreground w-32 sm:w-40 truncate">{subject.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-14 text-right shrink-0">{hours}h</span>
                      {isWeak && <Badge tone="warning">Prioridade</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>

            {saving && <p className="text-xs text-muted">Salvando sua meta no perfil...</p>}
          </div>
        )
      )}
    </div>
  );
}
