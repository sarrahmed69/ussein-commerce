import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, email, password, vendorId } = body;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // Login
  if (!action || action === "login") {
    if (email?.toLowerCase().trim() === adminEmail && password === adminPassword) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 401 });
  }

  // Verifier session admin
  if (password !== adminPassword) {
    return NextResponse.json({ success: false, error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdmin();

  // Suspendre
  if (action === "suspend") {
    await supabase.from("vendors").update({ subscription_status: "expired", status: "suspended" }).eq("id", vendorId);
    await supabase.from("products").update({ status: "inactive" }).eq("vendor_id", vendorId);
    return NextResponse.json({ success: true });
  }

  // Supprimer
  if (action === "delete") {
    const { data: prods } = await supabase.from("products").select("images").eq("vendor_id", vendorId);
    if (prods?.length) {
      const paths: string[] = [];
      prods.forEach((p: any) => {
        p.images?.forEach((url: string) => {
          try { const parts = url.split("/object/public/products/"); if (parts[1]) paths.push(decodeURIComponent(parts[1])); } catch {}
        });
      });
      if (paths.length) await supabase.storage.from("products").remove(paths);
    }
    await supabase.from("products").delete().eq("vendor_id", vendorId);
    await supabase.from("vendors").delete().eq("id", vendorId);
    return NextResponse.json({ success: true });
  }

  // Activer
  if (action === "activate") {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    await supabase.from("vendors").update({ subscription_status: "active", status: "active", subscription_expires_at: expires.toISOString() }).eq("id", vendorId);
    await supabase.from("products").update({ status: "active" }).eq("vendor_id", vendorId);
    return NextResponse.json({ success: true, expires: expires.toISOString() });
  }

  return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
}