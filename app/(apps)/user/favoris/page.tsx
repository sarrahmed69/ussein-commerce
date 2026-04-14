"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbArrowLeft, TbHeart, TbPackage, TbLoader2, TbX } from "react-icons/tb";

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function Favoris() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavoris = async () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (favs.length === 0) { setProducts([]); setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase.from("products").select("id,name,price,images,category,promo_price,promo_ends_at,stock").in("id", favs).eq("status", "active");
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadFavoris(); }, []);

  const removeFavori = (id: string) => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    localStorage.setItem("favorites", JSON.stringify(favs.filter((f: string) => f !== id)));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getPrice = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date() ? p.promo_price : p.price;
  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/user/dashboard" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><TbArrowLeft size={20} /></Link>
        <h1 className="font-bold text-gray-800 flex-1">Mes favoris</h1>
        {products.length > 0 && <span className="text-xs bg-red-100 text-red-500 font-bold px-2.5 py-1 rounded-full">{products.length}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><TbLoader2 className="animate-spin text-primary" size={36} /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <TbHeart className="text-gray-200 mb-4" size={64} />
          <p className="font-semibold text-gray-500">Aucun favori pour l instant</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Ajoutez des produits a vos favoris en cliquant sur le coeur</p>
          <Link href="/produits" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm">Voir les produits</Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
                <button onClick={() => removeFavori(p.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                  <TbX size={14} className="text-red-400" />
                </button>
                <Link href={"/produits/" + p.id}>
                  <div className="h-36 bg-gray-100 overflow-hidden relative">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-300" size={32} /></div>}
                    {isPromo(p) && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">PROMO</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    {p.category && <p className="text-xs text-gray-400 mb-1">{p.category}</p>}
                    {isPromo(p) ? (
                      <div className="flex items-center gap-1">
                        <p className="text-red-500 font-bold text-sm">{formatPrice(p.promo_price)}</p>
                        <p className="text-gray-400 text-xs line-through">{formatPrice(p.price)}</p>
                      </div>
                    ) : (
                      <p className="text-primary font-bold text-sm">{formatPrice(p.price)}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}