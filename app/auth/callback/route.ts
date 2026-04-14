import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: vendors } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", data.user.id)
        .limit(1);

      if (vendors && vendors.length > 0) {
        return NextResponse.redirect(`${origin}/vendor/dashboard`);
      }
      return NextResponse.redirect(`${origin}/user/dashboard`);
    }
  }

  console.error("CALLBACK ERROR: code:", code); return NextResponse.redirect(`${origin}/auth/sign-in`);
}