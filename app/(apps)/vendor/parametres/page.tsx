"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbBuildingStore, TbArrowLeft, TbUser, TbBrandWhatsapp,
  TbLoader2, TbCheck, TbPhoto, TbUpload, TbX, TbClock,
} from "react-icons/tb";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function VendorParametres() {
  const [user, setUser] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ shopName: "", wave_number: "", description: "" });
  const [deliveryDays, setDeliveryDays] = useState<string[]>([]);
  const [deliveryHours, setDeliveryHours] = useState<{ start: string; end: string }>({ start: "08:00", end: "18:00" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUser(user);
      const { data: vendors } = await supabase.from("vendors")
        .select("id, shop_name, wave_number, description, logo_url, delivery_days, delivery_hours")
        .eq("user_id", user.id);
      const v = vendors?.[0] ?? null;
      setVendor(v);
      setLogoUrl(v?.logo_url ?? null);
      setForm({ shopName: v?.shop_name || "", wave_number: v?.wave_number || "", description: v?.description || "" });
      if (v?.delivery_days) setDeliveryDays(v.delivery_days);
      if (v?.delivery_hours) setDeliveryHours(v.delivery_hours);
      setLoading(false);
    })();
  }, []);

  const uploadLogo = async (file: File) => {
    if (!vendor?.id) return;
    setLogoUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `logos/${vendor.id}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    if (error) { alert("Erreur upload : " + error.message); setLogoUploading(false); return; }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    const url = data.publicUrl + "?t=" + Date.now();
    await supabase.from("vendors").update({ logo_url: url }).eq("id", vendor.id);
    setLogoUrl(url);
    setLogoUploading(false);
  };

  const removeLogo = async () => {
    if (!vendor?.id) return;
    const supabase = createClient();
    await supabase.from("vendors").update({ logo_url: null }).eq("id", vendor.id);
    setLogoUrl(null);
  };

  const toggleDay = (jour: string) => {
    setDeliveryDays(prev => prev.includes(jour) ? prev.filter(d => d !== jour) : [...prev, jour]);
  };

  const save = async () => {
    if (!vendor?.id) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("vendors").update({
      shop_name: form.shopName,
      wave_number: form.wave_number,
      description: form.description,
      delivery_days: deliveryDays,
      delivery_hours: deliveryDays.length > 0 ? deliveryHours : null,
    }).eq("id", vendor.id);
    if (error) { alert("Erreur : " + error.message); setSaving(false); return; }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-[#2d5a1b]" size={36} /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/dashboard" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
            <TbArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
            <p className="text-sm text-gray-500">Configurez votre boutique</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Logo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <TbPhoto className="text-[#2d5a1b]" size={20} /> Logo de la boutique
            </h2>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                {logoUploading ? <TbLoader2 className="animate-spin text-[#2d5a1b]" size={28} /> :
                  logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      <button onClick={removeLogo} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                        <TbX size={11} />
                      </button>
                    </>
                  ) : <TbBuildingStore className="text-gray-300" size={36} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-1">Photo de votre boutique</p>
                <p className="text-xs text-gray-400 mb-3">JPG, PNG ou WEBP. Recommande : 200x200px</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                <button onClick={() => fileRef.current?.click()} disabled={logoUploading}
                  className="flex items-center gap-2 bg-[#2d5a1b] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a3d10] transition-colors disabled:opacity-50">
                  <TbUpload size={15} /> {logoUrl ? "Changer le logo" : "Ajouter un logo"}
                </button>
              </div>
            </div>
          </div>

          {/* Infos boutique */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <TbUser className="text-[#2d5a1b]" size={20} /> Informations de la boutique
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500" value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom de la boutique</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b]"
                placeholder="Ma boutique campus" value={form.shopName} onChange={e => setForm(f => ({...f, shopName: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
              <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b] resize-none"
                placeholder="Decrivez votre boutique..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <TbBrandWhatsapp size={15} className="text-green-500" /> Numero WhatsApp / Wave
              </label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b]"
                placeholder="771234567" value={form.wave_number} onChange={e => setForm(f => ({...f, wave_number: e.target.value}))} />
            </div>
          </div>

          {/* Horaires de livraison - OPTIONNEL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <TbClock className="text-[#2d5a1b]" size={20} /> Horaires de livraison
              </h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Optionnel</span>
            </div>
            <p className="text-xs text-gray-400 -mt-2">Indiquez vos jours et heures de disponibilite pour les livraisons. Les clients verront ces infos sur vos produits.</p>

            {/* Jours */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Jours disponibles</p>
              <div className="flex flex-wrap gap-2">
                {JOURS.map(jour => (
                  <button key={jour} onClick={() => toggleDay(jour)}
                    className={"px-3 py-2 rounded-xl text-xs font-bold transition-all " + (deliveryDays.includes(jour) ? "bg-[#2d5a1b] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                    {jour.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Heures - seulement si au moins un jour selectionne */}
            {deliveryDays.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Horaires</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">De</label>
                    <input type="time" value={deliveryHours.start}
                      onChange={e => setDeliveryHours(h => ({ ...h, start: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b]" />
                  </div>
                  <div className="text-gray-400 mt-4">→</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">A</label>
                    <input type="time" value={deliveryHours.end}
                      onChange={e => setDeliveryHours(h => ({ ...h, end: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b]" />
                  </div>
                </div>

                {/* Apercu */}
                <div className="mt-3 bg-[#2d5a1b]/5 border border-[#2d5a1b]/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 font-medium">Apercu pour les clients :</p>
                  <p className="text-sm text-[#2d5a1b] font-bold mt-1">
                    {deliveryDays.map(d => d.slice(0, 3)).join(", ")} · {deliveryHours.start} - {deliveryHours.end}
                  </p>
                </div>
              </div>
            )}

            {deliveryDays.length === 0 && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400 text-center">
                Selectionnez au moins un jour pour definir vos horaires
              </div>
            )}
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-[#2d5a1b] text-white font-bold py-4 rounded-xl hover:bg-[#1a3d10] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg">
            {saving ? <><TbLoader2 size={20} className="animate-spin" /> Enregistrement...</> :
              saved ? <><TbCheck size={20} /> Enregistre !</> : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}