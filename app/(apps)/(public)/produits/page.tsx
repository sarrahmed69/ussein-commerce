"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbSearch, TbPackage, TbFlame, TbX,
  TbDeviceLaptop, TbShirt, TbToolsKitchen2, TbBook2,
  TbHome2, TbBrush, TbBriefcase, TbCategory2, TbPencil,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const CATS = [
  { label: "Tous", icon: TbCategory2 },
  { label: "Electronique", icon: TbDeviceLaptop },
  { label: "Vetements", icon: TbShirt },
  { label: "Alimentation", icon: TbToolsKitchen2 },
  { label: "Livres", icon: TbBook2 },
  { label: "Logement", icon: TbHome2 },
  { label: "Beaute", icon: TbBrush },
  { label: "Services", icon: TbBriefcase },
  { label: "Autre", icon: TbPencil },
];

export default function ProduitsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("cat") || "Tous");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id,name,price,category,images,stock,description,promo_price,promo_ends_at,whatsapp_contact")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  // Filtrage intelligent
  const filtered = products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    // Comparaison insensible a la casse + partielle pour la categorie
    const matchCat = cat === "Tous" ||
      p.category?.toLowerCase().trim() === cat.toLowerCase().trim() ||
      p.category?.toLowerCase().trim().includes(cat.toLowerCase().trim());

    return matchSearch && matchCat;
  });

  const isPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();
  const clearSearch = () => setSearch("");

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* Header */}
      <div className="bg-[#1a3d10] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-extrabold text-white mb-4">Produits</h1>
          <div className="flex bg-white rounded-xl overflow-hidden shadow-md">
            <div className="flex items-center pl-4">
              <TbSearch size={17} className="text-gray-400" />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 px-3 py-3.5 text-sm text-gray-800 outline-none bg-transparent"
            />
            {search && (
              <button onClick={clearSearch} className="pr-4 text-gray-400 hover:text-gray-600">
                <TbX size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres categories */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATS.map(c => (
              <button key={c.label} onClick={() => setCat(c.label)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  cat === c.label
                    ? "bg-[#1a3d10] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>
                <c.icon size={13} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Compteur resultats */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 font-medium">
              {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
              {cat !== "Tous" && <span className="text-[#2d5a1b] font-semibold"> · {cat}</span>}
              {search && <span className="text-[#2d5a1b] font-semibold"> · "{search}"</span>}
            </p>
            {(cat !== "Tous" || search) && (
              <button onClick={() => { setCat("Tous"); clearSearch(); }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <TbX size={12} /> Effacer
              </button>
            )}
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TbPackage className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-700 font-bold mb-1">Aucun produit trouve</p>
            <p className="text-gray-400 text-sm mb-4">Essayez un autre mot-cle ou une autre categorie</p>
            <button onClick={() => { setCat("Tous"); clearSearch(); }}
              className="text-sm text-[#2d5a1b] font-semibold hover:underline">
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => {
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
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-lg">Epuise</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    {p.category && (
                      <p className="text-[10px] text-gray-400 mt-0.5 mb-1.5">{p.category}</p>
                    )}
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
      </div>
    </div>
  );
}