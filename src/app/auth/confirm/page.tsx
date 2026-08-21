import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { confirmEmailLink } from "./actions";

/**
 * Landing point for every Supabase Auth email link: cadastro/convite
 * (invite), recuperação de senha (recovery). The link itself only carries
 * token_hash/type/next — verification happens in confirmEmailLink, and only
 * on this page's button submit (see actions.ts for why).
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash, type, next } = await searchParams;

  if (!token_hash || !type) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <img src="/logo-wide.png" alt="Ápice Fiscal" className="h-9 w-auto" />
          </div>
          <div className="card p-6">
            <p className="text-foreground font-semibold">Link inválido</p>
            <p className="text-muted text-sm mt-2">Este link de acesso está incompleto ou corrompido.</p>
            <Link href="/login" className="inline-block mt-5">
              <Button>Voltar para o login</Button>
            </Link>
            <p className="text-muted text-xs mt-4">
              Tem o código de 6 dígitos do email?{" "}
              <Link href="/auth/codigo" className="text-accent font-semibold hover:underline">
                Entrar com código
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo-wide.png" alt="Ápice Fiscal" className="h-9 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Confirmar acesso</h2>
        <p className="text-muted text-sm mt-1.5 mb-8">
          Clique no botão abaixo para confirmar e entrar na sua conta.
        </p>
        <form action={confirmEmailLink}>
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <Button type="submit" className="w-full" size="lg">
            Confirmar e entrar
          </Button>
        </form>
        <p className="text-muted text-xs mt-4">
          Botão não funcionou?{" "}
          <Link
            href={`/auth/codigo?type=${type}&next=${encodeURIComponent(next ?? "/dashboard")}`}
            className="text-accent font-semibold hover:underline"
          >
            Entrar com código
          </Link>
        </p>
      </div>
    </div>
  );
}
