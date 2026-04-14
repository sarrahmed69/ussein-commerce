"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TbBuildingStore, TbStarFilled, TbPhone, TbBrandWhatsapp,
  TbPackage, TbArrowLeft, TbShieldCheck, TbLoader2, TbShare, TbCheck,
  TbMapPin, TbClock, TbFlame, TbTag, TbChevronRight, TbHeart,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
      <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
    </div>
  );
}

export default function VendeurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data: v } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
      if (!v) { setLoading(false); return; }
      const { data: p } = await supabase
        .from("products")
        .select("id, name, price, images, category, stock, promo_price, promo_ends_at, delivery_available")
        .eq("vendor_id", v.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setVendor(v);
      setProducts(p || []);
      setLoading(false);
    })();
  }, [id]);

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

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="h-48 bg-gradient-to-br from-[#1a3d10] to-[#2d5a1b] animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-3"><div className="h-6 bg-gray-200 rounded-xl w-1/3" /><div className="h-4 bg-gray-100 rounded-lg w-2/3" /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(i => <ProductSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-6">
      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
        <TbBuildingStore className="text-gray-300" size={48} />
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-bold text-lg mb-1">Boutique introuvable</p>
        <p className="text-gray-400 text-sm">Cette boutique n existe pas ou a ete supprimee</p>
      </div>
      <Link href="/vendeurs" className="bg-[#2d5a1b] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#1a3d10] transition-colors">
        Voir toutes les boutiques
      </Link>
    </div>
  );

  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();
  const isSuspended = vendor?.subscription_status === "suspended" || vendor?.status === "suspended";

  if (isSuspended) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-6 p-6">
      <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center">
        <TbBuildingStore className="text-orange-400" size={48} />
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-bold text-lg mb-1">Boutique indisponible</p>
        <p className="text-gray-400 text-sm">Cette boutique est temporairement inactive</p>
      </div>
      <Link href="/vendeurs" className="bg-[#2d5a1b] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#1a3d10] transition-colors">
        Voir les autres boutiques
      </Link>
    </div>
  );
  const phone = vendor.wave_number || "";
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];
  const filtered = filter === "all" ? products : products.filter((p: any) => p.category === filter);
  const promoCount = products.filter(isPromo).length;
  const memberSince = new Date(vendor.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Banner */}
      <div className="relative h-20 lg:h-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d10] via-[#2d5a1b] to-[#3d7a28]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a017]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
          <Link href="/vendeurs" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm transition-all">
            <TbArrowLeft size={16} /> Boutiques
          </Link>
          <button onClick={handleShare} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm transition-all">
            {copied ? <><TbCheck size={16} /> Copie !</> : <><TbShare size={16} /> Partager</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 space-y-6 pb-12">
        {/* Carte vendeur */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-24 h-24 bg-gradient-to-br from-[#2d5a1b]/10 to-[#2d5a1b]/5 rounded-3xl flex items-center justify-center font-extrabold text-3xl text-[#2d5a1b] flex-shrink-0 overflow-hidden border-4 border-white shadow-lg shadow-green-900/10">
              {vendor.logo_url
                ? <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover" />
                : vendor.shop_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">{vendor.shop_name}</h1>
                {vendor.is_verified && (
                  <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold border border-emerald-100">
                    <TbShieldCheck size={14} /> Verifie
                  </span>
                )}
              </div>
              {vendor.description && <p className="text-gray-500 text-[15px] leading-relaxed mb-3 max-w-xl">{vendor.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5 font-medium"><TbPackage size={16} className="text-[#2d5a1b]" /> {products.length} produit{products.length > 1 ? "s" : ""}</span>
                {vendor.total_sales > 0 && <span className="flex items-center gap-1.5 font-medium"><TbCheck size={16} className="text-[#2d5a1b]" /> {vendor.total_sales} ventes</span>}
                {vendor.rating > 0 && <span className="flex items-center gap-1.5 text-amber-500 font-bold"><TbStarFilled size={16} /> {(vendor.rating / 10).toFixed(1)}/5</span>}
                {vendor.campus && <span className="flex items-center gap-1.5 font-medium"><TbMapPin size={16} className="text-[#2d5a1b]" /> {vendor.campus}{vendor.residence ? " · " + vendor.residence : ""}</span>}
                <span className="flex items-center gap-1.5"><TbClock size={16} /> Membre depuis {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Boutons contact */}
          {phone && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <a href={"https://wa.me/" + phone.replace(/\D/g, "")} target="_blank"
                className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-400/20">
                <TbBrandWhatsapp size={20} /> Contacter sur WhatsApp
              </a>
              <a href={"tel:+221" + phone}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 border border-gray-200">
                <TbPhone size={18} /> Appeler
              </a>
            </div>
          )}
        </div>





        {/* Grille produits */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Produits
            </h2>
            {promoCount > 0 && filter === "all" && (
              <span className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100">
                <TbFlame size={14} /> {promoCount} promo{promoCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <TbPackage className="text-gray-300" size={40} />
              </div>
              <p className="text-gray-800 font-bold mb-1">Aucun produit</p>
              <p className="text-gray-400 text-sm">Cette boutique n a pas encore de produit dans cette categorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p: any) => {
                const promo = isPromo(p);
                const discount = promo ? Math.round((1 - p.promo_price / p.price) * 100) : 0;
                return (
                  <Link key={p.id} href={"/produits/" + p.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all group hover:-translate-y-0.5">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-300" size={36} /></div>}
                      {promo && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl shadow-lg shadow-red-200/50">
                          <TbFlame size={12} /> -{discount}%
                        </div>
                      )}
                      {p.stock < 3 && p.stock > 0 && (
                        <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                          Plus que {p.stock}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-800 text-sm truncate mb-0.5">{p.name}</p>
                      {p.category && (
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><TbTag size={11} /> {p.category}</p>
                      )}
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