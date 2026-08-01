"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LessonCard } from "@/components/videoaulas/LessonCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { lessonsService, subjectsService } from "@/services";
import type { Lesson, Subject } from "@/types";

export default function VideoaulasPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("todas");

  useEffect(() => {
    Promise.all([lessonsService.list(), subjectsService.list()]).then(([l, s]) => {
      setLessons(l);
      setSubjects(s);
      setLoading(false);
    });
  }, []);

  const filteredBySubject = useMemo(
    () => lessons.filter((l) => subjectFilter === "todas" || l.subjectId === subjectFilter),
    [lessons, subjectFilter]
  );

  const filtered = useMemo(
    () =>
      filteredBySubject.filter(
        (l) =>
          l.title.toLowerCase().includes(search.toLowerCase()) ||
          l.professor.toLowerCase().includes(search.toLowerCase())
      ),
    [filteredBySubject, search]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const lesson of filtered) {
      const list = map.get(lesson.subjectId) ?? [];
      list.push(lesson);
      map.set(lesson.subjectId, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Videoaulas</h1>
        <p className="text-muted text-sm mt-1">Assista às aulas organizadas por matéria e continue seu progresso.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar aula ou professor..."
          className="w-full h-11 rounded-xl border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
        />
      </div>

      <FilterChips
        value={subjectFilter}
        onChange={setSubjectFilter}
        options={[{ value: "todas", label: "Todas as matérias" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">Nenhuma aula encontrada para essa busca.</p>
      ) : (
        <div className="space-y-10">
          {subjects
            .filter((s) => grouped.has(s.id))
            .map((subject) => (
              <div key={subject.id}>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: subject.color }} />
                  {subject.name}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {grouped.get(subject.id)!.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
