/**
 * Controls whether the Supabase session survives a browser restart.
 * Supabase's browser client persists the session in a single storage area,
 * so "lembrar-me" is implemented by choosing that area (localStorage vs.
 * sessionStorage) *before* signing in, via this flag.
 */
const FLAG_KEY = "apice-remember-me";

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FLAG_KEY, remember ? "1" : "0");
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(FLAG_KEY) !== "0";
}
