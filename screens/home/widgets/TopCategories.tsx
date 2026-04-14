"use client";
import Link from "next/link";
import {
  TbDeviceLaptop, TbShirt, TbHome2, TbBook2,
  TbToolsKitchen2, TbBrush, TbBriefcase, TbCategory2,
} from "react-icons/tb";

const categories = [
  { label: "Electronique", icon: TbDeviceLaptop, color: "bg-blue-50 text-blue-500", href: "/produits?cat=Electronique" },
  { label: "Vetements", icon: TbShirt, color: "bg-purple-50 text-purple-500", href: "/produits?cat=Vetements" },
  { label: "Logement", icon: TbHome2, color: "bg-green-50 text-green-600", href: "/produits?cat=Logement" },
  { label: "Livres & Cours", icon: TbBook2, color: "bg-orange-50 text-orange-500", href: "/produits?cat=Livres" },
  { label: "Alimentation", icon: TbToolsKitchen2, color: "bg-red-50 text-red-500", href: "/produits?cat=Alimentation" },
  { label: "Beaute", icon: TbBrush, color: "bg-pink-50 text-pink-500", href: "/produits?cat=Beaute" },
  { label: "Services", icon: TbBriefcase, color: "bg-yellow-50 text-yellow-600", href: "/produits?cat=Services" },
  { label: "Tout voir", icon: TbCategory2, color: "bg-gray-100 text-gray-500", href: "/produits" },
];

export default function TopCategories() {
  return (
    <section className="bg-white border-b border-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-gray-900">Categories</h2>
          <Link href="/produits" className="text-xs text-[#2d5a1b] font-semibold">Voir tout</Link>
        </div>
        {/* Scroll horizontal sur mobile, grille sur desktop */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 sm:grid sm:grid-cols-8">
          {categories.map((cat) => (
            <Link key={cat.label} href={cat.href}
              className="flex-shrink-0 flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-105 transition-transform`}>
                <cat.icon size={24} />
              </div>
              <span className="text-[11px] font-semibold text-gray-500 text-center leading-tight w-14 truncate group-hover:text-[#2d5a1b] transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}