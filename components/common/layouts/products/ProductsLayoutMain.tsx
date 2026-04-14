"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbPackage, TbLoader2 } from "react-icons/tb";
import { useSearchParams } from "next/navigation";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function ProductsLayoutMain() {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") || "";
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("id,name,price,category,images,stock,description,delivery_available,promo_price,promo_ends_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);
      if (cat) query = query.eq("category", cat);
      if (q) query = query.ilike("name", "%" + q + "%");
      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    })();
  }, [cat, q]);

  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center py-24"><TbLoader2 className="animate-spin text-[#4a7c2f]" size={36} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <TbPackage className="text-gray-300 mx-auto mb-4" size={60} />
          <p className="text-gray-500 font-medium">Aucun produit pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <Link key={p.id} href={"/produits/" + p.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <TbPackage className="text-gray-300" size={48} />}
                {isPromo(p) && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    -{Math.round((1 - p.promo_price / p.price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                {p.category && <span className="text-xs bg-green-50 text-[#4a7c2f] px-2 py-0.5 rounded-full">{p.category}</span>}
                {isPromo(p) ? (
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-red-500 font-bold text-sm">{fmt(p.promo_price)}</p>
                    <p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p>
                  </div>
                ) : (
                  <p className="text-[#4a7c2f] font-bold mt-1">{fmt(p.price)}</p>
                )}
                {p.delivery_available && <p className="text-xs text-green-600 mt-1">Livraison campus</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}