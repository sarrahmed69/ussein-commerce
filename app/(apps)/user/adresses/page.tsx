"use client";

import Link from "next/link";
import { TbArrowLeft, TbMapPin } from "react-icons/tb";
export default function Adresses() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Link href="/user/dashboard" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><TbArrowLeft size={20} /></Link>
        <h1 className="font-bold text-gray-800">Mes adresses</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <TbMapPin className="text-gray-200 mb-4" size={64} />
        <p className="font-semibold text-gray-500">Aucune adresse enregistree</p>
        <p className="text-sm text-gray-400 mt-1">Les livraisons sur le campus se font directement via WhatsApp</p>
      </div>
    </div>
  );
}