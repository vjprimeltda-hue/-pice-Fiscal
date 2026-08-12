import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Accounts are provisioned only by the kirvano-webhook Edge Function after a
// purchase is approved (it invites the buyer by email). There is no public
// self-signup: Supabase Auth's signup endpoint is disabled in config.toml,
// so a form here would only ever fail.
export default function CreateAccountPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo-wide.png" alt="Ápice Fiscal" className="h-9 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-foreground">Acesso por compra</h2>
        <p className="text-muted text-sm mt-1.5 mb-8">
          Sua conta é criada automaticamente após a compra do Acesso Vitalício. Verifique seu
          email para definir sua senha, ou entre se já tiver uma conta.
        </p>

        <Link href="/login">
          <Button className="w-full" size="lg">
            Entrar
          </Button>
        </Link>
      </div>
    </div>
  );
}
