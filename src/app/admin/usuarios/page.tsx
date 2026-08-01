"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldOff, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { adminUsersService } from "@/services/admin";
import { formatDatePtBr, initials } from "@/utils/format";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => adminUsersService.list().then(setUsers).catch(() => showToast("Erro ao carregar usuários.", "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const toggleRole = async (profile: Profile) => {
    if (profile.id === currentUser?.id) {
      showToast("Você não pode alterar seu próprio papel.", "error");
      return;
    }
    const nextRole = profile.role === "admin" ? "aluno" : "admin";
    if (!confirm(`Tornar ${profile.name} ${nextRole === "admin" ? "administrador" : "aluno"}?`)) return;
    setUpdatingId(profile.id);
    try {
      await adminUsersService.setRole(profile.id, nextRole);
      showToast("Papel atualizado.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível atualizar.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Usuários" description="Alunos e administradores da plataforma." />

      <div className="relative mb-4 max-w-sm">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full h-10 rounded-xl border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!filtered &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {filtered?.map((profile) => (
              <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                      {initials(profile.name)}
                    </div>
                    <span className="font-medium text-foreground">{profile.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{profile.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={profile.role === "admin" ? "accent" : "neutral"}>
                    {profile.role === "admin" ? "Administrador" : "Aluno"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted">{formatDatePtBr(profile.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRole(profile)}
                    disabled={updatingId === profile.id || profile.id === currentUser?.id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {profile.role === "admin" ? (
                      <>
                        <ShieldOff className="size-3.5" /> Remover admin
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3.5" /> Tornar admin
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
