"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import {
  TbDeviceLaptop, TbShirt, TbHome2, TbBook2,
  TbToolsKitchen2, TbBrush, TbBriefcase, TbCategory2,
  TbSchool, TbActivityHeartbeat, TbArrowRight,
} from "react-icons/tb";

const categories = [
  { name: "Electronique", icon: TbDeviceLaptop, color: "bg-blue-50 text-blue-500", border: "border-blue-100", desc: "Phones, laptops, accessoires" },
  { name: "Vetements", icon: TbShirt, color: "bg-purple-50 text-purple-500", border: "border-purple-100", desc: "Mode, chaussures, sacs" },
  { name: "Logement", icon: TbHome2, color: "bg-green-50 text-green-600", border: "border-green-100", desc: "Chambres, colocation" },
  { name: "Livres & Cours", icon: TbBook2, color: "bg-orange-50 text-orange-500", border: "border-orange-100", desc: "Manuels, polycopiés, PDF" },
  { name: "Alimentation", icon: TbToolsKitchen2, color: "bg-red-50 text-red-500", border: "border-red-100", desc: "Repas, snacks, boissons" },
  { name: "Beaute", icon: TbBrush, color: "bg-pink-50 text-pink-500", border: "border-pink-100", desc: "Soins, cosmétiques, parfums" },
  { name: "Services", icon: TbBriefcase, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100", desc: "Cours, aide, réparations" },
  { name: "Fournitures", icon: TbSchool, color: "bg-indigo-50 text-indigo-500", border: "border-indigo-100", desc: "Cahiers, stylos, matériel" },
  { name: "Sport & Loisirs", icon: TbActivityHeartbeat, color: "bg-teal-50 text-teal-500", border: "border-teal-100", desc: "Équipements, jeux, loisirs" },
  { name: "Autres", icon: TbCategory2, color: "bg-gray-100 text-gray-500", border: "border-gray-200", desc: "Tout le reste" },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2d5a1b] to-[#4a7c2f] text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Toutes les catégories</h1>
        <p className="text-white/60 text-sm">Trouvez ce dont vous avez besoin par catégorie</p>
      </div>

      {/* Grille */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name}
              href={`/produits?cat=${encodeURIComponent(cat.name)}`}
              className={`bg-white rounded-2xl p-5 border ${cat.border} hover:shadow-md transition-all group flex flex-col gap-3`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-200`}>
                <cat.icon size={28} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{cat.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#4a7c2f] font-semibold mt-auto">
                Voir les produits <TbArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}