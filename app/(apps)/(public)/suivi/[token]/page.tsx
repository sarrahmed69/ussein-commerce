"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbCheck, TbClock, TbPackage, TbTruck, TbLoader2, TbArrowLeft, TbBrandWhatsapp } from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const STEPS = [
  { key: "pending", label: "Commande recue", desc: "Votre commande a ete envoyee au vendeur", icon: TbClock },
  { key: "confirmed", label: "Confirmee", desc: "Le vendeur a confirme votre commande", icon: TbCheck },
  { key: "delivered", label: "Livree", desc: "Votre commande a ete livree avec succes", icon: TbTruck },
];

export default function SuiviPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: o } = await supabase.from("orders").select("*").eq("tracking_token", token).single();
      if (!o) { setLoading(false); return; }
      setOrder(o);
      if (o.product_id) {
        const { data: p } = await supabase.from("products").select("id, name, images, price").eq("id", o.product_id).single();
        setProduct(p);
      }
      if (o.vendor_id) {
        const { data: v } = await supabase.from("vendors").select("id, shop_name, wave_number, logo_url").eq("id", o.vendor_id).single();
        setVendor(v);
      }
      setLoading(false);
    })();
  }, [token]);

  const getCurrentStep = () => {
    if (order?.status === "delivered") return 2;
    if (order?.status === "confirmed") return 1;
    return 0;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <TbLoader2 className="animate-spin text-[#2d5a1b]" size={36} />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fafaf8] p-6">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
        <TbPackage className="text-gray-300" size={40} />
      </div>
      <p className="font-bold text-gray-800">Commande introuvable</p>
      <p className="text-gray-400 text-sm text-center">Ce lien de suivi est invalide ou a expire</p>
      <Link href="/" className="bg-[#2d5a1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold">Retour accueil</Link>
    </div>
  );

  const step = getCurrentStep();
  const waPhone = vendor?.wave_number?.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95">
          <TbArrowLeft size={18} />
        </Link>
        <div>
          <p className="font-bold text-gray-900 text-sm">Suivi de commande</p>
          <p className="text-xs text-gray-400">#{(token as string)?.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Statut principal */}
        <div className={"rounded-2xl p-5 text-center border " + (
          step === 2 ? "bg-emerald-50 border-emerald-200" :
          step === 1 ? "bg-blue-50 border-blue-200" :
          "bg-amber-50 border-amber-200"
        )}>
          <div className={"w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 " + (
            step === 2 ? "bg-emerald-100" : step === 1 ? "bg-blue-100" : "bg-amber-100"
          )}>
            {step === 2 ? <TbTruck size={28} className="text-emerald-600" /> :
             step === 1 ? <TbCheck size={28} className="text-blue-600" /> :
             <TbClock size={28} className="text-amber-600" />}
          </div>
          <p className="font-extrabold text-gray-900 text-lg">{STEPS[step].label}</p>
          <p className="text-sm text-gray-500 mt-1">{STEPS[step].desc}</p>
        </div>

        {/* Barre de progression */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-5">Progression</h3>
          <div className="space-y-0">
            {STEPS.map((s, i) => {
              const done = i <= step;
              const current = i === step;
              return (
                <div key={s.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={"w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all " + (done ? "bg-[#2d5a1b] border-[#2d5a1b]" : "bg-white border-gray-200")}>
                      {done ? <TbCheck size={16} className="text-white" /> : <s.icon size={16} className="text-gray-300" />}
                    </div>
                    {i < STEPS.length - 1 && <div className={"w-0.5 h-10 " + (i < step ? "bg-[#2d5a1b]" : "bg-gray-100")} />}
                  </div>
                  <div className="pb-8">
                    <p className={"font-bold text-sm " + (done ? "text-gray-900" : "text-gray-300")}>{s.label}</p>
                    <p className={"text-xs mt-0.5 " + (current ? "text-[#2d5a1b] font-medium" : done ? "text-gray-400" : "text-gray-200")}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Infos commande */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Details de la commande</h3>
          {product && (
            <div className="flex items-center gap-3">
              {product.images?.[0]
                ? <img src={product.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><TbPackage className="text-gray-300" size={24} /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qte : {order.quantity || 1}</p>
                <p className="text-[#2d5a1b] font-bold text-sm mt-0.5">{fmt(order.total_price || 0)}</p>
              </div>
            </div>
          )}
          <div className="h-px bg-gray-100" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Client</span>
              <span className="font-semibold text-gray-800">{order.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Livraison</span>
              <span className="font-semibold text-gray-800">{order.delivery_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Vendeur */}
        {vendor && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#2d5a1b]/10 flex items-center justify-center font-bold text-[#2d5a1b] overflow-hidden flex-shrink-0">
                {vendor.logo_url ? <img src={vendor.logo_url} alt="" className="w-full h-full object-cover" /> : vendor.shop_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400">Vendu par</p>
                <p className="font-bold text-gray-900 text-sm">{vendor.shop_name}</p>
              </div>
            </div>
            {waPhone && (
              <a href={"https://wa.me/" + waPhone} target="_blank"
                className="bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95">
                <TbBrandWhatsapp size={16} /> Contacter
              </a>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-300">USSEIN Commerce · Marketplace officielle</p>
      </div>
    </div>
  );
}