"use client";

import { useRef, useState, type FormEvent } from "react";
import { Camera, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { initials } from "@/utils/format";

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [goal, setGoal] = useState(user?.goal ?? "");
  const [targetExam, setTargetExam] = useState(user?.targetExam ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateUser({ name, email, phone, city, state, goal, targetExam, avatarUrl });
    setSavingProfile(false);
    showToast("Perfil atualizado com sucesso.", "success");
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("A nova senha deve ter ao menos 6 caracteres.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("A confirmação de senha não confere.", "error");
      return;
    }
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 500));
    setSavingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Senha alterada com sucesso.", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted text-sm mt-1">Gerencie suas informações pessoais e objetivo de concurso.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações pessoais</CardTitle>
        </CardHeader>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="size-20 rounded-full object-cover" />
              ) : (
                <div className="size-20 rounded-full bg-navy text-white grid place-items-center text-xl font-semibold">
                  {name ? initials(name) : "?"}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 size-8 rounded-full bg-accent text-white grid place-items-center border-2 border-surface"
                aria-label="Alterar foto"
              >
                <Camera className="size-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Foto de perfil</p>
              <p className="text-xs text-muted mt-0.5">PNG ou JPG, até 5MB.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Estado" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
            </div>
            <Input label="Concurso desejado" value={targetExam} onChange={(e) => setTargetExam(e.target.value)} />
            <Input label="Objetivo" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>

          <Button type="submit" loading={savingProfile}>
            Salvar alterações
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <div className="size-9 rounded-xl bg-accent-soft grid place-items-center text-accent">
            <KeyRound className="size-4" />
          </div>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input label="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={savingPassword}>
            Alterar senha
          </Button>
        </form>
      </Card>
    </div>
  );
}
