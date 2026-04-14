"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { useRouter } from "next/navigation";
import { TbPlus, TbPackage, TbPencil, TbTrash, TbLoader2, TbEye, TbSearch, TbPhoto, TbLock, TbCreditCard, TbTag, TbX, TbArrowLeft } from "react-icons/tb";
import { useCartStore } from "@/lib/zustand/cart-store";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

type Product = { id: string; name: string; price: number; category: string; stock: number; status: string; images: string[]; promo_price: number | null; promo_ends_at: string | null };

export default function MesProduits() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [promoModal, setPromoModal] = useState<Product | null>(null);
  const [promoPrice, setPromoPrice] = useState("");
  const [promoEnds, setPromoEnds] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const { removeItem } = useCartStore();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const savedId = localStorage.getItem("vendor_selected_id");
      const { data: vendors } = await supabase.from("vendors").select("id, subscription_status, subscription_expires_at").eq("user_id", user.id);
      const vendor = (savedId && vendors?.find((v: any) => v.id === savedId)) ? vendors.find((v: any) => v.id === savedId) : vendors?.[0] ?? null;
      const vid = vendor?.id ?? null;
      if (!vid) { setLoading(false); return; }
      const expired = !vendor?.subscription_expires_at || new Date(vendor?.subscription_expires_at) <= new Date();
      const isOk = (vendor?.subscription_status === "active" && !expired) || (vendor?.subscription_status === "trial" && !expired) || vendor?.subscription_status === "pending";
      setSuspended(!isOk);
      const { data } = await supabase.from("products").select("id, name, price, category, stock, status, images, promo_price, promo_ends_at").eq("vendor_id", vid).order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const deleteProduct = async (id: string) => {
    if (suspended) return;
    setDeleting(id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDeleting(null); return; }
      const p = products.find(x => x.id === id);
      if (p?.images?.length) {
        const paths = p.images.map((url: string) => { try { const parts = url.split("/object/public/products/"); return parts[1] ? decodeURIComponent(parts[1]) : null; } catch { return null; } }).filter(Boolean) as string[];
        if (paths.length) await (createClient()).storage.from("products").remove(paths);
      }
      const { error } = await (createClient()).from("products").delete().eq("id", id);
      if (error) { alert("Erreur : " + error.message); setDeleting(null); return; }
      removeItem(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); } finally { setDeleting(null); setConfirmDelete(null); }
  };

  const savePromo = async () => {
    if (!promoModal) return;
    if (!promoPrice || parseInt(promoPrice) >= promoModal.price) { alert("Le prix promo doit etre inferieur au prix normal !"); return; }
    if (!promoEnds) { alert("Choisissez une date de fin de promo !"); return; }
    setPromoLoading(true);
    const supabase = createClient();
    await supabase.from("products").update({ promo_price: parseInt(promoPrice), promo_ends_at: new Date(promoEnds).toISOString() }).eq("id", promoModal.id);
    setProducts(prev => prev.map(p => p.id === promoModal.id ? { ...p, promo_price: parseInt(promoPrice), promo_ends_at: new Date(promoEnds).toISOString() } : p));
    setPromoLoading(false);
    setPromoModal(null);
    setPromoPrice("");
    setPromoEnds("");
  };

  const removePromo = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").update({ promo_price: null, promo_ends_at: null }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, promo_price: null, promo_ends_at: null } : p));
  };

  const isPromoActive = (p: Product) => p.promo_price !== null && p.promo_ends_at !== null && new Date(p.promo_ends_at) > new Date();

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes produits</h1>
          <p className="text-sm text-gray-500">{products.length} produit{products.length > 1 ? "s" : ""}</p>
        </div>
        {suspended ? (
          <Link href="/vendor/abonnement" className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors self-start sm:self-auto">
            <TbLock size={18} /> Renouveler l abonnement
          </Link>
        ) : (
          <Link href="/vendor/produits/nouveau" className="bg-[#4a7c2f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#1e2570] transition-opacity self-start sm:self-auto">
            <TbPlus size={18} /> Nouveau produit
          </Link>
        )}
      </div>

      {suspended && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><TbLock className="text-red-500" size={20} /></div>
            <div>
              <p className="font-bold text-red-800 text-sm">Boutique suspendue</p>
              <p className="text-red-600 text-xs mt-0.5">Renouvelez pour retrouver l acces complet.</p>
            </div>
          </div>
          <Link href="/vendor/abonnement" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap flex-shrink-0">
            <TbCreditCard size={14} /> Renouveler — 1 000 FCFA
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="relative">
          <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><TbLoader2 className="text-primary animate-spin" size={36} /></div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><TbPackage className="text-gray-400" size={40} /></div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun produit pour l instant</h3>
          <p className="text-gray-400 text-sm mb-6">Ajoutez votre premier produit pour commencer a vendre.</p>
          {!suspended && <Link href="/vendor/produits/nouveau" className="bg-[#4a7c2f] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-[#1e2570]"><TbPlus size={18} /> Ajouter mon premier produit</Link>}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><TbSearch size={36} className="mx-auto mb-2" /><p>Aucun produit trouve pour "{search}"</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex gap-3 p-3">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <TbPhoto className="text-gray-300" size={24} />}
                  {isPromoActive(p) && <span className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black px-1 rounded-br-lg">PROMO</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                  {isPromoActive(p) ? (
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-red-500 font-bold text-sm">{fmt(p.promo_price!)}</p>
                      <p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p>
                    </div>
                  ) : (
                    <p className="text-primary font-bold text-sm mt-1">{fmt(p.price)}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{p.status === "active" ? "Actif" : p.status}</span>
                    <span className="text-xs text-gray-400">· Stock: {p.stock}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Link href={"/produits/"+p.id} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"><TbEye size={15} /></Link>
                  {!suspended && <Link href={"/vendor/produits/"+p.id+"/modifier"} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"><TbPencil size={15} /></Link>}
                  {!suspended && (
                    isPromoActive(p)
                      ? <button onClick={() => removePromo(p.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><TbX size={15} /></button>
                      : <button onClick={() => { setPromoModal(p); setPromoPrice(""); setPromoEnds(""); }} className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors"><TbTag size={15} /></button>
                  )}
                  <button onClick={() => setConfirmDelete(p.id)} disabled={suspended} className={"w-8 h-8 rounded-lg flex items-center justify-center transition-colors " + (suspended ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500")}>
                    {deleting === p.id ? <TbLoader2 size={15} className="animate-spin" /> : <TbTrash size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden hidden lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-4">Produit</th>
                  <th className="text-left px-6 py-4">Categorie</th>
                  <th className="text-left px-6 py-4">Prix</th>
                  <th className="text-left px-6 py-4">Stock</th>
                  <th className="text-left px-6 py-4">Statut</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className={"transition-colors " + (suspended ? "bg-gray-50/50" : "hover:bg-gray-50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <TbPhoto className="text-gray-300" size={18} />}
                          {isPromoActive(p) && <span className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-black px-0.5 rounded-br-md">%</span>}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 truncate max-w-[160px] block">{p.name}</span>
                          {isPromoActive(p) && <span className="text-[10px] text-red-500 font-semibold">Promo jusqu au {new Date(p.promo_ends_at!).toLocaleDateString("fr-FR")}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{p.category}</span></td>
                    <td className="px-6 py-4">
                      {isPromoActive(p) ? (
                        <div>
                          <p className="text-red-500 font-bold">{fmt(p.promo_price!)}</p>
                          <p className="text-gray-400 text-xs line-through">{fmt(p.price)}</p>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-700">{fmt(p.price)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.stock}</td>
                    <td className="px-6 py-4"><span className={"text-xs px-2 py-1 rounded-full font-medium " + (p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{p.status === "active" ? "Actif" : p.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={"/produits/"+p.id} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"><TbEye size={15} /></Link>
                        {suspended ? <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 cursor-not-allowed"><TbLock size={15} /></div> : <Link href={"/vendor/produits/"+p.id+"/modifier"} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"><TbPencil size={15} /></Link>}
                        {!suspended && (
                          isPromoActive(p)
                            ? <button onClick={() => removePromo(p.id)} title="Supprimer la promo" className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><TbX size={15} /></button>
                            : <button onClick={() => { setPromoModal(p); setPromoPrice(""); setPromoEnds(""); }} title="Mettre en promo" className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors"><TbTag size={15} /></button>
                        )}
                        <button onClick={() => setConfirmDelete(p.id)} disabled={suspended} className={"w-8 h-8 rounded-lg flex items-center justify-center transition-colors " + (suspended ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500")}>
                          {deleting === p.id ? <TbLoader2 size={15} className="animate-spin" /> : suspended ? <TbLock size={15} /> : <TbTrash size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmModal message="Supprimer ce produit ?" subMessage="Il sera retire du panier. Votre boutique reste intacte." confirmLabel="Supprimer" danger onConfirm={() => deleteProduct(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}

      {/* Modal Promo */}
      {promoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Promotion</p>
                  <h3 className="text-white text-lg font-black">{promoModal.name}</h3>
                  <p className="text-white/60 text-xs mt-0.5">Prix actuel : {fmt(promoModal.price)}</p>
                </div>
                <button onClick={() => setPromoModal(null)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <TbX size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Prix promotionnel (FCFA) *</label>
                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all" placeholder={`Moins de ${fmt(promoModal.price)}`} value={promoPrice} onChange={e => setPromoPrice(e.target.value)} />
                {promoPrice && parseInt(promoPrice) >= promoModal.price && <p className="text-red-500 text-xs mt-1">Le prix promo doit etre inferieur au prix normal !</p>}
                {promoPrice && parseInt(promoPrice) < promoModal.price && <p className="text-green-600 text-xs mt-1 font-semibold">Reduction : -{Math.round((1 - parseInt(promoPrice)/promoModal.price)*100)}%</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date de fin de promo *</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all" min={new Date().toISOString().slice(0,16)} value={promoEnds} onChange={e => setPromoEnds(e.target.value)} />
              </div>
              <button onClick={savePromo} disabled={promoLoading || !promoPrice || !promoEnds || parseInt(promoPrice) >= promoModal.price}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg">
                {promoLoading ? <TbLoader2 size={18} className="animate-spin" /> : <TbTag size={18} />}
                Lancer la promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
