"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbChevronLeft, TbChevronRight, TbBuildingStore, TbPlayerPlay } from "react-icons/tb";

interface VendorStory {
  vendor_id: string;
  shop_name: string;
  logo_url: string | null;
  campus: string | null;
  story_count: number;
}

export default function StoriesBar() {
  const [vendors, setVendors] = useState<VendorStory[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("vendor_stories")
        .select("vendor_id, vendors(id, shop_name, logo_url, campus)")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      const map = new Map<string, VendorStory>();
      data.forEach((row: any) => {
        const v = row.vendors;
        if (!v) return;
        if (!map.has(v.id)) {
          map.set(v.id, { vendor_id: v.id, shop_name: v.shop_name, logo_url: v.logo_url, campus: v.campus, story_count: 0 });
        }
        map.get(v.id)!.story_count++;
      });

      setVendors(Array.from(map.values()));
      setLoading(false);
    })();
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  if (loading || vendors.length === 0) return null;

  return (
    <div className="relative bg-white border-b border-gray-100 py-3">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <TbChevronLeft size={16} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-8"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Bouton Voir tout — ouvre la page TikTok */}
        <Link href="/stories" className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8960A] to-[#C4291A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <TbPlayerPlay size={26} className="text-white" />
          </div>
          <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Voir tout</span>
        </Link>

        {/* Un avatar par vendeur */}
        {vendors.map(v => (
          <Link
            key={v.vendor_id}
            href="/stories"
            className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#E8960A] overflow-hidden bg-[#1B3A6B]/10 flex items-center justify-center text-[#1B3A6B] font-bold text-xl group-hover:scale-105 transition-transform">
                {v.logo_url
                  ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                  : <TbBuildingStore size={24} />}
              </div>
              {v.story_count > 1 && (
                <span className="absolute -bottom-1 -right-1 bg-[#E8960A] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {v.story_count}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap max-w-[64px] truncate text-center">
              {v.shop_name}
            </span>
          </Link>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <TbChevronRight size={16} />
      </button>
    </div>
  );
}