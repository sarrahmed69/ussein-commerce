import { createServerClient } from "@supabase/ssr";
import { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
  const cookieHeader = c.req.header("cookie") || "";
  
  // Log pour debug
  console.log("[AUTH] cookies recus:", cookieHeader.substring(0, 200));

  const cookies = cookieHeader.split(";").map((pair) => {
    const [name, ...rest] = pair.trim().split("=");
    return { name: name.trim(), value: rest.join("=") };
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookies,
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log("[AUTH] user:", user?.id || "NULL", "error:", error?.message || "none");

  if (error || !user) {
    return c.json({ success: false, error: "Non autorise" }, 401);
  }

  c.set("user", user);
  c.set("supabase", supabase);
  await next();
}

export function getUser(c: Context) {
  return c.get("user") as { id: string; email: string; [key: string]: any };
}

export function getSupabase(c: Context) {
  return c.get("supabase");
}