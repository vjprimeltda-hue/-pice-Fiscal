"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap as CourseIcon,
  PlayCircle,
  FileText,
  ListChecks,
  CreditCard,
  Bell,
  LogOut,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const navItems = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/materias", label: "Matérias", icon: BookOpen },
  { href: "/admin/cursos", label: "Cursos", icon: CourseIcon },
  { href: "/admin/videoaulas", label: "Videoaulas", icon: PlayCircle },
  { href: "/admin/materiais", label: "Materiais", icon: FileText },
  { href: "/admin/questoes", label: "Questões", icon: ListChecks },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/notificacoes", label: "Notificações", icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast("Sessão encerrada com sucesso.", "info");
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col shrink-0 w-64 h-screen sticky top-0 bg-navy text-white">
      <div className="flex items-center gap-3 h-16 px-5 shrink-0">
        <div className="size-9 rounded-xl bg-gradient-to-br from-accent to-accent-light grid place-items-center shrink-0">
          <GraduationCap className="size-5 text-navy" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm tracking-tight">Ápice Fiscal</p>
          <p className="text-[11px] text-white/50">Painel administrativo</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.3 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-smooth"
        >
          <ArrowLeft className="size-5 shrink-0" />
          <span>Voltar ao app</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-smooth"
        >
          <LogOut className="size-5 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
