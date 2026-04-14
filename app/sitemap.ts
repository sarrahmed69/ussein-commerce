import { createClient } from "@/lib/supabase/client";

export default async function sitemap() {
  const SITE = "https://www.ussein-commerce.com";
  const today = new Date().toISOString();

  const staticPages = [
    { url: SITE, lastModified: today, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE}/produits`, lastModified: today, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE}/vendeurs`, lastModified: today, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE}/categories`, lastModified: today, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE}/devenir-vendeur`, lastModified: today, changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  try {
    const supabase = createClient();

    const [{ data: vendors }, { data: products }] = await Promise.all([
      supabase.from("vendors").select("id,updated_at").eq("status", "active"),
      supabase.from("products").select("id,updated_at").eq("status", "active"),
    ]);

    const vendorPages = (vendors || []).map((v) => ({
      url: `${SITE}/vendeurs/${v.id}`,
      lastModified: v.updated_at || today,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const productPages = (products || []).map((p) => ({
      url: `${SITE}/produits/${p.id}`,
      lastModified: p.updated_at || today,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...vendorPages, ...productPages];
  } catch {
    return staticPages;
  }
}