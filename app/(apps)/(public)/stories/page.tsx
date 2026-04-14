"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TbArrowLeft, TbHeart, TbBrandWhatsapp, TbBuildingStore,
  TbVolume, TbVolumeOff, TbShoppingBag, TbChevronUp, TbChevronDown,
  TbTrash, TbDots,
} from "react-icons/tb";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  vendor_id: string;
  likes_count: number;
  vendor: {
    id: string;
    shop_name: string;
    logo_url: string | null;
    wave_number: string | null;
    campus: string | null;
  };
}

function ProgressBars({ total, current, progress }: { total: number; current: number; progress: number }) {
  return (
    <div className="flex gap-1 px-4 pt-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-[2px] rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-none"
            style={{
              width: i < current ? "100%" : i === current ? progress + "%" : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StoryItem({
  story, isActive, onNext, onPrev, onDelete, isOwner,
}: {
  story: Story;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const getFingerprint = () => {
    let fp = localStorage.getItem("ussein_fp");
    if (!fp) { fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("ussein_fp", fp); }
    return fp;
  };

  useEffect(() => {
    if (!isActive) return;
    (async () => {
      const supabase = createClient();
      const fp = getFingerprint();
      const [{ count }, { data: myLike }] = await Promise.all([
        supabase.from("story_likes").select("*", { count: "exact", head: true }).eq("story_id", story.id),
        supabase.from("story_likes").select("id").eq("story_id", story.id).eq("user_fingerprint", fp),
      ]);
      setLikeCount(count || 0);
      setLiked(myLike !== null && myLike.length > 0);
    })();
  }, [story.id, isActive]);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setProgress(0);
    setShowMenu(false);
    if (!isActive) { videoRef.current?.pause(); clearInterval(timerRef.current); return; }
    if (story.media_type === "video") {
      videoRef.current?.play().catch(() => {});
      const onTime = () => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        setProgress((v.currentTime / v.duration) * 100);
      };
      videoRef.current?.addEventListener("timeupdate", onTime);
      return () => { videoRef.current?.removeEventListener("timeupdate", onTime); };
    } else {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const pct = Math.min(((Date.now() - start) / 5000) * 100, 100);
        setProgress(pct);
        if (pct >= 100) { clearInterval(timerRef.current); onNext(); }
      }, 40);
      return () => clearInterval(timerRef.current);
    }
  }, [isActive, story]);

  const handleLike = async () => {
    const supabase = createClient();
    const fp = getFingerprint();
    if (liked) {
      await supabase.from("story_likes").delete().eq("story_id", story.id).eq("user_fingerprint", fp);
      setLikeCount(c => Math.max(0, c - 1));
      setLiked(false);
    } else {
      await supabase.from("story_likes").insert({ story_id: story.id, user_fingerprint: fp });
      setLikeCount(c => c + 1);
      setLiked(true);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }
  };

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from("vendor_stories").delete().eq("id", story.id);
    onDelete(story.id);
  };

  const waPhone = story.vendor.wave_number?.replace(/\D/g, "") || "";
  const waText = encodeURIComponent("Bonjour ! J ai vu votre story sur USSEIN Commerce.");
  const waHref = "https://wa.me/" + waPhone + "?text=" + waText;
  const vendorHref = "/vendeurs/" + story.vendor.id;

  const timeAgo = () => {
    const diff = Date.now() - new Date(story.created_at).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (h > 0) return h + "h";
    if (m > 0) return m + "min";
    return "maintenant";
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {story.media_type === "video" ? (
        <video ref={videoRef} src={story.media_url} loop muted={muted} playsInline
          className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <img src={story.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Tap zones */}
      <button className="absolute left-0 top-0 w-1/3 h-full z-10" onClick={onPrev} />
      <button className="absolute right-0 top-0 w-1/3 h-full z-10" onClick={onNext} />

      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <ProgressBars total={1} current={0} progress={progress} />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-4 z-30">
        <div className="flex items-center justify-between">
          <Link href={vendorHref} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold text-white text-base"
                style={{ boxShadow: "0 0 0 2px #E8960A, 0 0 0 4px rgba(232,150,10,0.3)" }}>
                {story.vendor.logo_url
                  ? <img src={story.vendor.logo_url} alt="" className="w-full h-full object-cover" />
                  : story.vendor.shop_name?.[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{story.vendor.shop_name}</p>
              <p className="text-white/50 text-[11px]">{timeAgo()}{story.vendor.campus ? " · " + story.vendor.campus : ""}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            {story.media_type === "video" && (
              <button onClick={() => setMuted(m => !m)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                {muted ? <TbVolumeOff size={16} className="text-white" /> : <TbVolume size={16} className="text-white" />}
              </button>
            )}
            {isOwner && (
              <div className="relative">
                <button onClick={() => setShowMenu(m => !m)}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <TbDots size={16} className="text-white" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-44 z-50">
                    {!confirmDelete ? (
                      <button onClick={() => setConfirmDelete(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                        <TbTrash size={16} /> Supprimer la story
                      </button>
                    ) : (
                      <div className="p-3">
                        <p className="text-white/70 text-xs text-center mb-3">Confirmer la suppression ?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium">
                            Annuler
                          </button>
                          <button onClick={handleDelete}
                            className="flex-1 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Like animation */}
      {likeAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <TbHeart size={80} className="text-red-500 fill-red-500 drop-shadow-2xl animate-ping" />
        </div>
      )}

      {/* Actions droite */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 transition-all active:scale-90">
            <TbHeart size={24} className={liked ? "text-red-500 fill-red-500" : "text-white"} />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow">{likeCount}</span>
        </button>

        {waPhone && (
          <a href={waHref} target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              <TbBrandWhatsapp size={24} className="text-white" />
            </div>
            <span className="text-white text-[11px] font-semibold drop-shadow">Contact</span>
          </a>
        )}

        <Link href={vendorHref} className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10">
            <TbBuildingStore size={24} className="text-white" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow">Boutique</span>
        </Link>
      </div>

      {/* Caption + CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8">
        {story.caption && (
          <p className="text-white text-sm font-medium leading-relaxed mb-3 drop-shadow-lg max-w-[75%]">
            {story.caption}
          </p>
        )}
        <Link href={vendorHref}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white border border-white/20 backdrop-blur-sm"
          style={{ background: "linear-gradient(135deg, rgba(232,150,10,0.8), rgba(196,41,26,0.8))" }}
          onClick={e => e.stopPropagation()}>
          <TbBuildingStore size={16} />
          Voir la boutique
        </Link>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: userData }, { data: storiesData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("vendor_stories")
          .select("*, vendors(id, shop_name, logo_url, wave_number, campus), likes_count")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setUserId(userData.user?.id || null);
      if (userData.user?.id) {
        const { data: vd } = await supabase.from("vendors").select("id").eq("id", userData.user.id).single();
        setVendorId(vd?.id || null);
      }
      setStories((storiesData ?? []).map((s: any) => ({ ...s, vendor: s.vendors })));
      setLoading(false);
    })();
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= stories.length) return;
    setCurrent(idx);
    const el = containerRef.current?.children[idx] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth" });
  }, [stories.length]);

  const handleDelete = (id: string) => {
    setStories(prev => {
      const next = prev.filter(s => s.id !== id);
      if (current >= next.length) setCurrent(Math.max(0, next.length - 1));
      return next;
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.5) {
          const idx = Array.from(container.children).indexOf(e.target as HTMLElement);
          if (idx !== -1) setCurrent(idx);
        }
      });
    }, { threshold: 0.5 });
    Array.from(container.children).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [stories]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#E8960A]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#E8960A] animate-spin" />
      </div>
    </div>
  );

  if (stories.length === 0) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6 text-center px-8">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1B3A6B20, #E8960A20)", border: "1px solid rgba(232,150,10,0.2)" }}>
        <TbShoppingBag size={40} className="text-[#E8960A]/60" />
      </div>
      <div>
        <p className="text-white font-bold text-xl mb-2">Aucune story</p>
        <p className="text-white/30 text-sm leading-relaxed">Les vendeurs n ont pas encore publie de stories aujourd hui</p>
      </div>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 text-white text-sm font-medium border border-white/10">
        <TbArrowLeft size={16} /> Retour
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {/* Bouton retour */}
      <button onClick={() => router.back()}
        className="absolute top-14 left-4 z-40 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
        <TbArrowLeft size={16} className="text-white" />
      </button>

      {/* Compteur */}
      <div className="absolute top-14 right-4 z-40 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
        <span className="text-white text-xs font-semibold">{current + 1} / {stories.length}</span>
      </div>

      {/* Nav haut/bas */}
      {current > 0 && (
        <button onClick={() => goTo(current - 1)}
          className="absolute left-1/2 -translate-x-1/2 top-20 z-40 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <TbChevronUp size={18} className="text-white" />
        </button>
      )}
      {current < stories.length - 1 && (
        <button onClick={() => goTo(current + 1)}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 z-40 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <TbChevronDown size={18} className="text-white" />
        </button>
      )}

      <div ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}>
        {stories.map((story, idx) => (
          <div key={story.id} className="h-screen w-full flex-shrink-0 snap-start snap-always relative">
            <StoryItem
              story={story}
              isActive={idx === current}
              onNext={() => goTo(idx + 1)}
              onPrev={() => goTo(idx - 1)}
              onDelete={handleDelete}
              isOwner={vendorId === story.vendor_id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}