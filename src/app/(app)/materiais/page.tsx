"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MaterialCard } from "@/components/materiais/MaterialCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { materialsService, subjectsService } from "@/services";
import type { Material, MaterialType, Subject } from "@/types";

const typeOptions: { value: MaterialType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os tipos" },
  { value: "pdf", label: "PDF" },
  { value: "resumo", label: "Resumos" },
  { value: "mapa-mental", label: "Mapas Mentais" },
  { value: "lei", label: "Leis" },
  { value: "exercicios", label: "Exercícios" },
];

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("todas");
  const [typeFilter, setTypeFilter] = useState<MaterialType | "todos">("todos");

  useEffect(() => {
    Promise.all([materialsService.list(), subjectsService.list()]).then(([m, s]) => {
      setMaterials(m);
      setSubjects(s);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () =>
      materials.filter(
        (m) =>
          (subjectFilter === "todas" || m.subjectId === subjectFilter) &&
          (typeFilter === "todos" || m.type === typeFilter) &&
          m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [materials, subjectFilter, typeFilter, search]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Material[]>();
    for (const material of filtered) {
      const list = map.get(material.subjectId) ?? [];
      list.push(material);
      map.set(material.subjectId, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Materiais</h1>
        <p className="text-muted text-sm mt-1">Biblioteca de PDFs, resumos, mapas mentais e leis secas.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar material..."
          className="w-full h-11 rounded-xl border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
        />
      </div>

      <div className="space-y-3">
        <FilterChips
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={[{ value: "todas", label: "Todas as matérias" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <FilterChips value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">Nenhum material encontrado para essa busca.</p>
      ) : (
        <div className="space-y-8">
          {subjects
            .filter((s) => grouped.has(s.id))
            .map((subject) => (
              <div key={subject.id}>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: subject.color }} />
                  {subject.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {grouped.get(subject.id)!.map((material) => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
