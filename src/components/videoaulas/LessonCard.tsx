"use client";

import { useState } from "react";
import { CheckCircle2, Circle, PlayCircle, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatMinutes } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import type { Lesson } from "@/types";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [completed, setCompleted] = useState(lesson.completed);
  const favorited = isFavorited("lesson", lesson.id);

  const handleWatch = () => {
    showToast(`Reproduzindo: ${lesson.title}`, "info");
  };

  const handleToggleComplete = () => {
    setCompleted((prev) => {
      const next = !prev;
      showToast(next ? "Aula marcada como concluída!" : "Aula marcada como pendente.", "success");
      return next;
    });
  };

  return (
    <div className="card overflow-hidden group">
      <button
        onClick={handleWatch}
        className="relative w-full aspect-video bg-gradient-to-br from-navy to-navy-light flex items-center justify-center overflow-hidden"
      >
        <PlayCircle className="size-12 text-white/90 group-hover:scale-110 transition-smooth" />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 text-white text-xs px-1.5 py-0.5 font-medium">
          {formatMinutes(lesson.durationMinutes)}
        </span>
        {completed && (
          <span className="absolute top-2 left-2 rounded-md bg-emerald-500 text-white text-xs px-1.5 py-0.5 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3" /> Concluída
          </span>
        )}
      </button>

      <div className="p-4">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{lesson.title}</p>
        <p className="text-xs text-muted mt-1">{lesson.professor}</p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleWatch}
            className="flex-1 h-9 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-smooth"
          >
            Assistir
          </button>
          <button
            onClick={handleToggleComplete}
            title={completed ? "Marcar como pendente" : "Marcar como concluída"}
            className={cn(
              "size-9 rounded-lg border border-border grid place-items-center transition-smooth shrink-0",
              completed ? "bg-emerald-500/10 text-emerald-600" : "text-muted hover:bg-surface-2"
            )}
          >
            {completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
          </button>
          <button
            onClick={() => toggleFavorite("lesson", lesson.id)}
            title="Favoritar"
            className={cn(
              "size-9 rounded-lg border border-border grid place-items-center transition-smooth shrink-0",
              favorited ? "bg-amber-500/10 text-amber-500" : "text-muted hover:bg-surface-2"
            )}
          >
            <Star className={cn("size-4", favorited && "fill-amber-500")} />
          </button>
        </div>
      </div>
    </div>
  );
}
