import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import VendeurClient from "./VendeurClient";

const SITE = "https://www.ussein-commerce.com";

async function getVendeur(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("id,shop_name,description,logo_url,is_verified,rating,total_sales,wave_number")
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function getProduits(vendorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name,images,price,promo_price,promo_ends_at")
    .eq("vendor_id", vendorId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);
  return data || [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const v = await getVendeur(params.id);
  if (!v) return { title: "Boutique introuvable — USSEIN Commerce" };

  const produits = await getProduits(v.id);
  const nomsProduits = produits.map((p: any) => p.name).join(", ");
  const image = v.logo_url || produits[0]?.images?.[0] || `${SITE}/images/USSEIN-logo.jpg`;

  const titre = `${v.shop_name} — Boutique USSEIN Commerce`;
  const desc = v.description
    ? `${v.description}${nomsProduits ? ` · Produits : ${nomsProduits}` : ""}`
    : `Decouvrez la boutique ${v.shop_name} sur USSEIN Commerce. ${nomsProduits ? `Produits disponibles : ${nomsProduits}.` : ""} Paiement Wave et Orange Money accepte.`;
  const url = `${SITE}/vendeurs/${v.id}`;

  return {
    title: titre,
    description: desc,
    keywords: ["USSEIN Commerce", v.shop_name, "boutique campus", "marketplace etudiant", "Wave Orange Money", nomsProduits],
    alternates: { canonical: url },
    openGraph: {
      title: titre,
      description: desc,
      url,
      siteName: "USSEIN Commerce",
      locale: "fr_SN",
      type: "profile",
      images: [{ url: image, width: 1200, height: 630, alt: `Boutique ${v.shop_name} sur USSEIN Commerce` }],
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description: desc,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export default function VendeurDetailPage({ params }: { params: { id: string } }) {
  return <VendeurClient id={params.id} />;
}