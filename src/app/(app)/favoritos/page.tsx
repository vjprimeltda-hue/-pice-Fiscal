"use client";

import { useEffect, useMemo, useState } from "react";
import { PlayCircle, FileText, ListChecks, Map } from "lucide-react";
import { LessonCard } from "@/components/videoaulas/LessonCard";
import { MaterialCard } from "@/components/materiais/MaterialCard";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { useFavorites } from "@/context/FavoritesContext";
import { lessonsService, materialsService, questionsService } from "@/services";
import type { Lesson, Material, Question } from "@/types";

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: typeof PlayCircle;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="size-5 text-accent" />
        {title}
        <span className="text-sm font-normal text-muted">({count})</span>
      </h2>
      {count === 0 ? (
        <p className="text-sm text-muted py-6 text-center card">Nenhum item favoritado ainda.</p>
      ) : (
        children
      )}
    </div>
  );
}

export default function FavoritosPage() {
  const { favoriteLessonIds, favoriteMaterialIds, favoriteQuestionIds } = useFavorites();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    Promise.all([lessonsService.list(), materialsService.list(), questionsService.list()]).then(
      ([l, m, q]) => {
        setLessons(l);
        setMaterials(m);
        setQuestions(q);
      }
    );
  }, []);

  const favoriteLessons = useMemo(() => lessons.filter((l) => favoriteLessonIds.has(l.id)), [lessons, favoriteLessonIds]);
  const favoriteMaterials = useMemo(() => materials.filter((m) => favoriteMaterialIds.has(m.id)), [materials, favoriteMaterialIds]);
  const favoriteQuestions = useMemo(() => questions.filter((q) => favoriteQuestionIds.has(q.id)), [questions, favoriteQuestionIds]);

  const pdfs = favoriteMaterials.filter((m) => m.type === "pdf" || m.type === "resumo" || m.type === "lei");
  const mindMaps = favoriteMaterials.filter((m) => m.type === "mapa-mental");
  const exercises = favoriteMaterials.filter((m) => m.type === "exercicios");

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
        <p className="text-muted text-sm mt-1">Todo o conteúdo que você marcou para acessar depois.</p>
      </div>

      <Section title="Videoaulas" icon={PlayCircle} count={favoriteLessons.length}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </Section>

      <Section title="PDFs e Resumos" icon={FileText} count={pdfs.length}>
        <div className="grid sm:grid-cols-2 gap-3">
          {pdfs.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </Section>

      <Section title="Mapas Mentais" icon={Map} count={mindMaps.length}>
        <div className="grid sm:grid-cols-2 gap-3">
          {mindMaps.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </Section>

      <Section title="Exercícios e Questões" icon={ListChecks} count={exercises.length + favoriteQuestions.length}>
        <div className="space-y-4 max-w-3xl">
          {exercises.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {exercises.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
          {favoriteQuestions.map((question, i) => (
            <QuestionCard key={question.id} question={question} index={i + 1} />
          ))}
        </div>
      </Section>
    </div>
  );
}
