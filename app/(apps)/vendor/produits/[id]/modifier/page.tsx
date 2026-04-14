"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TbArrowLeft, TbPhoto, TbX, TbCheck, TbLoader2, TbBrandWhatsapp, TbTag, TbCurrencyDollar } from "react-icons/tb";

const CATEGORIES = ["Alimentation","Fournitures scolaires","Vetements","Electronique","Livres & Cours","Services","Beaute","Autre"];

export default function ModifierProduitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    nom: "", description: "", prix: "",
    categorie: "", stock: "1", whatsapp: "", livraison: false, status: "active",
  });

  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error || !product) { router.push("/vendor/produits"); return; }
      setForm({
        nom: product.name || "",
        description: product.description || "",
        prix: String(product.price || ""),
        categorie: product.category || "",
        stock: String(product.stock || "1"),
        whatsapp: product.whatsapp_contact || "",
        livraison: product.delivery_available || false,
        status: product.status || "active",
      });
      setExistingImages(Array.isArray(product.images) ? product.images : []);
      setChecking(false);
    })();
  }, [id]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const total = existingImages.length + newPreviews.length;
    const newF = Array.from(e.target.files || []).slice(0, 4 - total);
    newF.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target?.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    });
    setNewFiles(prev => [...prev, ...newF].slice(0, 4));
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prix || !form.categorie) {
      alert("Nom, prix et categorie requis."); return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const ext = file.name.split(".").pop();
        const path = user.id + "/" + Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;
        const { error: uploadError } = await supabase.storage.from("products").upload(path, file, { upsert: true });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }
      const { error } = await supabase.from("products").update({
        name: form.nom,
        description: form.description,
        price: parseFloat(form.prix),
        category: form.categorie,
        stock: parseInt(form.stock),
        whatsapp_contact: form.whatsapp || null,
        delivery_available: form.livraison,
        status: form.status,
        images: [...existingImages, ...uploadedUrls],
      }).eq("id", id);
      if (error) { alert("Erreur: " + error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/vendor/produits"), 1500);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a7c2f]/30 focus:border-[#4a7c2f] transition-all";
  const totalImages = existingImages.length + newPreviews.length;

  if (checking) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-[#4a7c2f]" size={36} /></div>;
  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><TbCheck className="text-green-600" size={40} /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Produit mis a jour !</h2>
        <p className="text-gray-500">Redirection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/vendor/produits" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="font-bold text-gray-800">Modifier le produit</h1>
          <p className="text-xs text-gray-400">Mettez a jour les informations</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TbPhoto className="text-[#4a7c2f]" size={20} /> Photos</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((src, i) => (
              <div key={"e"+i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <TbX size={14} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 bg-[#4a7c2f] text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Principale</span>}
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={"n"+i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => { setNewPreviews(prev => prev.filter((_, idx) => idx !== i)); setNewFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <TbX size={14} />
                </button>
              </div>
            ))}
            {totalImages < 4 && (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#4a7c2f] hover:text-[#4a7c2f] transition-colors">
                <TbPhoto size={24} /><span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          <p className="text-xs text-gray-400">4 photos max.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TbTag className="text-[#4a7c2f]" size={20} /> Informations</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom du produit *</label>
            <input className={inputClass} value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: Cahier grand format" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea className={inputClass + " resize-none"} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Decrivez votre produit..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Categorie *</label>
            <select className={inputClass} value={form.categorie} onChange={e => set("categorie", e.target.value)}>
              <option value="">Choisir une categorie</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TbCurrencyDollar className="text-[#4a7c2f]" size={20} /> Prix & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Prix (FCFA) *</label>
              <input className={inputClass} type="number" min="0" value={form.prix} onChange={e => set("prix", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stock</label>
              <input className={inputClass} type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="1" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TbBrandWhatsapp className="text-green-500" size={20} /> Contact & Options</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">WhatsApp (optionnel)</label>
            <input className={inputClass} type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="221771234567" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.livraison} onChange={e => set("livraison", e.target.checked)} />
              <div className={"w-11 h-6 rounded-full transition-colors " + (form.livraison ? "bg-[#4a7c2f]" : "bg-gray-200")} />
              <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (form.livraison ? "translate-x-5" : "")} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Livraison campus disponible</span>
          </label>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Visibilite</label>
            <div className="flex gap-3">
              {["active", "inactive"].map(s => (
                <button key={s} onClick={() => set("status", s)}
                  className={"flex-1 py-2.5 rounded-xl text-sm font-medium border transition " + (form.status === s ? "border-[#4a7c2f] bg-[#4a7c2f]/5 text-[#4a7c2f]" : "border-gray-200 text-gray-500")}>
                  {s === "active" ? "Visible" : "Masque"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-[#4a7c2f] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-[#2d5a1b] disabled:opacity-60">
          {loading ? <><TbLoader2 size={20} className="animate-spin" /> Enregistrement...</> : <><TbCheck size={20} /> Enregistrer</>}
        </button>
        <Link href="/vendor/produits" className="block text-center text-sm text-gray-400 hover:text-gray-600">Annuler</Link>
      </div>
    </div>
  );
}