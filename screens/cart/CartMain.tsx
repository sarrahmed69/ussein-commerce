"use client";
import { useState } from "react";
import Link from "next/link";
import {
  TbArrowLeft, TbTrash, TbMinus, TbPlus,
  TbBrandWhatsapp, TbShoppingBag, TbBuildingStore, TbLoader2,
} from "react-icons/tb";
import { useCartStore } from "@/lib/zustand/cart-store";
import { createClient } from "@/lib/supabase/client";

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function CartMain() {
  const { items, updateQty, removeItem, clearCart, total } = useCartStore();
  const [ordering, setOrdering] = useState(false);
  const totalAmount = total();

  const handleCommander = async () => {
    if (!items.length) return;
    setOrdering(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      for (const item of items) {
        const { data: prod } = await supabase
          .from("products").select("stock").eq("id", item.id).single();
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.qty);
          await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
        }
      }

      const vendorGroups: Record<string, typeof items> = {};
      for (const item of items) {
        if (!vendorGroups[item.vendorId]) vendorGroups[item.vendorId] = [];
        vendorGroups[item.vendorId].push(item);
      }

      for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
        const orderTotal = vendorItems.reduce((s, i) => s + i.price * i.qty, 0);
        await supabase.from("orders").insert({
          vendor_id: vendorId,
          buyer_id: user?.id || null,
          buyer_name: user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Invite",
          items: vendorItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
          total: orderTotal,
          status: "pending",
          whatsapp: vendorItems[0]?.whatsapp || null,
        });
      }

      const lines = items.map(i => `- ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`).join("\n");
      const msg = encodeURIComponent(
        `Bonjour ! Je souhaite passer commande :\n\n${lines}\n\nTotal : ${formatPrice(totalAmount)}\n\nMerci de confirmer !`
      );
      const phone = items[0]?.whatsapp?.replace(/\D/g, "") || "";
      const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
      window.open(url, "_blank");
      clearCart();
    } catch (e) {
      console.error(e);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/produits" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <TbArrowLeft size={20} />
        </Link>
        <span className="text-sm text-primary font-semibold">Continuer mes achats</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Mon panier
          {items.length > 0 && (
            <span className="text-base text-gray-400 font-normal ml-2">
              ({items.length} article{items.length > 1 ? "s" : ""})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <TbShoppingBag className="text-gray-200 mx-auto mb-4" size={60} />
            <p className="font-semibold text-gray-500 mb-4">Votre panier est vide</p>
            <Link href="/produits" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block">
              Voir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

            {/* Colonne gauche : produits */}
            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {items.map((item, idx) => (
                  <div key={item.id} className={idx < items.length - 1 ? "border-b border-gray-100" : ""}>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary font-bold text-xs">
                        {item.vendeur?.[0] ?? "V"}
                      </div>
                      <TbBuildingStore size={13} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{item.vendeur}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-bold">
                            {item.name?.[0] ?? "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-primary font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2 border border-gray-200 rounded-full px-3 py-1 w-fit">
                          <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-primary transition-colors">
                            <TbMinus size={13} />
                          </button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-primary transition-colors">
                            <TbPlus size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <TbTrash size={17} />
                        </button>
                        <p className="text-sm font-bold text-gray-700">{formatPrice(item.price * item.qty)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : recapitulatif */}
            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                <h2 className="font-bold text-gray-800">Recapitulatif</h2>
                <div className="space-y-2">
                  {items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate flex-1 mr-4">{i.name} <span className="text-gray-400">x{i.qty}</span></span>
                      <span className="whitespace-nowrap font-medium">{formatPrice(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Livraison</span>
                    <span className="text-primary font-semibold">A convenir</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>

                <button
                  onClick={handleCommander}
                  disabled={ordering}
                  className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {ordering ? (
                    <><TbLoader2 size={20} className="animate-spin" /> Envoi en cours...</>
                  ) : (
                    <><TbBrandWhatsapp size={20} /> Passer commande</>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 leading-relaxed">
                  La commande sera envoyee au vendeur via WhatsApp.
                </p>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2 text-center">Paiements acceptes</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">Cash</span>
                    <span className="bg-[#0070E0] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Wave</span>
                    <span className="bg-[#FF6600] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Orange Money</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}