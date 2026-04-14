import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 60;

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      const res = NextResponse.json(cache.data);
      res.headers.set("X-Cache", "HIT");
      res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      return res;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [{ data: products }, { data: vendors }, { data: categories }] = await Promise.all([
      supabase.from("products").select("id, name, price, category, images, promo_price, promo_ends_at").eq("status", "active").order("created_at", { ascending: false }).limit(8),
      supabase.from("vendors").select("id, shop_name, slug, logo_url, is_verified, total_sales, campus, residence, subscription_status, subscription_expires_at").eq("status", "active").neq("subscription_status", "suspended").order("total_sales", { ascending: false }).limit(4),
      supabase.from("categories").select("id, name, image_url").limit(8),
    ]);

    const result = { products: products || [], vendors: vendors || [], categories: categories || [] };
    cache = { data: result, ts: Date.now() };

    const res = NextResponse.json(result);
    res.headers.set("X-Cache", "MISS");
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch {
    return NextResponse.json({ products: [], vendors: [], categories: [] });
  }
}