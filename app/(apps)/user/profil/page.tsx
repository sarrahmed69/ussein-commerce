"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { TbArrowLeft, TbLoader2, TbCheck, TbUser } from "react-icons/tb";
export default function Profil() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setForm({
          firstName: user.user_metadata?.firstName || "",
          lastName: user.user_metadata?.lastName || "",
          phone: user.user_metadata?.phone || "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { ...form } });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><TbLoader2 className="animate-spin text-primary" size={36} /></div>;

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/user/dashboard" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><TbArrowLeft size={20} /></Link>
        <h1 className="font-bold text-gray-800">Mon profil</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <TbUser className="text-primary" size={36} />
          </div>
          <p className="font-bold text-gray-800">{form.firstName} {form.lastName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Prenom</label>
            <input className={inputClass} value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} placeholder="Votre prenom" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom</label>
            <input className={inputClass} value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} placeholder="Votre nom" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <input className={inputClass + " text-gray-400"} value={user?.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Telephone</label>
            <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+221 77 123 45 67" />
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-accent disabled:opacity-60">
          {saving ? <><TbLoader2 size={20} className="animate-spin" /> Enregistrement...</> : saved ? <><TbCheck size={20} /> Enregistre !</> : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}