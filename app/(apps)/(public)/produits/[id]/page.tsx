"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbArrowLeft, TbBrandWhatsapp, TbPackage,
  TbTruck, TbTag, TbChevronLeft, TbChevronRight, TbHeart,
  TbShare, TbShieldCheck, TbClock, TbCheck,
  TbFlame, TbMinus, TbPlus, TbX, TbUser,
  TbPhone, TbSend, TbShoppingBag,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ fullName: "", campus: "", residence: "", phone: "" });
  const campusResidences: Record<string, string[]> = {
    "Kaolack": ["Saloum 1","Saloum 2","Saloum 3","Saloum 4","Saloum 5","Saloum 6","Saloum 7","Saloum 8","Hors residence"],
    "Fatick":  ["Sine 1","Sine 2","Sine 3","Sine 4","Sine 5","Sine 6","Sine 7","Sine 8","Hors residence"],
    "Kaffrine":["Ndoukman","Hors residence"],
  };
  const [orderSending, setOrderSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFav(favs.includes(id));
    const saved = localStorage.getItem("ussein_order_info");
    if (saved) { try { setOrderForm(JSON.parse(saved)); } catch {} }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (!data) { setLoading(false); return; }
      setProduct(data);
      if (data.vendor_id) {
        const { data: v } = await supabase.from("vendors").select("id, shop_name, logo_url, is_verified, wave_number, rating, total_sales, campus, residence, delivery_days, delivery_hours").eq("id", data.vendor_id).single();
        setVendor(v);
      }
      if (data.category) {
        const { data: related } = await supabase.from("products").select("id, name, price, images, category, promo_price, promo_ends_at").eq("status", "active").eq("category", data.category).neq("id", id).limit(4);
        setRelatedProducts(related || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const toggleFav = useCallback(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = isFav ? favs.filter((f: string) => f !== id) : [...favs, id];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFav(!isFav);
  }, [isFav, id]);

  const share = useCallback(async () => {
    if (navigator.share) { try { await navigator.share({ title: product?.name, url: window.location.href }); } catch {} }
    else { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [product]);

  const images = product ? (Array.isArray(product.images) && product.images.length > 0 ? product.images : []) : [];
  const isPromo = product?.promo_price && product?.promo_ends_at && new Date(product.promo_ends_at) > new Date();
  const finalPrice = isPromo ? product?.promo_price : product?.price;
  const discount = isPromo ? Math.round((1 - product.promo_price / product.price) * 100) : 0;
  const waPhone = product?.whatsapp_contact ? product.whatsapp_contact.replace(/\D/g, "") : (vendor?.wave_number ? vendor.wave_number.replace(/\D/g, "") : "");
  const inStock = product?.stock > 0;
  const isRelatedPromo = (p: any) => p.promo_price && p.promo_ends_at && new Date(p.promo_ends_at) > new Date();

  const handleOrder = useCallback(async () => {
    if (!orderForm.fullName.trim() || !orderForm.campus || !orderForm.residence) return;
    setOrderSending(true);
    localStorage.setItem("ussein_order_info", JSON.stringify({ fullName: orderForm.fullName, campus: orderForm.campus, residence: orderForm.residence, phone: orderForm.phone }));
    const totalPrice = finalPrice * quantity;
    const msg = "Nouvelle commande USSEIN Commerce !\n\nProduit : " + product.name + "\nQuantite : " + quantity + "\nPrix total : " + fmt(totalPrice) + "\n\nClient : " + orderForm.fullName + "\nCampus : " + orderForm.campus + " / Residence : " + orderForm.residence + (orderForm.phone ? "\nTelephone : " + orderForm.phone : "") + "\n\nMerci de confirmer la commande.";
    if (waPhone) { window.open("https://wa.me/" + waPhone + "?text=" + encodeURIComponent(msg), "_blank"); }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const trackingToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const trackingUrl = window.location.origin + "/suivi/" + trackingToken;
      const { data: insertedOrder, error: insertError } = await supabase.from("orders").insert({
        tracking_token: trackingToken,
        vendor_id: product.vendor_id || null, product_id: product.id, buyer_id: user?.id || null,
        buyer_name: orderForm.fullName, delivery_address: orderForm.campus + " - " + orderForm.residence, buyer_phone: orderForm.phone || null,
        quantity, items: [{ id: product.id, name: product.name, price: finalPrice, qty: quantity, image: images[0] || "" }],
        total_price: totalPrice, whatsapp: waPhone || null, status: "pending",
      }).select().single();
      if (insertError) { console.error("ERREUR INSERT COMMANDE:", insertError.message, insertError.code); alert("Erreur commande: " + insertError.message); setOrderSending(false); return; }
      console.log("Commande inseree OK:", insertedOrder?.id);
    } catch (e: any) { console.error("CATCH ERREUR:", e); alert("Erreur: " + e.message); setOrderSending(false); return; }
    setOrderSending(false); setOrderSent(true);
    setOrderForm({ fullName: "", campus: "", residence: "", phone: "" });
    localStorage.removeItem("ussein_order_info");
    setTimeout(() => { setOrderSent(false); setShowOrderForm(false); }, 3000);
  }, [orderForm, product, vendor, quantity, finalPrice, waPhone, images]);

  if (loading) return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="p-4 space-y-3"><div className="h-5 bg-gray-100 rounded-lg w-2/3" /><div className="h-8 bg-gray-100 rounded-lg w-1/3" /></div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6">
      <TbPackage className="text-gray-200" size={56} />
      <p className="text-gray-800 font-bold">Produit introuvable</p>
      <Link href="/produits" className="bg-[#2d5a1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold">Voir les produits</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      {/* Header mobile */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-3 py-2.5 flex items-center gap-2">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95"><TbArrowLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
          <p className="text-[11px] text-gray-400">{product.category}</p>
        </div>
        <button onClick={share} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95">
          {copied ? <TbCheck size={16} className="text-green-500" /> : <TbShare size={16} />}
        </button>
        <button onClick={toggleFav} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95">
          <TbHeart size={16} className={isFav ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-2 lg:gap-8 lg:p-6">
        {/* Image */}
        <div className="relative bg-gray-50 aspect-square lg:rounded-2xl overflow-hidden">
          {images.length > 0 ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
              <img src={images[imgIndex]} alt={product.name} className={"w-full h-full object-contain " + (imgLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImgLoaded(true)} />
              {isPromo && <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1"><TbFlame size={12} /> -{discount}%</div>}
              {!inStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl text-sm">Rupture de stock</span></div>}
              {images.length > 1 && (
                <>
                  <button onClick={() => { setImgLoaded(false); setImgIndex(i => (i - 1 + images.length) % images.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><TbChevronLeft size={18} /></button>
                  <button onClick={() => { setImgLoaded(false); setImgIndex(i => (i + 1) % images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"><TbChevronRight size={18} /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, i: number) => <div key={i} className={"w-1.5 h-1.5 rounded-full " + (i === imgIndex ? "bg-[#2d5a1b] w-4" : "bg-black/20")} />)}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-200" size={48} /></div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 px-3 py-3 overflow-x-auto lg:hidden">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => { setImgLoaded(false); setImgIndex(i); }} className={"w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 " + (i === imgIndex ? "border-[#2d5a1b]" : "border-gray-200 opacity-60")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Infos */}
        <div className="px-4 lg:px-0 pt-4 lg:pt-0 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-[#2d5a1b]/10 text-[#2d5a1b] px-2.5 py-1 rounded-full font-semibold">{product.category}</span>
            {inStock ? (
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-semibold">{product.stock} en stock</span>
            ) : (
              <span className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-full font-semibold">Rupture</span>
            )}
          </div>

          {/* Nom */}
          <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

          {/* Prix */}
          <div className="flex items-baseline gap-2">
            {isPromo ? (
              <>
                <span className="text-2xl font-black text-red-500">{fmt(product.promo_price)}</span>
                <span className="text-sm text-gray-400 line-through">{fmt(product.price)}</span>
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded">-{discount}%</span>
              </>
            ) : (
              <span className="text-2xl font-black text-[#2d5a1b]">{fmt(product.price)}</span>
            )}
          </div>

          {isPromo && product.promo_ends_at && (
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
              <TbClock size={14} /> Offre jusqu au {new Date(product.promo_ends_at).toLocaleDateString("fr-FR")}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Garanties - en ligne */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0">
              <TbTruck size={16} className="text-blue-500" />
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Livraison campus</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0">
              <TbShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Paiement securise</span>
            </div>

          </div>

          {/* Quantite + Commander */}
          {inStock && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Quantite</span>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-0.5">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95"><TbMinus size={14} /></button>
                  <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95"><TbPlus size={14} /></button>
                </div>
              </div>
              <button onClick={() => setShowOrderForm(true)} className="w-full bg-[#2d5a1b] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] text-sm">
                <TbShoppingBag size={18} /> Commander — {fmt(finalPrice * quantity)}
              </button>
            </div>
          )}

          {/* Horaires de livraison */}
          {vendor?.delivery_days && vendor.delivery_days.length > 0 && (() => {
            const now = new Date();
            const jourActuel = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][now.getDay()];
            const hNow = now.getHours() * 60 + now.getMinutes();
            const hStart = vendor.delivery_hours?.start ? parseInt(vendor.delivery_hours.start.split(":")[0]) * 60 + parseInt(vendor.delivery_hours.start.split(":")[1]) : 0;
            const hEnd = vendor.delivery_hours?.end ? parseInt(vendor.delivery_hours.end.split(":")[0]) * 60 + parseInt(vendor.delivery_hours.end.split(":")[1]) : 1440;
            const disponible = vendor.delivery_days.includes(jourActuel) && hNow >= hStart && hNow <= hEnd;
            return (
              <div className={"flex items-center gap-3 rounded-2xl px-4 py-3 border " + (disponible ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100")}>
                <div className={"w-2.5 h-2.5 rounded-full flex-shrink-0 " + (disponible ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                <div className="flex-1 min-w-0">
                  <p className={"text-xs font-bold " + (disponible ? "text-emerald-700" : "text-gray-500")}>
                    {disponible ? "Disponible maintenant pour livraison" : "Indisponible pour livraison"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {vendor.delivery_days.map((d: string) => d.slice(0,3)).join(", ")}
                    {vendor.delivery_hours ? " · " + vendor.delivery_hours.start + " - " + vendor.delivery_hours.end : ""}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Vendeur */}
          {vendor && (
            <Link href={"/vendeurs/" + vendor.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-[#2d5a1b]/10 flex items-center justify-center font-bold text-[#2d5a1b] text-lg flex-shrink-0 overflow-hidden">
                {vendor.logo_url ? <img src={vendor.logo_url} alt="" className="w-full h-full object-cover" /> : vendor.shop_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400">Vendu par</p>
                <p className="font-bold text-gray-900 text-sm truncate">{vendor.shop_name}</p>
                
                {vendor.campus && <span className="text-xs text-[#2d5a1b] font-bold">{vendor.campus}{vendor.residence ? " · " + vendor.residence : ""}</span>}
                {vendor.is_verified && <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><TbShieldCheck size={10} /> Verifie</span>}
              </div>
              <TbChevronRight size={16} className="text-gray-300 group-hover:text-[#2d5a1b]" />
            </Link>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div className="px-4 lg:px-6 py-8 mt-4 border-t border-gray-50 max-w-5xl mx-auto">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Similaires</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedProducts.map(p => (
              <Link key={p.id} href={"/produits/" + p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-md">
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><TbPackage className="text-gray-200" size={28} /></div>}
                  {isRelatedPromo(p) && <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">-{Math.round((1 - p.promo_price / p.price) * 100)}%</span>}
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-gray-800 text-xs truncate">{p.name}</p>
                  <p className="text-[#2d5a1b] font-bold text-xs mt-0.5">{fmt(isRelatedPromo(p) ? p.promo_price : p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Barre fixe mobile */}
      {inStock && !showOrderForm && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2.5 flex items-center gap-3 z-30 lg:hidden safe-area-bottom">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400">Prix total</p>
            <p className="text-base font-black text-gray-900">{fmt(finalPrice * quantity)}</p>
          </div>
          <button onClick={() => setShowOrderForm(true)} className="bg-[#2d5a1b] text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 active:scale-95 text-sm">
            <TbShoppingBag size={18} /> Commander
          </button>
        </div>
      )}

      {/* Modal commande */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowOrderForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl lg:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto safe-area-bottom">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Commander</h2>
                <p className="text-xs text-gray-400">Informations de livraison</p>
              </div>
              <button onClick={() => setShowOrderForm(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><TbX size={16} /></button>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              {images[0] ? <img src={images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center"><TbPackage size={20} className="text-gray-400" /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400">Qty: {quantity} — <span className="font-bold text-[#2d5a1b]">{fmt(finalPrice * quantity)}</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block"><TbUser size={12} className="inline mr-1" />Nom complet *</label>
                <input type="text" placeholder="Amadou Diallo" value={orderForm.fullName} onChange={e => setOrderForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b]/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Campus *</label>
                <select value={orderForm.campus} onChange={e => setOrderForm(f => ({ ...f, campus: e.target.value, residence: "" }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b]/20 bg-white">
                  <option value="">Choisir votre campus</option>
                  {Object.keys(campusResidences).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {orderForm.campus && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Residence *</label>
                <select value={orderForm.residence} onChange={e => setOrderForm(f => ({ ...f, residence: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b]/20 bg-white">
                  <option value="">Choisir votre residence</option>
                  {campusResidences[orderForm.campus]?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block"><TbPhone size={12} className="inline mr-1" />Telephone (optionnel)</label>
                <input type="tel" placeholder="77 123 45 67" value={orderForm.phone} onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b]/20" />
              </div>
            </div>

            {orderSent ? (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-3 rounded-xl text-sm"><TbCheck size={18} /> Commande envoyee !</div>
            ) : (
              <button onClick={handleOrder} disabled={orderSending || !orderForm.fullName.trim() || !orderForm.campus || !orderForm.residence}
                className="w-full bg-[#2d5a1b] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] text-sm">
                {orderSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TbSend size={16} />}
                {orderSending ? "Envoi..." : "Confirmer — " + fmt(finalPrice * quantity)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
