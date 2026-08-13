/**
 * Student-facing billing reads: own subscription status and the active
 * catalog of plans. Purchases themselves happen outside the app (Kirvano
 * checkout) or via the create-subscription Edge Function (Mercado Pago) —
 * this service only reads what proxy.ts and /assinatura need to render.
 */
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export const billingService = {
  async hasActiveSubscription(): Promise<boolean> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc("has_active_subscription", { check_user_id: user.id });
    if (error) throw error;
    return data ?? false;
  },

  async getMySubscription(): Promise<SubscriptionRow | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listActivePlans(): Promise<PlanRow[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("price_cents", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};
