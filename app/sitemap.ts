import { createClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const SITE = "https://www.ussein-commerce.com";
  const today = new Date().toISOString();

  // Pages statiques
  const staticPages = [
    { url: SITE, lastModified: today, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/produits`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/vendeurs`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/categories`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/devenir-vendeur`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Pages vendeurs dynamiques
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, updated_at")
    .eq("status", "active");

  const vendorPages = (vendors || []).map((v) => ({
    url: `${SITE}/vendeurs/${v.id}`,
    lastModified: v.updated_at || today,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Pages produits dynamiques
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("status", "active");

  const productPages = (products || []).map((p) => ({
    url: `${SITE}/produits/${p.id}`,
    lastModified: p.updated_at || today,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...vendorPages, ...productPages];
}