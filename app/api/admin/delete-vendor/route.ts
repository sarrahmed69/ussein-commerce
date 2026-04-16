import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { vendorId } = await req.json();
    if (!vendorId) return NextResponse.json({ error: "vendorId manquant" }, { status: 400 });
    await supabase.from("orders").delete().eq("vendor_id", vendorId);
    await supabase.from("products").delete().eq("vendor_id", vendorId);
    const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur inconnue" }, { status: 500 });
  }
}