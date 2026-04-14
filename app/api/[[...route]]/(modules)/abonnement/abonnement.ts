import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createServerClient } from "@supabase/ssr";

const abonnementSchema = z.object({
  vendorId: z.string().uuid(),
  txRef: z.string().min(3).max(100),
});

const abonnementRouter = new Hono()
  .post("/", zValidator("json", abonnementSchema), async (c) => {
    const { vendorId, txRef } = c.req.valid("json");

    const cookieHeader = c.req.header("cookie") || "";
    const cookies = cookieHeader.split(";").map((pair) => {
      const [name, ...rest] = pair.trim().split("=");
      return { name: name.trim(), value: rest.join("=") };
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookies, setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return c.json({ success: false, error: "Non autorise" }, 401);

    const { data: vendor, error: checkError } = await supabase
      .from("vendors")
      .select("id, shop_name")
      .eq("id", vendorId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !vendor) return c.json({ success: false, error: "Boutique introuvable" }, 403);

    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const { error } = await supabase.from("vendors").update({
      subscription_status: "pending",
      subscription_expires_at: expires.toISOString(),
      last_tx_ref: txRef,
      status: "active",
    }).eq("id", vendorId);

    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, message: "Paiement recu, verification sous 24h" });
  })

  .post("/suspend-expired", async (c) => {
    const adminKey = c.req.header("x-admin-key");
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return c.json({ success: false, error: "Non autorise" }, 401);
    }
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("vendors")
      .update({ status: "suspended", subscription_status: "expired" })
      .lt("subscription_expires_at", now)
      .in("subscription_status", ["trial", "active"])
      .select("id, shop_name");
    if (error) return c.json({ success: false, error: error.message }, 500);
    if (data && data.length > 0) {
      const ids = data.map((v: any) => v.id);
      await supabase.from("products").update({ status: "inactive" }).in("vendor_id", ids);
    }
    return c.json({ success: true, suspended: data?.length || 0 });
  });

export default abonnementRouter;