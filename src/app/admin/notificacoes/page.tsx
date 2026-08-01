"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminNotificationsService } from "@/services/admin";
import { formatRelativeDate } from "@/utils/format";
import type { Database } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"] & { profiles: { name: string } | null };

export default function AdminNotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationRow[] | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const load = () =>
    adminNotificationsService
      .list()
      .then((data) => setNotifications(data as unknown as NotificationRow[]))
      .catch(() => showToast("Erro ao carregar notificações.", "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await adminNotificationsService.send({ title, message });
      showToast("Notificação enviada para todos os alunos.", "success");
      setTitle("");
      setMessage("");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível enviar.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Notificações" description="Envie avisos para todos os alunos da plataforma." />

      <Card className="max-w-xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <Button type="submit" icon={<Send className="size-4" />} loading={sending}>
            Enviar para todos os alunos
          </Button>
        </form>
      </Card>

      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Histórico</h2>
      <div className="space-y-2">
        {!notifications && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        {notifications?.length === 0 && <p className="text-muted text-sm">Nenhuma notificação enviada ainda.</p>}
        {notifications?.map((n) => (
          <div key={n.id} className="card p-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{n.title}</p>
                <Badge tone={n.user_id ? "neutral" : "accent"}>{n.user_id ? "individual" : "broadcast"}</Badge>
              </div>
              <p className="text-sm text-muted mt-0.5">{n.message}</p>
            </div>
            <span className="text-xs text-muted shrink-0">{formatRelativeDate(n.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
