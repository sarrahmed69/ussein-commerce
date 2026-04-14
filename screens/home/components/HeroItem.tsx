"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { TbArrowRight, TbBrandWhatsapp, TbShoppingBag } from "react-icons/tb";

const HeroItem = () => {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-sm bg-[#2d5a1b]">

      {/* Cercles décoratifs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-green-400/10 rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />

      {/* Grille décorative */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Badge flottant top-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 text-white text-xs font-semibold flex items-center gap-2">
        <TbBrandWhatsapp className="text-green-400" size={16} />
        Commande directe WhatsApp
      </motion.div>

      {/* Stats flottantes */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-8 right-8 hidden md:flex flex-col gap-3">
        {[
          { val: "500+", label: "Etudiants" },
          { val: "1 000", label: "FCFA/mois" },
        ].map((s) => (
          <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-center">
            <p className="font-bold text-lg text-primary">{s.val}</p>
            <p className="text-xs text-white/60">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Contenu principal */}
      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-4 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full w-fit">
          <TbShoppingBag size={14} /> Campus Marketplace — USSEIN
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-white font-bold text-4xl md:text-6xl leading-tight mb-3">
          Achetez &<br />
          <span className="text-primary">Vendez</span> sur<br />
          le campus
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/60 text-sm md:text-base mb-6 max-w-sm">
          Rejoignez la marketplace des etudiants de l USSEIN. Produits, services, livraison campus.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex items-center gap-3 flex-wrap">
          <Link href="/produits"
            className="bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm">
            Voir les produits <TbArrowRight size={18} />
          </Link>
          <Link href="/devenir-vendeur"
            className="border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            Devenir vendeur
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroItem;