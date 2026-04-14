"use client";
import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = "Retour", href }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => href ? router.push(href) : router.back()}
      className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors group mb-4"
    >
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
        <TbArrowLeft size={18} />
      </div>
      {label}
    </button>
  );
}