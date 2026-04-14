"use client";
import { BsChevronDown } from "react-icons/bs";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TbDeviceLaptop, TbShirt, TbHome2, TbBook2,
  TbToolsKitchen2, TbBrush, TbBriefcase, TbCategory2,
  TbSchool, TbHanger,
} from "react-icons/tb";

interface NavCategoryDropDownProps {
  showDropDown: boolean;
  setShowDropDown: React.Dispatch<React.SetStateAction<boolean>>;
}

const categories = [
  { name: "Electronique", icon: TbDeviceLaptop, color: "bg-blue-50 text-blue-500" },
  { name: "Vetements", icon: TbShirt, color: "bg-purple-50 text-purple-500" },
  { name: "Logement", icon: TbHome2, color: "bg-green-50 text-green-600" },
  { name: "Livres & Cours", icon: TbBook2, color: "bg-orange-50 text-orange-500" },
  { name: "Alimentation", icon: TbToolsKitchen2, color: "bg-red-50 text-red-500" },
  { name: "Beaute", icon: TbBrush, color: "bg-pink-50 text-pink-500" },
  { name: "Services", icon: TbBriefcase, color: "bg-yellow-50 text-yellow-600" },
  { name: "Fournitures", icon: TbSchool, color: "bg-indigo-50 text-indigo-500" },
  { name: "Sport & Loisirs", icon: TbHanger, color: "bg-teal-50 text-teal-500" },
  { name: "Autres", icon: TbCategory2, color: "bg-gray-100 text-gray-500" },
];

const NavCategoryDropDown: React.FC<NavCategoryDropDownProps> = ({
  showDropDown,
  setShowDropDown,
}) => {
  return (
    <div className="relative flex">
      <div
        className="text-gray-600 max-xl:text-xl relative whitespace-nowrap flex justify-center items-center gap-x-1 cursor-pointer"
        onClick={() => setShowDropDown((prev) => !prev)}
        onKeyDown={(e) => { if (e.key === "Enter") setShowDropDown((prev) => !prev); }}
        tabIndex={0}
      >
        Categories
        <BsChevronDown className={cn("transition-all ease-in-out duration-300", { "rotate-180": showDropDown })} />
      </div>

      {showDropDown && (
        <motion.div
          className="absolute bg-white min-w-[280px] sm:min-w-[500px] lg:min-w-[600px] max-w-[95vw] mt-12 p-5 rounded-2xl left-0 shadow-xl z-30 border border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <p className="text-gray-800 font-bold text-base">Categories populaires</p>
            <Link href="/produits" onClick={() => setShowDropDown(false)}
              className="text-xs text-primary font-semibold hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link key={cat.name}
                href={`/produits?cat=${encodeURIComponent(cat.name)}`}
                onClick={() => setShowDropDown(false)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <cat.icon size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600 text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NavCategoryDropDown;