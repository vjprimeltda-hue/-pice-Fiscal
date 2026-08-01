"use client";

import { Download, Eye, FileText, Map, ScrollText, Star, ListTree } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import type { Material, MaterialType } from "@/types";

const typeMeta: Record<MaterialType, { label: string; icon: typeof FileText; tone: string }> = {
  pdf: { label: "PDF", icon: FileText, tone: "text-red-600 bg-red-500/10" },
  "mapa-mental": { label: "Mapa Mental", icon: Map, tone: "text-emerald-600 bg-emerald-500/10" },
  resumo: { label: "Resumo", icon: ScrollText, tone: "text-accent bg-accent-soft" },
  lei: { label: "Lei Seca", icon: ListTree, tone: "text-amber-600 bg-amber-500/10" },
  exercicios: { label: "Exercícios", icon: FileText, tone: "text-navy bg-navy/5 dark:text-white dark:bg-white/10" },
};

export function MaterialCard({ material }: { material: Material }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const favorited = isFavorited("material", material.id);
  const meta = typeMeta[material.type];
  const Icon = meta.icon;

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={cn("size-11 rounded-xl grid place-items-center shrink-0", meta.tone)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{material.name}</p>
        <p className="text-xs text-muted mt-0.5">
          {meta.label} · {formatFileSize(material.sizeKb)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => showToast(`Abrindo "${material.name}"...`, "info")}
          title="Visualizar"
          className="size-9 rounded-lg border border-border grid place-items-center text-muted hover:bg-surface-2 transition-smooth"
        >
          <Eye className="size-4" />
        </button>
        <button
          onClick={() => showToast(`Baixando "${material.name}"...`, "success")}
          title="Baixar"
          className="size-9 rounded-lg border border-border grid place-items-center text-muted hover:bg-surface-2 transition-smooth"
        >
          <Download className="size-4" />
        </button>
        <button
          onClick={() => toggleFavorite("material", material.id)}
          title="Favoritar"
          className={cn(
            "size-9 rounded-lg border border-border grid place-items-center transition-smooth",
            favorited ? "bg-amber-500/10 text-amber-500" : "text-muted hover:bg-surface-2"
          )}
        >
          <Star className={cn("size-4", favorited && "fill-amber-500")} />
        </button>
      </div>
    </div>
  );
}
