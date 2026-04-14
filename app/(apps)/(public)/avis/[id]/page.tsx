"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbStar, TbStarFilled, TbCheck, TbLoader2, TbArrowLeft } from "react-icons/tb";

export default function AvisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  const submit = async () => {
    if (rating === 0) { alert("Choisissez une note !"); return; }
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("reviews").insert({
      order_id: id,
      vendor_id: order?.vendor_id,
      rating,
      comment,
    });
    setDone(true);
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-24"><TbLoader2 className="animate-spin text-[#4a7c2f]" size={36} /></div>;

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbCheck className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre avis !</h2>
        <p className="text-gray-500 mb-4">Votre retour aide la communaute campus.</p>
        <Link href="/produits" className="bg-[#4a7c2f] text-white px-6 py-3 rounded-xl font-semibold text-sm">Voir les produits</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <TbArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800">Laisser un avis</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm mb-4">Comment s est passee votre commande ?</p>
          <div className="flex gap-2 justify-center mb-6">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                {n <= rating
                  ? <TbStarFilled size={40} className="text-yellow-400" />
                  : <TbStar size={40} className="text-gray-300" />}
              </button>
            ))}
          </div>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a7c2f]/30 resize-none"
            rows={4}
            placeholder="Partagez votre experience (optionnel)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button onClick={submit} disabled={submitting || rating === 0}
            className="w-full mt-4 bg-[#4a7c2f] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <TbLoader2 size={18} className="animate-spin" /> : <TbCheck size={18} />}
            Envoyer mon avis
          </button>
        </div>
      </div>
    </div>
  );
}