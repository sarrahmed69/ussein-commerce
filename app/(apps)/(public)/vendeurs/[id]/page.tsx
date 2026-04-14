"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbBuildingStore, TbStarFilled, TbPhone, TbBrandWhatsapp,
  TbPackage, TbArrowLeft, TbShieldCheck, TbShare, TbCheck,
  TbMapPin, TbClock, TbFlame, TbTag,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function VendeurDetailPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split("/").pop();
    if (!id) { setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data: v } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
      if (!v) { setLoading(false); return; }
      const { data: p } = await supabase
        .from("products")
        .select("id, name, price, images, category, stock, promo_price, promo_ends_at")
        .eq("vendor_id", v.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setVendor(v);
      setProducts(p || []);
      setLoading(false);
    })();
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: vendor?.shop_name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#2d5a1b] border-t-transparent rounded-full" /></div>;

  if (!vendor) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <TbBuildingStore className="text-gray-300" size={60} />
      <p className="text-gray-500">Boutique introuvable</p>
      <Link href="/vendeurs" className="bg-[#2d5a1b] text-white px-6 py-3 rounded-xl text-sm font-semibold">Voir toutes les boutiques</Link>
    </div>
  );

  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();
  const phone = vendor.wave_number || "";
  const memberSince = new Date(vendor.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const promoCount = products.filter(isPromo).length;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="relative h-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d10] via-[#2d5a1b] to-[#3d7a28]" />
        <div className="relative max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
          <Link href="/vendeurs" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium bg-white/10 px-4 py-2 rounded-2xl">
            <TbArrowLeft size={16} /> Boutiques
          </Link>
          <button onClick={handleShare} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium bg-white/10 px-4 py-2 rounded-2xl">
            {copied ? <><TbCheck size={16} /> Copie !</> : <><TbShare size={16} /> Partager</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 space-y-6 pb-12">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-24 h-24 bg-[#2d5a1b]/10 rounded-3xl flex items-center justify-center font-extrabold text-3xl text-[#2d5a1b] flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
              {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover" /> : vendor.shop_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-2xl font-extrabold text-gray-900">{vendor.shop_name}</h1>
                {vendor.is_verified && <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold border border-emerald-100"><TbShieldCheck size={14} /> Verifie</span>}
              </div>
              {vendor.description && <p className="text-gray-500 text-sm leading-relaxed mb-3">{vendor.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><TbPackage size={16} className="text-[#2d5a1b]" /> {products.length} produit{products.length > 1 ? "s" : ""}</span>
                {vendor.total_sales > 0 && <span className="flex items-center gap-1.5"><TbCheck size={16} className="text-[#2d5a1b]" /> {vendor.total_sales} ventes</span>}
                {vendor.rating > 0 && <span className="flex items-center gap-1.5 text-amber-500 font-bold"><TbStarFilled size={16} /> {(vendor.rating / 10).toFixed(1)}/5</span>}
                <span className="flex items-center gap-1.5"><TbClock size={16} /> Membre depuis {memberSince}</span>
              </div>
            </div>
          </div>
          {phone && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <a href={"https://wa.me/" + phone.replace(/\D/g, "")} target="_blank" className="flex-1 sm:flex-none bg-[#25D366] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                <TbBrandWhatsapp size={20} /> Contacter sur WhatsApp
              </a>
              <a href={"tel:+221" + phone} className="bg-gray-50 text-gray-700 px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 border border-gray-200">
                <TbPhone size={18} /> Appeler
              </a>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900">Produits</h2>
            {promoCount > 0 && <span className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100"><TbFlame size={14} /> {promoCount} promo{promoCount > 1 ? "s" : ""}</span>}
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
              <TbPackage className="text-gray-300 mx-auto mb-4" size={40} />
              <p className="text-gray-800 font-bold">Aucun produit</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p: any) => {
                const promo = isPromo(p);
                const discount = promo ? Math.round((1 - p.promo_price / p.price) * 100) : 0;
                return (
                  <Link key={p.id} href={"/produits/" + p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-300" size={36} /></div>}
                      {promo && <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl"><TbFlame size={12} className="inline" /> -{discount}%</div>}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-800 text-sm truncate mb-0.5">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><TbTag size={11} /> {p.category}</p>}
                      {promo ? (
                        <div className="flex items-center gap-2">
                          <p className="text-red-500 font-extrabold text-base">{fmt(p.promo_price)}</p>
                          <p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p>
                        </div>
                      ) : (
                        <p className="text-[#2d5a1b] font-extrabold text-base">{fmt(p.price)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}