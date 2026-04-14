"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  TbArrowLeft, TbPlus, TbTrash, TbPhoto, TbVideo,
  TbClock, TbUpload, TbX, TbCheck, TbAlertCircle,
} from "react-icons/tb";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
}

export default function VendorStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push("/connexion"); return; }

      const vid = localStorage.getItem("vendor_selected_id") || userData.user.id;
      setVendorId(vid);

      const { data } = await supabase
        .from("vendor_stories")
        .select("id, media_url, media_type, caption, created_at, expires_at")
        .eq("vendor_id", vid)
        .order("created_at", { ascending: false });
      setStories(data || []);
      setLoading(false);
    })();
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!file || !vendorId) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = vendorId + "-" + Date.now() + "." + ext;
      const { error: upErr } = await supabase.storage.from("stories").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("stories").getPublicUrl(path);
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const expires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

      const { data: newStory, error: insErr } = await supabase
        .from("vendor_stories")
        .insert({ vendor_id: vendorId, media_url: urlData.publicUrl, media_type: mediaType, caption: caption || null, expires_at: expires })
        .select()
        .single();
      if (insErr) throw insErr;

      setStories(prev => [newStory, ...prev]);
      setShowUpload(false);
      setFile(null);
      setPreview(null);
      setCaption("");
      showToast("Story publiee avec succes !", "success");
    } catch (e: any) {
      showToast("Erreur : " + e.message, "error");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("vendor_stories").delete().eq("id", id);
    setStories(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
    showToast("Story supprimee", "success");
  };

  const timeLeft = (expires: string) => {
    const diff = new Date(expires).getTime() - Date.now();
    if (diff <= 0) return "Expiree";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h + "h " + m + "min restantes";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#E8960A]/20 border-t-[#E8960A] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] pb-10">
      {/* Toast */}
      {toast && (
        <div className={"fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition-all " +
          (toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
          {toast.type === "success" ? <TbCheck size={16} /> : <TbAlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Confirm delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <TbTrash size={28} className="text-red-400" />
            </div>
            <p className="text-white font-bold text-center text-lg mb-1">Supprimer la story ?</p>
            <p className="text-white/40 text-sm text-center mb-6">Cette action est irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm border border-white/10">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
              <p className="text-white font-bold text-lg">Nouvelle story</p>
              <button onClick={() => { setShowUpload(false); setFile(null); setPreview(null); setCaption(""); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <TbX size={16} className="text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!preview ? (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full h-52 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-[#E8960A]/50 hover:bg-[#E8960A]/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#E8960A]/10 transition-colors">
                    <TbUpload size={28} className="text-white/30 group-hover:text-[#E8960A] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 font-medium text-sm">Choisir une photo ou video</p>
                    <p className="text-white/20 text-xs mt-0.5">JPG, PNG, MP4 — max 50MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-52">
                  {file?.type.startsWith("video") ? (
                    <video src={preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                    <TbX size={14} className="text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 rounded-xl px-2 py-1 flex items-center gap-1.5">
                    {file?.type.startsWith("video") ? <TbVideo size={12} className="text-[#E8960A]" /> : <TbPhoto size={12} className="text-[#E8960A]" />}
                    <span className="text-white text-[11px] font-medium">{file?.type.startsWith("video") ? "Video" : "Photo"}</span>
                  </div>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              <div className="relative">
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Ajouter une description (optionnel)..."
                  maxLength={150}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-[#E8960A]/50 transition-colors"
                />
                <span className="absolute bottom-3 right-3 text-white/20 text-[11px]">{caption.length}/150</span>
              </div>

              <div className="flex items-center gap-2 text-white/30 text-xs">
                <TbClock size={14} />
                <span>La story expire automatiquement apres 24h</span>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: !file || uploading ? undefined : "linear-gradient(135deg, #E8960A, #C4291A)" }}>
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publication...</>
                ) : (
                  <><TbUpload size={16} /> Publier la story</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <TbArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <p className="text-white font-bold text-base">Mes Stories</p>
              <p className="text-white/30 text-xs">{stories.length} story{stories.length > 1 ? "s" : ""} active{stories.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #E8960A, #C4291A)" }}>
            <TbPlus size={16} /> Nouvelle
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1B3A6B15, #E8960A15)", border: "1px solid rgba(232,150,10,0.15)" }}>
              <TbPhoto size={36} className="text-[#E8960A]/40" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1">Aucune story publiee</p>
              <p className="text-white/30 text-sm">Publiez votre premiere story pour attirer des clients</p>
            </div>
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #E8960A, #C4291A)" }}>
              <TbPlus size={16} /> Publier ma premiere story
            </button>
          </div>
        ) : (
          stories.map(story => (
            <div key={story.id}
              className="flex gap-3 bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden bg-white/5">
                {story.media_type === "video" ? (
                  <video src={story.media_url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 left-1 bg-black/60 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                  {story.media_type === "video" ? <TbVideo size={10} className="text-[#E8960A]" /> : <TbPhoto size={10} className="text-[#E8960A]" />}
                </div>
              </div>
              <div className="flex-1 py-3 pr-3 min-w-0">
                <p className="text-white/60 text-xs truncate mb-1">
                  {story.caption || "Aucune description"}
                </p>
                <div className="flex items-center gap-1.5 text-[#E8960A]/70 text-[11px]">
                  <TbClock size={12} />
                  <span>{timeLeft(story.expires_at)}</span>
                </div>
              </div>
              <div className="flex items-center pr-3">
                <button onClick={() => setDeleteId(story.id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  <TbTrash size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}