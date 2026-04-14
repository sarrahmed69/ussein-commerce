"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  TbLoader2, TbCheck, TbArrowLeft, TbClock, TbShieldCheck,
  TbBrandWhatsapp, TbStar, TbCrown, TbFlame, TbX,
} from "react-icons/tb";

const WAVE_LINK = "https://pay.wave.com/m/M_sn_tR8008S5rtTU/c/sn/";
const ADMIN_WA = "221764772441";
const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p);

const PLANS = [
  { id: "mensuel", name: "Mensuel", price: 1000, days: 30, popular: false, icon: TbStar, desc: "Ideal pour debuter" },
  { id: "trimestriel", name: "Trimestriel", price: 2500, days: 90, popular: true, icon: TbFlame, desc: "Economisez 500 FCFA", save: 500 },
  { id: "annuel", name: "Annuel", price: 8000, days: 365, popular: false, icon: TbCrown, desc: "Economisez 4 000 FCFA", save: 4000 },
];

function CountDown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expire"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      setUrgent(days < 5);
      setRemaining(days > 0 ? days + "j " + hours + "h" : hours + "h");
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return <span className={"font-bold " + (urgent ? "text-red-500" : "text-emerald-600")}>{remaining}</span>;
}

export default function AbonnementPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      const savedId = localStorage.getItem("vendor_selected_id");
      let query = supabase.from("vendors").select("*").eq("user_id", user.id);
      if (savedId) query = query.eq("id", savedId);
      const { data } = await query.limit(1).single();
      setVendor(data);
      setLoading(false);
    })();
  }, []);

  const getStatus = () => {
    if (!vendor) return "none";
    const expired = !vendor.subscription_expires_at || new Date(vendor.subscription_expires_at) <= new Date();
    if (vendor.subscription_status === "active" && !expired) return "active";
    if (vendor.subscription_status === "trial" && !expired) return "trial";
    if (vendor.subscription_status === "pending") return "pending";
    if (vendor.subscription_status === "suspended") return "suspended";
    return "expired";
  };

  const handlePayment = async () => {
    if (!selectedPlan || !vendor) return;
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;
    setSubmitting(true);

    const supabase = createClient();
    await supabase.from("vendors").update({ subscription_status: "pending" }).eq("id", vendor.id);

    // Ouvrir Wave pour le paiement
    window.open(WAVE_LINK + "?amount=" + plan.price, "_blank");

    // Envoyer confirmation WhatsApp
    setTimeout(() => {
      const msg = encodeURIComponent(
        "Paiement abonnement USSEIN Commerce\n\n" +
        "Boutique : " + vendor.shop_name + "\n" +
        "Forfait : " + plan.name + " (" + fmt(plan.price) + " FCFA)\n" +
        "Duree : " + plan.days + " jours\n\n" +
        "Merci de confirmer mon paiement."
      );
      window.open("https://wa.me/" + ADMIN_WA + "?text=" + msg, "_blank");
    }, 1500);

    setSubmitting(false);
    setSubmitted(true);
    setVendor({ ...vendor, subscription_status: "pending" });
  };

  const status = getStatus();

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <TbLoader2 className="animate-spin text-[#2d5a1b]" size={36} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95">
          <TbArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Abonnement</h1>
          <p className="text-sm text-gray-400">{vendor?.shop_name}</p>
        </div>
      </div>

      {/* Statut actuel */}
      <div className={"rounded-2xl p-5 border " + (
        status === "active" ? "bg-emerald-50 border-emerald-200" :
        status === "trial" ? "bg-blue-50 border-blue-200" :
        status === "pending" ? "bg-amber-50 border-amber-200" :
        status === "suspended" ? "bg-orange-50 border-orange-200" :
        "bg-red-50 border-red-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (
              status === "active" ? "bg-emerald-100" :
              status === "trial" ? "bg-blue-100" :
              status === "pending" ? "bg-amber-100" :
              status === "suspended" ? "bg-orange-100" :
              "bg-red-100"
            )}>
              {status === "active" && <TbShieldCheck size={20} className="text-emerald-600" />}
              {status === "trial" && <TbClock size={20} className="text-blue-600" />}
              {status === "pending" && <TbClock size={20} className="text-amber-600" />}
              {status === "suspended" && <TbClock size={20} className="text-orange-600" />}
              {status === "expired" && <TbClock size={20} className="text-red-500" />}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {status === "active" && "Abonnement actif"}
                {status === "trial" && "Essai gratuit"}
                {status === "pending" && "Paiement en attente de verification"}
                {status === "suspended" && "Boutique suspendue — Abonnez-vous"}
                {status === "expired" && "Abonnement expire"}
              </p>
              {vendor?.subscription_expires_at && (status === "active" || status === "trial") && (
                <p className="text-sm text-gray-500">Expire dans <CountDown expiresAt={vendor.subscription_expires_at} /></p>
              )}
              {status === "pending" && <p className="text-sm text-amber-600">Votre paiement est en cours de verification par l admin</p>}
              {status === "suspended" && <p className="text-sm text-orange-600">Choisissez un forfait pour activer votre boutique</p>}
              {status === "expired" && <p className="text-sm text-red-500">Renouvelez pour continuer a vendre</p>}
            </div>
          </div>
          {vendor?.subscription_expires_at && (status === "active" || status === "trial") && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Expiration</p>
              <p className="text-sm font-bold text-gray-700">{new Date(vendor.subscription_expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          )}
        </div>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <TbCheck size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">Demande envoyee !</p>
            <p className="text-xs text-emerald-600">L admin va verifier votre paiement et activer votre abonnement sous 24h.</p>
          </div>
        </div>
      )}

      {/* Forfaits */}
      {status !== "pending" && (
        <>
          <h2 className="text-lg font-extrabold text-gray-900 pt-2">
            {status === "active" || status === "trial" ? "Renouveler ou changer de forfait" : "Choisir un forfait"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <button key={plan.id} onClick={() => { setSelectedPlan(plan.id); setShowPayment(true); }}
                className={"relative rounded-2xl p-5 border-2 text-left transition-all hover:shadow-lg active:scale-[0.98] " + (
                  plan.popular ? "border-[#d4a017] bg-[#d4a017]/5 shadow-md" : "border-gray-200 bg-white hover:border-[#2d5a1b]"
                )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d4a017] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Populaire
                  </div>
                )}
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + (plan.popular ? "bg-[#d4a017]/20" : "bg-gray-100")}>
                  <plan.icon size={20} className={plan.popular ? "text-[#d4a017]" : "text-gray-500"} />
                </div>
                <p className="font-extrabold text-gray-900 text-lg">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#2d5a1b]">{fmt(plan.price)}</span>
                  <span className="text-sm text-gray-400">FCFA</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{plan.days} jours</p>
                <p className={"text-xs font-semibold mt-2 " + (plan.save ? "text-[#d4a017]" : "text-gray-400")}>{plan.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal paiement */}
      {showPayment && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPayment(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900">Payer l abonnement</h2>
              <button onClick={() => setShowPayment(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500"><TbX size={16} /></button>
            </div>

            {(() => {
              const plan = PLANS.find(p => p.id === selectedPlan)!;
              return (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-400">Forfait {plan.name}</p>
                    <p className="text-3xl font-black text-[#2d5a1b] mt-1">{fmt(plan.price)} FCFA</p>
                    <p className="text-xs text-gray-400 mt-1">{plan.days} jours</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Comment payer :</p>
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-blue-800">1. Payez {fmt(plan.price)} FCFA via Wave</p>
                      <a href={WAVE_LINK + "?amount=" + plan.price} target="_blank"
                        className="inline-flex items-center gap-2 bg-[#29ABE2] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1a9ad0] transition-colors">
                        Payer avec Wave — {fmt(plan.price)} FCFA
                      </a>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-green-800">2. Confirmez via WhatsApp</p>
                      <p className="text-xs text-green-600">Apres le paiement, cliquez le bouton ci-dessous</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-amber-800">3. Activation sous 24h</p>
                      <p className="text-xs text-amber-600">L admin verifie et active votre abonnement</p>
                    </div>
                  </div>

                  <button onClick={handlePayment} disabled={submitting}
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] text-sm">
                    {submitting ? <TbLoader2 size={18} className="animate-spin" /> : <TbBrandWhatsapp size={20} />}
                    {submitting ? "Envoi..." : "J ai paye — Confirmer via WhatsApp"}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Avantages */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-gray-800 text-sm">Ce que comprend votre abonnement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Boutique en ligne personnalisee",
            "Ajout de produits illimite",
            "Commandes via WhatsApp",
            "Visibilite sur la marketplace",
            "Support par WhatsApp",
            "Statistiques de vente",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <TbCheck size={16} className="text-emerald-500 flex-shrink-0" /> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}