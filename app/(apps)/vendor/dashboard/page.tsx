"use client";

import StoryUpload from "@/components/stories/StoryUpload";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TbBuildingStore, TbPlus, TbPackage, TbLoader2, TbShoppingBag, TbChevronRight, TbStar, TbCheck, TbTrash, TbX, TbCreditCard, TbPencil, TbEye, TbLock, TbPhoto } from "react-icons/tb";
import ConfirmModal from "@/components/ui/ConfirmModal";

const campusResidences: Record<string, string[]> = {
  "Kaolack": ["Saloum 1","Saloum 2","Saloum 3","Saloum 4","Saloum 5","Saloum 6","Saloum 7","Saloum 8","Hors residence"],
  "Fatick":  ["Sine 1","Sine 2","Sine 3","Sine 4","Sine 5","Sine 6","Sine 7","Sine 8","Hors residence"],
  "Kaffrine":["Ndoukman","Hors residence"],
};

function BoutiqueModal({ title, subtitle, values, onChangeName, onChangePhone, onChangeBatiment, onChangeChambre, onChangeCampus, onChangeResidence, onSave, onClose, saving, saveLabel }: {
  title: string; subtitle: string;
  values: { shop_name: string; whatsapp: string; batiment: string; chambre: string; campus: string; residence: string };
  onChangeName: (v: string) => void; onChangePhone: (v: string) => void;
  onChangeBatiment: (v: string) => void; onChangeChambre: (v: string) => void;
  onChangeCampus: (v: string) => void; onChangeResidence: (v: string) => void;
  onSave: () => void; onClose: () => void; saving: boolean; saveLabel: string;
}) {
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-[#4a7c2f] p-6 sticky top-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white"><TbX size={20} /></button>
          </div>
          <p className="text-white/60 text-xs">{subtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nom de la boutique *</label>
            <input className={inputClass} placeholder="Ex: Kaay Dieundeu" value={values.shop_name} onChange={e => onChangeName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Telephone WhatsApp</label>
            <input className={inputClass} placeholder="+221 77 123 45 67" value={values.whatsapp} onChange={e => onChangePhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Campus *</label>
            <select className={inputClass} value={values.campus} onChange={e => { onChangeCampus(e.target.value); onChangeResidence(""); }}>
              <option value="">Choisir votre campus</option>
              {Object.keys(campusResidences).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {values.campus && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Residence *</label>
              <select className={inputClass} value={values.residence} onChange={e => onChangeResidence(e.target.value)}>
                <option value="">Choisir votre residence</option>
                {campusResidences[values.campus]?.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Annuler</button>
            <button onClick={onSave} disabled={saving || !values.shop_name.trim() || !values.campus || !values.residence} className="flex-1 bg-[#4a7c2f] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <TbLoader2 size={16} className="animate-spin" />}{saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [produitsCounts, setProduitsCounts] = useState<Record<string, number>>({});
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBatiment, setNewBatiment] = useState("");
  const [newChambre, setNewChambre] = useState("");
  const [newCampus, setNewCampus] = useState("");
  const [newResidence, setNewResidence] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCampus, setEditCampus] = useState("");
  const [editResidence, setEditResidence] = useState("");
  const [editBatiment, setEditBatiment] = useState("");
  const [editChambre, setEditChambre] = useState("");

  const selected = boutiques.find(b => b.id === selectedId) ?? boutiques[0] ?? null;
  const totalProduits = Object.values(produitsCounts).reduce((a, b) => a + b, 0);
  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      setUser(user);
      const { data: shops } = await supabase.from("vendors").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      const list = shops || [];
      setBoutiques(list);
      const saved = localStorage.getItem("vendor_selected_id");
      setSelectedId(saved && list.find((b: any) => b.id === saved) ? saved : list[0]?.id ?? null);
      const pc: Record<string, number> = {};
      const oc: Record<string, number> = {};
      try {
        for (const shop of list) {
          const { count: c1 } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", shop.id);
          pc[shop.id] = c1 || 0;
          const { count: c2 } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("vendor_id", shop.id);
          oc[shop.id] = c2 || 0;
        }
      } catch (e) { console.error("Erreur chargement stats:", e); }
      setProduitsCounts(pc);
      setOrderCounts(oc);
      setLoading(false);
    })();
  }, []);

  const selectBoutique = (id: string) => { setSelectedId(id); localStorage.setItem("vendor_selected_id", id); };
  const resetCreate = () => { setNewName(""); setNewPhone(""); setNewBatiment(""); setNewChambre(""); };
  const resetEdit = () => { setEditName(""); setEditPhone(""); setEditBatiment(""); setEditChambre(""); };

  const createBoutique = async () => { if (isSuspended) return;
    if (!newName.trim()) return;
    setCreating(true);
    const rawPhone = newPhone.replace(/\D/g, "");
    const cleanPhone = rawPhone.length >= 9 ? rawPhone.slice(-9) : "";
    const res = await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopName: newName.trim(), waveNumber: cleanPhone.match(/^7[0-9]{8}$/) ? cleanPhone : undefined, type: "student", campusDelivery: true }) });
    const json = await res.json();
    if (json.success && json.data) {
      setBoutiques(prev => [json.data, ...prev]);
      setProduitsCounts(prev => ({ ...prev, [json.data.id]: 0 }));
      selectBoutique(json.data.id);
      setShowCreate(false);
      resetCreate();
      router.push("/vendor/produits/nouveau");
    } else { alert("Erreur : " + (json.error || "Impossible de creer la boutique")); }
    setCreating(false);
  };

  const saveBoutique = async () => {
    if (!editName.trim() || !showEdit) return;
    setEditing(true);
    const supabase = createClient();
    const rawPhone = editPhone.replace(/\D/g, "");
    const cleanPhone = rawPhone.length >= 9 ? rawPhone.slice(-9) : "";
    const { data, error } = await supabase.from("vendors").update({ shop_name: editName.trim(), wave_number: cleanPhone.match(/^7[0-9]{8}$/) ? cleanPhone : null }).eq("id", showEdit.id).select().single();
    if (!error && data) { setBoutiques(prev => prev.map(b => b.id === data.id ? data : b)); setShowEdit(null); resetEdit(); }
    else alert("Erreur : " + error?.message);
    setEditing(false);
  };

  const deleteBoutique = async (id: string) => {
    setDeleting(id);
    await fetch("/api/vendors/"+id, { method: "DELETE" });
    const updated = boutiques.filter(b => b.id !== id);
    setBoutiques(updated);
    const next = updated[0]?.id ?? null;
    setSelectedId(next);
    if (next) localStorage.setItem("vendor_selected_id", next);
    else localStorage.removeItem("vendor_selected_id");
    setDeleting(null);
    setConfirmDeleteId(null);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;

  const firstName = user?.user_metadata?.firstName || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Vendeur";
  const subStatus = selected?.subscription_status;
  const subExpiry = selected?.subscription_expires_at ? new Date(selected.subscription_expires_at) : null;
  const isActive = subStatus === "active" && subExpiry && subExpiry > new Date();
  const isTrial = subStatus === "trial" && subExpiry && subExpiry > new Date();
  const isPending = subStatus === "pending";
  const isSubscribed = isActive || isTrial || isPending;
  const isSuspended = !isSubscribed && boutiques.length > 0 && selected;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Story rapide */}
      {selected && (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <StoryUpload vendorId={selected.id} vendorName={selected.shop_name} />
          <div>
            <p className="font-semibold text-gray-800 text-sm">Ajouter une story</p>
            <p className="text-xs text-gray-400">Visible 24h par tous les clients</p>
          </div>
        </div>
      )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} !</h1>
          <p className="text-sm text-gray-500 mt-0.5">{boutiques.length} boutique{boutiques.length > 1 ? "s" : ""} · {totalProduits} produit{totalProduits > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[#4a7c2f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#1e2570] self-start sm:self-auto">
          <TbPlus size={18} /> Nouvelle boutique
        </button>
      </div>

      {isSuspended && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl overflow-hidden">
          <div className="bg-red-500 px-5 py-3 flex items-center gap-2"><TbLock className="text-white flex-shrink-0" size={18} /><p className="font-bold text-white text-sm">Boutique suspendue — Abonnement expire</p></div>
          <div className="p-5 space-y-3">
            <p className="text-red-700 text-sm">Vos produits ne sont plus visibles. Renouvelez pour les reactiver.</p>
            <Link href="/vendor/abonnement" className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <TbCreditCard size={16} /> Renouveler maintenant — 1 000 FCFA
            </Link>
            <p className="text-xs text-red-400 text-center">Activation sous 24h apres verification du paiement Wave</p>
          </div>
        </div>
      )}

      {boutiques.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><TbBuildingStore className="text-primary" size={40} /></div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Creez votre premiere boutique</h3>
          <p className="text-gray-400 text-sm mb-6">Ajoutez vos produits et commencez a vendre sur le campus.</p>
          <button onClick={() => setShowCreate(true)} className="bg-[#4a7c2f] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-[#1e2570]"><TbPlus size={18} /> Creer ma boutique</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Produits", value: totalProduits, icon: TbPackage, color: "bg-blue-50 text-blue-500", href: "/vendor/produits" },
              { label: "Boutiques", value: boutiques.length, icon: TbBuildingStore, color: "bg-[#4a7c2f]/10 text-[#4a7c2f]", href: "/vendor/dashboard" },
              { label: "Commandes", value: totalOrders, icon: TbShoppingBag, color: "bg-orange-50 text-orange-500", href: "/vendor/commandes" },
            ].map(s => (
              <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className={"w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " + s.color}><s.icon size={20} /></div>
                <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Mes boutiques</h2>
              <button onClick={() => setShowCreate(true)} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"><TbPlus size={14} /> Ajouter</button>
            </div>
            {boutiques.map(b => {
              const sub = b.subscription_status === "active" && b.subscription_expires_at && new Date(b.subscription_expires_at) > new Date();
              const nbProduits = produitsCounts[b.id] || 0;
              const isSelected = selectedId === b.id;
              return (
                <div key={b.id} className={"flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 transition-colors " + (isSelected ? "bg-primary/5" : "hover:bg-gray-50")}>
                  <button onClick={() => selectBoutique(b.id)} className={"w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-colors " + (isSelected ? "bg-[#4a7c2f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {b.shop_name[0].toUpperCase()}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectBoutique(b.id)}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">{b.shop_name}</p>
                      {isSelected && <TbCheck size={14} className="text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs mt-0.5">
                      <span className={"font-medium " + (sub ? "text-green-600" : "text-orange-500")}>{sub ? "Abonne" : "Non abonne"}</span>
                      <span className="text-gray-400"> · {nbProduits} produit{nbProduits > 1 ? "s" : ""}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href="/vendor/produits" onClick={() => selectBoutique(b.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"><TbEye size={15} /></Link>
                    <Link href="/vendor/produits/nouveau" onClick={() => selectBoutique(b.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"><TbPlus size={15} /></Link>
                    <button onClick={() => { setShowEdit(b); setEditName(b.shop_name); setEditPhone(b.wave_number || ""); setEditBatiment(""); setEditChambre(""); }} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"><TbPencil size={15} /></button>
                    <button onClick={() => setConfirmDeleteId(b.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-400 transition-colors">
                      {deleting === b.id ? <TbLoader2 size={15} className="animate-spin" /> : <TbTrash size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50"><h2 className="font-bold text-gray-800">Actions rapides</h2></div>
            {[
              { label: "Ajouter un produit", sub: isSuspended ? "Abonnement requis" : selected ? "Dans : " + selected.shop_name : "Selectionner une boutique", href: isSuspended ? "/vendor/abonnement" : "/vendor/produits/nouveau", icon: isSuspended ? TbLock : TbPlus, color: isSuspended ? "bg-red-100 text-red-400" : "bg-[#4a7c2f] text-white" },
              { label: "Mes produits", sub: totalProduits + " produit" + (totalProduits > 1 ? "s" : "") + " au total", href: "/vendor/produits", icon: TbPackage, color: "bg-blue-50 text-blue-500" },
              { label: "Abonnement", sub: isSubscribed ? "Abonnement actif" : "1 000 FCFA / mois", href: "/vendor/abonnement", icon: TbCreditCard, color: isSubscribed ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500" },
              { label: "Mes stories", sub: "Gerer et supprimer vos stories", href: "/vendor/stories", icon: TbPhoto, color: "bg-purple-50 text-purple-500" },
            ].map((item, i) => (
              <Link key={item.label+i} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " + item.color}><item.icon size={20} /></div>
                <div className="flex-1 min-w-0"><p className="font-medium text-gray-800 text-sm">{item.label}</p><p className="text-xs text-gray-400 truncate">{item.sub}</p></div>
                <TbChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <BoutiqueModal title="Nouvelle boutique" subtitle="Creez votre espace de vente sur USSEIN Commerce"
          values={{ shop_name: newName, whatsapp: newPhone, batiment: newBatiment, chambre: newChambre, campus: newCampus, residence: newResidence }}
          onChangeName={setNewName} onChangePhone={setNewPhone} onChangeBatiment={setNewBatiment} onChangeChambre={setNewChambre} onChangeCampus={setNewCampus} onChangeResidence={setNewResidence}
          onSave={createBoutique} onClose={() => { setShowCreate(false); resetCreate(); }} saving={creating} saveLabel="Creer ma boutique" />
      )}

      {showEdit && (
        <BoutiqueModal title={"Modifier : " + showEdit.shop_name} subtitle="Mettez a jour les informations de votre boutique"
          values={{ shop_name: editName, whatsapp: editPhone, batiment: editBatiment, chambre: editChambre, campus: editCampus, residence: editResidence }}
          onChangeName={setEditName} onChangePhone={setEditPhone} onChangeBatiment={setEditBatiment} onChangeChambre={setEditChambre} onChangeCampus={setEditCampus} onChangeResidence={setEditResidence}
          onSave={saveBoutique} onClose={() => { setShowEdit(null); resetEdit(); }} saving={editing} saveLabel="Enregistrer" />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          message="Supprimer cette boutique ?"
          subMessage="Tous ses produits seront effaces definitivement."
          confirmLabel="Supprimer"
          danger
          onConfirm={() => deleteBoutique(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}