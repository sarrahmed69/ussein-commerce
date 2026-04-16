import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { vendorId } = await req.json();
  if (!vendorId) return NextResponse.json({ error: "vendorId manquant" }, { status: 400 });
  const { error } = await supabase.from("vendors").update({ subscription_status: "expired", status: "suspended" }).eq("id", vendorId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("products").update({ status: "inactive" }).eq("vendor_id", vendorId);
  return NextResponse.json({ success: true });
}