"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbPhoto, TbX, TbPackage, TbCurrencyDollar,
  TbTag, TbAlignLeft, TbBuildingStore, TbCheck,
  TbLoader2, TbBrandWhatsapp, TbStack2, TbLock, TbCreditCard,
  TbSparkles,
} from "react-icons/tb";

const CATEGORIES = [
  "Alimentation", "Fournitures scolaires", "Vetements",
  "Electronique", "Livres & Cours", "Services", "Beaute", "Autre",
];

export default function NouveauProduitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [suspended, setSuspended] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "", description: "", prix: "",
    categorie: "", stock: "1", whatsapp: "", livraison: false,
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      const vendorId = localStorage.getItem("vendor_selected_id");
      if (!vendorId) { router.push("/vendor/dashboard"); return; }
      const { data: vendor } = await supabase.from("vendors").select("subscription_status, subscription_expires_at, status").eq("id", vendorId).eq("user_id", user.id).single();
      if (!vendor) { router.push("/vendor/dashboard"); return; }
      const expired = !vendor.subscription_expires_at || new Date(vendor.subscription_expires_at) <= new Date();
      const isOk = (vendor.subscription_status === "active" && !expired) || (vendor.subscription_status === "trial" && !expired) || vendor.subscription_status === "pending";
      setSuspended(!isOk);
      setChecking(false);
    })();
  }, []);

  const generateDescription = async () => {
    if (!form.nom) { alert("Entrez d'abord le nom du produit !"); return; }
    setAiLoading(true);
    try {
      let imageBase64 = null;
      let imageType = null;
      if (files[0]) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
          reader.readAsDataURL(files[0]);
        });
        imageType = files[0].type;
      }
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: form.nom, imageBase64, imageType }),
      });
      const data = await response.json();
      if (data.description) set("description", data.description);
    } catch (e) {
      alert("Erreur IA. Reessayez !");
    }
    setAiLoading(false);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).slice(0, 4 - files.length);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    });
    setFiles((prev) => [...prev, ...newFiles].slice(0, 4));
  };

  const removeImage = (i: number) => {
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (suspended) return;
    if (!form.nom || !form.prix || !form.categorie) { alert("Veuillez remplir le nom, le prix et la categorie."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      const { data: vendorData } = await supabase
        .from("vendors")
        .select("id, subscription_status, subscription_expires_at")
        .eq("user_id", user.id)
        .single();
      const vendorId = vendorData?.id ?? null;
      const vendor = vendorData;
      const expired = !vendor?.subscription_expires_at || new Date(vendor.subscription_expires_at) <= new Date();
      const isOk = (vendor?.subscription_status === "active" && !expired) || (vendor?.subscription_status === "trial" && !expired) || vendor?.subscription_status === "pending";
      if (!isOk) { setSuspended(true); setLoading(false); return; }
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("products").upload(path, file, { upsert: true });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
          imageUrls.push(publicUrl);
        }
      }
      const { error } = await supabase.from("products").insert({
        name: form.nom, description: form.description, price: parseFloat(form.prix),
        category: form.categorie, stock: parseInt(form.stock),
        whatsapp_contact: form.whatsapp || null, delivery_available: form.livraison,
        seller_id: user.id, vendor_id: vendorId || null, status: "active", images: imageUrls,
      });
      if (error) { alert("Erreur: " + error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/vendor/produits"), 1800);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  if (checking) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;

  if (suspended) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-red-500 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><TbLock className="text-white" size={40} /></div>
          <h2 className="text-white font-bold text-xl">Acces bloque</h2>
          <p className="text-white/70 text-sm mt-1">Abonnement expire ou inactif</p>
        </div>
        <div className="p-6 space-y-4 text-center">
          <p className="text-gray-600 text-sm">Vous ne pouvez pas ajouter de produits car votre boutique est suspendue.</p>
          <Link href="/vendor/abonnement" className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <TbCreditCard size={18} /> Renouveler mon abonnement
          </Link>
          <Link href="/vendor/dashboard" className="block text-sm text-gray-400 hover:text-gray-600">Retour au tableau de bord</Link>
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><TbCheck className="text-green-600" size={40} /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Produit ajoute !</h2>
        <p className="text-gray-500">Redirection vers vos produits...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full hidden lg:flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><TbBuildingStore className="text-white" size={20} /></div>
            <div><p className="font-bold text-gray-800 text-sm">Ma Boutique</p><p className="text-xs text-gray-400">Espace vendeur</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Tableau de bord", href: "/vendor/dashboard" },
            { label: "Mes produits", href: "/vendor/produits" },
            { label: "Commandes", href: "/vendor/commandes" },
            { label: "Parametres", href: "/vendor/parametres" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <TbPackage size={17} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/produits" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <TbArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
            <p className="text-sm text-gray-500">Remplissez les informations de votre produit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TbPhoto className="text-primary" size={20} /> Photos du produit</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><TbX size={14} /></button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Principale</span>}
                  </div>
                ))}
                {previews.length < 4 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    <TbPhoto size={24} /><span className="text-xs font-medium">Ajouter</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              <p className="text-xs text-gray-400">4 photos max. La 1ere sera la photo principale.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TbTag className="text-primary" size={20} /> Informations de base</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom du produit <span className="text-red-500">*</span></label>
                <input className={inputClass} placeholder="Ex: Cahier grand format 200 pages" value={form.nom} onChange={(e) => set("nom", e.target.value)} />
              </div>

              {/* Description avec IA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><TbAlignLeft size={15} className="inline" /> Description</label>
                  <button onClick={generateDescription} disabled={aiLoading || !form.nom}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#4a7c2f] to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm">
                    {aiLoading ? <TbLoader2 size={13} className="animate-spin" /> : <TbSparkles size={13} />}
                    {aiLoading ? "Generation..." : "Generer avec IA"}
                  </button>
                </div>
                <div className="relative">
                  <textarea className={inputClass + " resize-none"} rows={4}
                    placeholder="Decrivez votre produit ou cliquez sur Generer avec IA..."
                    value={form.description} onChange={(e) => set("description", e.target.value)} />
                  {aiLoading && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <div className="flex items-center gap-2 text-[#4a7c2f] font-semibold text-sm">
                        <TbSparkles size={18} className="animate-pulse" /> L IA redige votre description...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{form.description.length}/500</p>
                  <p className="text-xs text-indigo-400 flex items-center gap-1"><TbSparkles size={11} /> Propulse par Claude AI</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Categorie <span className="text-red-500">*</span></label>
                <select className={inputClass} value={form.categorie} onChange={(e) => set("categorie", e.target.value)}>
                  <option value="">Choisir une categorie</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TbCurrencyDollar className="text-primary" size={20} /> Prix & Stock</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Prix (FCFA) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input className={inputClass + " pr-14"} type="number" min="0" placeholder="0" value={form.prix} onChange={(e) => set("prix", e.target.value)} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block"><TbStack2 size={15} className="inline mr-1" />Stock</label>
                  <input className={inputClass} type="number" min="1" placeholder="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TbBrandWhatsapp className="text-green-500" size={20} /> Contact & Livraison</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">WhatsApp (optionnel)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+221</span>
                  <input className={inputClass + " pl-14"} type="tel" placeholder="77 123 45 67" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.livraison} onChange={(e) => set("livraison", e.target.checked)} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${form.livraison ? "bg-primary" : "bg-gray-200"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.livraison ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium">Livraison disponible sur le campus</span>
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="font-semibold text-gray-800 mb-4">Apercu</h2>
              <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
                {previews[0] ? <img src={previews[0]} alt="" className="w-full aspect-square object-cover" /> : (
                  <div className="w-full aspect-square bg-gray-50 flex flex-col items-center justify-center text-gray-300"><TbPhoto size={48} /><p className="text-xs mt-2">Photo principale</p></div>
                )}
              </div>
              <p className="font-bold text-gray-900 truncate">{form.nom || "Nom du produit"}</p>
              <p className="text-primary font-bold text-xl mt-1">{form.prix ? parseInt(form.prix).toLocaleString("fr-FR") + " FCFA" : "— FCFA"}</p>
              {form.categorie && <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded-full font-medium mt-2 inline-block">{form.categorie}</span>}
              {form.livraison && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><TbCheck size={14} /> Livraison campus</p>}
              {form.description && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{form.description}</p>}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full mt-6 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><TbLoader2 size={20} className="animate-spin" /> Publication...</> : <><TbCheck size={20} /> Publier le produit</>}
              </button>
              <Link href="/vendor/produits" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">Annuler</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
