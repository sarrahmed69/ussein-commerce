"use client";
import { useEffect, useState } from "react";
import { TbX, TbBuildingStore, TbArrowRight, TbSparkles } from "react-icons/tb";
import Link from "next/link";

export default function NewsLetter() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const seen = sessionStorage.getItem("banner_seen");
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);
  const close = () => {
    setVisible(false);
    sessionStorage.setItem("banner_seen", "1");
  };
  if (!visible) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}>
      <div className="bg-gradient-to-br from-[#1a3d10] to-[#2d5a1b] rounded-3xl shadow-2xl w-80 overflow-hidden border border-green-800/30">
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="flex items-start justify-between mb-4 relative">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#d4a017]/20 rounded-2xl flex items-center justify-center">
                <TbBuildingStore className="text-[#d4a017]" size={22} />
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <TbSparkles size={12} className="text-[#d4a017]" />
                <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-wider">Nouveau</span>
              </div>
            </div>
            <button onClick={close} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all">
              <TbX size={14} />
            </button>
          </div>
          <h3 className="text-xl font-extrabold text-white leading-tight mb-2">
            Vendez sur votre campus pour <span className="text-[#d4a017]">1 000 FCFA/mois</span>
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            Profitez de 30 jours d essai gratuit. Publiez vos produits directement sur la plateforme et vendez facilement aux etudiants de l USSEIN, sans intermediaire.
          </p>
        </div>
        <div className="px-6 pb-6 pt-2 flex gap-2">
          <Link href="/devenir-vendeur" onClick={close}
            className="flex-1 bg-[#d4a017] hover:bg-[#c49515] text-[#1a3d10] text-sm font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#d4a017]/20">
            Ouvrir ma boutique <TbArrowRight size={16} />
          </Link>
          <button onClick={close}
            className="px-4 py-3 text-sm text-white/40 hover:text-white/70 transition-colors font-medium">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}