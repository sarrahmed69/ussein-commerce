"use client";
import Link from "next/link";
import { AiOutlineUser, AiOutlineSearch } from "react-icons/ai";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { TbUserCheck, TbShoppingCart } from "react-icons/tb";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useCartStore } from "@/lib/zustand/cart-store";

interface NavbarLeftProps {
  isMobile: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  searching: boolean;
  setNavBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearchRedirect: () => void;
  handleSearchValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
}

const NavbarLeft: React.FC<NavbarLeftProps> = ({
  isMobile, setSearching, searching, setNavBarOpen,
  handleSearchRedirect, handleSearchValueChange, searchValue,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const items = useCartStore(s => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Utiliser email_confirmed_at (fiable) plutot que identity_data
  const profileLink = user
    ? user.email_confirmed_at ? "/user/dashboard" : "/auth/confirm-otp"
    : "/auth/sign-in";

  return (
    <div className="flex justify-center items-center sm:gap-x-5 gap-x-2">
      {/* Recherche mobile */}
      <div
        className={`flex justify-center items-center gap-x-3 relative ml-1 md:ml-0 ${!isMobile ? "hidden" : ""}`}
        onClick={() => setSearching(prev => !prev)}
      >
        <AiOutlineSearch size={20} />
        {searching && (
          <div className={`${isMobile ? "fixed md:absolute bg-white rounded-lg mt-32 right-0 px-5 py-5 w-[98%] mr-[1%] flex justify-center items-center z-30 shadow-[3px_3px_16.5px_-7.5px_#ccc6c6]" : ""}`}>
            <input
              autoFocus
              onChange={handleSearchValueChange}
              value={searchValue}
              className="border-none w-full outline-none"
              type="text"
              placeholder="Rechercher un produit"
              onKeyDown={e => { if (e.key === "Enter") { setSearching(false); handleSearchRedirect(); } }}
            />
            <div className="rounded-full hover:bg-gray-200 min-h-7 min-w-7 max-h-7 max-w-7 flex justify-center items-center cursor-pointer" onClick={handleSearchRedirect}>
              <AiOutlineSearch size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Profil */}
      <Link href={profileLink} title="Profil" aria-label="Profil">
        <div className="flex items-center gap-x-2 relative ml-1 md:ml-0">
          {user ? (
            <>
              <TbUserCheck size={20} className="text-[#4a7c2f]" />
              {!isMobile && (
                <span className="capitalize text-sm font-semibold text-[#4a7c2f] max-w-[80px] truncate whitespace-nowrap">
                  {user?.user_metadata?.full_name?.split(" ")[0]?.toLowerCase() ||
                    user?.user_metadata?.firstName?.toLowerCase() ||
                    user?.email?.split("@")[0]}
                </span>
              )}
            </>
          ) : (
            <>
              <AiOutlineUser size={20} className="text-[#4a7c2f]" />
              {!isMobile && <span className="text-sm font-semibold text-[#4a7c2f] whitespace-nowrap">Compte</span>}
            </>
          )}
        </div>
      </Link>

      {/* Panier avec compteur */}
      <Link href="/cart" title="Panier" aria-label="Panier">
        <div className="flex items-center gap-x-2 relative ml-1 md:ml-0">
          <div className="relative">
            <TbShoppingCart size={22} className="text-[#4a7c2f]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#d4a017] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          {!isMobile && <span className="text-sm font-semibold text-[#4a7c2f] whitespace-nowrap">Panier</span>}
        </div>
      </Link>

      {/* Menu mobile */}
      <div
        className={`flex justify-center items-center gap-x-3 relative ml-1 md:ml-0 ${!isMobile ? "hidden" : ""}`}
        onClick={() => setNavBarOpen(true)}
      >
        <HiOutlineMenuAlt4 size={20} />
      </div>
    </div>
  );
};

export default NavbarLeft;