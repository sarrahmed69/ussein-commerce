"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbPackage, TbLoader2, TbCheck,
  TbClock, TbTruck, TbX, TbExternalLink, TbBrandWhatsapp,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

const STATUS = {
  pending:   { label: "En attente", color: "bg-amber-100 text-amber-700",  icon: TbClock },
  confirmed: { label: "Confirmee",  color: "bg-blue-100 text-blue-700",    icon: TbCheck },
  delivered: { label: "Livree",     color: "bg-emerald-100 text-emerald-700", icon: TbTruck },
  cancelled: { label: "Annulee",    color: "bg-red-100 text-red-600",      icon: TbX },
};

export default function UserCommandesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }

      const { data } = await supabase
        .from("orders")
        .select("*, products(id, name, images, price)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <TbLoader2 className="animate-spin text-[#2d5a1b]" size={36} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95">
          <TbArrowLeft size={18} />
        </button>
        <div>
          <p className="font-bold text-gray-900 text-sm">Mes commandes</p>
          <p className="text-xs text-gray-400">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
              <TbPackage className="text-gray-300" size={40} />
            </div>
            <p className="font-bold text-gray-800">Aucune commande</p>
            <p className="text-gray-400 text-sm text-center">Vous n avez pas encore passe de commande</p>
            <Link href="/produits" className="bg-[#2d5a1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              Voir les produits
            </Link>
          </div>
        ) : (
          orders.map(order => {
            const product = order.products;
            const s = STATUS[order.status as keyof typeof STATUS] || STATUS.pending;
            const Icon = s.icon;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header statut */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className={"flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full " + s.color}>
                    <Icon size={12} /> {s.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Produit */}
                <div className="flex items-center gap-3 px-4 py-4">
                  {product?.images?.[0]
                    ? <img src={product.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><TbPackage className="text-gray-300" size={24} /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{product?.name || "Produit"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qte : {order.quantity || 1}</p>
                    <p className="text-[#2d5a1b] font-bold text-sm mt-0.5">{fmt(order.total_price || 0)}</p>
                  </div>
                </div>

                {/* Infos livraison */}
                {order.delivery_address && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-400">Livraison : <span className="text-gray-600 font-medium">{order.delivery_address}</span></p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-4">
                  {order.tracking_token && (
                    <Link href={"/suivi/" + order.tracking_token}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#2d5a1b] text-white text-xs font-bold py-2.5 rounded-xl active:scale-95">
                      <TbExternalLink size={14} /> Suivre la commande
                    </Link>
                  )}
                  {order.whatsapp && (
                    <a href={"https://wa.me/" + order.whatsapp.replace(/\D/g, "")} target="_blank"
                      className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-2.5 rounded-xl active:scale-95">
                      <TbBrandWhatsapp size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}