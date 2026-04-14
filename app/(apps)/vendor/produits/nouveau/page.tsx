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
      const { data: vendor } = await supabase.from("vendors").select("id, subscription_status, subscription_expires_at, status").eq("user_id", user.id).limit(1).single();
      if (!vendor) { router.push("/vendor/dashboard"); return; }
      const expired = !vendor.subscription_expires_at || new Date(vendor.subscription_expires_at) <= new Date();
      const isOk = (vendor.subscription_status === "active" && !expired) || (vendor.subscription_status === "trial" && !expired) || vendor.subscription_status === "pending";
      setSuspended(!isOk);
      setChecking(false);
    })();
  }, []);

  const generateDescription = async () => {
    if (!form.nom) { alert("Entrez d abord le nom du produit !"); return; }
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
    } catch (e) { alert("Erreur IA. Reessayez !"); }
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
      const vendorId = localStorage.getItem("vendor_selected_id");
      const { data: vendor } = await supabase.from("vendors").select("subscription_status, subscription_expires_at").eq("id", vendorId || "").single();
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
        seller_id: user.id, vendor_id: vendorId, status: "active", images: imageUrls,
      });
      if (error) { alert("Erreur: " + error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/vendor/produits"), 1800);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4a7c2f]/30 focus:border-[#4a7c2f] transition-all";

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <TbLoader2 className="animate-spin text-[#4a7c2f]" size={36} />
    </div>
  );

  if (suspended) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><TbLock className="text-white" size={32} /></div>
          <h2 className="text-white font-bold text-lg">Acces bloque</h2>
          <p className="text-white/70 text-sm mt-1">Abonnement expire ou inactif</p>
        </div>
        <div className="p-6 space-y-3 text-center">
          <p className="text-gray-600 text-sm">Votre boutique est suspendue. Renouvelez pour ajouter des produits.</p>
          <Link href="/vendor/abonnement" className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <TbCreditCard size={16} /> Renouveler mon abonnement
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
    <div className="min-h-screen bg-[#f9fafb]">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0">
          <TbArrowLeft size={19} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900">Nouveau produit</h1>
          <p className="text-xs text-gray-400">Remplissez les informations</p>
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="bg-[#1a3d10] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#2d5a1b] transition-colors flex items-center gap-1.5 disabled:opacity-60 flex-shrink-0">
          {loading ? <TbLoader2 size={15} className="animate-spin" /> : <TbCheck size={15} />}
          {loading ? "Publication..." : "Publier"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Photos */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <TbPhoto className="text-[#4a7c2f]" size={18} /> Photos du produit
          </h2>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <TbX size={11} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 bg-[#1a3d10] text-white text-[9px] px-1 py-0.5 rounded font-bold">PRINCIPALE</span>}
              </div>
            ))}
            {previews.length < 4 && (
              <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-[#4a7c2f] hover:text-[#4a7c2f] transition-colors">
                <TbPhoto size={20} />
                <span className="text-[10px] font-medium">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          <p className="text-xs text-gray-400">4 photos max. La 1ere sera la photo principale.</p>
        </div>

        {/* Infos de base */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <TbTag className="text-[#4a7c2f]" size={18} /> Informations de base
          </h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nom du produit <span className="text-red-500">*</span></label>
            <input className={inputClass} placeholder="Ex: Cahier grand format 200 pages" value={form.nom} onChange={(e) => set("nom", e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600">Description</label>

            </div>
            <div className="relative">
              <textarea className={inputClass + " resize-none"} rows={4}
                placeholder="Decrivez votre produit..."
                value={form.description} onChange={(e) => set("description", e.target.value)} />

            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">{form.description.length}/500</p>

            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Categorie <span className="text-red-500">*</span></label>
            <select className={inputClass} value={form.categorie} onChange={(e) => set("categorie", e.target.value)}>
              <option value="">Choisir une categorie</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Prix & Stock */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <TbCurrencyDollar className="text-[#4a7c2f]" size={18} /> Prix & Stock
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Prix (FCFA) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input className={inputClass + " pr-12"} type="number" min="0" placeholder="0" value={form.prix} onChange={(e) => set("prix", e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">FCFA</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Stock</label>
              <input className={inputClass} type="number" min="1" placeholder="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Contact & Livraison */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <TbBrandWhatsapp className="text-green-500" size={18} /> Contact & Livraison
          </h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">WhatsApp (optionnel)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+221</span>
              <input className={inputClass + " pl-14"} type="tel" placeholder="77 123 45 67" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex-shrink-0">
              <input type="checkbox" className="sr-only" checked={form.livraison} onChange={(e) => set("livraison", e.target.checked)} />
              <div className={`w-11 h-6 rounded-full transition-colors ${form.livraison ? "bg-[#4a7c2f]" : "bg-gray-200"}`} />
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.livraison ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm text-gray-700">Livraison disponible sur le campus</span>
          </label>
        </div>

        {/* Apercu */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm">Apercu</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
              {previews[0]
                ? <img src={previews[0]} alt="" className="w-full h-full object-cover" />
                : <TbPhoto className="text-gray-200" size={28} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-sm">{form.nom || "Nom du produit"}</p>
              <p className="text-[#4a7c2f] font-bold text-lg mt-0.5">{form.prix ? parseInt(form.prix).toLocaleString("fr-FR") + " FCFA" : "— FCFA"}</p>
              {form.categorie && <span className="text-xs bg-[#eaf3de] text-[#2d5a1b] px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{form.categorie}</span>}
            </div>
          </div>
          {form.livraison && <p className="text-xs text-green-600 mt-3 flex items-center gap-1"><TbCheck size={13} /> Livraison campus disponible</p>}
        </div>

        {/* Bouton publier */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-[#1a3d10] text-white font-bold py-4 rounded-2xl hover:bg-[#2d5a1b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
          {loading ? <><TbLoader2 size={18} className="animate-spin" /> Publication en cours...</> : <><TbCheck size={18} /> Publier le produit</>}
        </button>
        <Link href="/vendor/produits" className="block text-center text-sm text-gray-400 hover:text-gray-600 pb-6">Annuler</Link>

      </div>
    </div>
  );
}