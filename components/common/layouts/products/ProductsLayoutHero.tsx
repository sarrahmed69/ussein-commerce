"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbSearch } from "react-icons/tb";

export default function ProductsLayoutHero() {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <div className="bg-gradient-to-r from-[#2d5a1b] to-[#4a7c2f] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Tous les produits</h1>
        <p className="text-white/70 mb-6">Trouvez ce dont vous avez besoin sur le campus</p>
        <div className="relative max-w-md mx-auto">
          <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
            placeholder="Rechercher un produit..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") router.push("/produits?q=" + encodeURIComponent(q)); }}
          />
        </div>
      </div>
    </div>
  );
}