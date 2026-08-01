"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, ChevronDown, User as UserIcon, Settings, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { notifications as mockNotifications } from "@/data/mock";
import { initials, formatRelativeDate } from "@/utils/format";

export function Header() {
  const { setMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(mockNotifications.filter((n) => !n.read).length);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Sessão encerrada com sucesso.", "info");
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) showToast(`Buscando por "${search}"...`, "info");
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-border bg-surface/80 backdrop-blur px-4 lg:px-6 flex items-center gap-3">
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden text-foreground p-2 -ml-2"
        aria-label="Abrir menu"
      >
        <Menu className="size-6" />
      </button>

      <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Pesquisar aulas, materiais, questões..."
          className="w-full h-10 rounded-xl border border-border bg-surface-2 pl-10 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2.5 rounded-xl hover:bg-surface-2 transition-smooth text-foreground"
            aria-label="Notificações"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent ring-2 ring-surface" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 card p-2 animate-fade-in max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-semibold">Notificações</span>
                {unread > 0 && (
                  <button
                    onClick={() => setUnread(0)}
                    className="text-xs text-accent hover:underline"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-2 py-2.5 rounded-lg text-sm hover:bg-surface-2 transition-smooth cursor-pointer",
                      !n.read && "bg-accent-soft/60"
                    )}
                  >
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="text-muted text-xs mt-0.5">{n.message}</p>
                    <p className="text-muted text-[11px] mt-1">{formatRelativeDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-2 transition-smooth"
          >
            <div className="size-9 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
              {user ? initials(user.name) : "?"}
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground max-w-32 truncate">
              {user?.name ?? "Aluno"}
            </span>
            <ChevronDown className="hidden md:block size-4 text-muted" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 card p-1.5 animate-fade-in">
              <Link
                href="/perfil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-surface-2 transition-smooth"
              >
                <UserIcon className="size-4 text-muted" /> Meu Perfil
              </Link>
              <Link
                href="/configuracoes"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-surface-2 transition-smooth"
              >
                <Settings className="size-4 text-muted" /> Configurações
              </Link>
              <hr className="my-1 border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-smooth"
              >
                <LogOut className="size-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
