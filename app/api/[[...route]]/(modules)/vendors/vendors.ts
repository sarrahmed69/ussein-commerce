import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { authMiddleware, getUser, getSupabase } from "../middleware/auth";

const registerVendorSchema = z.object({
  shopName: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["student", "association", "department", "official"]),
  ufr: z.string().max(100).optional(),
  studentId: z.string().max(50).optional(),
  waveNumber: z.string().regex(/^7[0-9]{8}$/).optional(),
  orangeMoneyNumber: z.string().regex(/^7[0-9]{8}$/).optional(),
  campusDelivery: z.boolean().default(true),
});

const updateVendorSchema = z.object({
  shopName: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  waveNumber: z.string().regex(/^7[0-9]{8}$/).optional().nullable(),
  campusDelivery: z.boolean().optional(),
});

const vendorsRouter = new Hono()
  // PUBLIC : lister les vendeurs actifs
  .get("/", async (c) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data, error } = await supabase
      .from("vendors")
      .select("id, shop_name, slug, description, type, status, campus_delivery, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  })

  // PROTEGE : verifier si user connecte est vendeur (AVANT /:id !)
  .get("/me", authMiddleware, async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const { data, error } = await supabase
      .from("vendors")
      .select("id, shop_name, slug, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);
    if (error || !data || data.length === 0) return c.json({ success: false }, 404);
    return c.json({ success: true, data: data[0] });
  })

  // PUBLIC : detail d un vendeur
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data, error } = await supabase
      .from("vendors")
      .select("id, shop_name, slug, description, type, status, campus_delivery, created_at")
      .eq("id", id)
      .single();

    if (error || !data) return c.json({ success: false, error: "Vendeur introuvable" }, 404);
    return c.json({ success: true, data });
  })

  // PROTEGE : creer une boutique (user_id force cote serveur)
  .post("/register", authMiddleware, zValidator("json", registerVendorSchema), async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const body = c.req.valid("json");

    const slug = body.shopName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

    // Verifier si cet utilisateur a deja utilise un trial sur une boutique passee
    const { data: existingVendors } = await supabase
      .from("vendors")
      .select("id, subscription_status")
      .eq("user_id", user.id);

    const hasUsedTrial = existingVendors && existingVendors.length > 0;
    const trialStatus = hasUsedTrial ? "expired" : "trial";
    const trialExpiry = hasUsedTrial
      ? new Date().toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const shopStatus = hasUsedTrial ? "suspended" : "active";

    const { data, error } = await supabase.from("vendors").insert({
      user_id: user.id,
      shop_name: body.shopName.trim(),
      slug,
      description: body.description?.trim() || null,
      type: body.type,
      ufr: body.ufr?.trim() || null,
      student_id: body.studentId?.trim() || null,
      wave_number: body.waveNumber || null,
      orange_money_number: body.orangeMoneyNumber || null,
      campus_delivery: body.campusDelivery,
      status: shopStatus,
      subscription_status: trialStatus,
      subscription_expires_at: trialExpiry,
    }).select().single();

    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data, message: "Boutique creee avec succes !" }, 201);
  })

  // PROTEGE : modifier sa propre boutique uniquement
  .put("/:id", authMiddleware, zValidator("json", updateVendorSchema), async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const { id } = c.req.param();
    const body = c.req.valid("json");

    // Verifier que la boutique appartient bien a cet utilisateur
    const { data: vendor, error: checkError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !vendor) {
      return c.json({ success: false, error: "Boutique introuvable ou acces refuse" }, 403);
    }

    const updates: any = {};
    if (body.shopName) updates.shop_name = body.shopName.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.waveNumber !== undefined) updates.wave_number = body.waveNumber;
    if (body.campusDelivery !== undefined) updates.campus_delivery = body.campusDelivery;

    const { data, error } = await supabase
      .from("vendors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  })

  // PROTEGE : supprimer sa propre boutique UNIQUEMENT
  .delete("/:id", authMiddleware, async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const { id } = c.req.param();

    // Verifier que la boutique appartient a cet user
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return c.json({ success: false, error: "Acces refuse" }, 403);

    // Supprimer seulement les produits de CETTE boutique
    await supabase.from("products").delete().eq("vendor_id", id);

    // Supprimer seulement CETTE boutique — le compte user reste intact
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) return c.json({ success: false, error: error.message }, 500);

    // Le flag is_vendor reste true — le vendeur garde son acces dashboard
    return c.json({ success: true, message: "Boutique supprimee. Votre compte vendeur reste actif." });
  });

export default vendorsRouter;