"use client";
import MainLayout from "../layouts/main/MainLayout";
import Link from "next/link";
import { TbMapPin } from "react-icons/tb";
import { WordRotate } from "@/components/ui/word-rotate";

interface NavbarTopProps {
  stickToTop?: boolean;
}

const NavbarTop: React.FC<NavbarTopProps> = ({ stickToTop }) => {
  return (
    <div style={{ background: "#1a3d10" }} className="border-b border-green-900/50">
      <MainLayout>
        <div className="flex justify-between items-center text-white h-9 text-xs">
          <div className="flex items-center gap-2">
            <TbMapPin size={12} className="text-[#d4a017]" />
            <span className="text-green-300 hidden sm:inline">Campus USSEIN</span>
          </div>
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            <WordRotate
              className="text-xs font-medium text-green-300"
              words={[
                "Bienvenue sur USSEIN Commerce — Campus Marketplace",
                "Paiement Wave et Orange Money acceptes",
                "Commandez directement via WhatsApp",
                "Achetez et vendez entre etudiants USSEIN",
                "Abonnement vendeur : 1 000 FCFA/mois",
                "La marketplace officielle du campus USSEIN",
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-300">FCFA</span>
            <span className="text-green-300">FR</span>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default NavbarTop;