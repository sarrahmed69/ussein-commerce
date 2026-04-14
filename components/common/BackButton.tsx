"use client";
import { useRouter, usePathname } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";

const HIDDEN_PATHS = ["/", "/produits/", "/vendeurs/"];

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Cacher sur l'accueil et les pages qui ont deja un bouton retour
  if (pathname === "/" || pathname.match(/^\/produits\/[^/]+$/) || pathname.match(/^\/vendeurs\/[^/]+$/)) {
    return null;
  }

  return (
    <div className="sticky top-[88px] z-10 px-4 pt-3 pb-1 max-w-5xl mx-auto lg:hidden">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-[#2d5a1b] bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm active:scale-95 transition-all">
        <TbArrowLeft size={16} /> Retour
      </button>
    </div>
  );
}