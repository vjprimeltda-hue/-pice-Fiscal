"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { favoritesService, contentTypeFor, type FavoriteKind } from "@/services/favorites";
import { useAuth } from "@/context/AuthContext";

interface FavoritesContextValue {
  isFavorited: (kind: FavoriteKind, id: string) => boolean;
  toggleFavorite: (kind: FavoriteKind, id: string, materialType?: string) => void;
  favoriteLessonIds: Set<string>;
  favoriteMaterialIds: Set<string>;
  favoriteQuestionIds: Set<string>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<Set<string>>(new Set());
  const [favoriteMaterialIds, setFavoriteMaterialIds] = useState<Set<string>>(new Set());
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const load = isAuthenticated
      ? favoritesService.list()
      : Promise.resolve({ lessonIds: [], materialIds: [], questionIds: [] });

    load.then(({ lessonIds, materialIds, questionIds }) => {
      if (cancelled) return;
      setFavoriteLessonIds(new Set(lessonIds));
      setFavoriteMaterialIds(new Set(materialIds));
      setFavoriteQuestionIds(new Set(questionIds));
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

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

  const toggleFavorite = (kind: FavoriteKind, id: string, materialType?: string) => {
    const wasFavorited = sets[kind].has(id);
    setters[kind]((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (wasFavorited) {
      favoritesService.remove(id).catch(() => {
        setters[kind]((prev) => new Set(prev).add(id));
      });
    } else {
      favoritesService.add(id, contentTypeFor(kind, materialType)).catch(() => {
        setters[kind]((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    }
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
