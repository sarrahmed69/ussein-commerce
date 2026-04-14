import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, getUser, getSupabase } from "../middleware/auth";
import { updateOrderPaid } from "../lib/supabase-admin";

const omInitiateSchema = z.object({
  amount: z.number().min(100).max(5_000_000),
  orderId: z.string().uuid(),
});

async function getOrangeToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: { "Authorization": `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Token Orange Money invalide");
  return data.access_token;
}

const orangeMoneyRouter = new Hono()
  .post("/initiate", authMiddleware, zValidator("json", omInitiateSchema), async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const { amount, orderId } = c.req.valid("json");

    const { data: order, error: orderError } = await supabase
      .from("orders").select("id, total_amount, status")
      .eq("id", orderId).eq("user_id", user.id).single();

    if (orderError || !order) return c.json({ success: false, error: "Commande introuvable ou acces refuse" }, 403);
    if (order.status !== "pending") return c.json({ success: false, error: "Cette commande ne peut plus etre payee" }, 400);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = process.env.ORANGE_MONEY_ENV === "production"
      ? "https://api.orange.com/orange-money-webpay/sn/v1"
      : "https://api.orange.com/orange-money-webpay/dev/v1";

    try {
      const token = await getOrangeToken();
      const omResponse = await fetch(`${baseUrl}/webpayment`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_key: process.env.ORANGE_MONEY_MERCHANT_NUMBER,
          currency: "OUV", order_id: orderId, amount: amount.toString(),
          return_url: `${appUrl}/commande/succes?order=${orderId}`,
          cancel_url: `${appUrl}/commande/annulation`,
          notif_url: `${appUrl}/api/payments/orange-money/webhook`,
          lang: "fr", reference: `USSEIN-${orderId.slice(0, 8).toUpperCase()}`,
        }),
      });
      const session = await omResponse.json();
      if (session.status !== "200") return c.json({ success: false, error: session.message }, 400);
      return c.json({ success: true, paymentUrl: session.payment_url, payToken: session.pay_token });
    } catch (error) {
      return c.json({ success: false, error: "Erreur Orange Money" }, 500);
    }
  })

  .post("/webhook", async (c) => {
    const body = await c.req.json();

    if (body.status === "SUCCESS" && body.order_id) {
      await updateOrderPaid(body.order_id, Number(body.amount), "orange-money");
    }

    return c.json({ received: true });
  });

export default orangeMoneyRouter;