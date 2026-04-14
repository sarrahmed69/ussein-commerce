"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbLock, TbShieldCheck, TbClock, TbRefresh, TbCheck, TbX, TbLoader2, TbBuildingStore, TbPackage, TbEye, TbEyeOff, TbAlertCircle, TbCalendar, TbSearch, TbCurrencyDollar, TbBell, TbDownload, TbChevronDown, TbChevronUp, TbPlus, TbMinus, TbHistory, TbPhoto, TbTrash } from "react-icons/tb";
import ConfirmModal from "@/components/ui/ConfirmModal";



const PRICE = 1000;
const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p);

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-green-100 text-green-700", trial: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700", expired: "bg-red-100 text-red-600" };
  const labels: Record<string, string> = { active: "Actif", trial: "Essai gratuit", pending: "En attente", expired: "Expire" };
  return <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (map[status] || "bg-gray-100 text-gray-500")}>{labels[status] || status}</span>;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<"boutiques" | "paiements" | "stats">("boutiques");
  const [showProducts, setShowProducts] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showExtend, setShowExtend] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number>(30);
  const [extendDays, setExtendDays] = useState(30);
  const [extending, setExtending] = useState(false);

  const [confirmSuspend, setConfirmSuspend] = useState<any | null>(null);
  const [confirmDeleteVendor, setConfirmDeleteVendor] = useState<any | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<any | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: v } = await supabase.from("vendors").select("id, shop_name, status, subscription_status, subscription_expires_at, created_at, wave_number").order("created_at", { ascending: false });
    setVendors(v || []);
    const { data: p } = await supabase.from("vendors").select("id, shop_name, subscription_status, subscription_expires_at, created_at").eq("subscription_status", "active").order("subscription_expires_at", { ascending: false });
    setPayments(p || []);
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "1") { setAuthed(true); load(); }
  }, []);

  const prevPending = useRef(0);
  useEffect(() => {
    const pending = vendors.filter(v => getSubStatus(v) === "pending").length;
    if (pending > prevPending.current && prevPending.current >= 0) {
      if (typeof window !== "undefined" && "Notification" in window) {
        Notification.requestPermission().then(perm => {
          if (perm === "granted") new Notification("USSEIN Commerce — Nouveau paiement", { body: pending + " paiement(s) en attente", icon: "/favicon.ico" });
        });
      }
    }
    prevPending.current = pending;
  }, [vendors]);

  const login = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: pw }),
      });
      const data = await res.json();
      if (data.success) { sessionStorage.setItem("admin_auth", "1"); setAuthed(true); load(); }
      else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
    } catch { setPwError(true); setTimeout(() => setPwError(false), 2000); }
  };

  const getSubStatus = (v: any) => {
    const expired = !v.subscription_expires_at || new Date(v.subscription_expires_at) <= new Date();
    if (v.subscription_status === "active" && !expired) return "active";
    if (v.subscription_status === "trial" && !expired) return "trial";
    if (v.subscription_status === "pending") return "pending";
    return "expired";
  };

  const activate = async (vendor: any) => {
    setSaving(vendor.id);
    const supabase = createClient();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    await supabase.from("vendors").update({ subscription_status: "active", subscription_expires_at: expires.toISOString(), status: "active" }).eq("id", vendor.id);
    await supabase.from("products").update({ status: "active" }).eq("vendor_id", vendor.id);
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, subscription_status: "active", status: "active", subscription_expires_at: expires.toISOString() } : v));
    showToast("Boutique activee pour 30 jours !");
    setSaving(null);
  };

  const suspend = async (vendor: any) => {
    setSaving(vendor.id);
    const supabase = createClient();
    await supabase.from("vendors").update({ subscription_status: "expired", status: "suspended" }).eq("id", vendor.id);
    await supabase.from("products").update({ status: "inactive" }).eq("vendor_id", vendor.id);
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, subscription_status: "expired", status: "suspended" } : v));
    showToast("Boutique suspendue.");
    setSaving(null);
    setConfirmSuspend(null);
  };

  const PLANS = [
    { label: "Mensuel — 1 000 FCFA", days: 30 },
    { label: "Trimestriel — 2 500 FCFA", days: 90 },
    { label: "Annuel — 8 000 FCFA", days: 365 },
  ];

  const extendSubscription = async () => {
    if (!showExtend || extendDays < 1) return;
    setExtending(true);
    const supabase = createClient();
    const current = (showExtend.subscription_status === "active" && showExtend.subscription_expires_at && new Date(showExtend.subscription_expires_at) > new Date()) ? new Date(showExtend.subscription_expires_at) : new Date();
    const expiry = new Date(current.getTime() + selectedPlan * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("vendors").update({ subscription_status: "active", status: "active", subscription_expires_at: expiry }).eq("id", showExtend.id);
    await supabase.from("products").update({ status: "active" }).eq("vendor_id", showExtend.id);
    setVendors(prev => prev.map(v => v.id === showExtend.id ? { ...v, subscription_status: "active", status: "active", subscription_expires_at: expiry } : v));
    showToast("Abonnement active pour " + selectedPlan + " jours !");
    setExtending(false);
    setShowExtend(null);
  };


  const loadProducts = async (vendorId: string) => {
    setLoadingProducts(true);
    setShowProducts(vendorId);
    const supabase = createClient();
    const { data } = await supabase.from("products").select("id, name, price, category, status, images, stock").eq("vendor_id", vendorId).order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  const deleteVendor = async (vendor: any) => {
    setSaving(vendor.id);
    try {
      const supabase = createClient();
      const { data: prods } = await supabase.from("products").select("images").eq("vendor_id", vendor.id);
      if (prods && prods.length > 0) {
        const paths: string[] = [];
        prods.forEach((p: any) => { if (p.images?.length) p.images.forEach((url: string) => { try { const parts = url.split("/object/public/products/"); if (parts[1]) paths.push(decodeURIComponent(parts[1])); } catch {} }); });
        if (paths.length > 0) await supabase.storage.from("products").remove(paths);
      }
      const { error } = await supabase.from("vendors").delete().eq("id", vendor.id);
      if (error) { alert("Erreur : " + error.message); setSaving(null); return; }
      setVendors(prev => prev.filter(v => v.id !== vendor.id));
      showToast("Boutique supprimee definitivement.");
    } catch (e) { alert("Une erreur est survenue."); }
    setSaving(null);
    setConfirmDeleteVendor(null);
  };

  const deleteProduct = async (p: any) => {
    const supabase = createClient();
    if (p.images?.length) {
      const paths = p.images.map((url: string) => { try { const parts = url.split("/object/public/products/"); return parts[1] ? decodeURIComponent(parts[1]) : null; } catch { return null; } }).filter(Boolean);
      if (paths.length) await supabase.storage.from("products").remove(paths);
    }
    await supabase.from("products").delete().eq("id", p.id);
    setProducts(prev => prev.filter(x => x.id !== p.id));
    setConfirmDeleteProduct(null);
  };

  const exportCSV = () => {
    const headers = ["Boutique", "Statut", "Expiration", "Date creation", "Wave"];
    const rows = vendors.map(v => [v.shop_name, getSubStatus(v), v.subscription_expires_at ? new Date(v.subscription_expires_at).toLocaleDateString("fr-FR") : "-", new Date(v.created_at).toLocaleDateString("fr-FR"), v.wave_number || "-"]);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vendeurs-USSEIN-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click(); URL.revokeObjectURL(url);
    showToast("Export CSV telecharge !");
  };

  if (!authed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-[#4a7c2f] p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><TbLock className="text-white" size={32} /></div>
          <h1 className="text-white font-bold text-xl">Espace Admin</h1>
          <p className="text-white/50 text-sm mt-1">USSEIN Commerce</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
            <input type="email" className={"w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all " + (pwError ? "border-red-400 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-[#4a7c2f]/30")} placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} className={"w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none pr-10 transition-all " + (pwError ? "border-red-400 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-[#4a7c2f]/30")} placeholder="Mot de passe" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? <TbEyeOff size={18} /> : <TbEye size={18} />}</button>
            </div>
            {pwError && <p className="text-red-500 text-xs mt-1.5 font-medium">Email ou mot de passe incorrect</p>}
          </div>
          <button onClick={login} className="w-full bg-[#4a7c2f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1e2570] transition-opacity">Acceder au panneau admin</button>
        </div>
      </div>
    </div>
  );

  const total = vendors.length;
  const actifs = vendors.filter(v => getSubStatus(v) === "active").length;
  const trials = vendors.filter(v => getSubStatus(v) === "trial").length;
  const pending = vendors.filter(v => getSubStatus(v) === "pending").length;
  const suspendus = vendors.filter(v => getSubStatus(v) === "expired").length;
  const revenuMensuel = actifs * PRICE;
  const revenuAnnuelEstime = revenuMensuel * 12;
  const filtered = vendors.filter(v => (filter === "all" || getSubStatus(v) === filter) && v.shop_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#4a7c2f] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-pulse">
          <TbCheck size={18} /> {toast}
        </div>
      )}

      {showProducts && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowProducts(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Produits de la boutique</h3>
              <button onClick={() => setShowProducts(null)} className="text-gray-400 hover:text-gray-600"><TbX size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {loadingProducts ? <div className="flex justify-center py-10"><TbLoader2 className="animate-spin text-primary" size={28} /></div>
              : products.length === 0 ? <div className="text-center py-10 text-gray-400"><TbPackage size={36} className="mx-auto mb-2" /><p className="text-sm">Aucun produit</p></div>
              : products.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <TbPhoto className="text-gray-400" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category} · Stock : {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-700 text-sm">{fmt(p.price)} FCFA</p>
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{p.status === "active" ? "Actif" : "Inactif"}</span>
                    </div>
                    <button onClick={() => setConfirmDeleteProduct(p)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"><TbTrash size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showExtend && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowExtend(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#4a7c2f] px-6 py-5">
              <h3 className="font-bold text-white">Prolonger l abonnement</h3>
              <p className="text-white/60 text-sm mt-0.5">{showExtend.shop_name}</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Nombre de jours a ajouter</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "Mensuel", price: "1 000 FCFA", days: 30 }, { label: "Trimestriel", price: "2 500 FCFA", days: 90 }, { label: "Annuel", price: "8 000 FCFA", days: 365 }].map(plan => (
                    <button key={plan.days} onClick={() => setSelectedPlan(plan.days)} className={"rounded-2xl p-4 border-2 text-center transition-all " + (selectedPlan === plan.days ? "border-[#2d5a1b] bg-[#2d5a1b]/5" : "border-gray-200 hover:border-gray-300")}>
                      <p className="font-extrabold text-gray-900 text-sm">{plan.label}</p>
                      <p className="text-[#2d5a1b] font-bold text-xs mt-1">{plan.price}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{plan.days} jours</p>
                    </button>
                  ))}
                </div>

              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 text-center">
                Nouvelle expiration : <span className="font-bold">{(() => { const base = (showExtend.subscription_status === "active" && showExtend.subscription_expires_at && new Date(showExtend.subscription_expires_at) > new Date()) ? new Date(showExtend.subscription_expires_at) : new Date(); base.setDate(base.getDate() + selectedPlan); return base.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); })()}</span>
              </div>


              <div className="flex gap-2">
                <button onClick={() => setShowExtend(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Annuler</button>
                <button onClick={extendSubscription} disabled={extending} className="flex-1 bg-[#4a7c2f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1e2570] transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {extending ? <TbLoader2 size={16} className="animate-spin" /> : <TbCheck size={16} />} Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 space-y-6 pb-10">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panneau Admin</h1>
            <p className="text-sm text-gray-400 mt-0.5">USSEIN Commerce — Gestion complete</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"><TbDownload size={16} /> CSV</button>
            <button onClick={load} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"><TbRefresh size={16} /> Actualiser</button>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); setPw(""); setEmail(""); }} className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Deconnexion</button>
          </div>
        </div>

        {pending > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                <TbBell className="text-yellow-600" size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{pending}</span>
              </div>
              <div>
                <p className="font-bold text-yellow-800 text-sm">{pending} paiement{pending > 1 ? "s" : ""} en attente</p>
                <p className="text-yellow-600 text-xs mt-0.5">Verifiez Wave → cliquez Confirmer et Activer.</p>
              </div>
            </div>
            <button onClick={() => { setFilter("pending"); setActiveTab("boutiques"); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap">Voir les paiements</button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total boutiques", value: total, icon: TbBuildingStore, color: "bg-gray-800 text-white" },
            { label: "Abonnes actifs", value: actifs, icon: TbShieldCheck, color: "bg-green-500 text-white" },
            { label: "Essai gratuit", value: trials, icon: TbClock, color: "bg-blue-500 text-white" },
            { label: "Suspendus", value: suspendus, icon: TbLock, color: "bg-red-400 text-white" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className={"w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " + s.color}><s.icon size={20} /></div>
              <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 w-fit">
          {[{ key: "boutiques", label: "Boutiques", icon: TbBuildingStore }, { key: "stats", label: "Statistiques", icon: TbCurrencyDollar }, { key: "paiements", label: "Historique", icon: TbHistory }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)} className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors " + (activeTab === t.key ? "bg-[#4a7c2f] text-white" : "text-gray-500 hover:text-gray-700")}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Revenu mensuel actuel</p><p className="text-3xl font-bold text-gray-900">{fmt(revenuMensuel)}</p><p className="text-sm text-gray-400 mt-1">FCFA · {actifs} boutique{actifs > 1 ? "s" : ""} active{actifs > 1 ? "s" : ""}</p></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Estimation annuelle</p><p className="text-3xl font-bold text-green-600">{fmt(revenuAnnuelEstime)}</p><p className="text-sm text-gray-400 mt-1">FCFA · si meme nb actifs</p></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Taux de conversion</p><p className="text-3xl font-bold text-blue-600">{total > 0 ? Math.round((actifs / total) * 100) : 0}%</p><p className="text-sm text-gray-400 mt-1">des boutiques sont actives</p></div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Repartition des statuts</h3>
              <div className="space-y-3">
                {[{ label: "Abonnes actifs", count: actifs, color: "bg-green-500" }, { label: "Essai gratuit", count: trials, color: "bg-blue-500" }, { label: "En attente", count: pending, color: "bg-yellow-500" }, { label: "Suspendus", count: suspendus, color: "bg-red-400" }].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 font-medium">{s.label}</span><span className="font-bold text-gray-800">{s.count} <span className="text-gray-400 font-normal">({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span></span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={"h-full rounded-full transition-all " + s.color} style={{ width: total > 0 ? (s.count / total * 100) + "%" : "0%" }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1">Potentiel de revenus</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-xl p-4"><p className="text-xs text-green-600 font-semibold mb-1">Scenario actuel</p><p className="text-2xl font-bold text-green-700">{fmt(actifs * PRICE)} FCFA</p></div>
                <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-blue-600 font-semibold mb-1">Scenario optimal</p><p className="text-2xl font-bold text-blue-700">{fmt((actifs + trials + pending) * PRICE)} FCFA</p></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "paiements" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="font-bold text-gray-800">Boutiques actives</h3><span className="text-xs text-gray-400">{payments.length} enregistrement{payments.length > 1 ? "s" : ""}</span></div>
            {payments.length === 0 ? <div className="text-center py-16 text-gray-400"><TbHistory size={36} className="mx-auto mb-2" /><p className="text-sm">Aucun paiement enregistre</p></div>
            : <div className="divide-y divide-gray-50">{payments.map(v => (
              <div key={v.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">{v.shop_name?.[0]?.toUpperCase()}</div>
                  <div><p className="font-semibold text-gray-800 text-sm">{v.shop_name}</p><p className="text-xs text-gray-400">Expire le {v.subscription_expires_at ? new Date(v.subscription_expires_at).toLocaleDateString("fr-FR") : "-"}</p></div>
                </div>
                <div className="text-right"><p className="font-bold text-green-600 text-sm">{fmt(PRICE)} FCFA</p><p className="text-xs text-gray-400">Wave · mensuel</p></div>
              </div>
            ))}</div>}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center"><span className="text-sm font-semibold text-gray-600">Total encaisse</span><span className="text-lg font-bold text-green-600">{fmt(revenuMensuel)} FCFA</span></div>
          </div>
        )}

        {activeTab === "boutiques" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#4a7c2f]/30" placeholder="Rechercher une boutique..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{ key: "all", label: "Tous" }, { key: "pending", label: "En attente" }, { key: "trial", label: "Essai" }, { key: "active", label: "Actifs" }, { key: "expired", label: "Suspendus" }].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)} className={"px-3 py-2 rounded-xl text-xs font-bold transition-colors " + (filter === f.key ? "bg-[#4a7c2f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
                    {f.label}{f.key === "pending" && pending > 0 && <span className="ml-1.5 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loading ? <div className="flex justify-center py-16"><TbLoader2 className="animate-spin text-primary" size={32} /></div>
              : filtered.length === 0 ? <div className="text-center py-16"><TbPackage className="text-gray-200 mx-auto mb-3" size={40} /><p className="text-gray-400 text-sm">Aucune boutique trouvee</p></div>
              : filtered.map(v => {
                const s = getSubStatus(v);
                const isSav = saving === v.id;
                const expDate = v.subscription_expires_at ? new Date(v.subscription_expires_at) : null;
                const daysLeft = expDate ? Math.max(0, Math.floor((expDate.getTime() - Date.now()) / 86400000)) : null;
                return (
                  <div key={v.id} className={"border-b border-gray-50 last:border-0 " + (s === "pending" ? "bg-yellow-50/50" : "")}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-[#4a7c2f]/10 rounded-xl flex items-center justify-center font-bold text-[#4a7c2f] flex-shrink-0">{v.shop_name?.[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap"><p className="font-bold text-gray-800 text-sm">{v.shop_name}</p><Badge status={s} /></div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {expDate && <p className="text-xs text-gray-400 flex items-center gap-1"><TbCalendar size={11} />{s === "expired" ? "Expire le " + expDate.toLocaleDateString("fr-FR") : daysLeft + "j restants · " + expDate.toLocaleDateString("fr-FR")}</p>}
                            <p className="text-xs text-gray-300">Cree le {new Date(v.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap flex-shrink-0">
                        <button onClick={() => loadProducts(v.id)} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"><TbEye size={14} /> Produits</button>
                        <button onClick={() => { setShowExtend(v); setExtendDays(30); }} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"><TbPlus size={14} /> Prolonger</button>
                        {(s === "pending" || s === "expired" || s === "trial") && (
                          <button onClick={() => activate(v)} disabled={isSav} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60">
                            {isSav ? <TbLoader2 size={14} className="animate-spin" /> : <TbCheck size={14} />}{s === "pending" ? "Confirmer & Activer" : "Activer"}
                          </button>
                        )}
                        {(s === "active" || s === "trial") && (
                          <button onClick={() => setConfirmSuspend(v)} disabled={isSav} className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60">
                            {isSav ? <TbLoader2 size={14} className="animate-spin" /> : <TbX size={14} />} Suspendre
                          </button>
                        )}
                        <button onClick={() => setConfirmDeleteVendor(v)} disabled={isSav} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60">
                          {isSav ? <TbLoader2 size={14} className="animate-spin" /> : <TbTrash size={14} />} Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-xs text-center text-gray-300">Admin USSEIN Commerce · Acces restreint</p>
      </div>

      {confirmSuspend && (
        <ConfirmModal
          message={"Suspendre " + confirmSuspend.shop_name + " ?"}
          subMessage="Ses produits seront desactives immediatement."
          confirmLabel="Suspendre"
          danger
          onConfirm={() => suspend(confirmSuspend)}
          onCancel={() => setConfirmSuspend(null)}
        />
      )}

      {confirmDeleteVendor && (
        <ConfirmModal
          message={"Supprimer " + confirmDeleteVendor.shop_name + " ?"}
          subMessage="Tous ses produits et commandes seront effaces. Irreversible."
          confirmLabel="Supprimer definitivement"
          danger
          onConfirm={() => deleteVendor(confirmDeleteVendor)}
          onCancel={() => setConfirmDeleteVendor(null)}
        />
      )}

      {confirmDeleteProduct && (
        <ConfirmModal
          message={"Supprimer " + confirmDeleteProduct.name + " ?"}
          confirmLabel="Supprimer"
          danger
          onConfirm={() => deleteProduct(confirmDeleteProduct)}
          onCancel={() => setConfirmDeleteProduct(null)}
        />
      )}
    </div>
  );
}
