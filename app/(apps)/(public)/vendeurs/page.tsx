"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbBuildingStore, TbStar, TbArrowRight, TbLoader2, TbSearch, TbPackage, TbCheck, TbX } from "react-icons/tb";

export default function VendeursPage() {
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("vendors").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (data) {
        const with_count = await Promise.all(data.map(async (v) => {
          const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", v.id).eq("status", "active");
          return { ...v, nbProduits: count || 0 };
        }));
        setVendeurs(with_count);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = vendeurs.filter(v => v.shop_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* Hero */}
      <div className="bg-[#1a3d10] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-extrabold text-white mb-1">Vendeurs</h1>
          <p className="text-white/50 text-sm mb-4">Boutiques actives des etudiants USSEIN</p>
          <div className="flex bg-white rounded-xl overflow-hidden shadow-md">
            <div className="flex items-center pl-4"><TbSearch size={17} className="text-gray-400" /></div>
            <input
              className="flex-1 px-3 py-3.5 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="Rechercher une boutique..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="pr-4 text-gray-400 hover:text-gray-600"><TbX size={16} /></button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><TbLoader2 className="animate-spin text-[#4a7c2f]" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <TbBuildingStore className="text-gray-200 mx-auto mb-3" size={48} />
            <p className="font-semibold text-gray-500 mb-1">{search ? "Aucune boutique trouvee" : "Aucun vendeur pour le moment"}</p>
            <p className="text-sm text-gray-400 mb-5">Soyez le premier a vendre sur le campus !</p>
            <Link href="/devenir-vendeur" className="bg-[#d4a017] text-[#1a3d10] px-5 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2">
              <TbBuildingStore size={16} /> Creer ma boutique
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 font-medium">{filtered.length} boutique{filtered.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((v) => (
                <Link key={v.id} href={`/vendeurs/${v.id}`}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[#4a7c2f]/10 text-[#4a7c2f] flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden group-hover:bg-[#4a7c2f] group-hover:text-white transition-colors">
                    {v.logo_url
                      ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                      : v.shop_name?.[0]?.toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{v.shop_name}</h3>
                      {v.is_verified && (
                        <span className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                          <TbCheck size={10} className="text-green-600" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <TbStar size={11} className="text-yellow-400" />
                        {v.rating ? `${v.rating}/5` : "Nouveau"}
                      </span>
                      <span className="flex items-center gap-1">
                        <TbPackage size={11} />
                        {v.nbProduits} produit{v.nbProduits > 1 ? "s" : ""}
                      </span>
                    </div>
                    {v.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{v.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-[#4a7c2f] text-xs font-semibold mt-3">
                      Voir la boutique <TbArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/devenir-vendeur" className="bg-[#1a3d10] text-white px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 hover:bg-[#2d5a1b] transition-colors">
                Devenir vendeur <TbArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}