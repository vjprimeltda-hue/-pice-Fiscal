"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { questionsService, subjectsService } from "@/services";
import type { Question, Subject } from "@/types";

export default function QuestoesPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("todas");

  useEffect(() => {
    Promise.all([questionsService.list(), subjectsService.list()]).then(([q, s]) => {
      setQuestions(q);
      setSubjects(s);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () =>
      questions.filter(
        (q) =>
          (subjectFilter === "todas" || q.subjectId === subjectFilter) &&
          q.statement.toLowerCase().includes(search.toLowerCase())
      ),
    [questions, subjectFilter, search]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Questões</h1>
        <p className="text-muted text-sm mt-1">Pratique com questões comentadas e acompanhe seu desempenho.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar questão..."
          className="w-full h-11 rounded-xl border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
        />
      </div>

      <FilterChips
        value={subjectFilter}
        onChange={setSubjectFilter}
        options={[{ value: "todas", label: "Todas as matérias" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">Nenhuma questão encontrada para essa busca.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filtered.map((question, i) => (
            <QuestionCard key={question.id} question={question} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
