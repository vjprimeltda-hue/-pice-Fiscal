"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/Badge";
import type { Question } from "@/types";

const difficultyTone = {
  facil: "success",
  medio: "warning",
  dificil: "danger",
} as const;

const difficultyLabel = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
} as const;

export function QuestionCard({ question, index }: { question: Question; index: number }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const favorited = isFavorited("question", question.id);

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setAnswered(true);
    const correct = selected === question.correctIndex;
    showToast(correct ? "Resposta correta! Mandou bem." : "Resposta incorreta. Revise o conteúdo.", correct ? "success" : "error");
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">Questão {index}</span>
          <Badge tone={difficultyTone[question.difficulty]}>{difficultyLabel[question.difficulty]}</Badge>
        </div>
        <button
          onClick={() => toggleFavorite("question", question.id)}
          className={cn("shrink-0", favorited ? "text-amber-500" : "text-muted hover:text-amber-500")}
        >
          <Star className={cn("size-5", favorited && "fill-amber-500")} />
        </button>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-4">{question.statement}</p>

      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isCorrect = answered && i === question.correctIndex;
          const isWrongSelected = answered && i === selected && i !== question.correctIndex;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "w-full text-left flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-smooth",
                !answered && selected === i && "border-accent bg-accent-soft",
                !answered && selected !== i && "border-border hover:bg-surface-2",
                isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                isWrongSelected && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0",
                  !answered && selected === i ? "border-accent text-accent" : "border-border text-muted",
                  isCorrect && "border-emerald-500 text-emerald-600",
                  isWrongSelected && "border-red-500 text-red-600"
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {isCorrect && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
              {isWrongSelected && <XCircle className="size-4 text-red-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {!answered && (
        <button
          onClick={handleConfirm}
          disabled={selected === null}
          className="mt-4 h-10 px-5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar resposta
        </button>
      )}
    </div>
  );
}
