"use client";

import { useState } from "react";
import { Download, Eye, FileText, Map, ScrollText, Star, ListTree, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import { materialsService } from "@/services/content";
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
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);
  const favorited = isFavorited("material", material.id);
  const meta = typeMeta[material.type];
  const Icon = meta.icon;

  const handlePreview = async () => {
    setBusy("preview");
    try {
      const url = await materialsService.getSignedUrl(material.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível abrir o arquivo.", "error");
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      const url = await materialsService.getSignedDownloadUrl(material.id, material.name);
      const a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Baixando "${material.name}"...`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível baixar o arquivo.", "error");
    } finally {
      setBusy(null);
    }
  };

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
          onClick={handlePreview}
          disabled={busy !== null}
          title="Visualizar"
          className="size-9 rounded-lg border border-border grid place-items-center text-muted hover:bg-surface-2 transition-smooth disabled:opacity-50"
        >
          {busy === "preview" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
        </button>
        <button
          onClick={handleDownload}
          disabled={busy !== null}
          title="Baixar"
          className="size-9 rounded-lg border border-border grid place-items-center text-muted hover:bg-surface-2 transition-smooth disabled:opacity-50"
        >
          {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </button>
        <button
          onClick={() => toggleFavorite("material", material.id, material.type)}
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
