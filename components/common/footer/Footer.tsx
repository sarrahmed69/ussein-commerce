"use client";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#e8ede4] px-4 py-8 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div>
            <img src="/images/USSEIN-logo.jpg" alt="USSEIN Commerce" width={150} height={50} className="object-contain" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: "Produits", href: "/produits" },
              { label: "Vendeurs", href: "/vendeurs" },
              { label: "Categories", href: "/categories" },
              { label: "Devenir vendeur", href: "/vendeur/creer" },
            ].map((l, i) => (
              <Link key={i} href={l.href} className="text-sm text-gray-500 hover:text-[#2d5a1b] transition-colors">{l.label}</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-[#29ABE2] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Wave</span>
            <span className="bg-white border border-gray-200 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-lg">Orange Money</span>
            <span className="bg-[#2d5a1b] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Cash FCFA</span>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-gray-300">© 2025 USSEIN Commerce · Marketplace officielle</span>
          <div className="flex gap-5">
            {["Confidentialite", "Conditions", "Aide"].map((t, i) => (
              <span key={i} className="text-xs text-gray-300 hover:text-gray-500 cursor-pointer transition-colors">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;