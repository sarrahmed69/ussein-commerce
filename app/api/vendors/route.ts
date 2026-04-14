import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Non connecte" }, { status: 401 });

    const body = await request.json();
    const { shopName, waveNumber, type, campusDelivery, campus, residence } = body;
    if (!shopName?.trim()) return NextResponse.json({ success: false, error: "Nom requis" }, { status: 400 });

    const cleanPhone = (waveNumber || "").replace(/\D/g, "").slice(-9);
    const { data: existingTrial } = await supabase.from("trial_tracker").select("id").eq("phone", cleanPhone);
    const isFirstShop = !existingTrial || existingTrial.length === 0;

    const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const { data, error } = await supabase.from("vendors").insert({
      user_id: user.id,
      shop_name: shopName.trim(),
      slug,
      wave_number: waveNumber || null,
      type: type || "student",
      campus_delivery: campusDelivery ?? true,
      campus: campus || null,
      residence: residence || null,
      status: "active",
      is_verified: false,
      rating: 0,
      total_sales: 0,
      total_revenue: 0,
      subscription_status: isFirstShop ? "trial" : "suspended",
      subscription_expires_at: isFirstShop ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    }).select("*").single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    if (isFirstShop && cleanPhone) {
      await supabase.from("trial_tracker").insert({ phone: cleanPhone, user_id: user.id, vendor_id: data.id });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}