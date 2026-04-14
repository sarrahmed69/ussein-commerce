"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbPackage, TbClock, TbTrendingUp, TbArrowRight } from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {[1,2,3,4,5,6,7,8].map(i => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div className="h-40 bg-gray-100" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

function Card({ p }: { p: any }) {
  return (
    <Link href={`/produits/${p.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-50">
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          : <TbPackage className="text-gray-300" size={36} />}
        {p.category && (
          <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {p.category}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
        {p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date() ? (<div className="mt-1"><div className="flex items-center gap-1.5"><p className="text-red-500 font-bold text-sm">{fmt(p.promo_price)}</p><p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p><span className="bg-red-100 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded-full">-{Math.round((1-p.promo_price/p.price)*100)}%</span></div></div>) : (<p className="text-[#4a7c2f] font-bold text-sm mt-1">{fmt(p.price)}</p>)}
        {p.stock != null && p.stock <= 3 && p.stock > 0 && (
          <p className="text-orange-500 text-[10px] font-semibold mt-0.5">Plus que {p.stock} en stock !</p>
        )}
      </div>
    </Link>
  );
}

export default function TrendingProducts() {
  const [recent, setRecent] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recent" | "popular">("recent");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("products").select("id,name,price,category,images,stock,promo_price,promo_ends_at").eq("status","active").order("created_at",{ascending:false}).limit(8),
        supabase.from("products").select("id,name,price,category,images,stock,promo_price,promo_ends_at").eq("status","active").order("created_at",{ascending:false}).limit(8),
      ]);
      setRecent(r || []);
      setPopular(p || []);
      setLoading(false);
    })();
  }, []);

  const displayed = tab === "recent" ? recent : popular;

  return (
    <section className="px-4 py-10 max-w-7xl mx-auto">
      {/* Header avec onglets */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab("recent")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "recent" ? "bg-white text-[#4a7c2f] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <TbClock size={15} /> Nouveaux
          </button>
          <button
            onClick={() => setTab("popular")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "popular" ? "bg-white text-[#4a7c2f] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <TbTrendingUp size={15} /> Populaires
          </button>
        </div>
        <Link href="/produits" className="text-xs text-[#4a7c2f] font-semibold hover:underline flex items-center gap-1">
          Voir tout <TbArrowRight size={14} />
        </Link>
      </div>

      {/* Grille */}
      {loading ? <SkeletonGrid /> : displayed.length === 0 ? (
        <div className="text-center py-16">
          <TbPackage className="text-gray-200 mx-auto mb-3" size={48} />
          <p className="text-gray-400 text-sm">Aucun produit pour le moment</p>
          <Link href="/devenir-vendeur" className="text-[#4a7c2f] text-sm font-semibold hover:underline mt-2 block">
            Soyez le premier a vendre !
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayed.map(p => <Card key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}