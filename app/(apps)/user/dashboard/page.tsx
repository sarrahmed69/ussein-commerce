"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbUser, TbPackage, TbHeart, TbMapPin, TbLogout,
  TbShoppingBag, TbChevronRight, TbBuildingStore,
  TbLoader2, TbEdit, TbLayoutDashboard, TbStar,
  TbShieldCheck, TbBell, TbSettings, TbHome,
} from "react-icons/tb";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      setUser(user);
      const { data: vendors } = await supabase.from("vendors").select("id").eq("user_id", user.id).limit(1);
      if (vendors && vendors.length > 0) setIsVendor(true);
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("buyer_id", user.id);
      setOrderCount(count || 0);
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavCount(favs.length);
      setLoading(false);
    })();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <TbLoader2 className="animate-spin text-[#2d5a1b]" size={32} />
    </div>
  );

  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.firstName || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";
  const lastName = user?.user_metadata?.last_name || user?.user_metadata?.lastName || user?.user_metadata?.full_name?.split(" ")[1] || "";
  const initials = (firstName[0] + (lastName[0] || firstName[1] || "")).toUpperCase();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#1a3d10] via-[#2d5a1b] to-[#3d7a28] px-4 pt-6 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4a017]/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="max-w-2xl mx-auto flex items-center justify-between relative">
          <div>
            <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">Mon espace</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Bonjour, {firstName} 👋</h1>
            <p className="text-white/50 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 bg-gradient-to-br from-[#d4a017] to-[#c49515] rounded-2xl flex items-center justify-center text-[#1a3d10] font-extrabold text-xl shadow-lg">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 space-y-4 pb-10">
        {/* Carte profil */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2d5a1b]/10 to-[#2d5a1b]/5 rounded-2xl flex items-center justify-center text-[#2d5a1b] font-extrabold text-xl border-2 border-[#2d5a1b]/10">
                {initials}
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{firstName} {lastName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Link href="/" className="fixed bottom-4 left-4 z-50 bg-[#2d5a1b] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95">
            <TbHome size={22} />
          </Link>
          <TbShieldCheck size={13} className="text-emerald-500" />
                  <p className="text-xs text-emerald-600 font-semibold">{isVendor ? "Vendeur actif" : "Compte verifie"}</p>
                </div>
              </div>
            </div>
            <Link href="/user/profil" className="w-9 h-9 bg-gray-50 hover:bg-[#2d5a1b]/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#2d5a1b] transition-all border border-gray-100">
              <TbEdit size={16} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          {[
            { label: "Commandes", value: orderCount, icon: TbShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Favoris", value: favCount, icon: TbHeart, color: "text-red-500", bg: "bg-red-50" },
            { label: "Avis", value: 0, icon: TbStar, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " + s.bg}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Espace vendeur */}
        {isVendor ? (
          <Link href="/vendor/dashboard"
            className="flex items-center gap-4 bg-gradient-to-r from-[#2d5a1b] to-[#1a3d10] text-white rounded-3xl px-5 py-4 shadow-lg shadow-green-900/10 group">
            <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TbLayoutDashboard size={22} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm">Mon espace vendeur</p>
              <p className="text-xs text-white/60 mt-0.5">Tableau de bord · Produits · Commandes</p>
            </div>
            <TbChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
          </Link>
        ) : (
          <Link href="/devenir-vendeur"
            className="flex items-center gap-4 bg-gradient-to-r from-[#d4a017] to-[#c49515] rounded-3xl px-5 py-4 shadow-lg shadow-amber-900/10 group">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TbBuildingStore size={22} className="text-[#1a3d10]" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm text-[#1a3d10]">Ouvrir ma boutique</p>
              <p className="text-xs text-[#1a3d10]/60 mt-0.5">30 jours gratuits · 1 000 FCFA/mois ensuite</p>
            </div>
            <TbChevronRight size={18} className="text-[#1a3d10]/40" />
          </Link>
        )}

        {/* Menu */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: TbShoppingBag, label: "Mes commandes", sub: "Suivre et gerer vos achats", href: "/user/commandes", color: "bg-blue-50 text-blue-500" },
            { icon: TbHeart, label: "Mes favoris", sub: "Produits sauvegardes", href: "/user/favoris", color: "bg-red-50 text-red-500" },
            { icon: TbMapPin, label: "Mes adresses", sub: "Gerer vos adresses de livraison", href: "/user/adresses", color: "bg-emerald-50 text-emerald-500" },
            { icon: TbUser, label: "Mon profil", sub: "Modifier vos informations", href: "/user/profil", color: "bg-purple-50 text-purple-500" },
          ].map((item, i, arr) => (
            <Link key={item.href} href={item.href}
              className={"flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors " + (i < arr.length - 1 ? "border-b border-gray-50" : "")}>
              <div className={"w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 " + item.color}>
                <item.icon size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <TbChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Deconnexion */}
        <button onClick={logout}
          className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:bg-red-50 active:bg-red-100 transition-colors group">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
            <TbLogout size={19} className="text-red-500" />
          </div>
          <span className="font-semibold text-red-500 text-sm">Se deconnecter</span>
        </button>
      </div>
    </div>
  );
}