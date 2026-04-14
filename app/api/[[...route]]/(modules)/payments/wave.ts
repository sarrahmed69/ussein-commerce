import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createHmac } from "crypto";
import { authMiddleware, getUser, getSupabase } from "../middleware/auth";
import { updateOrderPaid } from "../lib/supabase-admin";

const waveInitiateSchema = z.object({
  amount: z.number().min(100).max(5_000_000),
  orderId: z.string().uuid(),
});

const waveRouter = new Hono()
  .post("/initiate", authMiddleware, zValidator("json", waveInitiateSchema), async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const { amount, orderId } = c.req.valid("json");

    const apiKey = process.env.WAVE_API_KEY;
    if (!apiKey) return c.json({ success: false, error: "Configuration Wave manquante" }, 500);

    const { data: order, error: orderError } = await supabase
      .from("orders").select("id, total_amount, status")
      .eq("id", orderId).eq("user_id", user.id).single();

    if (orderError || !order) return c.json({ success: false, error: "Commande introuvable ou acces refuse" }, 403);
    if (order.status !== "pending") return c.json({ success: false, error: "Cette commande ne peut plus etre payee" }, 400);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      const waveResponse = await fetch("https://api.wave.com/v1/checkout/sessions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount.toString(), currency: "XOF",
          error_url: `${appUrl}/commande/erreur`,
          success_url: `${appUrl}/commande/succes?order=${orderId}`,
          client_reference: orderId,
        }),
      });
      if (!waveResponse.ok) {
        const err = await waveResponse.json();
        return c.json({ success: false, error: err.message || "Erreur Wave" }, 400);
      }
      const session = await waveResponse.json();
      return c.json({ success: true, checkoutUrl: session.wave_launch_url, sessionId: session.id });
    } catch (error) {
      return c.json({ success: false, error: "Erreur lors de l initiation Wave" }, 500);
    }
  })

  .post("/webhook", async (c) => {
    const secret = process.env.WAVE_WEBHOOK_SECRET;
    const signature = c.req.header("wave-signature");
    const rawBody = await c.req.text();

    if (secret && signature) {
      const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
      if (signature !== expected) return c.json({ error: "Signature invalide" }, 401);
    }

    const body = JSON.parse(rawBody);
    const { status, client_reference: orderId, amount } = body;

    if (status === "succeeded" && orderId) {
      await updateOrderPaid(orderId, Number(amount), "wave");
    }

    return c.json({ received: true });
  });

export default waveRouter;