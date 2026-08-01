"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { lessons as initialLessons, materials as initialMaterials, questions as initialQuestions } from "@/data/mock";

type FavoriteKind = "lesson" | "material" | "question";

interface FavoritesContextValue {
  isFavorited: (kind: FavoriteKind, id: string) => boolean;
  toggleFavorite: (kind: FavoriteKind, id: string) => void;
  favoriteLessonIds: Set<string>;
  favoriteMaterialIds: Set<string>;
  favoriteQuestionIds: Set<string>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<Set<string>>(
    () => new Set(initialLessons.filter((l) => l.favorited).map((l) => l.id))
  );
  const [favoriteMaterialIds, setFavoriteMaterialIds] = useState<Set<string>>(
    () => new Set(initialMaterials.filter((m) => m.favorited).map((m) => m.id))
  );
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<Set<string>>(
    () => new Set(initialQuestions.filter((q) => q.favorited).map((q) => q.id))
  );

  const setters: Record<FavoriteKind, (updater: (prev: Set<string>) => Set<string>) => void> = {
    lesson: setFavoriteLessonIds,
    material: setFavoriteMaterialIds,
    question: setFavoriteQuestionIds,
  };

  const sets: Record<FavoriteKind, Set<string>> = {
    lesson: favoriteLessonIds,
    material: favoriteMaterialIds,
    question: favoriteQuestionIds,
  };

  const toggleFavorite = (kind: FavoriteKind, id: string) => {
    setters[kind]((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isFavorited = (kind: FavoriteKind, id: string) => sets[kind].has(id);

  const value = useMemo(
    () => ({ isFavorited, toggleFavorite, favoriteLessonIds, favoriteMaterialIds, favoriteQuestionIds }),
    [favoriteLessonIds, favoriteMaterialIds, favoriteQuestionIds]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
