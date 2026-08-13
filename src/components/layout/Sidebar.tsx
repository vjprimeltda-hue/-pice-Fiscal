"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  ListChecks,
  CalendarDays,
  ClipboardList,
  Star,
  User,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/videoaulas", label: "Videoaulas", icon: PlayCircle },
  { href: "/materiais", label: "Materiais", icon: BookOpen },
  { href: "/questoes", label: "Questões", icon: ListChecks },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/plano-de-estudos", label: "Plano de Estudos", icon: ClipboardList },
  { href: "/favoritos", label: "Favoritos", icon: Star },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/perfil", label: "Meu Perfil", icon: User },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast("Sessão encerrada com sucesso.", "info");
    router.push("/login");
  };

  const content = (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className={cn("flex items-center gap-3 h-16 px-5 shrink-0", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <img src="/logo-icon.png" alt="Ápice Fiscal" className="h-8 w-auto shrink-0" />
        ) : (
          <img src="/logo-wide.png" alt="Ápice Fiscal" className="h-8 w-auto shrink-0" />
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto lg:hidden text-white/70 hover:text-white"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                collapsed && "justify-center px-0",
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.3 : 2} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "Painel Admin" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-smooth mb-1",
              collapsed && "justify-center px-0"
            )}
          >
            <ShieldCheck className="size-5 shrink-0" />
            {!collapsed && <span>Painel Admin</span>}
          </Link>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-smooth",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-smooth mt-1"
        >
          {collapsed ? <ChevronsRight className="size-5 shrink-0" /> : <ChevronsLeft className="size-5 shrink-0" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 transition-[width] duration-200 ease-out",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
