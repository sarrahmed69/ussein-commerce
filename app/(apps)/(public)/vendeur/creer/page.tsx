"use client";

import { useState } from "react";
import Link from "next/link";
import { TbArrowRight, TbUser, TbShoppingBag, TbCheck, TbLoader2 } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const campusData: Record<string, string[]> = {
  "Kaolack": ["Saloum 1", "Saloum 2", "Saloum 3", "Saloum 4", "Saloum 5", "Saloum 6", "Saloum 7", "Saloum 8", "Hors residence"],
  "Fatick": ["Sine 1", "Sine 2", "Sine 3", "Sine 4", "Sine 5", "Sine 6", "Sine 7", "Sine 8", "Hors residence"],
  "Kaffrine": ["Ndoukman", "Hors residence"],
};

const categories = [
  "Informatique", "Alimentation", "Vetements", "Livres",
  "Services", "Logement", "Sport", "Beaute", "Electronique", "Autre"
];

export default function CreerVendeurPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    confirmPassword: "", phone: "", shopName: "", shopDescription: "",
    category: "", whatsapp: "",
    waveNumber: "", orangeMoneyNumber: "", agreeTerms: false,
    campus: "", residence: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    if (!form.agreeTerms) { setError("Veuillez accepter les conditions"); return; }
    setLoading(true); setError("");
    try {
      // Verifier si deja connecte
      let userId: string | null = null;
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      
      if (existingUser) {
        // Deja connecte, utiliser ce compte
        userId = existingUser.id;
      } else {
        // Creer un nouveau compte
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { first_name: form.firstName, last_name: form.lastName, phone: form.phone } },
        });
        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("Erreur lors de la creation du compte");
        userId = authData.user.id;

        // Se connecter
        await new Promise(r => setTimeout(r, 500));
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        });
        if (signInError) throw new Error("Compte cree mais connexion echouee. Verifiez votre email puis connectez-vous.");
      }
      
      if (!userId) throw new Error("Impossible de recuperer votre compte");

      const slug = form.shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

      // Verifier si ce numero a deja eu un essai gratuit
      const cleanPhone = (form.whatsapp || form.phone).replace(/\D/g, "").slice(-9);
      const { data: existingTrial } = await supabase.from("trial_tracker").select("id").eq("phone", cleanPhone);
      const isFirstShop = !existingTrial || existingTrial.length === 0;
      // 2eme boutique+ sera creee en suspension

      const { data: vendorData, error: vendorError } = await supabase.from("vendors").insert({
        user_id: userId,
        shop_name: form.shopName,
        slug: slug,
        description: form.shopDescription || null,
        wave_number: form.whatsapp || form.phone || null,
        orange_money_number: form.orangeMoneyNumber || null,
        free_money_number: null,
        type: "student",
        status: "active",
        is_verified: false,
        rating: 0,
        total_sales: 0,
        total_revenue: 0,
        campus_delivery: true,
        campus: form.campus,
        residence: form.residence,
        subscription_status: isFirstShop ? "trial" : "suspended",
        subscription_expires_at: isFirstShop ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      }).select("id").single();

      if (vendorError) throw new Error("Erreur creation boutique : " + vendorError.message);
      if (vendorData?.id) {
        localStorage.setItem("vendor_selected_id", vendorData.id);
        if (isFirstShop) {
          await supabase.from("trial_tracker").insert({
            phone: cleanPhone,
            user_id: userId,
            vendor_id: vendorData.id,
          });
        }
      }
      router.push("/vendor/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="bg-gradient-to-br from-[#1a3d10] to-[#2d5a1b] px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#d4a017]/20 border border-[#d4a017]/40 rounded-full px-4 py-1.5 text-[#d4a017] text-xs font-bold mb-3">USSEIN Commerce</div>
        <h1 className="text-white text-2xl lg:text-3xl font-black mb-2">Creer votre boutique</h1>
        <p className="text-white/70 text-sm">Rejoignez la marketplace des etudiants USSEIN</p>
        <div className="flex justify-center items-center gap-3 mt-6">
          {[{ n: 1, l: "Compte" }, { n: 2, l: "Boutique" }, { n: 3, l: "Confirmer" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm " + (step >= s.n ? "bg-[#d4a017] text-[#1a3d10]" : "bg-white/15 text-white/50")}>
                {step > s.n ? <TbCheck size={16} /> : s.n}
              </div>
              <span className={"text-xs " + (step >= s.n ? "text-white font-bold" : "text-white/40")}>{s.l}</span>
              {i < 2 && <div className={"w-8 h-0.5 " + (step > s.n ? "bg-[#d4a017]" : "bg-white/20")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {error && <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-red-600 text-sm mb-6 font-medium">{error}</div>}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><TbUser size={20} className="text-[#2d5a1b]" /> Informations personnelles</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Prenom *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Mouhamed" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="SARR" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="exemple@ussein.edu.sn" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Telephone / WhatsApp *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+221 77 000 00 00" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Mot de passe *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 caracteres" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirmer le mot de passe *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Repetez le mot de passe" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><TbShoppingBag size={20} className="text-[#2d5a1b]" /> Votre boutique</h2>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom de la boutique *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" value={form.shopName} onChange={e => set("shopName", e.target.value)} placeholder="Ex: Tech Campus Store" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Description *</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10 min-h-[100px] resize-y" value={form.shopDescription} onChange={e => set("shopDescription", e.target.value)} placeholder="Decrivez vos produits/services..." /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Categorie principale *</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10 bg-white" value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Choisir une categorie</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Campus *</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10 bg-white" value={form.campus} onChange={e => { set("campus", e.target.value); set("residence", ""); }}>
                <option value="">Choisir votre campus</option>
                {Object.keys(campusData).map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
              {form.campus && (
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Residence *</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10 bg-white" value={form.residence} onChange={e => set("residence", e.target.value)}>
                <option value="">Choisir votre residence</option>
                {campusData[form.campus]?.map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
              )}
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Numero WhatsApp boutique *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1b] focus:ring-2 focus:ring-[#2d5a1b]/10" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+221 77 000 00 00" /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-gray-900">Confirmation</h2>
              <p className="text-gray-400 text-sm -mt-3">Verifiez vos informations avant de creer votre boutique</p>

              <div className="bg-[#fafaf8] rounded-2xl p-5 space-y-2">
                <p className="font-bold text-[#1a3d10] text-sm mb-3">Recapitulatif</p>
                {[{ l: "Nom", v: form.firstName + " " + form.lastName },{ l: "Email", v: form.email },{ l: "Boutique", v: form.shopName },{ l: "Categorie", v: form.category },{ l: "Campus", v: form.campus },{ l: "Residence", v: form.residence },{ l: "WhatsApp", v: form.whatsapp }].map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{r.l}</span><span className="text-[#1a3d10] font-semibold">{r.v || "-"}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#2d5a1b] flex-shrink-0" />
                <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer leading-relaxed">J accepte les conditions d utilisation et je m engage a respecter les regles de la marketplace USSEIN.</label>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 gap-3">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm px-6 py-3.5 rounded-xl transition-all active:scale-95">Retour</button>
            ) : (
              <Link href="/devenir-vendeur" className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm px-6 py-3.5 rounded-xl inline-flex items-center">Annuler</Link>
            )}
            {step < 3 ? (
              <button onClick={() => {
                if (step === 1 && (!form.firstName || !form.email || !form.password)) { setError("Remplir tous les champs obligatoires"); return; }
                if (step === 2 && (!form.shopName || !form.category || !form.whatsapp || !form.campus || !form.residence)) { setError("Remplir tous les champs obligatoires"); return; }
                setError(""); setStep(s => s + 1);
              }} className="bg-gradient-to-r from-[#2d5a1b] to-[#1a3d10] text-white font-bold text-sm px-8 py-3.5 rounded-xl flex items-center gap-2 active:scale-95 hover:shadow-lg">
                Suivant <TbArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="bg-[#d4a017] hover:bg-[#c49515] disabled:bg-gray-300 text-[#1a3d10] font-extrabold text-sm px-8 py-3.5 rounded-xl flex items-center gap-2 active:scale-95 disabled:cursor-not-allowed">
                {loading ? <><TbLoader2 size={16} className="animate-spin" /> Creation...</> : "Creer ma boutique"}
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">Deja vendeur ? <Link href="/auth/sign-in" className="text-[#2d5a1b] font-semibold hover:underline">Se connecter</Link></p>
      </div>
    </div>
  );
}