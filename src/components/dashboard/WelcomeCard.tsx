import { Sparkles } from "lucide-react";

export function WelcomeCard({ name }: { name: string }) {
  const firstName = name.split(" ")[0];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-light text-white p-6 sm:p-8">
      <div className="absolute -top-16 -right-16 size-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex items-center gap-2 text-accent-light text-sm font-medium mb-2">
        <Sparkles className="size-4" />
        <span>Bem-vindo novamente, {firstName}!</span>
      </div>
      <h1 className="relative text-2xl sm:text-3xl font-bold tracking-tight max-w-xl">
        Continue sua preparação rumo à aprovação.
      </h1>
      <p className="relative text-white/60 text-sm mt-2 max-w-lg">
        Cada minuto de estudo hoje te aproxima do cargo que você deseja. Vamos em frente!
      </p>
    </div>
  );
}
