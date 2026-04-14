"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TbBuildingStore, TbShoppingBag, TbBrandWhatsapp, TbStar, TbPackage, TbCreditCard } from "react-icons/tb";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Panneau gauche */}
      <div className="hidden lg:flex flex-col justify-between bg-[#4a7c2f] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <Image src="/images/USSEIN-logo.jpg" alt="USSEIN" width={48} height={48}
            className="rounded-full object-cover bg-white p-0.5" style={{ width: 48, height: 48 }} />
          <div>
            <p className="font-bold text-xl leading-none">USSEIN Commerce</p>
            <p className="text-xs text-[#d4a017] uppercase tracking-widest">Campus Marketplace</p>
          </div>
        </Link>

        <div className="relative z-10 space-y-8">



          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: TbShoppingBag, text: "Achetez et vendez directement sur le campus USSEIN" },
              { icon: TbBrandWhatsapp, text: "Commandes et paiements via WhatsApp et Wave" },
              { icon: TbStar, text: "Devenez vendeur pour seulement 1 000 FCFA par mois" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                  <f.icon size={18} className="text-[#d4a017]" />
                </div>
                <p className="text-sm text-blue-100 leading-snug">{f.text}</p>
              </div>
            ))}
          </div>


        </div>

        <p className="text-xs text-blue-300 relative z-10">
          &copy; {new Date().getFullYear()} USSEIN Commerce — Universite du Sine Saloum. Tous droits reserves.
        </p>
      </div>

      {/* Panneau droit */}
      <div className="flex flex-col justify-center items-center px-6 py-12 bg-gray-50">
        <motion.div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/images/USSEIN-logo.jpg" alt="USSEIN" width={32} height={32}
              className="rounded-full object-cover" style={{ width: 32, height: 32 }} />
            <span className="font-bold text-[#4a7c2f] text-lg">USSEIN Commerce</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm mb-8">{subtitle}</p>}

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;