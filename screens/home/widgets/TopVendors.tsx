"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbArrowRight, TbCheck } from "react-icons/tb";

export default function TopVendors() {
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("vendors")
        .select("id, shop_name, logo_url, is_verified, description, total_sales")
        .eq("status", "active")
        .order("total_sales", { ascending: false })
        .limit(6);
      setVendeurs(data || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && !vendeurs.length) return null;

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Nos vendeurs</h2>
          <p className="text-xs text-gray-400 mt-0.5">Boutiques actives sur le campus</p>
        </div>
        <Link href="/vendeurs" className="text-xs text-[#2d5a1b] font-semibold flex items-center gap-1 hover:underline">
          Voir tout <TbArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-2" />
              <div className="h-2 bg-gray-100 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {vendeurs.map(v => (
            <Link key={v.id} href={`/vendeurs/${v.id}`}
              className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a1b]/10 text-[#2d5a1b] flex items-center justify-center font-extrabold text-lg mx-auto mb-2 overflow-hidden group-hover:bg-[#2d5a1b] group-hover:text-white transition-colors">
                {v.logo_url
                  ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                  : v.shop_name?.[0]?.toUpperCase()}
              </div>
              <p className="font-bold text-gray-800 text-xs truncate">{v.shop_name}</p>
              {v.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold mt-1">
                  <TbCheck size={10} /> Verifie
                </span>
              )}
              {v.total_sales > 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">{v.total_sales} ventes</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}