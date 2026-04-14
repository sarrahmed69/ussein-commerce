import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec service_role — bypasse le RLS
 * A utiliser UNIQUEMENT cote serveur (webhooks, cron jobs)
 * Ne jamais exposer SUPABASE_SERVICE_ROLE_KEY au client
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Variables Supabase service_role manquantes");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function updateOrderPaid(orderId: string, amount: number, method: string) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_method: method,
      payment_amount: amount,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending");

  if (error) {
    console.error(`updateOrderPaid [${orderId}] erreur:`, error.message);
    return false;
  }
  console.log(`Commande ${orderId} marquee payee via ${method}`);
  return true;
}