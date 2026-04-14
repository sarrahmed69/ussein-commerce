import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware, getUser, getSupabase } from "../middleware/auth";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^7[0-9]{8}$/).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

const usersApp = new Hono()
  // GET /api/users/me — profil de l utilisateur connecte
  .get("/me", authMiddleware, async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);

    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, phone, avatar_url, created_at")
      .eq("id", user.id)
      .single();

    if (error) return c.json({ success: false, error: "Profil introuvable" }, 404);
    return c.json({ success: true, data });
  })

  // PUT /api/users/me — modifier son propre profil
  .put("/me", authMiddleware, zValidator("json", updateProfileSchema), async (c) => {
    const user = getUser(c);
    const supabase = getSupabase(c);
    const body = c.req.valid("json");

    const updates: any = {};
    if (body.firstName) updates.first_name = body.firstName.trim();
    if (body.lastName) updates.last_name = body.lastName.trim();
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)  // force : on ne peut modifier que son propre profil
      .select()
      .single();

    if (error) return c.json({ success: false, error: error.message }, 500);
    return c.json({ success: true, data });
  });

export default usersApp;