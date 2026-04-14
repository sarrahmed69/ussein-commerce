"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbSearch, TbArrowRight, TbShieldCheck, TbBrandWhatsapp,
  TbPackage, TbBuildingStore, TbFlame, TbCheck,
  TbDeviceLaptop, TbShirt, TbToolsKitchen2, TbBook2,
  TbHome2, TbBrush, TbBriefcase, TbCategory2,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const CATS = [
  { label: "Electronique", icon: TbDeviceLaptop, color: "text-blue-500 bg-blue-50", href: "/produits?cat=Electronique" },
  { label: "Vetements", icon: TbShirt, color: "text-purple-500 bg-purple-50", href: "/produits?cat=Vetements" },
  { label: "Alimentation", icon: TbToolsKitchen2, color: "text-red-500 bg-red-50", href: "/produits?cat=Alimentation" },
  { label: "Livres", icon: TbBook2, color: "text-orange-500 bg-orange-50", href: "/produits?cat=Livres" },
  { label: "Logement", icon: TbHome2, color: "text-green-600 bg-green-50", href: "/produits?cat=Logement" },
  { label: "Beaute", icon: TbBrush, color: "text-pink-500 bg-pink-50", href: "/produits?cat=Beaute" },
  { label: "Services", icon: TbBriefcase, color: "text-yellow-600 bg-yellow-50", href: "/produits?cat=Services" },
  { label: "Tout voir", icon: TbCategory2, color: "text-gray-500 bg-gray-100", href: "/produits" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from("products").select("id,name,price,images,category,promo_price,promo_ends_at,stock").eq("status", "active").order("created_at", { ascending: false }).limit(6),
        supabase.from("vendors").select("id,shop_name,logo_url,is_verified,total_sales").eq("status", "active").order("total_sales", { ascending: false }).limit(4),
      ]);
      setProducts(p || []);
      setVendors(v || []);
      setLoading(false);
    })();
  }, []);

  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="bg-[#1a3d10] px-4 pt-10 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-white/10 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide">
            Marketplace officielle · USSEIN
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-3">
            Achetez et vendez<br />sur le campus
          </h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Vendeurs verifies · Paiement Wave & Orange Money · Livraison campus
          </p>

          {/* Recherche */}
          <div className="flex bg-white rounded-2xl overflow-hidden shadow-lg max-w-md mx-auto">
            <div className="flex items-center pl-4">
              <TbSearch size={18} className="text-gray-400" />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") window.location.href = `/produits${search ? `?q=${encodeURIComponent(search)}` : ""}`; }}
              placeholder="Rechercher un produit..."
              className="flex-1 px-3 py-4 text-sm text-gray-800 outline-none bg-transparent"
            />
            <Link
              href={`/produits${search ? `?q=${encodeURIComponent(search)}` : ""}`}
              className="bg-[#d4a017] text-[#1a3d10] font-extrabold text-sm px-5 flex items-center whitespace-nowrap hover:bg-[#c49515] transition-colors"
            >
              Chercher
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: TbShieldCheck, label: "Vendeurs verifies" },
              { icon: TbBrandWhatsapp, label: "Support WhatsApp" },
              { icon: TbBuildingStore, label: "1 000 F / mois" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/50 text-xs">
                <Icon size={14} className="text-[#d4a017]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CATEGORIES
      ══════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {CATS.map((c) => (
              <Link key={c.label} href={c.href}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-all ${c.color}`}>
                  <c.icon size={22} />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#2d5a1b] transition-colors">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PRODUITS
      ══════════════════════════════════ */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-gray-900">Nouveaux produits</h2>
          <Link href="/produits" className="text-xs text-[#2d5a1b] font-semibold flex items-center gap-1">
            Voir tout <TbArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <TbPackage className="text-gray-200 mx-auto mb-3" size={40} />
            <p className="text-gray-400 text-sm">Aucun produit pour le moment</p>
            <Link href="/vendeur/creer" className="text-[#2d5a1b] text-sm font-semibold mt-2 inline-block">Soyez le premier a vendre</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => {
              const promo = isPromo(p);
              const img = Array.isArray(p.images) ? p.images[0] : null;
              const discount = promo ? Math.round((1 - p.promo_price / p.price) * 100) : 0;
              return (
                <Link key={p.id} href={`/produits/${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="relative h-36 bg-gray-50 overflow-hidden">
                    {img
                      ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-200" size={32} /></div>
                    }
                    {promo && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-0.5">
                        <TbFlame size={10} /> -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 truncate mb-1">{p.name}</p>
                    {p.category && <p className="text-[10px] text-gray-400 mb-1.5">{p.category}</p>}
                    {promo ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-red-500">{fmt(p.promo_price)}</span>
                        <span className="text-xs text-gray-300 line-through">{fmt(p.price)}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-extrabold text-[#2d5a1b]">{fmt(p.price)}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          BANNIERE VENDEUR
      ══════════════════════════════════ */}
      <section className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="bg-[#2d5a1b] rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#d4a017] uppercase tracking-widest mb-1">Devenir vendeur</p>
            <p className="text-white font-extrabold text-base leading-snug mb-1">Vendez sur le campus.</p>
            <p className="text-white/40 text-xs">30 jours gratuits · 1 000 F/mois ensuite</p>
          </div>
          <Link href="/devenir-vendeur"
            className="flex-shrink-0 bg-[#d4a017] text-[#0d1f09] font-extrabold text-xs px-5 py-3 rounded-xl hover:bg-[#c49515] transition-colors whitespace-nowrap flex items-center gap-1.5">
            Commencer <TbArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════
          VENDEURS
      ══════════════════════════════════ */}
      <section className="px-4 pb-12 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-gray-900">Vendeurs actifs</h2>
          <Link href="/vendeurs" className="text-xs text-[#2d5a1b] font-semibold flex items-center gap-1">
            Voir tout <TbArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? null : (
          <div className="grid grid-cols-2 gap-3">
            {vendors.map(v => (
              <Link key={v.id} href={`/vendeurs/${v.id}`}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2d5a1b]/10 text-[#2d5a1b] flex items-center justify-center font-extrabold text-base flex-shrink-0 overflow-hidden">
                  {v.logo_url
                    ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                    : v.shop_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{v.shop_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {v.is_verified && <TbCheck size={10} className="text-emerald-500" />}
                    <span className="text-[10px] text-gray-400">{v.total_sales > 0 ? `${v.total_sales} ventes` : "Nouveau"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}