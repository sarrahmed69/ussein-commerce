"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbPlus, TbX, TbLoader2, TbPhoto, TbVideo, TbCheck } from "react-icons/tb";

interface StoryUploadProps {
  vendorId: string;
  vendorName: string;
  onUploaded?: () => void;
}

export default function StoryUpload({ vendorId, vendorName, onUploaded }: StoryUploadProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const upload = async () => {
    if (!file || !vendorId) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `stories/${vendorId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Erreur upload : " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("stories").getPublicUrl(path);
    const mediaUrl = urlData.publicUrl;
    const mediaType = file.type.startsWith("video") ? "video" : "image";

    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const { error: insertError } = await supabase.from("vendor_stories").insert({
      vendor_id: vendorId,
      media_url: mediaUrl,
      media_type: mediaType, expires_at: expiresAt,
      caption: caption.trim() || null,
    });

    if (insertError) {
      alert("Erreur : " + insertError.message);
    } else {
      setDone(true);
      setFile(null);
      setPreview(null);
      setCaption("");
      onUploaded?.();
      setTimeout(() => { setOpen(false); setDone(false); }, 1500);
    }
    setUploading(false);
  };

  const reset = () => { setFile(null); setPreview(null); setCaption(""); setDone(false); };

  return (
    <>
      {/* Bouton ouvrir */}
      <button onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1.5 group flex-shrink-0">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#4a7c2f]/40 flex items-center justify-center text-[#4a7c2f] group-hover:border-[#4a7c2f] group-hover:bg-[#4a7c2f]/5 transition-all">
          <TbPlus size={24} />
        </div>
        <span className="text-[11px] text-gray-500 font-medium">Ma story</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2d5a1b] to-[#4a7c2f] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Ajouter une story</h3>
                  <p className="text-white/60 text-xs mt-0.5">{vendorName} · Visible 24h</p>
                </div>
                <button onClick={() => { setOpen(false); reset(); }} className="text-white/60 hover:text-white">
                  <TbX size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {done ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <TbCheck className="text-green-600" size={32} />
                  </div>
                  <p className="font-bold text-gray-800">Story publiee !</p>
                  <p className="text-xs text-gray-400">Visible par tous les clients pendant 24h</p>
                </div>
              ) : (
                <>
                  {/* Zone upload */}
                  {!preview ? (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#4a7c2f]/40 transition-colors"
                      onClick={() => inputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}>
                      <div className="flex justify-center gap-3 mb-3">
                        <TbPhoto className="text-gray-300" size={32} />
                        <TbVideo className="text-gray-300" size={32} />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Cliquez ou glissez une image / video</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 · Max 50MB</p>
                      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-64">
                      {file?.type.startsWith("video") ? (
                        <video src={preview} className="w-full h-full object-contain" controls />
                      ) : (
                        <img src={preview} alt="" className="w-full h-full object-contain" />
                      )}
                      <button onClick={reset}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                        <TbX size={14} />
                      </button>
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Legende (optionnelle)
                    </label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a7c2f]/20"
                      placeholder="Ex: Nouveau produit disponible !"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{caption.length}/150</p>
                  </div>

                  <button onClick={upload} disabled={!file || uploading}
                    className="w-full bg-gradient-to-r from-[#d4a017] to-[#e05c1a] text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    {uploading ? <TbLoader2 size={18} className="animate-spin" /> : <TbPlus size={18} />}
                    {uploading ? "Publication..." : "Publier la story"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}